import { useRouter } from "next/router";
import Logo from "./components/logo";
import Head from "./components/head";
import Footer from "./components/footer";
import useLocalesMap from "./components/use-locales-map";
import { useRouter as useRouter7 } from "next/router";
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
  // Global
  docsRepositoryBase: "https://github.com/ulearning-intl/ulearning-docs",
  useNextSeoProps() {
    return {
      titleTemplate: "Ulearning - %s",
    };
  },
  head: Head,

  // Navbar
  logo: Logo,
  search: {
    placeholder: () => useLocalesMap(searchPlaceholderMap),
  },

  // Sidebar
  // ...

  // TOC Sidebar
  toc: {
    float: true,
    title: () => useLocalesMap(tableOfContentsTitleMap),
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
  themeSwitch: {
    useOptions() {
      const { locale } = useRouter7();
      console.log('locale',locale)
      if (locale === "zh-CN") {
        return { dark: "\u6DF1\u8272\u4E3B\u9898", light: "\u6D45\u8272\u4E3B\u9898", system: "\u7CFB\u7EDF\u9ED8\u8BA4" };
      }else if(locale === "fr-FR"){
        return { dark: "Sombre", light: "Lumière", system: "Système" };
      }else if(locale === "ar"){
        return { dark: "مظلم", light: "ضوء .", system: "نظم" };
      }
      return {
        light: 'Light',
        dark: 'Dark',
        system: 'System'
      }
    }
  },
  feedback: {
    content: () => useLocalesMap(feedbackLinkMap),
  },

  // End of Page
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

  // Footer
  footer: {
    component: Footer,
  },

  // I18n
  i18n: Object.entries(languageMap).map(([locale, text]) => ({
    locale,
    text,
    direction: locale === "ar" ? "rtl" : "ltr",
  })),
};

export default themeConfig;
