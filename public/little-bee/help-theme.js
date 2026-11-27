(() => {
  "use strict";

  const themeKey = "ai-helper-theme";
  const colorScheme = window.matchMedia?.("(prefers-color-scheme: dark)");
  const root = document.documentElement;

  function readPreference() {
    try {
      return localStorage.getItem(themeKey);
    } catch {
      return null;
    }
  }

  function applyTheme(theme) {
    if (root.dataset.theme === theme) return;
    root.dataset.theme = theme;
    window.dispatchEvent(new Event("help-theme-change"));
  }

  function syncTheme() {
    const preference = readPreference();
    applyTheme(preference === "dark" || preference === "light"
      ? preference : colorScheme?.matches ? "dark" : "light");
  }

  window.HelpTheme = {
    toggle() {
      const theme = root.dataset.theme === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(themeKey, theme);
      } catch {
        // The current page can still switch themes when storage is unavailable.
      }
      applyTheme(theme);
    }
  };

  syncTheme();
  colorScheme?.addEventListener?.("change", syncTheme);
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) syncTheme();
  });
  window.addEventListener("storage", (event) => {
    if (event.key === themeKey || event.key === null) syncTheme();
  });
})();
