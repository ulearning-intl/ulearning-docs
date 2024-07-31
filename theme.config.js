import { useRouter } from "next/router";
import Logo from "./components/logo";
import Head from "./components/head";
import Footer from "./components/footer";
import useLocalesMap from "./components/use-locales-map";
import {
  editTextMap,
  feedbackLinkMap,
  gitTimestampMap,
  languageMap,
  searchPlaceholderMap,
  tableOfContentsTitleMap,
} from "./translations/text";

/** @type {import('nextra-theme-docs').DocsThemeConfig} */
const themeConfig = {
  docsRepositoryBase: "https://github.com/ulearning-intl/ulearning-docs",
  useNextSeoProps() {
    return {
      titleTemplate: "Ulearning - %s",
    };
  },
  toc: {
    float: true,
    title: () => useLocalesMap(tableOfContentsTitleMap),
  },
  search: {
    placeholder: () => useLocalesMap(searchPlaceholderMap),
  },
  editLink: {
    component: ({ className, filePath }) => {
      const docsRepositoryDevBase =
        "https://github.dev/ulearning-intl/ulearning-docs/blob/test/";
      return (
        <a
          className={className}
          href={docsRepositoryDevBase + filePath}
          target="_blank"
          rel="noreferrer"
        >
          {useLocalesMap(editTextMap)}
        </a>
      );
    },
  },
  feedback: {
    content: () => useLocalesMap(feedbackLinkMap),
  },
  logo: Logo,
  head: Head,
  footer: {
    component: Footer,
  },
  gitTimestamp({ timestamp }) {
    const { locale } = useRouter();
    const lastUpdatedOn = useLocalesMap(gitTimestampMap);

    return (
      <>
        {lastUpdatedOn}{" "}
        <time dateTime={timestamp.toISOString()}>
          {timestamp.toLocaleDateString(locale, {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </time>
      </>
    );
  },
  i18n: Object.entries(languageMap).map(([locale, text]) => ({
    locale,
    text,
    direction: locale === "ar" ? "rtl" : "ltr",
  })),
};

export default themeConfig;
