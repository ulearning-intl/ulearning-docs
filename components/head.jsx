import { useRouter } from "next/router";
import { useConfig } from "nextra-theme-docs";
import useLocalesMap from "./use-locales-map";
import { headDescriptionMap, titleMap } from "../translations/text";

export default function Head() {
  const { locales, locale } = useRouter();
  const { frontMatter, title } = useConfig();
  const titleSuffix = useLocalesMap(titleMap);
  const description = useLocalesMap(headDescriptionMap);

  const contentLanguage = locales.join(", ");
  const ogTitle = title ? `${title}` : `${titleSuffix}`;
  const ogDescription = frontMatter.description || description;

  return (
    <>
      <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
      <meta httpEquiv="Content-Language" content={contentLanguage} />
      <meta name="msapplication-TileColor" content="#ffffff" />
      <meta name="description" content={ogDescription} />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:locale" content={locale} />
      {locales
        .filter((l) => l !== locale)
        .map((l) => (
          <meta property="og:locale:alternate" content={l} key={l} />
        ))}
    </>
  );
}
