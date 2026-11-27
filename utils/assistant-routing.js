const routesByRole = require("../data/assistant-routes.json");

const roleByRoute = new Map(
  Object.entries(routesByRole).flatMap(([role, routes]) =>
    routes.map((route) => [route, role])
  )
);
const languages = { "zh-CN": "zh", "en-US": "en", "fr-FR": "fr", ar: "ar" };
const legacyRoutes = {
  "/uclass/quick-start-for-teachers": "/uclass/quick-start/quick-start-for-teachers",
  "/uagent/quick-start-for-teachers": "/uagent/quick-start/quick-start-for-teachers",
  "/uagent/quick-start-for-administrators": "/uagent/quick-start/quick-start-for-administrators",
};

function normalizeDocumentRoute(pathname) {
  return String(pathname || "/")
    .split(/[?#]/)[0]
    .split("/").map((segment) => {
      try { return decodeURIComponent(segment); }
      catch { return segment; }
    }).join("/")
    .replace(/^\/[a-z]{2}(?:-[a-z]{2})?(?=\/|$)/i, "")
    .replace(/\/+$/, "")
    .replace(/\.[a-z]{2}(?:-[a-z]{2})?$/i, "")
    .replace(/\/index$/, "") || "/";
}

function getAssistantRole(pathname) {
  return roleByRoute.get(normalizeDocumentRoute(pathname)) || "teacher";
}

function getAssistantContext(pathname) {
  const route = normalizeDocumentRoute(pathname);
  const canonical = legacyRoutes[route] || route;
  const context = { role: getAssistantRole(route) };
  const product = canonical.split("/")[1];
  if (product && [...roleByRoute.keys()].some((entry) => entry.startsWith(`/${product}/`))) {
    context.product = product === "ulearning" ? "ulms" : product;
    if (roleByRoute.has(canonical)) context.documentId = canonical.slice(1);
  }
  return context;
}

function getAssistantUrl(pathname, locale) {
  const prefix = String(pathname || "").match(/^\/([a-z]{2}(?:-[a-z]{2})?)(?=\/|$)/i)?.[1];
  const language = languages[locale || prefix] || "en";
  const { role, product, documentId } = getAssistantContext(pathname);
  const query = new URLSearchParams({ language, role });
  if (product) query.set("product", product);
  if (documentId) query.set("doc", documentId);
  return `/assistant?${query.toString()}`;
}

module.exports = { normalizeDocumentRoute, getAssistantRole, getAssistantContext, getAssistantUrl };
