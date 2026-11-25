const assert = require("node:assert/strict");
const test = require("node:test");
const { selectHeapMB, inspectMemory } = require("../scripts/build-memory.cjs");

test("heap limit leaves headroom on small and large servers", () => {
  for (const [available, expected] of [[1024, 665], [2048, 1331], [4096, 2662], [8192, 5324], [16384, 6144]]) {
    assert.equal(selectHeapMB(available), expected);
    assert(selectHeapMB(available) < available);
  }
});

test("insufficient or invalid available memory stops the build early", () => {
  for (const available of [0, 512, 1023, -1, NaN, Infinity]) {
    assert.throws(() => selectHeapMB(available), /Free memory or increase/);
  }
});

function inspectFixture(files) {
  return inspectMemory(file => files[file] || "", () => 8 * 1024 ** 3);
}

test("container v2 remaining memory takes precedence over host memory", () => {
  const memory = inspectFixture({
    "/proc/meminfo": "MemAvailable:   8388608 kB",
    "/sys/fs/cgroup/memory.max": String(4 * 1024 ** 3),
    "/sys/fs/cgroup/memory.current": String(1 * 1024 ** 3),
    "/sys/fs/cgroup/memory.events": "oom 2\noom_kill 1",
  });
  assert.equal(memory.availableMB, 3072);
  assert(memory.details.some(line => line.includes("oom_kill 1")));
});

test("nested v1 cgroups respect the tighter parent limit", () => {
  const memory = inspectFixture({
    "/proc/self/cgroup": "5:memory:/build/job",
    "/sys/fs/cgroup/memory/build/job/memory.limit_in_bytes": String(6 * 1024 ** 3),
    "/sys/fs/cgroup/memory/build/job/memory.usage_in_bytes": "0",
    "/sys/fs/cgroup/memory/build/memory.limit_in_bytes": String(2 * 1024 ** 3),
    "/sys/fs/cgroup/memory/build/memory.usage_in_bytes": String(1 * 1024 ** 3),
  });
  assert.equal(memory.availableMB, 1024);
});

test("unlimited cgroups use host available memory; exhausted groups report zero", () => {
  assert.equal(inspectFixture({ "/sys/fs/cgroup/memory.max": "max" }).availableMB, 8192);
  assert.equal(inspectFixture({
    "/sys/fs/cgroup/memory.max": "1024",
    "/sys/fs/cgroup/memory.current": "2048",
  }).availableMB, 0);
});
