module.exports = {
  content: [
    "./components/**/*.{js,jsx}",
    "./pages/**/*.{md,mdx}",
    "./theme.config.js",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
        },
      },
    },
  },
};
