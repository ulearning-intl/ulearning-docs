import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/router";
import { getAssistantUrl } from "../utils/assistant-routing";
import styles from "./floating-assistant.module.css";

export default function FloatingAssistant() {
  const { pathname } = useRouter();
  const [hovered, setHovered] = useState(false);

  return (
    <a
      className={styles.entry}
      href={getAssistantUrl(pathname)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="访问 ta.tongshike.cn（在新标签页打开）"
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
    >
      <Image
        src={hovered ? "/img/小蜜蜂@4x.gif" : "/img/floating-assistant.png"}
        alt="智能助手"
        width={108}
        height={108}
        unoptimized
      />
    </a>
  );
}
