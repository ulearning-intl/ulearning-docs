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
      {
        source: "/docs",
        destination: "/docs/getting-started",
        statusCode: 301,
      },
      {
        source: "/advanced/performance",
        destination: "/docs/advanced/performance",
        statusCode: 301,
      },
      {
        source: "/advanced/cache",
        destination: "/docs/advanced/cache",
        statusCode: 301,
      },
      {
        source: "/docs/cache",
        destination: "/docs/advanced/cache",
        statusCode: 301,
      },
      {
        source: "/docs/options",
        destination: "/docs/api",
        statusCode: 301,
      },
      {
        source: "/change-log",
        destination: "/docs/change-log",
        statusCode: 301,
      },
      {
        source: "/blog/swr-1",
        destination: "/blog/swr-v1",
        statusCode: 301,
      },
      {
        source: "/docs",
        destination: "/docs/getting-started",
        statusCode: 302,
      },
      {
        source: "/examples",
        destination: "/examples/basic",
        statusCode: 302,
      },
    ];
  },
  reactStrictMode: true,
});
