import { useRouter } from "next/router";
import { getAssistantUrl } from "../utils/assistant-routing";

const labels = {
  "zh-CN": "向小蜜蜂提问",
  "en-US": "Ask the assistant",
  "fr-FR": "Demander à l’assistant",
  ar: "اسأل المساعد",
};

export default function AssistantLink() {
  const router = useRouter();
  const locale = router.locale || "en-US";
  return (
    <a className="ulearning-assistant-link" href={getAssistantUrl(router.asPath || router.pathname, locale)} target="_blank" rel="noreferrer">
      {labels[locale] || labels["en-US"]}
    </a>
  );
}
