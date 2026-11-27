const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const routesByRole = require("../data/assistant-routes.json");
const { getAssistantContext, getAssistantRole, getAssistantUrl } = require("../utils/assistant-routing");

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
    ["/urecord/administrator/account-management/registration-and-login", "admin"],
    ["/urecord/supervisor/account-management/registration-and-login", "supervisor"],
    ["/urecord/quick-start/quick-start-for-supervisors", "supervisor"],
    ["/uagent/quick-start/quick-start-for-administrators", "admin"],
    ["/uagent/quick-start-for-administrators", "admin"],
    ["/ulms/student/account-management/personal-profile", "student"],
    ["/ulms/quick-start/quick-start-for-students", "student"],
    ["/ulms/student/account-management/registration-and-login", "student"],
    ["/ulms/teacher/account-management/registration-and-login", "teacher"],
    ["/uclass/teacher/in-class-teaching/ai-workbench", "teacher"],
    ["/uclass/quick-start/quick-start-for-teachers", "teacher"],
    ["/uagent/quick-start/quick-start-for-teachers", "teacher"],
  ];
  for (const [route, role] of cases) {
    assert.equal(getAssistantRole(route), role, route);
  }
});

test("local assistant URLs preserve locale, role, product, and article context", () => {
  const route = "/uagent/administrator/login";
  const expectedLanguages = { "zh-CN": "zh", "en-US": "en", "fr-FR": "fr", ar: "ar" };
  for (const locale of Object.keys(expectedLanguages)) {
    const url = new URL(getAssistantUrl(`/${locale}${route}/?role=student#teacher`, locale), "https://docs.example");
    assert.equal(url.origin, "https://docs.example");
    assert.equal(url.pathname, "/assistant");
    assert.equal(url.searchParams.get("language"), expectedLanguages[locale]);
    assert.equal(url.searchParams.get("role"), "admin");
    assert.equal(url.searchParams.get("product"), "uagent");
    assert.equal(url.searchParams.get("doc"), "uagent/administrator/login");
  }
});

test("uRecord supervisor pages keep their product and role context", () => {
  const route = "/urecord/supervisor/imported/管理个人账号/登录.zh-CN";
  assert.equal(getAssistantRole(route), "supervisor");
  assert.deepEqual(getAssistantContext(route), {
    role: "supervisor",
    product: "urecord",
    documentId: "urecord/supervisor/imported/管理个人账号/登录",
  });
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
      const relative = route.slice(1);
      const candidates = [path.join(root, "pages", relative), path.join(root, "assistant-content", relative)];
      const exists = candidates.some((base) => {
        const parent = path.dirname(base);
        const name = path.basename(base);
        return fs.existsSync(base) || (fs.existsSync(parent) && fs.readdirSync(parent).some(
          (file) => file.startsWith(name + ".") && file.endsWith(".mdx")
        ));
      });
      assert(exists || redirects.has(route), `Missing document: ${route}`);
    }
  }
});

test("legacy uLearning article links use the current uLMS product", () => {
  const route = routesByRole.teacher.find((entry) => entry.startsWith("/ulearning/teacher/"));
  assert(route, "Expected preserved uLearning knowledge source");
  const context = getAssistantContext(route);
  assert.equal(context.product, "ulms");
  assert.equal(context.documentId, route.slice(1));
});
