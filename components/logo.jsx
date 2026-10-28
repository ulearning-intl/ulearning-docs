import Image from "next/image";
import useLocalesMap from "./use-locales-map";
import { titleMap } from "../translations/text";

export default function Logo() {
  const title = useLocalesMap(titleMap);

  return (
    <Image
      src="/img/docs-logo.png"
      alt="ULearning Docs"
      title={title}
      width={256}
      height={32}
    />
  );
}
