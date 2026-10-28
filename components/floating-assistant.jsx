import Image from "next/image";
import styles from "./floating-assistant.module.css";

export default function FloatingAssistant() {
  return (
    <a
      className={styles.entry}
      href="https://ta.tongshike.cn/"
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
