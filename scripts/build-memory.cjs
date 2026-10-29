const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path").posix;

const MB = 1024 * 1024;

function read(file) {
  try {
    return fs.readFileSync(file, "utf8").trim();
  } catch {
    return "";
  }
}

function selectHeapMB(availableMB) {
  if (!Number.isFinite(availableMB) || availableMB < 1024) {
    throw new Error("Less than 1 GB available for the build. Free memory or increase the server/container memory limit before retrying.");
  }
  // Leave room for native allocations, webpack workers and the running site.
  return Math.min(6144, Math.floor(availableMB * 0.65));
}

function inspectMemory(readFile = read, freeMemory = os.freemem) {
  const meminfo = readFile("/proc/meminfo");
  const availableKB = meminfo.match(/^MemAvailable:\s+(\d+)\s+kB$/m);
  let available = availableKB ? Number(availableKB[1]) * 1024 : freeMemory();
  const details = [`host available: ${Math.floor(available / MB)} MB`];
  const groups = new Set(["/sys/fs/cgroup", "/sys/fs/cgroup/memory"]);
  for (const line of readFile("/proc/self/cgroup").split("\n")) {
    const match = line.match(/^\d+:([^:]*):(\/.*)$/);
    if (!match) continue;
    if (match[1] === "") groups.add(path.join("/sys/fs/cgroup", match[2]));
    if (match[1].split(",").includes("memory")) {
      groups.add(path.join("/sys/fs/cgroup/memory", match[2]));
    }
  }
  // Inspect ancestors too: a parent cgroup can impose a tighter limit.
  for (const group of [...groups]) {
    let parent = path.dirname(group);
    while (parent.startsWith("/sys/fs/cgroup")) {
      groups.add(parent);
      parent = path.dirname(parent);
    }
  }
  for (const group of groups) {
    for (const [limitFile, usageFile] of [
      ["memory.max", "memory.current"],
      ["memory.limit_in_bytes", "memory.usage_in_bytes"],
    ]) {
      const limitText = readFile(path.join(group, limitFile));
      const usageText = readFile(path.join(group, usageFile));
      if (!/^\d+$/.test(limitText) || !/^\d+$/.test(usageText)) continue;
      const limit = Number(limitText);
      const usage = Number(usageText);
      if (!Number.isSafeInteger(limit) || limit <= 0) continue;
      available = Math.min(available, Math.max(0, limit - usage));
      details.push(`${group}: limit ${Math.floor(limit / MB)} MB, used ${Math.floor(usage / MB)} MB`);
    }
    for (const file of ["memory.events", "memory.failcnt"]) {
      const events = readFile(path.join(group, file));
      if (events) details.push(`${group}/${file}: ${events.replace(/\n/g, "; ")}`);
    }
  }
  return { availableMB: Math.floor(available / MB), details };
}

if (require.main === module) {
  try {
    const { availableMB, details } = inspectMemory();
    for (const detail of details) console.error(`[build memory] ${detail}`);
    console.error(`[build memory] available budget: ${availableMB} MB`);
    if (!process.argv.includes("--report")) {
      const heapMB = selectHeapMB(availableMB);
      console.error(`[build memory] automatic Node heap limit: ${heapMB} MB`);
      console.log(heapMB);
    }
  } catch (error) {
    console.error(`[build memory] ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = { selectHeapMB, inspectMemory };
