const routesByRole = require("../data/assistant-routes.json");

const roleByRoute = new Map(
  Object.entries(routesByRole).flatMap(([role, routes]) =>
    routes.map((route) => [route, role])
  )
);

function normalizeDocumentRoute(pathname) {
  return (pathname || "/")
    .split(/[?#]/)[0]
    .replace(/^\/[a-z]{2}(?:-[a-z]{2})?(?=\/|$)/i, "")
    .replace(/\/+$/, "")
    .replace(/\.[a-z]{2}(?:-[a-z]{2})?$/i, "")
    .replace(/\/index$/, "") || "/";
}

function getAssistantRole(pathname) {
  return roleByRoute.get(normalizeDocumentRoute(pathname)) || "teacher";
}

function getAssistantUrl(pathname) {
  const url = new URL("https://ta.tongshike.cn/");
  url.searchParams.set("language", "zh");
  url.searchParams.set("role", getAssistantRole(pathname));
  return url.toString();
}

module.exports = { normalizeDocumentRoute, getAssistantRole, getAssistantUrl };
