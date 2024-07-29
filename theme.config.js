import { useRouter } from "next/router";
import { useConfig } from "nextra-theme-docs";
import Logo from "./components/logo";
import Footer from "./components/footer";
import useLocalesMap from "./components/use-locales-map";
import {
  editTextMap,
  feedbackLinkMap,
  gitTimestampMap,
  headDescriptionMap,
  languageMap,
  searchPlaceholderMap,
  tableOfContentsTitleMap,
  titleMap,
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
      const docsRepositoryDevBase = "https://github.dev/ulearning-intl/ulearning-docs/blob/test/"
      return (
        <a className={ className } href={ docsRepositoryDevBase + filePath } target="_blank" rel="noreferrer">{ useLocalesMap(editTextMap) }</a>
      )
    }
  },
  feedback: {
    content: () => useLocalesMap(feedbackLinkMap),
  },
  logo: () => {
    const title = useLocalesMap(titleMap);
    return (
      <>
        <Logo height={32} />
        <span
          className="mx-2 font-extrabold hidden md:inline select-none text-blue-600 text-xl"
          title={`SWR: ${title}`}
        >
          Docs
        </span>
      </>
    );
  },
  head: () => {
    const { route, locales, locale } = useRouter();
    const { frontMatter, title } = useConfig();
    const titleSuffix = useLocalesMap(titleMap);
    const description = useLocalesMap(headDescriptionMap);

    const imageUrl = new URL("https://swr-card.vercel.app");

    if (!/\/index\.+/.test(route)) {
      imageUrl.searchParams.set("title", title || titleSuffix);
    }

    const contentLanguage = locales.join(", ");
    const ogTitle = title ? `${title} – SWR` : `SWR: ${titleSuffix}`;
    const ogDescription = frontMatter.description || description;
    const ogImage = frontMatter.image || imageUrl.toString();

    return (
      <>
        {/* Favicons, meta */}
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon/favicon-16x16.png"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <link
          rel="mask-icon"
          href="/favicon/safari-pinned-tab.svg"
          color="#000000"
        />
        <meta httpEquiv="Content-Language" content={contentLanguage} />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="apple-mobile-web-app-title" content="SWR" />
        <meta name="description" content={ogDescription} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@vercel" />
        <meta name="twitter:image" content={ogImage} />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:locale" content={locale} />
        {
          locales
          .filter((l) => l !== locale)
          .map((l) => (
            <meta property="og:locale:alternate" content={l} key={l} />
          ))
        }
      </>
    );
  },
  footer: {
    component: () => Footer(),
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
    direction: locale === 'ar' ? 'rtl' : 'ltr'
  })),
};

export default themeConfig;
