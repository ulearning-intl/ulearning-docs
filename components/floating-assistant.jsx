import Image from "next/image";
import { useRouter } from "next/router";
import { getAssistantUrl } from "../utils/assistant-routing";
import styles from "./floating-assistant.module.css";

export default function FloatingAssistant() {
  const { pathname } = useRouter();

  return (
    <a
      className={styles.entry}
      href={getAssistantUrl(pathname)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="访问 ta.tongshike.cn（在新标签页打开）"
    >
      <Image
        src="/img/floating-assistant.png"
        alt="智能助手"
        width={96}
        height={96}
      />
    </a>
  );
}
