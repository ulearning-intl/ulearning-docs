import Image from "next/image";
import useLocalesMap from "./use-locales-map";
import { titleMap } from "../translations/text";

export default function Logo() {
  const title = useLocalesMap(titleMap);

  return (
    <>
      <Image
        src="/img/logo.png"
        alt="logo"
        title={title}
        width={143}
        height={32}
      />
      <span
        className="mx-2 font-extrabold hidden md:inline select-none text-blue-600 text-xl"
        title={title}
      >
        Docs
      </span>
    </>
  );
}
