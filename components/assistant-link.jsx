import { useRouter } from "next/router";

const languageMap = {
  "zh-CN": "zh",
  "en-US": "en",
  "fr-FR": "fr",
  ar: "ar",
};

const labels = {
  "zh-CN": "向小蜜蜂提问",
  "en-US": "Ask the assistant",
  "fr-FR": "Demander à l’assistant",
  ar: "اسأل المساعد",
};

function contextForPath(pathname) {
  const [path] = String(pathname || "").split(/[?#]/, 1);
  const parts = path.split("/").filter(Boolean).map((segment) => {
    try { return decodeURIComponent(segment); }
    catch { return segment; }
  });
  if (Object.hasOwn(languageMap, parts[0])) parts.shift();
  if (parts.length) {
    const last = parts.length - 1;
    parts[last] = parts[last].replace(/\.(zh-CN|en-US|fr-FR|ar)$/, "");
  }
  const product = parts[0] || "";
  const role = new Map([
    ["admin", "admin"], ["teacher", "teacher"], ["student", "student"],
    ["reviewer", "supervisor"], ["supervisor", "supervisor"],
  ]).get(parts[1]);
  if (!role || parts.length < 3) return { role: "teacher" };
  return { product, role, documentId: parts.join("/") };
}

export default function AssistantLink() {
  const router = useRouter();
  const locale = router.locale || "en-US";
  const language = languageMap[locale] || "en";
  const { role, product, documentId } = contextForPath(router.asPath || router.pathname);
  const query = new URLSearchParams({ language, role });
  if (product) query.set("product", product);
  if (documentId) query.set("doc", documentId);
  return (
    <a className="ulearning-assistant-link" href={`/assistant?${query.toString()}`} target="_blank" rel="noreferrer">
      {labels[locale] || labels["en-US"]}
    </a>
  );
}
