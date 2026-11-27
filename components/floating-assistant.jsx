import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/router";
import { getAssistantUrl } from "../utils/assistant-routing";
import styles from "./floating-assistant.module.css";

export default function FloatingAssistant() {
  const { asPath, pathname, locale } = useRouter();
  const [hovered, setHovered] = useState(false);

  return (
    <a
      className={styles.entry}
      href={getAssistantUrl(asPath || pathname, locale)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="打开小蜜蜂文档问答（在新标签页打开）"
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
    >
      {hovered ? (
        <video
          src="/img/floating-assistant.webm"
          poster="/img/floating-assistant.png"
          width={108}
          height={108}
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
        />
      ) : (
        <Image
          src="/img/floating-assistant.png"
          alt="智能助手"
          width={108}
          height={108}
          unoptimized
        />
      )}
    </a>
  );
}
