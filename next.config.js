const withNextra = require("nextra")({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.js",
  staticImage: true,
  flexsearch: {
    codeblocks: false,
  },
  defaultShowCopyCode: true,
});

const languageMap = {
  "en-US": "English",
  // "es-ES": "Español",
  "fr-FR": "Français",
  // "id-ID": "Bahasa Indonesia",
  // "th-TH": "ไทย",
  "ar": "العربية",
  "zh-CN": "简体中文",
  // "zh-TW": "繁體中文",
  // "ja": "日本語",
  // "ko": "한국어",
  // "ru": "Русский",
  // "pt-BR": "Português Brasileiro",
};

module.exports = withNextra({
  i18n: {
    locales: Object.keys(languageMap),
    defaultLocale: "en-US",
  },
  async redirects() {
    return [
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
