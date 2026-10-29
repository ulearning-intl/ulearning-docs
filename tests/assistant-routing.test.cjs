const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const routesByRole = require("../data/assistant-routes.json");
const { getAssistantRole, getAssistantUrl } = require("../utils/assistant-routing");

test("every listed document resolves to its assigned role without overlaps", () => {
  const seen = new Set();
  for (const [role, routes] of Object.entries(routesByRole)) {
    for (const route of routes) {
      assert(!seen.has(route), `Duplicate role assignment: ${route}`);
      seen.add(route);
      assert.equal(getAssistantRole(route), role);
      assert.equal(getAssistantRole(`/zh-CN${route}/?from=docs#steps`), role);
      assert.equal(getAssistantRole(`${route}.zh-CN`), role);
    }
  }
});

test("role directories and quick-start pages match their intended audiences", () => {
  const cases = [
    ["/uagent/administrator/login", "admin"],
    ["/ulearning/admin/system-settings/site-settings", "admin"],
    ["/uagent/quick-start/quick-start-for-administrators", "admin"],
    ["/uagent/quick-start-for-administrators", "admin"],
    ["/ulms/student/account-management/personal-profile", "student"],
    ["/ulms/quick-start/quick-start-for-students", "student"],
    ["/ulcms/student/teacher/checkTask", "student"],
    ["/uclass/teacher/in-class-teaching/ai-workbench", "teacher"],
    ["/uclass/quick-start/quick-start-for-teachers", "teacher"],
    ["/uagent/quick-start/quick-start-for-teachers", "teacher"],
  ];
  for (const [route, role] of cases) {
    assert.equal(getAssistantRole(route), role, route);
  }
});

test("language prefixes and URL suffixes do not affect role selection", () => {
  const route = "/uagent/administrator/login";
  for (const locale of ["zh-CN", "en-US", "fr-FR", "ar", "pt-BR"]) {
    const url = new URL(getAssistantUrl(`/${locale}${route}/?role=student#teacher`));
    assert.equal(url.origin, "https://ta.tongshike.cn");
    assert.equal(url.searchParams.get("language"), "zh");
    assert.equal(url.searchParams.get("role"), "admin");
    assert.equal(url.searchParams.size, 2);
  }
});

test("shared pages and unlisted URLs default to teacher", () => {
  for (const route of [undefined, "/", "/zh-CN", "/ulms/overview",
    "/uagent/quick-start", "/unrelated/student", "/uagent/administrator/login-extra"]) {
    assert.equal(getAssistantRole(route), "teacher");
  }
});

test("Nextra category index pages retain their assigned role", () => {
  assert.equal(getAssistantRole("/uagent/administrator/index.zh-CN"), "admin");
  assert.equal(getAssistantRole("/ulms/student/index.zh-CN"), "student");
});

test("each listed route has a source document or an existing redirect", async () => {
  const root = path.resolve(__dirname, "..");
  const config = require("../next.config.js");
  const redirects = new Set((await config.redirects()).map(({ source }) => source));
  for (const routes of Object.values(routesByRole)) {
    for (const route of routes) {
      const base = path.join(root, "pages", route.slice(1));
      const parent = path.dirname(base);
      const name = path.basename(base);
      const exists = fs.existsSync(base) || fs.readdirSync(parent).some(
        (file) => file.startsWith(name + ".") && file.endsWith(".mdx")
      );
      assert(exists || redirects.has(route), `Missing document: ${route}`);
    }
  }
});
