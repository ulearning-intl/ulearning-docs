const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const sourceRoots = ["pages", "assistant-content"].map((name) => path.join(root, name));
const products = [...new Set(sourceRoots.flatMap((sourceRoot) =>
  fs.existsSync(sourceRoot)
    ? fs.readdirSync(sourceRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory()).map((entry) => entry.name)
    : []
))].sort();
const directoryRoles = {
  admin: "admin",
  administrator: "admin",
  student: "student",
  teacher: "teacher",
  reviewer: "supervisor",
  supervisor: "supervisor",
};
const quickStartRoles = {
  "quick-start-for-administrators": "admin",
  "quick-start-for-students": "student",
  "quick-start-for-teachers": "teacher",
  "quick-start-for-supervisors": "supervisor",
};
const routes = { admin: new Set(), student: new Set(), teacher: new Set(), supervisor: new Set() };

function collect(directory, sourceRoot) {
  if (!fs.existsSync(directory)) return;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      collect(filename, sourceRoot);
      continue;
    }
    if (!/\.[a-z]{2}(?:-[a-z]{2})?\.mdx$/i.test(entry.name)) continue;

    const route = path.relative(sourceRoot, filename)
      .split(path.sep).join("/")
      .replace(/\.[a-z]{2}(?:-[a-z]{2})?\.mdx$/i, "")
      .replace(/\/index$/, "");
    const segments = route.split("/");
    const role = directoryRoles[segments[1]] ||
      (segments[1] === "quick-start" && quickStartRoles[segments[2]]);
    if (role) routes[role].add("/" + route);
  }
}

for (const sourceRoot of sourceRoots) {
  for (const product of products) collect(path.join(sourceRoot, product), sourceRoot);
}

// Retain the previous quick-start URLs supported by Next.js redirects.
routes.teacher.add("/uclass/quick-start-for-teachers");
routes.teacher.add("/uagent/quick-start-for-teachers");
routes.admin.add("/uagent/quick-start-for-administrators");

const lists = Object.fromEntries(
  Object.entries(routes).map(([role, urls]) => [role, [...urls].sort()])
);
const output = path.join(root, "data", "assistant-routes.json");
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify(lists, null, 2) + "\n");
console.log(Object.fromEntries(
  Object.entries(lists).map(([role, urls]) => [role, urls.length])
));
