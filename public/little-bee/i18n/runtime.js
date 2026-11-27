// Classic scripts are loaded in order by index.html; no network translation is
// required for menus, role labels, prompts, topic titles or accessibility text.
const HELP_LANGUAGES = ["en", "fr", "ar", "zh"];
const UI_TRANSLATIONS = Object.fromEntries(HELP_LANGUAGES.map((code) => [code, HELP_I18N_LOCALES[code].ui]));
const ROLE_UI = Object.fromEntries(HELP_LANGUAGES.map((code) => [code, HELP_I18N_LOCALES[code].roles]));
const HelpI18n = (() => {
  const uiKeys = new Map();
  const normalize = (text) => String(text || "").trim().replace(/[？?。]+$/, "");
  for (const locale of Object.values(HELP_I18N_LOCALES)) {
    for (const [key, value] of Object.entries(locale.ui)) {
      if (value) uiKeys.set(normalize(value), key);
    }
  }
  // Match the complete query, never just the word "role" inside a tutorial.
  const roleQuestionKey = (value) => String(value || "").toLowerCase()
    .replace(/[\p{P}\p{S}\p{Z}\s_]+/gu, "");
  const roleQuestions = new Set(Object.values(HELP_I18N_LOCALES)
    .flatMap((locale) => locale.roleQuestions || []).map(roleQuestionKey));
  function isCurrentRoleQuestion(question) {
    return roleQuestions.has(roleQuestionKey(question));
  }
  function t(language, key, values = {}) {
    const text = UI_TRANSLATIONS[language]?.[key] ?? UI_TRANSLATIONS.zh[key] ?? key;
    return text.replace(/\{(\w+)\}/g, (placeholder, name) => values[name] === undefined ? placeholder : String(values[name]));
  }
  function lookup(language, source) {
    const text = String(source || "").trim();
    if (language === "zh") return text;
    const key = uiKeys.get(normalize(text));
    if (key) return t(language, key);
    let topic = HELP_I18N_TOPICS[text] || HELP_I18N_TOPICS[normalize(text)];
    if (!topic) {
      const short = normalize(text)
        .replace(/^在 (?:uAgent|uLMS|uClass|uclass|uRecord)(?: (?:教师|学生|管理员|督导员)端)?中如何/, "")
        .replace(/^如何/, "")
        .split(/\s+[·>]\s+|\s+-\s+/).pop();
      topic = HELP_I18N_TOPICS[short];
    }
    return topic?.[language] || null;
  }
  function registerScope(scope) {
    for (const group of Object.values(scope?.groups || {})) {
      for (const item of group?.questions || []) {
        for (const field of ["questionTranslations", "labelTranslations"]) {
          const translations = item?.[field];
          if (!translations || typeof translations !== "object") continue;
          const values = Object.fromEntries(Object.entries(translations).filter(([language, value]) =>
            HELP_LANGUAGES.includes(language) && value));
          for (const value of Object.values(values)) {
            if (value) HELP_I18N_TOPICS[value] = { ...(HELP_I18N_TOPICS[value] || {}), ...values };
          }
        }
      }
    }
  }
  function text(language, source, english = "", fallback = "helpTopic") {
    if (language === "zh") return String(source || "") || t(language, fallback);
    // Retain supplied English copy; French/Arabic use the offline dictionary.
    // Unknown, newly published titles use a local
    // fallback; never display an unrelated machine-guessed translation.
    return (language === "en" && english && !/[\u4e00-\u9fff]/u.test(english) ? english : "")
      || lookup(language, source)
      || t(language, fallback);
  }
  return Object.freeze({ t, text, lookup, registerScope, isCurrentRoleQuestion, locales: { zh: "zh-CN", en: "en-US", fr: "fr-FR", ar: "ar" } });
})();
