const withNextra = require("nextra")({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.js",
  staticImage: true,
  flexsearch: {
    codeblocks: false,
  },
  defaultShowCopyCode: true,
});

const locales = [
  "en-US",
  // "es-ES",
  "fr-FR",
  // "id-ID",
  // "th-TH",
  "ar",
  "zh-CN",
  // "zh-TW",
  // "ja",
  // "ko",
  // "ru",
  // "pt-BR",
];

module.exports = withNextra({
  experimental: {
    cpus: 1,
  },
  i18n: {
    locales,
    defaultLocale: "en-US",
    localeDetection: false,
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/zh-CN/index",
        locale: false,
        permanent: true,
      },
      {
        source: "/uclass/quick-start-for-teachers",
        destination: "/uclass/quick-start/quick-start-for-teachers",
        statusCode: 301,
      },
      {
        source: "/uagent/quick-start-for-teachers",
        destination: "/uagent/quick-start/quick-start-for-teachers",
        statusCode: 301,
      },
      {
        source: "/uagent/quick-start-for-administrators",
        destination: "/uagent/quick-start/quick-start-for-administrators",
        statusCode: 301,
      },
      // Preserve links in the retained homepages without keeping old manuals.
      {
        source: "/ulearning/student/:path*",
        destination: "/ulms/student/account-management/registration-and-login",
        statusCode: 301,
      },
      {
        source: "/ulearning/teacher/:path*",
        destination: "/ulms/teacher/account-management/registration-and-login",
        statusCode: 301,
      },
      ...["ulearning", "utest", "ulcms"].map((product) => ({
        source: `/${product}/:path*`,
        destination: "/ulms/overview",
        statusCode: 301,
      })),
      ...["docs", "blog", "solutions", "practices", "examples", "advanced"].map((section) => ({
        source: `/${section}/:path*`,
        destination: "/index",
        statusCode: 301,
      })),
      {
        source: "/change-log",
        destination: "/index",
        statusCode: 301,
      },
    ];
  },
  reactStrictMode: true,
});
