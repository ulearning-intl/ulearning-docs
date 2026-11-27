const HELP_ROLES = ["teacher", "student", "admin", "supervisor"];

function normalizeHelpLanguage(value) {
  const code = String(value || "").trim().toLowerCase().replaceAll("_", "-");
  const primary = code.split("-")[0];
  return HELP_LANGUAGES.includes(primary) ? primary : null;
}

function initialHelpLanguage(search = window.location?.search || "", stored = localStorage.getItem("ai-helper-language")) {
  const languages = new URLSearchParams(search).getAll("language");
  // An explicit URL value wins; empty, unknown and duplicate values use Chinese.
  if (languages.length) return languages.length === 1 ? normalizeHelpLanguage(languages[0]) || "zh" : "zh";
  return normalizeHelpLanguage(stored) || "zh";
}

function syncLanguagePreference() {
  localStorage.setItem("ai-helper-language", state.language);
  if (window.location?.href && window.history?.replaceState) {
    const url = new URL(window.location.href);
    url.searchParams.set("language", state.language);
    window.history.replaceState(null, "", url);
  }
}

function initialHelpProduct(search = window.location?.search || "") {
  const values = new URLSearchParams(search).getAll("product");
  if (values.length !== 1) return "";
  const value = values[0].trim().toLowerCase();
  return /^[a-z0-9_-]{1,80}$/i.test(value) ? value : "";
}

function initialHelpDocument(search = window.location?.search || "") {
  const values = new URLSearchParams(search).getAll("doc");
  if (values.length !== 1) return "";
  const value = values[0].trim();
  return value && value.length <= 240 && !value.includes("..") && !value.includes("\\") ? value : "";
}

function initialHelpRole(search = window.location?.search || "", stored = localStorage.getItem("ai-helper-role")) {
  const params = new URLSearchParams(search);
  const roles = params.getAll("role");
  // An explicit URL role always wins over this browser's previous selection.
  // Invalid/duplicate parameters fail back to teacher, never a stored admin.
  if (roles.length) return roles.length === 1 && HELP_ROLES.includes(roles[0]) ? roles[0] : "teacher";
  return HELP_ROLES.includes(stored) ? stored : "teacher";
}

const state = {
  messages: [],
  sessions: readJson("ai-helper-sessions", []),
  feedback: readJson("ai-helper-feedback", []),
  currentSessionId: null,
  language: initialHelpLanguage(),
  role: initialHelpRole(),
  productContext: initialHelpProduct(),
  documentId: initialHelpDocument(),
  busy: false,
  requestController: null,
  requestSequence: 0,
  scope: null,
  scopeError: false,
  promptProduct: null,
  promptDocument: null,
  pendingQuestion: null,
  composerDraft: "",
  translationController: null
};

const nodes = {
  chatPanel: document.querySelector(".chat-panel"),
  messages: document.querySelector("#messages"),
  form: document.querySelector("#chatForm"),
  input: document.querySelector("#chatInput"),
  historyList: document.querySelector("#historyList"),
  promptStrip: document.querySelector(".prompt-strip"),
  toast: document.querySelector("#toast"),
  feedbackDialog: document.querySelector("#feedbackDialog"),
  feedbackDialogClose: document.querySelector("#feedbackDialogClose"),
  dialogCancel: document.querySelector("#dialogCancel"),
  dialogHandoff: document.querySelector("#dialogHandoff"),
  handoffDialog: document.querySelector("#handoffDialog"),
  handoffDialogClose: document.querySelector("#handoffDialogClose"),
  handoffCancel: document.querySelector("#handoffCancel"),
  handoffSubmit: document.querySelector("#handoffSubmit"),
  handoffInput: document.querySelector("#handoffInput"),
  languageToggle: document.querySelector("#languageToggle"),
  languageMenu: document.querySelector("#languageMenu"),
  roleSelect: document.querySelector("#roleSelect")
};

function t(key, values = {}) {
  return HelpI18n.t(state.language, key, values);
}

function localizedText(source, english = "", fallback = "helpTopic") {
  return HelpI18n.text(state.language, source, english, fallback);
}

function localizedCatalogValue(item, field, fallbackField) {
  const translations = item?.[field];
  if (translations && typeof translations === "object" && translations[state.language]) {
    return translations[state.language];
  }
  return item?.[fallbackField] || "";
}

function promptQuestion(item) {
  const question = item.question || item.queryQuestion || item.label;
  const translated = localizedCatalogValue(item, "questionTranslations", "questionEn");
  return item.contentLanguage === state.language ? question : localizedText(question, translated);
}

function helpQuestionLabel(item) {
  const label = item.label || item.question;
  const translated = localizedCatalogValue(item, "labelTranslations", "labelEn");
  return item.contentLanguage === state.language ? label : localizedText(label, translated);
}

function categoryLabel(item) {
  return localizedText(item.categoryLabel, item.categoryLabelEn, "otherHelp");
}

function applyLanguage() {
  const language = state.language;
  document.documentElement.lang = language === "zh" ? "zh-CN" : language;
  // The design is intentionally identical in every locale. Only text uses bidi.
  document.documentElement.dir = "ltr";
  nodes.input.setAttribute("dir", "auto");
  nodes.handoffInput.setAttribute("dir", "auto");
  document.title = t("pageTitle");
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
  [
    ["data-i18n-placeholder", "placeholder"],
    ["data-i18n-title", "title"],
    ["data-i18n-aria-label", "aria-label"]
  ].forEach(([dataAttribute, targetAttribute]) => {
    document.querySelectorAll(`[${dataAttribute}]`).forEach((element) => {
      element.setAttribute(targetAttribute, t(element.getAttribute(dataAttribute)));
    });
  });
  nodes.languageToggle?.setAttribute("aria-label", t("languageSwitcher"));
  nodes.languageToggle?.setAttribute("title", t("languageSwitcher"));
  nodes.languageMenu?.setAttribute("aria-label", t("languageSwitcher"));
  document.querySelectorAll("[data-help-language]").forEach((button) => {
    button.setAttribute("aria-checked", String(button.dataset.helpLanguage === language));
  });
  const note = document.querySelector("#languageContentNote");
  if (note) { note.textContent = t("sourceContentNotice"); note.hidden = !note.textContent; }
  [["#sidebarToggle", "collapseSidebar"], ["#sidebarExpand", "expandSidebar"],
    ["#sidebarScrim", "closeSidebar"], ["#compactNewChat", "newChat"], ["#themeToggle", "toggleTheme"]]
    .forEach(([selector, key]) => document.querySelector(selector)?.setAttribute("aria-label", t(key)));
  applyRoleUI();
  syncComposer();
  renderHistory();
}

function setLanguage(language) {
  if (!HELP_LANGUAGES.includes(language)) return;
  setLanguageMenuOpen(false);
  if (state.language === language) { syncLanguagePreference(); return; }
  // Do not let a late answer/translation enter another language or conversation.
  if (state.busy) stopAnswering();
  cancelMessageTranslations();
  state.language = language;
  syncLanguagePreference();
  applyLanguage();
  renderAllMessages(true);
  void translateStoredMessages();
  void loadKnowledgeScope();
  showToast(t("switched"));
}

function cancelMessageTranslations() {
  state.translationController?.abort();
  state.translationController = null;
}

async function translateStoredMessages() {
  cancelMessageTranslations();
  const { language, role, currentSessionId: sessionId } = state;
  const messages = state.messages.filter((message) => message.docsDocumentId && message.contentLanguage !== language);
  if (!messages.length) return;
  const controller = new AbortController();
  state.translationController = controller;
  try {
    for (const message of messages) {
      const result = await getAssistantAnswer(`doc:${message.docsDocumentId}`, role, controller.signal);
      if (controller.signal.aborted || sessionId !== state.currentSessionId || role !== state.role || language !== state.language) return;
      if (result.intent === "service_error") continue;
      const available = result.intent === "docs_article" && result.contentLanguage === language;
      Object.assign(message, {
        content: available ? result.answer : t("documentUnavailable"),
        contentLanguage: language,
        language,
        articleBlocks: available ? result.articleBlocks : [],
        tutorialMode: available,
        suppressTutorial: !available
      });
      refreshMessage(message);
      const question = state.messages[state.messages.indexOf(message) - 1];
      if (available && question?.role === "user" && question.queryQuestion === `doc:${message.docsDocumentId}`) {
        question.questionTranslations = { ...question.questionTranslations, [language]: result.resolvedQuestion };
        refreshMessage(question);
      }
      persistCurrentSession();
    }
  } catch (error) {
    if (error.name !== "AbortError") console.warn("Document language update failed", error);
  } finally {
    if (state.translationController === controller) state.translationController = null;
  }
}

function setLanguageMenuOpen(open, focus = false, last = false) {
  if (!nodes.languageMenu || !nodes.languageToggle) return;
  nodes.languageMenu.hidden = !open;
  nodes.languageToggle.setAttribute("aria-expanded", String(open));
  if (open && focus) {
    const options = [...nodes.languageMenu.querySelectorAll("[data-help-language]")];
    const selected = options.find((option) => option.dataset.helpLanguage === state.language);
    (last ? options.at(-1) : selected || options[0])?.focus();
  }
}

function bindLanguageMenu() {
  const options = () => [...nodes.languageMenu.querySelectorAll("[data-help-language]")];
  nodes.languageToggle?.addEventListener("click", () => setLanguageMenuOpen(nodes.languageMenu.hidden, true));
  nodes.languageToggle?.addEventListener("keydown", (event) => {
    if (["ArrowDown", "ArrowUp"].includes(event.key)) {
      event.preventDefault();
      setLanguageMenuOpen(true, true, event.key === "ArrowUp");
    }
  });
  nodes.languageMenu?.addEventListener("click", (event) => {
    const option = event.target.closest("[data-help-language]");
    if (!option) return;
    setLanguage(option.dataset.helpLanguage);
    nodes.languageToggle.focus();
  });
  nodes.languageMenu?.addEventListener("keydown", (event) => {
    const items = options();
    const index = items.indexOf(document.activeElement);
    let target;
    if (event.key === "ArrowDown") target = items[(index + 1) % items.length];
    if (event.key === "ArrowUp") target = items[(index - 1 + items.length) % items.length];
    if (event.key === "Home") target = items[0];
    if (event.key === "End") target = items.at(-1);
    if (target) { event.preventDefault(); target.focus(); }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !nodes.languageMenu.hidden) {
      event.preventDefault(); setLanguageMenuOpen(false); nodes.languageToggle.focus();
    }
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".language-picker")) setLanguageMenuOpen(false);
  });
  document.addEventListener("focusin", (event) => {
    if (!event.target.closest(".language-picker")) setLanguageMenuOpen(false);
  });
}

const beeMascotMarkup = `<span class="bee-mascot" aria-hidden="true"></span>`;
const featureLinks = [];
let screenshotGuides = [];
let videoGuides = [];

function roleLabel(role = state.role) {
  return ROLE_UI[state.language][role]?.label || ROLE_UI[state.language].teacher.label;
}

function contentAllowed(item) {
  const roles = item.roles === undefined ? ["teacher"] : item.roles;
  return Array.isArray(roles) && roles.length > 0 && roles.every((role) => HELP_ROLES.includes(role))
    && (state.role === "admin" || roles.includes(state.role));
}

function productLabel(product) {
  return state.scope?.groups?.[product]?.label || { ulms: "uLMS", uclass: "uClass", uagent: "uAgent", urecord: "uRecord" }[product] || product;
}

function promptQuestionEn(item) {
  return item.questionTranslations?.en || item.questionEn || "How do I use this feature?";
}

function promptLabel(item) {
  const label = helpQuestionLabel(item);
  return state.role === "admin" && item.audienceLabel
    ? `${roleLabel(item.audienceRole || "teacher")} · ${label}` : label;
}

function promptCardMarkup(item) {
  const label = promptLabel(item) || t("helpTopic");
  const detail = item.available === false ? t("roleGuidesSoon")
    : state.language === "en" ? t("productHelp", { product: productLabel(item.product) }) : t("viewGuideSteps");
  return `
    <button class="prompt-card${item.available === false ? " prompt-card-muted" : ""}" type="button"
      data-question="${escapeAttr(item.question || item.queryQuestion || "")}" data-question-localized="${escapeAttr(promptQuestion(item))}" data-question-en="${escapeAttr(promptQuestionEn(item))}"
      data-query-question="${escapeAttr(item.queryQuestion || item.question || "")}">
      <span>${escapeHtml(label)}</span>
      <small><span class="prompt-detail-full">${escapeHtml(detail)}</span><span class="prompt-detail-compact">${escapeHtml(item.available === false ? t("roleGuidesSoon") : t("viewGuideShort"))}</span></small>
    </button>`;
}

const PROMPT_CARD_LIMIT = 6;
const HELP_PAGE_SIZE = 8;

function getPromptGroups() {
  if (!state.scope || state.scope.language !== state.language) return {};
  const groups = state.scope?.groups;
  const candidates = groups && typeof groups === "object" && !Array.isArray(groups)
    ? groups
    : (Array.isArray(state.scope?.questions) ? state.scope.questions : []).reduce((result, item) => {
        const product = item.product || "ulms";
        (result[product] ||= { questions: [] }).questions.push(item);
        return result;
      }, {});
  // Keep the same role scope as the backend, including the student landing-page product filter.
  return Object.fromEntries(Object.keys(candidates)
    .filter((product) => Array.isArray(candidates[product]?.questions) && candidates[product].questions.length)
    .map((product) => [product, candidates[product]]));
}

function promptProductMarkup(product, group) {
  const styleProduct = product === "ulearning" ? "ulms" : product;
  const descriptions = { uclass: t("uclassDescription"), ulms: t("ulmsDescription"), uagent: t("uagentDescription"), urecord: t("urecordDescription") };
  const count = group.questions.length;
  const countLabel = group.available === false
    ? t("roleGuidesSoon")
    : t("helpTopics", { count });
  const compactCountLabel = group.available === false
    ? countLabel
    : t("compactTopicCount", { count });
  return `
    <button class="prompt-card prompt-product-card" type="button" data-prompt-product="${escapeAttr(product)}">
      <span class="prompt-product-mark prompt-product-mark-${escapeAttr(styleProduct)}" aria-hidden="true">${escapeHtml({ uclass: "UC", ulms: "LM", uagent: "AI", urecord: "RC" }[styleProduct] || (group.label || product).slice(0, 2).toUpperCase())}</span>
      <span class="prompt-product-title">${t("productHelp", { product: productLabel(product) })}</span>
      <small>${escapeHtml(descriptions[styleProduct] || group.description || t("publishedDocuments"))}</small>
      <span class="prompt-product-footer"><small class="prompt-detail-full">${escapeHtml(countLabel)}</small><small class="prompt-detail-compact">${escapeHtml(compactCountLabel)}</small><span aria-hidden="true">${uiIcon("arrow-forward")}</span></span>
    </button>`;
}

function promptGroupMarkup(product, group) {
  const questions = Array.isArray(group?.questions) ? group.questions : [];
  if (!questions.length) return "";
  const hasMore = questions.length > PROMPT_CARD_LIMIT;
  const recommended = Array.isArray(group.recommendedQuestions) && group.recommendedQuestions.length
    ? group.recommendedQuestions : questions;
  const linkedQuestions = state.promptDocument
    ? questions.filter((item) => item.queryQuestion === `doc:${state.promptDocument}`) : [];
  const recentImports = group.recentImportQuestions || [];
  const seen = new Set();
  const visibleQuestions = [...linkedQuestions, ...recentImports, ...recommended, ...questions].filter((item) => {
    const key = item.faqId || item.queryQuestion || item.question;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, hasMore ? PROMPT_CARD_LIMIT - 1 : PROMPT_CARD_LIMIT);
  const title = `${t("productHelp", { product: productLabel(product) })}`;
  const countLabel = t("topicCount", { count: questions.length });
  return `
    <section class="prompt-group" data-product="${escapeAttr(product)}">
      <div class="prompt-group-heading">
        <div class="prompt-group-navigation">
          <button class="prompt-back" type="button" data-prompt-back="true">${uiIcon("arrow-left")}<span>${t("back")}</span></button>
          <strong>${escapeHtml(title)}</strong>
        </div>
        <span>${escapeHtml(countLabel)}</span>
      </div>
      <div class="prompt-group-grid">
        ${visibleQuestions.map((item) => promptCardMarkup(item)).join("")}
        ${hasMore ? `<button class="prompt-card prompt-card-more" type="button" data-help-documents="${escapeAttr(product)}">
          <span>${t("moreHelpDocuments")} <span aria-hidden="true">${uiIcon("arrow-forward")}</span></span>
          <small>${t("browseAllTopics", { count: questions.length })}</small>
        </button>` : ""}
      </div>
    </section>`;
}

function renderPromptPanel() {
  const grid = document.querySelector(".prompt-grid");
  const subtitle = document.querySelector('[data-i18n="welcomeSubtitle"]');
  const groups = getPromptGroups();
  if (!groups[state.promptProduct]) state.promptProduct = null;
  grid.classList.toggle("prompt-grid-products", !state.promptProduct);
  if (state.promptProduct) {
    grid.innerHTML = promptGroupMarkup(state.promptProduct, groups[state.promptProduct]);
    return;
  }
  subtitle.textContent = t("welcomeSubtitle");
  grid.innerHTML = Object.keys(groups).length
    ? Object.entries(groups).map(([product, group]) => promptProductMarkup(product, group)).join("")
    : `<div class="prompt-loading">${state.scopeError
        ? `${escapeHtml(t("helpLoadFailed"))} <button type="button" data-retry-scope>${escapeHtml(t("retry"))}</button>`
        : state.scope ? escapeHtml(t("noHelpDocuments")) : escapeHtml(t("loadingHelp"))}</div>`;
}

function showMoreHelpDocuments(product, savedDocuments = null) {
  const group = getPromptGroups()[product];
  const questions = group?.questions || savedDocuments?.questions?.filter(isHelpQuestionInLanguage);
  if (!questions?.length) return;
  const title = `${productLabel(product)} ${t("moreHelpDocuments")}`;
  const intro = t("helpBrowseIntro", { product: productLabel(product), count: questions.length });
  const content = [intro, "", ...questions.map((item, index) => `${index + 1}. ${promptLabel(item)}`)].join("\n");
  closePromptPanel();
  if (nodes.promptStrip.contains(document.activeElement)) document.activeElement.blur();
  state.pendingQuestion = null;
  setConversationMode(true);
  addMessage("user", title, roleLabel(), null, null, null, null, null, [], false, { uiQuestionProduct: product });
  addMessage("assistant", content, title, null, null, null, null, title, [], false,
    { product, suppressTutorial: true, helpDocuments: { version: 2, product, questions,
        language: state.language, intro, browser: { search: "", audience: "all", category: "all", page: 1 } } });
  persistCurrentSession(title, true);
}

function normalizeHelpSearch(value) {
  return String(value || "").toLocaleLowerCase().replace(/\s+/g, "");
}

function isExactHelpDocumentMatch(item, searchKey) {
  if (!searchKey) return false;
  const exactQuestion = normalizeHelpSearch(item.question || item.queryQuestion);
  const exactSection = normalizeHelpSearch(item.sourceSection);
  const exactDocument = normalizeHelpSearch(item.sourceDocument);
  return exactQuestion === searchKey
    || exactSection === searchKey
    || (item.isOverview && exactDocument === searchKey);
}

function isHelpQuestionInLanguage(item) {
  return item.contentLanguage === state.language;
}

function getHelpBrowserView(documents) {
  const group = getPromptGroups()[documents.product];
  if (state.scope?.language === state.language) {
    documents.questions = group?.questions || [];
    documents.version = 2;
    if (documents.language !== state.language) {
      documents.language = state.language;
      if (documents.browser) Object.assign(documents.browser, { category: "all", audience: "all", page: 1 });
    }
  }
  const browser = documents.browser ||= { search: "", audience: "all", category: "all", page: 1 };
  const tokens = String(browser.search || "").toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  const freshQuestions = new Map((group?.questions || []).map((item) => [item.faqId, item]));
  const questions = (Array.isArray(documents.questions) ? documents.questions : []).filter(isHelpQuestionInLanguage).map((item) => {
    const current = freshQuestions.get(item.faqId);
    return current ? { ...item, sourceDocument: current.sourceDocument, sourceSection: current.sourceSection, isOverview: current.isOverview } : item;
  });
  const searchKey = normalizeHelpSearch(browser.search);
  const exactDocuments = searchKey
    ? questions.filter((item) => isExactHelpDocumentMatch(item, searchKey))
    : [];
  const searchPool = exactDocuments.length ? exactDocuments : questions;
  const filtered = searchPool.filter((item) => {
    if (browser.audience !== "all" && (item.audienceRole || state.role) !== browser.audience) return false;
    if (browser.category !== "all" && (item.category || "other") !== browser.category) return false;
    const text = [promptLabel(item), promptQuestion(item), categoryLabel(item), item.label, item.labelEn, item.question, item.questionEn, item.categoryLabel,
      item.categoryLabelEn, item.sourceDocument, item.sourceSection, ...(item.keywords || [])].join(" ").toLocaleLowerCase();
    return tokens.every((token) => text.includes(token));
  });
  const pages = Math.max(1, Math.ceil(filtered.length / HELP_PAGE_SIZE));
  browser.page = Math.max(1, Math.min(pages, Math.floor(Number(browser.page)) || 1));
  const offset = (browser.page - 1) * HELP_PAGE_SIZE;
  return { browser, questions, filtered, pages, offset, items: filtered.slice(offset, offset + HELP_PAGE_SIZE) };
}

function highlightHelpTitle(title, search) {
  // Escape every fragment; user-entered search terms never become HTML or regex.
  const tokens = String(search || "").trim().split(/\s+/).filter(Boolean).map((token) => token.toLocaleLowerCase());
  const text = String(title || "");
  const lower = text.toLocaleLowerCase();
  let html = "";
  for (let index = 0; index < text.length;) {
    const token = tokens.find((value) => lower.startsWith(value, index));
    if (token) {
      html += `<mark>${escapeHtml(text.slice(index, index + token.length))}</mark>`;
      index += token.length;
    } else {
      html += escapeHtml(text[index]);
      index += 1;
    }
  }
  return html;
}

function renderHelpBrowserResults(documents, view = getHelpBrowserView(documents)) {
  const { browser, filtered, pages, offset, items } = view;
  const activeFilters = browser.search || browser.audience !== "all" || browser.category !== "all";
  const count = t("helpResults", { count: filtered.length }) + (filtered.length
    ? t("helpResultRange", { start: offset + 1, end: offset + items.length }) : "");
  const list = items.length ? `<div class="help-document-list">${items.map((item) => {
    const question = promptQuestion(item);
    const exactDocument = item.isOverview && normalizeHelpSearch(item.sourceDocument) === normalizeHelpSearch(browser.search);
    const title = exactDocument && (state.language === "zh" || item.contentLanguage === state.language)
      ? item.sourceDocument : helpQuestionLabel(item);
    const category = categoryLabel(item);
    const audience = ROLE_UI[state.language][item.audienceRole || state.role]?.label || "";
    const detail = state.role === "admin" ? `${audience} · ${category}` : category;
    return `<button class="help-document-link" type="button" data-followup="${escapeAttr(question)}"
      data-query-question="${escapeAttr(item.queryQuestion || item.question || "")}">
      <span class="help-document-copy"><span>${highlightHelpTitle(title, browser.search)}</span><small>${escapeHtml(detail)}</small></span><span aria-hidden="true">${uiIcon("arrow-forward")}</span>
    </button>`;
  }).join("")}</div>` : `<div class="help-browser-empty"><strong>${t("noSearchResults")}</strong><p>${t("helpSearchHint")}</p></div>`;
  return `<div class="help-browser-summary"><span role="status" aria-live="polite">${escapeHtml(count)}</span>
    ${activeFilters ? `<button type="button" data-help-reset>${t("clearFilters")}</button>` : ""}</div>
    ${list}
    ${pages > 1 ? `<nav class="help-pagination" aria-label="${t("helpPages")}">
      <button type="button" data-help-page="previous"${browser.page === 1 ? " disabled" : ""}>${t("previous")}</button>
      <label>${t("page")} <select data-help-page-select aria-label="${t("jumpPage")}">
        ${Array.from({ length: pages }, (_, index) => `<option value="${index + 1}"${index + 1 === browser.page ? " selected" : ""}>${index + 1} / ${pages}</option>`).join("")}
      </select> </label>
      <button type="button" data-help-page="next"${browser.page === pages ? " disabled" : ""}>${t("next")}</button>
    </nav>` : ""}`;
}

function renderHelpDocuments(documents) {
  const view = getHelpBrowserView(documents);
  const { browser, questions } = view;
  const audiences = new Map();
  const categories = new Map();
  questions.forEach((item) => {
    const audience = item.audienceRole || state.role;
    audiences.set(audience, (audiences.get(audience) || 0) + 1);
    const key = item.category || "other";
    if (!categories.has(key)) categories.set(key, categoryLabel(item));
  });
  return `<section class="help-documents">
    <p>${escapeHtml(t("helpDirectory", { product: productLabel(documents.product), count: questions.length }))}</p>
    <div class="help-browser-controls">
      <label class="help-search"><span aria-hidden="true">⌕</span><input type="search" data-help-search value="${escapeAttr(browser.search)}"
        placeholder="${t("searchHelpPlaceholder")}" aria-label="${t("searchHelp")}" autocomplete="off"></label>
      <label class="help-category"><span>${t("category")}</span><select data-help-category aria-label="${t("filterCategory")}">
        <option value="all">${t("allCategories")}</option>
        ${[...categories].map(([key, label]) => `<option value="${escapeAttr(key)}"${browser.category === key ? " selected" : ""}>${escapeHtml(label)}</option>`).join("")}
      </select></label>
    </div>
    ${state.role === "admin" && audiences.size > 1 ? `<div class="help-audience-filters" role="group" aria-label="${t("filterRole")}">
      <button type="button" data-help-audience="all" aria-pressed="${browser.audience === "all"}">${t("allRoles")} <span>${questions.length}</span></button>
      ${[...audiences].map(([audience, count]) => `<button type="button" data-help-audience="${escapeAttr(audience)}" aria-pressed="${browser.audience === audience}">${escapeHtml(ROLE_UI[state.language][audience]?.label || audience)} <span>${count}</span></button>`).join("")}
    </div>` : ""}
    <div class="help-browser-results">${renderHelpBrowserResults(documents, view)}</div>
  </section>`;
}

function updateHelpBrowser(control, changes) {
  const message = state.messages.find((item) => item.id === control.closest(".message")?.dataset.messageId);
  if (!message?.helpDocuments) return;
  const documents = message.helpDocuments;
  const view = getHelpBrowserView(documents);
  Object.assign(view.browser, changes);
  const section = control.closest(".help-documents");
  const results = section.querySelector(".help-browser-results");
  results.innerHTML = renderHelpBrowserResults(documents);
  // Keep the search input mounted while typing, preserving focus and IME.
  section.querySelector("[data-help-search]").value = documents.browser.search;
  section.querySelector("[data-help-category]").value = documents.browser.category;
  section.querySelectorAll("[data-help-audience]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.helpAudience === documents.browser.audience)));
  if (control.matches("[data-help-page]")) {
    results.querySelector(`[data-help-page="${control.dataset.helpPage}"]:not(:disabled)`)?.focus({ preventScroll: true });
  }
  if (control.matches("[data-help-page-select]")) results.querySelector("[data-help-page-select]")?.focus({ preventScroll: true });
  if (control.matches("[data-help-reset]")) section.querySelector("[data-help-search]").focus({ preventScroll: true });
  if (control.matches("[data-help-search]")) {
    window.clearTimeout(updateHelpBrowser.timer);
    const sessionId = state.currentSessionId;
    updateHelpBrowser.timer = window.setTimeout(() => { if (sessionId === state.currentSessionId) persistCurrentSession(); }, 350);
  } else persistCurrentSession();
}


function applyRoleUI() {
  const ui = ROLE_UI[state.language][state.role];
  nodes.roleSelect.value = state.role;
  document.querySelector("#roleLabel").textContent = t("rolePrefix");
  nodes.roleSelect.setAttribute("aria-label", t("selectRole"));
  [...nodes.roleSelect.options].forEach((option) => { option.textContent = roleLabel(option.value); });
  document.querySelector("#currentRoleName").textContent = roleLabel();
  document.querySelector("#roleTrigger").setAttribute("aria-label", t("rolePickerLabel", { label: t("helpRole"), role: roleLabel() }));
  document.querySelectorAll("[data-help-role]").forEach((button) => {
    button.textContent = roleLabel(button.dataset.helpRole);
    button.setAttribute("aria-selected", String(button.dataset.helpRole === state.role));
  });
  document.querySelector("#roleHint").textContent = t("roleHint");
  document.querySelector("#roleHintMobile").textContent = t("roleHintMobile");
  document.querySelector('[data-i18n="welcomeTitle"]').textContent = ui.title;
  nodes.input.placeholder = ui.placeholder;
  document.title = t("pageTitle");
  renderPromptPanel();

}


async function loadKnowledgeScope() {
  const { role, language } = state;
  try {
    const response = await fetch(`/api/assistant/scope?role=${encodeURIComponent(role)}&language=${encodeURIComponent(language)}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const scope = await response.json();
    if (role === state.role && language === state.language) {
      state.scope = scope;
      HelpI18n.registerScope(scope);
      state.scopeError = false;
      renderPromptPanel();
      state.messages.filter(({ helpDocuments }) => helpDocuments).forEach(refreshMessage);
    }
  } catch (error) {
    console.warn("Failed to load role knowledge scope", error);
    if (role === state.role && language === state.language) { state.scopeError = true; renderPromptPanel(); }
  }
}

async function changeRole() {
  const role = nodes.roleSelect.value;
  if (!HELP_ROLES.includes(role) || role === state.role) return;
  stopAnswering();
  persistCurrentSession();
  state.messages = [];
  state.role = role;
  state.scope = null;
  state.scopeError = false;
  localStorage.setItem("ai-helper-role", role);
  if (window.location && window.history?.replaceState) {
    const url = new URL(window.location.href);
    url.searchParams.set("role", role);
    url.searchParams.delete("helpProduct");
    url.searchParams.delete("helpDocument");
    window.history.replaceState(null, "", url);
  }
  startSession();
  applyRoleUI();
  renderHistory();
  await loadKnowledgeScope();
  applyRoleUI();
  showToast(t("roleChanged", { role: roleLabel() }));
}

async function init() {
  // Explicitly discard browser-restored form values on a full page load.
  state.composerDraft = "";
  nodes.input.value = "";
  syncLanguagePreference();
  // Apply the stored role before any network wait so student users never
  // see teacher quick-start cards while help indexes are loading.
  applyLanguage();
  repairSessionTitles();
  startSession();
  renderHistory();
  bindEvents();
  initSidebar();
  initViewportLayout();
  syncComposer();
  await loadKnowledgeScope();
  const group = getPromptGroups()[state.productContext];
  if (group) {
    state.promptProduct = group.product;
    state.promptDocument = state.documentId;
  }
  applyRoleUI();
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) void loadKnowledgeScope();
  });
}

function repairSessionTitles() {
  const count = state.sessions.length;
  state.sessions = state.sessions.filter((session) => (session.messages || []).some((message) => message.role === "user" && message.content?.trim()));
  let changed = count !== state.sessions.length;
  state.sessions = state.sessions.map((session) => {
    const title = getSessionTitle(session);
    if (session.title === title && !isBadHistoryTitle(session.title)) return session;
    changed = true;
    return { ...session, title };
  });
  if (changed) saveJson("ai-helper-sessions", state.sessions);
}

function setSidebarCollapsed(collapsed) {
  if (collapsed) setLanguageMenuOpen(false);
  const shell = document.querySelector("#appShell");
  shell.classList.toggle("sidebar-collapsed", collapsed);
  const mobile = window.matchMedia?.("(max-width: 900px)").matches;
  document.querySelector("#sidebarScrim").hidden = !mobile || collapsed;
  document.querySelector("#sidebarToggle").setAttribute("aria-expanded", String(!collapsed));
  document.querySelector("#sidebarExpand").setAttribute("aria-expanded", String(!collapsed));
  const sidebar = document.querySelector("#appSidebar");
  sidebar.inert = collapsed;
  sidebar.setAttribute("aria-hidden", String(collapsed));
  if (mobile) {
    nodes.chatPanel.inert = !collapsed;
    if (!collapsed) document.querySelector("#sidebarToggle").focus({ preventScroll: true });
    else if (sidebar.contains(document.activeElement)) document.querySelector("#sidebarExpand").focus({ preventScroll: true });
  } else nodes.chatPanel.inert = false;
}

function initSidebar() {
  const mobile = window.matchMedia?.("(max-width: 900px)").matches;
  setSidebarCollapsed(mobile || localStorage.getItem("ai-helper-sidebar-collapsed") === "true");
  const toggle = () => {
    const collapsed = !document.querySelector("#appShell").classList.contains("sidebar-collapsed");
    setSidebarCollapsed(collapsed);
    if (!window.matchMedia?.("(max-width: 900px)").matches) localStorage.setItem("ai-helper-sidebar-collapsed", String(collapsed));
  };
  document.querySelector("#sidebarToggle").addEventListener("click", toggle);
  document.querySelector("#sidebarExpand").addEventListener("click", toggle);
  document.querySelector("#sidebarScrim").addEventListener("click", () => setSidebarCollapsed(true));
  window.matchMedia?.("(max-width: 900px)").addEventListener?.("change", () => {
    setSidebarCollapsed(window.matchMedia("(max-width: 900px)").matches || localStorage.getItem("ai-helper-sidebar-collapsed") === "true");
  });
  const themeButton = document.querySelector("#themeToggle");
  const syncThemeButton = () => {
    const dark = document.documentElement.dataset.theme === "dark";
    themeButton.setAttribute("aria-pressed", String(dark));
    themeButton.setAttribute("aria-label", t("toggleTheme"));
    themeButton.querySelector("use")?.setAttribute("href", dark ? "#icon-moon" : "#icon-sun");
  };
  syncThemeButton();
  window.addEventListener("help-theme-change", syncThemeButton);
  themeButton.addEventListener("click", window.HelpTheme.toggle);
}

function initViewportLayout() {
  // The help popover follows the actual composer, including a growing draft,
  // instead of assuming a fixed desktop or mobile input height.
  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(([entry]) => {
      const height = entry.borderBoxSize?.[0]?.blockSize || nodes.form.getBoundingClientRect().height;
      document.documentElement.style.setProperty("--composer-height", `${height}px`);
    }).observe(nodes.form);
  }
  const viewport = window.visualViewport;
  const update = () => {
    const mobile = window.matchMedia?.("(max-width: 900px)").matches;
    // Pinch zoom must remain browser-native; only track keyboard/UI resizing.
    if (!mobile || (viewport && viewport.scale !== 1)) {
      document.documentElement.style.removeProperty("--app-height");
      document.documentElement.style.removeProperty("--viewport-top");
      delete document.documentElement.dataset.keyboardOpen;
      return;
    }
    document.documentElement.dataset.keyboardOpen = String(Boolean(viewport && viewport.height < window.innerHeight - 120));
    document.documentElement.style.setProperty("--app-height", `${viewport?.height || window.innerHeight}px`);
    document.documentElement.style.setProperty("--viewport-top", `${viewport?.offsetTop || 0}px`);
  };
  let frame;
  const schedule = () => { window.cancelAnimationFrame(frame); frame = window.requestAnimationFrame(update); };
  viewport?.addEventListener("resize", schedule);
  viewport?.addEventListener("scroll", schedule);
  window.addEventListener("resize", schedule);
  update();
  document.addEventListener("keydown", (event) => {
    const shell = document.querySelector("#appShell");
    if (event.defaultPrevented || !window.matchMedia?.("(max-width: 900px)").matches || shell.classList.contains("sidebar-collapsed")) return;
    if (event.key === "Escape") { event.preventDefault(); setSidebarCollapsed(true); return; }
    if (event.key !== "Tab") return;
    const items = [...document.querySelectorAll('#appSidebar button:not([disabled])')]
      .filter((element) => element.getClientRects().length && !element.closest("[hidden]"));
    const first = items[0], last = items.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  });
}

function syncComposer() {
  state.composerDraft = nodes.input.value;
  const hasInput = Boolean(nodes.input.value.trim());
  nodes.form.classList.toggle("has-input", hasInput);
  nodes.form.classList.toggle("is-busy", state.busy);
  const send = nodes.form.querySelector(".send-button");
  if (send) {
    const label = state.busy ? t("stopAnswering") : t("send");
    send.title = label;
    send.setAttribute("aria-label", label);
    send.setAttribute("aria-disabled", String(!hasInput && !state.busy));
  }
}

function stopAnswering() {
  cancelMessageTranslations();
  state.requestSequence += 1;
  state.requestController?.abort();
  state.requestController = null;
  state.busy = false;
  state.messages.filter((message) => message.pending).forEach(removeMessage);
  syncComposer();
}

function renderAllMessages(keepScroll = false) {
  const scrollTop = nodes.messages.scrollTop;
  const fragment = document.createDocumentFragment();
  state.messages.forEach((message) => renderMessageToContainer(message, fragment));
  nodes.messages.replaceChildren(fragment);
  syncLatestMessageTurn();
  prepareScreenshotImages(nodes.messages);
  nodes.messages.scrollTop = keepScroll ? scrollTop : nodes.messages.scrollHeight;
}

function closeRoleMenu(restoreFocus = false) {
  document.querySelector("#roleMenu").hidden = true;
  document.querySelector("#roleTrigger").setAttribute("aria-expanded", "false");
  if (restoreFocus) document.querySelector("#roleTrigger").focus();
}

function bindRoleMenu() {
  const trigger = document.querySelector("#roleTrigger");
  const menu = document.querySelector("#roleMenu");
  const options = [...menu.querySelectorAll("[data-help-role]")];
  const open = () => {
    closePromptPanel();
    menu.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    options.find((option) => option.dataset.helpRole === state.role)?.focus();
  };
  trigger.addEventListener("click", () => menu.hidden ? open() : closeRoleMenu());
  trigger.addEventListener("keydown", (event) => {
    if (["ArrowDown", "ArrowUp"].includes(event.key)) { event.preventDefault(); open(); }
  });
  menu.addEventListener("click", (event) => {
    const option = event.target.closest("[data-help-role]");
    if (!option) return;
    nodes.roleSelect.value = option.dataset.helpRole;
    closeRoleMenu(true);
    void changeRole();
  });
  menu.addEventListener("keydown", (event) => {
    if (event.key === "Escape") { event.preventDefault(); closeRoleMenu(true); return; }
    const current = options.indexOf(document.activeElement);
    const next = event.key === "ArrowDown" ? (current + 1) % options.length
      : event.key === "ArrowUp" ? (current + options.length - 1) % options.length
      : event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : null;
    if (next !== null) { event.preventDefault(); options[next]?.focus(); }
    if (event.key === "Tab") closeRoleMenu();
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".role-select-wrap")) closeRoleMenu();
  });
}

let promptPanelTrigger = null;

function bindEvents() {
  bindRoleMenu();
  for (const selector of ["#helpToggle", "#knowledgeButton"]) {
    document.querySelector(selector).addEventListener("click", (event) => {
      event.stopPropagation();
      if (!nodes.chatPanel.classList.contains("has-conversation")) return;
      promptPanelTrigger = event.currentTarget;
      setPromptPanelOpen(!nodes.promptStrip.classList.contains("prompt-open"));
    });
  }
  document.querySelector("#compactNewChat").addEventListener("click", () => {
    startSession();
    showToast(t("newChatStarted"));
  });
  nodes.historyList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-session]");
    if (button) {
      loadSession(button.dataset.session);
      if (window.matchMedia?.("(max-width: 900px)").matches) setSidebarCollapsed(true);
    }
  });
  nodes.promptStrip.addEventListener("click", (event) => {
    if (event.target.closest("[data-retry-scope]")) {
      state.scopeError = false;
      renderPromptPanel();
      void loadKnowledgeScope();
      return;
    }
    if (event.target.closest(".prompt-panel-close")) {
      closePromptPanel(true);
      return;
    }
    const productButton = event.target.closest("[data-prompt-product]");
    if (productButton) {
      state.promptProduct = productButton.dataset.promptProduct;
      state.promptDocument = null;
      renderPromptPanel();
      nodes.promptStrip.scrollTop = 0;
      nodes.promptStrip.querySelector(".prompt-back")?.focus({ preventScroll: true });
      return;
    }
    if (event.target.closest("[data-prompt-back]")) {
      const product = state.promptProduct;
      state.promptProduct = null;
      state.promptDocument = null;
      renderPromptPanel();
      nodes.promptStrip.scrollTop = 0;
      nodes.promptStrip.querySelector(`[data-prompt-product="${product}"]`)?.focus({ preventScroll: true });
      return;
    }
    const moreButton = event.target.closest("[data-help-documents]");
    if (moreButton) {
      showMoreHelpDocuments(moreButton.dataset.helpDocuments);
      return;
    }
    const button = event.target.closest("[data-question], [data-url]");
    if (!button) {
      const toggle = event.target.closest(".prompt-collapsed-icon");
      if (toggle && nodes.chatPanel.classList.contains("has-conversation")) {
        promptPanelTrigger = toggle;
        setPromptPanelOpen(!nodes.promptStrip.classList.contains("prompt-open"), true);
      }
      return;
    }
    if (button.dataset.url) {
      window.open(button.dataset.url, "_blank", "noopener");
      return;
    }
    const displayQuestion = button.dataset.questionLocalized || button.dataset.question;
    ask(displayQuestion, button.dataset.queryQuestion || button.dataset.question);
  });

  document.addEventListener("click", (event) => {
    // Product navigation replaces the clicked card before bubbling reaches the
    // document. Use the original event path, not only its now-detached target.
    if (event.composedPath().includes(nodes.promptStrip)) return;
    closePromptPanel();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nodes.promptStrip.classList.contains("prompt-open")) {
      event.preventDefault();
      closePromptPanel(true);
    }
  });

  nodes.messages.addEventListener("click", (event) => {
    const browserControl = event.target.closest("[data-help-audience], [data-help-page], [data-help-reset]");
    if (browserControl) {
      const documents = state.messages.find((item) => item.id === browserControl.closest(".message")?.dataset.messageId)?.helpDocuments;
      if (!documents) return;
      if (browserControl.hasAttribute("data-help-reset")) updateHelpBrowser(browserControl, { search: "", audience: "all", category: "all", page: 1 });
      else if (browserControl.dataset.helpAudience) updateHelpBrowser(browserControl, { audience: browserControl.dataset.helpAudience, category: "all", page: 1 });
      else updateHelpBrowser(browserControl, { page: (documents.browser?.page || 1) + (browserControl.dataset.helpPage === "next" ? 1 : -1) });
      return;
    }
    const tutorialTab = event.target.closest("[data-tutorial-tab]");
    if (tutorialTab) {
      switchTutorialTab(tutorialTab);
      return;
    }

    const scrollButton = event.target.closest("[data-screenshot-scroll]");
    if (scrollButton) {
      scrollScreenshotGuide(scrollButton);
      return;
    }

    const stepButton = event.target.closest("[data-screenshot-step]");
    if (stepButton) {
      activateScreenshotStep(stepButton);
      return;
    }

    const actionButton = event.target.closest("[data-message-action]");
    if (actionButton) {
      handleMessageAction(actionButton);
      return;
    }

    const button = event.target.closest("[data-followup]");
    if (!button) return;
    ask(button.dataset.followup, button.dataset.queryQuestion || button.dataset.followup);
  });

  nodes.messages.addEventListener("input", (event) => {
    if (event.target.matches("[data-help-search]") && !event.isComposing) updateHelpBrowser(event.target, { search: event.target.value, page: 1 });
  });
  nodes.messages.addEventListener("compositionend", (event) => {
    if (event.target.matches("[data-help-search]")) updateHelpBrowser(event.target, { search: event.target.value, page: 1 });
  });
  nodes.messages.addEventListener("change", (event) => {
    if (event.target.matches("[data-help-category]")) updateHelpBrowser(event.target, { category: event.target.value, page: 1 });
    if (event.target.matches("[data-help-page-select]")) updateHelpBrowser(event.target, { page: Number(event.target.value) });
  });

  nodes.form.addEventListener("submit", (event) => {
    event.preventDefault();
    const question = nodes.input.value.trim();
    if (state.busy) { stopAnswering(); persistCurrentSession(); return; }
    if (!question) return;
    nodes.input.value = "";
    nodes.input.style.height = "";
    syncComposer();
    ask(question);
  });

  nodes.input.addEventListener("input", () => {
    nodes.input.style.height = "auto";
    nodes.input.style.height = `${Math.min(Math.max(48, nodes.input.scrollHeight), 150)}px`;
    syncComposer();
  });

  nodes.input.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || event.shiftKey || event.isComposing || event.keyCode === 229) return;
    if (window.matchMedia?.("(hover: none) and (pointer: coarse)").matches && !event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    if (!nodes.input.value.trim()) return;
    nodes.form.requestSubmit();
  });

  document.querySelector("#newChat").addEventListener("click", () => {
    startSession();
    if (window.matchMedia?.("(max-width: 900px)").matches) setSidebarCollapsed(true);
    showToast(t("newChatStarted"));
  });

  bindLanguageMenu();
  nodes.roleSelect.addEventListener("change", changeRole);

  nodes.feedbackDialogClose.addEventListener("click", closeFeedbackDialog);
  nodes.dialogCancel.addEventListener("click", closeFeedbackDialog);
  nodes.feedbackDialog.addEventListener("click", (event) => {
    if (event.target === nodes.feedbackDialog) closeFeedbackDialog();
  });
  nodes.dialogHandoff.addEventListener("click", () => {
    closeFeedbackDialog();
    startManualHandoff();
  });
  nodes.handoffDialogClose.addEventListener("click", closeHandoffDialog);
  nodes.handoffCancel.addEventListener("click", closeHandoffDialog);
  nodes.handoffDialog.addEventListener("click", (event) => {
    if (event.target === nodes.handoffDialog) closeHandoffDialog();
  });
  nodes.handoffSubmit.addEventListener("click", submitHandoffFeedback);
}



function startSession() {
  stopAnswering();
  persistCurrentSession();
  state.currentSessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  state.messages = [];
  state.pendingQuestion = null;
  state.promptProduct = null;
  state.promptDocument = null;
  // Keep the unsent input on the page for the next conversation; do not store it.
  renderPromptPanel();
  nodes.messages.innerHTML = "";
  setConversationMode(false);
  renderHistory();
}

async function ask(question, queryQuestion = question) {
  if (state.busy || !String(question || "").trim()) return;
  const role = state.role;
  const sessionId = state.currentSessionId;
  if (state.pendingQuestion && (/^(ulms|lms|uclass|uagent|urecord|录播平台|录播系统)$/i.test(queryQuestion.trim()) || Object.entries(state.scope?.groups || {}).some(([id, group]) => [id, group.label].some((label) => String(label).toLowerCase() === queryQuestion.trim().toLowerCase())))) {
    queryQuestion = `在 ${queryQuestion.trim()} 中，${state.pendingQuestion}`;
  }
  closePromptPanel();
  if (nodes.promptStrip.contains(document.activeElement)) document.activeElement.blur();
  setConversationMode(true);
  const userMessage = addMessage("user", question, roleLabel());
  userMessage.queryQuestion = queryQuestion;
  if (queryQuestion.startsWith("doc:")) {
    const item = Object.values(getPromptGroups()).flatMap((group) => group.questions)
      .find((entry) => entry.queryQuestion === queryQuestion);
    userMessage.questionTranslations = item?.questionTranslations;
  }
  // Save the first submitted question immediately, including if its answer is stopped.
  persistCurrentSession(question, true);
  const thinkingMessage = addThinkingMessage();
  state.busy = true;
  const sequence = ++state.requestSequence;
  const controller = new AbortController();
  state.requestController = controller;
  syncComposer();
  let result;
  try {
    result = await getAssistantAnswer(queryQuestion, role, controller.signal);
  } catch (error) {
    if (error.name !== "AbortError") console.warn("Answer request failed", error);
    if (sequence === state.requestSequence) {
      removeMessage(thinkingMessage);
      state.busy = false;
      state.requestController = null;
      syncComposer();
    }
    return;
  }
  if (sequence !== state.requestSequence || role !== state.role || sessionId !== state.currentSessionId) return;
  state.busy = false;
  state.requestController = null;
  syncComposer();
  removeMessage(thinkingMessage);
  const docsArticle = result.intent === "docs_article" && result.contentLanguage === state.language;
  const unavailable = result.intent === "docs_unavailable";
  addMessage("assistant", unavailable ? t("documentUnavailable") : result.answer, t("pageTitle"),
    null, null, null, null, result.resolvedQuestion || queryQuestion, [], docsArticle,
    { knowledgeSource: result.knowledgeSource, suppressTutorial: !docsArticle,
      uiContentKey: ({ current_role: "currentRoleAnswer", service_error: "serviceError" })[result.intent],
      docsDocumentId: result.documentId || (queryQuestion.startsWith("doc:") ? queryQuestion.slice(4) : undefined),
      contentLanguage: state.language, articleBlocks: docsArticle ? result.articleBlocks : [] });
  persistCurrentSession(question);
}

async function getAssistantAnswer(question, role = state.role, signal = undefined) {
  // This is local UI state, not an article lookup. Answer from the same i18n
  // files as the role menu, even if the backend is stale or unavailable.
  if (HelpI18n.isCurrentRoleQuestion(question)) {
    const answer = HelpI18n.t(state.language, "currentRoleAnswer", { role: roleLabel(role) });
    return { answer, intent: "current_role", role, language: state.language,
      resolvedQuestion: question, matched: false, modelUsed: false, matches: [], relatedQuestions: [],
      answerTranslations: { [state.language]: answer }, answerTranslationComplete: true };
  }
  try {
    const response = await fetch("/api/assistant/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal,
      body: JSON.stringify({ message: question, language: state.language, role,
        product: question.startsWith("doc:") ? "" : state.promptProduct || state.productContext, documentId: state.documentId })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (data.answer) return data;
  } catch (error) {
    if (error.name === "AbortError") throw error;
    console.warn("Backend chat failed.", error);
  }
  return {
    answer: t("serviceError"),
    matched: false, intent: "service_error"
  };
}

function localizedSessionTitle(session) {
  const title = getSessionTitle(session);
  const question = (session.messages || []).find((message) => message.role === "user");
  if (question?.uiQuestionProduct) return normalizeSessionTitle(`${productLabel(question.uiQuestionProduct)} ${t("moreHelpDocuments")}`);
  if (question?.questionTranslations?.[state.language]) return normalizeSessionTitle(question.questionTranslations[state.language]);
  return normalizeSessionTitle(HelpI18n.lookup(state.language, question?.queryQuestion || question?.content)
    || HelpI18n.lookup(state.language, title) || title);
}

function renderHistory() {
  const sessions = state.sessions.filter((item) => (item.audienceRole || "teacher") === state.role);
  nodes.historyList.innerHTML = sessions
    .slice(0, 12)
    .map((item) => {
      const title = localizedSessionTitle(item);
      return `<button class="history-item ${item.id === state.currentSessionId ? "active" : ""}" type="button" data-session="${escapeAttr(item.id)}"><span class="history-title">${escapeHtml(title)}</span></button>`;
    })
    .join("");

}

function loadSession(sessionId) {
  const session = state.sessions.find((item) => item.id === sessionId);
  if (!session || (session.audienceRole || "teacher") !== state.role) return;
  stopAnswering();
  persistCurrentSession();
  state.pendingQuestion = null;
  state.currentSessionId = session.id;
  state.messages = session.messages || [];
  setConversationMode(state.messages.length > 0);
  renderAllMessages();
  renderHistory();
  void translateStoredMessages();
}

function persistCurrentSession(titleHint, promote = false) {
  const usefulMessages = state.messages.filter((item) => item.role === "user" && item.content?.trim());
  if (!state.currentSessionId || !usefulMessages.length) return;
  const existingSession = state.sessions.find((item) => item.id === state.currentSessionId);
  const existingTitle = isBadHistoryTitle(existingSession?.title) ? "" : existingSession?.title;
  const rawTitle = usefulMessages[0]?.content || existingTitle || titleHint || t("newSessionTitle");
  const title = normalizeSessionTitle(rawTitle);
  const session = {
    id: state.currentSessionId,
    title,
    updatedAt: promote || !existingSession ? new Date().toISOString() : existingSession.updatedAt,
    audienceRole: state.role,
    messages: state.messages.filter((item) => !item.pending)
  };
  // Viewing history, feedback, translations and directory filters are not
  // new conversation activity. Only a submitted question promotes a session.
  const index = state.sessions.findIndex((item) => item.id === session.id);
  if (index < 0 || promote) {
    state.sessions = state.sessions.filter((item) => item.id !== session.id);
    state.sessions.unshift(session);
  } else {
    state.sessions[index] = session;
  }
  state.sessions = state.sessions.slice(0, 20);
  saveJson("ai-helper-sessions", state.sessions);
  renderHistory();
}

function setConversationMode(hasConversation) {
  nodes.chatPanel.classList.toggle("is-empty", !hasConversation);
  nodes.chatPanel.classList.toggle("has-conversation", hasConversation);
  closePromptPanel();
}

function setPromptPanelOpen(open, moveFocus = false) {
  const floating = nodes.chatPanel.classList.contains("has-conversation");
  const isOpen = floating && Boolean(open);
  nodes.promptStrip.classList.toggle("prompt-open", isOpen);
  const toggle = nodes.promptStrip.querySelector(".prompt-collapsed-icon");
  const panel = nodes.promptStrip.querySelector(".prompt-panel-content");
  if (toggle) toggle.setAttribute("aria-expanded", String(isOpen));
  document.querySelector("#helpToggle")?.setAttribute("aria-expanded", String(isOpen));
  document.querySelector("#knowledgeButton")?.setAttribute("aria-expanded", String(isOpen));
  if (panel) {
    // Hidden cards must not receive keyboard focus or be announced as an open
    // menu. The same content remains available on the conversation-free home.
    panel.inert = floating && !isOpen;
    panel.setAttribute("aria-hidden", String(floating && !isOpen));
  }
  if (moveFocus && floating) {
    const target = isOpen ? panel?.querySelector(".prompt-back, [data-prompt-product], [data-question]") : (promptPanelTrigger || document.querySelector("#helpToggle"));
    target?.focus({ preventScroll: true });
  }
}

function closePromptPanel(restoreFocus = false) {
  setPromptPanelOpen(false, restoreFocus);
}

function getSessionTitle(session) {
  const userQuestion = (session.messages || []).find((item) => item.role === "user" && !isBadHistoryTitle(item.content))?.content;
  const title = isBadHistoryTitle(session.title) ? "" : session.title;
  return normalizeSessionTitle(title || userQuestion || "历史对话");
}

function normalizeSessionTitle(value) {
  const text = String(value || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return "新对话";
  return text.length > 22 ? `${text.slice(0, 22)}...` : text;
}

function isBadHistoryTitle(value) {
  const text = String(value || "").trim();
  return (
    !text ||
    /^\d{1,2}\/\d{1,2}\s+\d{1,2}:\d{2}$/.test(text) ||
    /^\d{1,2}-\d{1,2}\s+\d{1,2}:\d{2}$/.test(text) ||
    /^\d{4}-\d{1,2}-\d{1,2}/.test(text) ||
    /^Invalid Date$/i.test(text)
  );
}

function addMessage(role, content, meta, video, videoMenu, screenshot, guidance, sourceQuestion, blockedQuestions = [], tutorialMode = false, context = {}) {
  const message = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content: normalizeMessageDisplayText(content),
    meta,
    video,
    videoMenu,
    screenshot,
    guidance,
    sourceQuestion,
    blockedQuestions,
    tutorialMode,
    audienceRole: state.role,
    language: state.language,
    ...context,
    at: new Date().toISOString()
  };
  state.messages.push(message);
  renderMessage(message);
  return message;
}

function normalizeMessageDisplayText(content) {
  return String(content || "")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/。[？?]|[？?]。/g, "。")
    .trim();
}

function addThinkingMessage() {
  const message = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role: "assistant",
    content: t("thinking"),
    meta: t("pageTitle"),
    pending: true,
    at: new Date().toISOString()
  };
  state.messages.push(message);
  renderMessage(message);
  return message;
}

function removeMessage(message) {
  if (!message?.id) return;
  state.messages = state.messages.filter((item) => item.id !== message.id);
  const existing = nodes.messages.querySelector(`[data-message-id="${CSS.escape(message.id)}"]`);
  existing?.remove();
  syncLatestMessageTurn();
}

// The most recent submitted question and its answers form the active turn.
// Derive this after restores/replacements as well as sending new messages.
function syncLatestMessageTurn() {
  const messages = [...nodes.messages.children];
  const latestQuestion = messages.map((element) => element.classList.contains("user")).lastIndexOf(true);
  messages.forEach((element, index) => {
    element.classList.toggle("is-latest-turn", latestQuestion >= 0 && index >= latestQuestion);
  });
}

function renderMessage(message) {
  const messageElement = renderMessageToContainer(message, nodes.messages);
  syncLatestMessageTurn();
  prepareScreenshotImages(messageElement);
  window.requestAnimationFrame(() => {
    if (message.role === "assistant" && !message.pending) {
      const top = messageElement.getBoundingClientRect().top - nodes.messages.getBoundingClientRect().top + nodes.messages.scrollTop - 16;
      nodes.messages.scrollTo({ top: Math.max(0, top), behavior: screenshotScrollBehavior() });
      return;
    }
    nodes.messages.scrollTo({ top: nodes.messages.scrollHeight, behavior: screenshotScrollBehavior() });
  });
}

function refreshMessage(message) {
  const existing = Array.from(nodes.messages.querySelectorAll("[data-message-id]")).find((item) => item.dataset.messageId === message.id);
  if (!existing) return;
  const scrollTop = nodes.messages.scrollTop;
  const replacement = document.createElement("div");
  renderMessageToContainer(message, replacement);
  const replacementEl = replacement.firstElementChild;
  existing.replaceWith(replacementEl);
  syncLatestMessageTurn();
  prepareScreenshotImages(replacementEl);
  nodes.messages.scrollTop = scrollTop;
}

function messageDisplayContent(message) {
  if (message.uiContentKey === "knowledgeScopeBody") {
    return t(message.uiContentKey, { role: roleLabel(), count: state.scope?.faqCount || 0,
      products: Object.entries(state.scope?.products || {}).filter(([, count]) => count)
        .map(([product]) => productLabel(product)).join(", ") || t("loading") });
  }
  if (message.uiContentKey) return t(message.uiContentKey, { role: roleLabel() });
  if (message.uiQuestionProduct) return `${productLabel(message.uiQuestionProduct)} ${t("moreHelpDocuments")}`;
  if (message.role === "user") {
    return message.questionTranslations?.[state.language] || message.content;
  }
  if (message.docsDocumentId && message.contentLanguage !== state.language) return t("documentUnavailable");
  return normalizeMessageDisplayText(message.content);
}

function renderMessageToContainer(message, container) {
  if (!message.id) message.id = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const el = document.createElement("article");
  const label = message.role === "user" ? roleLabel(message.audienceRole || "teacher") : t("assistant");
  const hasScreenshotGuide = Boolean(message.screenshot || message.guidance?.screenshots?.length);
  const classNames = ["message", message.role];
  if (message.role === "assistant") classNames.push("has-avatar");
  if (message.pending) classNames.push("is-thinking");
  if (hasScreenshotGuide) classNames.push("has-screenshot");
  if (message.guidance) classNames.push("has-guidance");
  if (message.helpDocuments) classNames.push("has-help-browser");
  el.className = classNames.join(" ");
  el.dataset.messageId = message.id;
  const displayContent = messageDisplayContent(message);
  const currentDocument = message.docsDocumentId && message.contentLanguage === state.language;
  const canShowTutorial = Boolean(currentDocument && !message.pending && !message.suppressTutorial);
  const answerImages = canShowTutorial ? createAnswerImageCollector() : null;
  const answerHtml = message.role === "assistant" && !message.pending
    ? renderAssistantContent(displayContent, message, answerImages)
    : "";
  const screenshotGuide = canShowTutorial && answerImages.steps.length
    ? { title: answerImages.title || message.sourceQuestion, steps: answerImages.steps, fromAnswer: true }
    : null;
  const matchedVideoGuide = null;
  const unifiedTutorial = canShowTutorial && Boolean(message.tutorialMode || screenshotGuide);
  if (unifiedTutorial) el.classList.add("has-tutorial");
  const content = message.pending
    ? `<div class="thinking-indicator" role="status"><span class="thinking-spinner" aria-hidden="true"></span><span>${escapeHtml(t("thinking"))}</span></div>`
    : message.role === "assistant"
      ? (hasScreenshotGuide ? "" : answerHtml)
      : escapeHtml(displayContent);
  const screenshot = message.screenshot ? renderScreenshotGuide(message.screenshot) : "";
  const guidedScreenshots = (message.guidance?.screenshots || []).map(renderScreenshotGuide).join("");
  const video = "";
  const videoMenu = message.videoMenu ? renderVideoMenu(message.videoMenu) : "";
  const guidance = message.guidance ? renderGuidance(message.guidance) : "";
  const tutorial = unifiedTutorial
    ? renderUnifiedTutorialTabs(answerHtml, screenshotGuide, matchedVideoGuide)
    : "";
  const tools = renderMessageTools(message).trim();
  const body = `<div class="message-body"><div class="message-meta"><span>${escapeHtml(label)}</span><time>${formatTime(message.at)}</time></div>${tutorial || (content ? `<div class="message-content">${content}</div>` : "")}${unifiedTutorial ? "" : screenshot}${unifiedTutorial ? "" : guidedScreenshots}${videoMenu}${video}${guidance}${tools}</div>`;
  el.innerHTML = message.role === "assistant" ? `<div class="message-avatar">${beeMascotMarkup}</div>${body}` : body;
  container.appendChild(el);
  return el;
}

function uiIcon(name) {
  return `<svg class="ui-icon" aria-hidden="true"><use href="#icon-${name}"></use></svg>`;
}

function renderMessageTools(message) {
  if (message.pending) return "";
  const tool = (action, label, icon = action) => {
    const feedback = ["like", "dislike"].includes(action);
    const active = message.feedbackState?.type === action;
    return `<button class="${active ? "active" : ""}" type="button" data-message-action="${action}" data-message-id="${escapeAttr(message.id)}" aria-label="${escapeAttr(label)}" title="${escapeAttr(label)}"${feedback ? ` aria-pressed="${active}"` : ""}>${uiIcon(active && feedback ? `${icon}-active` : icon)}</button>`;
  };
  const time = `<time datetime="${escapeAttr(message.at)}">${escapeHtml(formatTime(message.at))}</time>`;
  return message.role === "user"
    ? `<div class="message-tools" aria-label="${escapeAttr(t("questionActions"))}">${time}${tool("edit", t("edit"))}${tool("copy", t("copy"))}</div>`
    : `<div class="message-tools" aria-label="${escapeAttr(t("answerActions"))}">${tool("copy", t("copy"))}${tool("regenerate", t("regenerate"))}${tool("like", t("helpful"))}${tool("dislike", t("notHelpful"))}${time}</div>`;
}

async function handleMessageAction(button) {
  const message = state.messages.find((item) => item.id === button.dataset.messageId);
  if (!message) return;
  const action = button.dataset.messageAction;
  if (action === "copy") {
    await copyText(messageDisplayContent(message));
    showToast(t("copied"));
    return;
  }
  if (action === "edit") {
    nodes.input.value = messageDisplayContent(message);
    nodes.input.focus();
    syncComposer();
    nodes.input.style.height = "auto";
    nodes.input.style.height = `${Math.min(nodes.input.scrollHeight, 150)}px`;
    showToast(t("edited"));
    return;
  }
  if (action === "regenerate") {
    if (message.helpDocuments) {
      showMoreHelpDocuments(message.helpDocuments.product, message.helpDocuments);
      return;
    }
    const index = state.messages.findIndex((item) => item.id === message.id);
    const previousUserMessage = [...state.messages.slice(0, index)].reverse().find((item) => item.role === "user");
    const previousQuestion = previousUserMessage && messageDisplayContent(previousUserMessage);
    if (!previousQuestion) {
      showToast(t("noQuestionToRegenerate"));
      return;
    }
    ask(previousQuestion, previousUserMessage.queryQuestion || previousQuestion);
    return;
  }
  if (action === "like" || action === "dislike") {
    await toggleMessageFeedback(message, action);
  }
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }
}

async function toggleMessageFeedback(message, type) {
  if (message.feedbackState?.type === type) {
    await removeMessageFeedback(message);
    message.feedbackState = null;
    refreshMessage(message);
    persistCurrentSession();
    showToast(t(type === "like" ? "feedbackRemovedHelpful" : "feedbackRemovedNotHelpful"));
    return;
  }

  if (message.feedbackState?.type) {
    await removeMessageFeedback(message);
  }
  await recordMessageFeedback(message, type);
  refreshMessage(message);
  persistCurrentSession();
  showToast(t(type === "like" ? "feedbackHelpful" : "feedbackNotHelpful"));
  if (type === "dislike") openFeedbackDialog();
}

async function recordMessageFeedback(message, type) {
  const index = state.messages.findIndex((item) => item.id === message.id);
  const question = [...state.messages.slice(0, index)].reverse().find((item) => item.role === "user")?.content || "";
  const feedbackId = `${message.id}-${type}-${Date.now()}`;
  const item = {
    type,
    feedbackId,
    user: roleLabel(),
    time: formatFeedbackTime(new Date()),
    question
  };
  message.feedbackState = { type, feedbackId };
  state.feedback.unshift(item);
  saveJson("ai-helper-feedback", state.feedback.slice(0, 120));
  await submitFeedbackRecord(item);
}

async function removeMessageFeedback(message) {
  if (!message.feedbackState?.feedbackId) return;
  await submitFeedbackRecord({
    action: "delete",
    type: message.feedbackState.type,
    feedbackId: message.feedbackState.feedbackId
  });
}

async function submitFeedbackRecord(item) {
  try {
    const response = await fetch("/api/assistant/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item)
    });
    return response.ok;
  } catch (error) {
    console.warn("Feedback save failed.", error);
    return false;
  }
}

function openFeedbackDialog() {
  nodes.feedbackDialog.classList.add("show");
  nodes.feedbackDialog.setAttribute("aria-hidden", "false");
}

function closeFeedbackDialog() {
  nodes.feedbackDialog.classList.remove("show");
  nodes.feedbackDialog.setAttribute("aria-hidden", "true");
}

function startManualHandoff() {
  nodes.handoffInput.value = "";
  nodes.handoffDialog.classList.add("show");
  nodes.handoffDialog.setAttribute("aria-hidden", "false");
  window.setTimeout(() => nodes.handoffInput.focus(), 0);
}

function closeHandoffDialog() {
  nodes.handoffDialog.classList.remove("show");
  nodes.handoffDialog.setAttribute("aria-hidden", "true");
}

async function submitHandoffFeedback() {
  const question = nodes.handoffInput.value.trim();
  if (!question) {
    showToast(t("writeFeedbackFirst"));
    nodes.handoffInput.focus();
    return;
  }
  const saved = await submitFeedbackRecord({
    type: "handoff",
    feedbackId: `handoff-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    user: roleLabel(),
    time: formatFeedbackTime(new Date()),
    question
  });
  if (!saved) {
    showToast(t("serviceError"));
    return;
  }
  closeHandoffDialog();
  showToast(t("feedbackReceived"));
}

function renderAssistantContent(content, message, answerImages) {
  if (message?.helpDocuments) return renderHelpDocuments(message.helpDocuments);
  if (message?.docsDocumentId && message.contentLanguage === state.language && message.articleBlocks?.length) {
    return `<div lang="${escapeAttr(state.language)}" dir="auto">${renderArticleBlocks(message.articleBlocks, message, answerImages)}</div>`;
  }
  return renderPlainAssistantContent(content, message, answerImages);
}

function safeArticleImageSource(value) {
  const source = String(value || "").trim();
  if (source.startsWith("/api/assistant/image?path=")) return source;
  try {
    const url = new URL(source);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : "";
  } catch {
    return "";
  }
}

function tutorialImageUrl(source) {
  return safeArticleImageSource(source);
}

function stripInlineMarkdown(value) {
  return String(value || "").replace(/\*\*/g, "").replace(/__/g, "").replace(/`/g, "");
}

function renderFeatureLinkedText(value, message) {
  const text = stripInlineMarkdown(value);
  const sortedLinks = getClickableLinks(message).sort((a, b) => b[0].length - a[0].length);
  const renderedQuestions = new Set();
  let html = "";
  let index = 0;
  while (index < text.length) {
    const matched = sortedLinks.find(([keyword]) => isClickablePhraseMatch(text, keyword, index));
    if (!matched) { html += escapeHtml(text[index]); index += 1; continue; }
    const [keyword, question] = matched;
    if (renderedQuestions.has(question)) html += escapeHtml(keyword);
    else {
      html += `<button class="feature-link" type="button" data-followup="${escapeAttr(question)}">${escapeHtml(keyword)}</button>`;
      renderedQuestions.add(question);
    }
    index += keyword.length;
  }
  return html;
}

const markdownImagePattern = /!\[([^\]]*)\]\(([^)\s]+)\)/g;

function renderArticleImage(value, alt, answerImages) {
  const source = safeArticleImageSource(value);
  if (!source) return "";
  const caption = helpImageCaption(alt);
  answerImages?.addImage(source, caption);
  const altText = caption || "\u6587\u7ae0\u56fe\u7247";
  const captionHtml = caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : "";
  return `<figure class="article-image-figure"><img class="article-image" src="${escapeAttr(tutorialImageUrl(source))}" alt="${escapeAttr(altText)}" loading="lazy" decoding="async">${captionHtml}</figure>`;
}

function renderMarkdownImageLine(line, message, answerImages) {
  let html = "";
  let cursor = 0;
  for (const match of line.matchAll(markdownImagePattern)) {
    const before = line.slice(cursor, match.index);
    answerImages?.addContext(before);
    html += renderFeatureLinkedText(before, message);
    html += renderArticleImage(match[2], match[1], answerImages)
      || `<span class="article-image-unavailable">${escapeHtml(t("sourceImageError"))}</span>`;
    cursor = match.index + match[0].length;
  }
  const rest = line.slice(cursor);
  answerImages?.addContext(rest);
  return html + renderFeatureLinkedText(rest, message);
}

function renderPlainAssistantContent(content, message, answerImages) {
  const lines = normalizeMessageDisplayText(content).split("\n");
  const structured = lines.some((line) =>
    /^(#{1,6})\s+/.test(line) || /^\s*(?:[-*+]\s+|\d+[?.)]\s*)/.test(line) || line.search(markdownImagePattern) >= 0);
  if (!structured) {
    const paragraph = lines.map((line) => line.trim()).filter(Boolean).join(" ");
    return paragraph ? `<p class="assistant-paragraph">${renderFeatureLinkedText(paragraph, message)}</p>` : "";
  }
  return lines.map((line) => {
    if (!line.trim()) return `<div class="assistant-break" aria-hidden="true"></div>`;
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const level = Math.min(6, heading[1].length);
      answerImages?.setHeading(heading[2].replace(markdownImagePattern, ""), level);
      return `<h${level} class="assistant-heading">${renderMarkdownImageLine(heading[2], message, answerImages)}</h${level}>`;
    }
    const listItem = line.match(/^\s*[-*+]\s+(.+)$/) || line.match(/^\s*\d+[?.)]\s*(.+)$/);
    const rendered = renderMarkdownImageLine(line, message, answerImages);
    return `<div class="${listItem ? "assistant-list-item" : "assistant-line"}">${rendered}</div>`;
  }).join("");
}

function renderArticleBlocks(blocks, message, answerImages) {
  const rendered = (blocks || []).map((block) => {
    if (!block || typeof block !== "object") return "";
    const text = String(block.text || "").trim();
    if (block.type === "heading" && text) {
      const level = Math.min(6, Math.max(1, Number(block.level) || 2));
      answerImages?.setHeading(text, level);
      return `<h${level} class="help-article-heading help-article-heading-${level}">${renderFeatureLinkedText(text, message)}</h${level}>`;
    }
    if (block.type === "image") {
      return renderArticleImage(block.src, block.alt, answerImages)
        || `<p class="article-image-unavailable">${escapeHtml(t("sourceImageError"))}</p>`;
    }
    if (block.type === "paragraph" && text) return `<p class="help-article-paragraph">${renderMarkdownImageLine(text, message, answerImages)}</p>`;
    return "";
  }).join("");
  return `<article class="help-article-content">${rendered}</article>`;
}

function getClickableLinks(message) {
  if (!["teacher", "admin"].includes(state.role) || ["帮助中心（海外）", "ulearning-docs"].includes(message?.knowledgeSource) || message?.suppressTutorial) return [];
  const links = [...featureLinks];
  links.push(
    ["一、创建课程", "引导步骤一：创建课程"],
    ["二、设置教学团队", "引导步骤二：设置教学团队"],
    ["三、关联课件", "引导步骤三：关联课件"],
    ["四、开始上课", "引导步骤四：开始上课"]
  );
  const seen = new Set();
  const sourceText = normalize(message?.sourceQuestion || "");
  const shouldBlockSourceTerms = sourceText && !isOverviewQuestion(sourceText);
  const blockedQuestions = new Set((message?.blockedQuestions || []).map(normalize));
  return links.filter(([keyword, question]) => {
    if (!keyword || keyword.length < 2) return false;
    if (!isExplicitActionPhrase(keyword)) return false;
    if (shouldBlockSourceTerms && blockedQuestions.has(normalize(question))) return false;
    if (shouldBlockSourceTerms && (sourceText === normalize(question) || sourceText.includes(normalize(question)) || sourceText.includes(normalize(keyword)))) {
      return false;
    }
    const key = `${keyword}@@${question}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function isClickablePhraseMatch(text, keyword, index) {
  if (!text.startsWith(keyword, index)) return false;
  const before = index > 0 ? text[index - 1] : "";
  const after = text[index + keyword.length] || "";
  if (after === "：" || after === ":") return false;
  return !isWordLikeChar(before) && !isWordLikeChar(after);
}

function isOverviewQuestion(text) {
  return ["有哪些功能", "能做什么", "功能包括", "主要功能"].some((term) => text.includes(normalize(term)));
}

function isWordLikeChar(char) {
  return /[\p{Script=Han}A-Za-z0-9]/u.test(char);
}

function renderGuidance(guidance) {
  const actions = guidance.actions || [];
  if (!guidance.prompt && !actions.length) return "";
  return `
    <section class="guided-next">
      <p>${escapeHtml(getGuidanceTitle(guidance.type === "related" ? t("relatedGuidePrompt") : localizedText(guidance.prompt, guidance.prompt, "relatedGuidePrompt")))}</p>
      ${
        actions.length
          ? `<div class="guided-actions">${actions
              .map(
                (action) =>
                  `<button class="guided-action" type="button" data-followup="${escapeAttr(state.language === "en" ? action.question || action.queryQuestion : localizedText(action.labelZh || action.label || action.question, action.labelEn || action.label))}" data-query-question="${escapeAttr(action.queryQuestion || action.question)}">${escapeHtml(localizedText(action.labelZh || action.label, action.labelEn || action.label))}</button>`
              )
              .join("")}</div>`
          : ""
      }
    </section>
  `;
}

function getGuidanceTitle(prompt) {
  return String(prompt || "")
    .trim()
    .replace(/[。；;：:]+$/, "") + (state.language === "zh" ? "：" : ":");
}

function renderVideoGuide(video) {
  if (!video?.src) {
    return `<div class="tutorial-empty" role="status">${escapeHtml(t("noVideoTutorial"))}</div>`;
  }
  return `
    <figure class="video-guide">
      <figcaption>${escapeHtml(localizedVideoTitle(video))} - ${escapeHtml(t("videoTutorial"))}</figcaption>
      <video controls preload="none" src="${escapeAttr(encodeURI(video.src))}"></video>
    </figure>
  `;
}

function getScreenshotStepImages(step) {
  const images = Array.isArray(step.images) && step.images.length ? step.images : (step.src ? [{ src: step.src }] : []);
  return images.map((image) => typeof image === "string" ? { src: image } : image).filter((image) => {
    const source = String(image?.src || "").trim().replace(/[\u0000-\u0020]/g, "");
    // Old conversations can contain retired remote URLs. Never render them.
    return source && !/^(?:[a-z][a-z0-9+.-]*:|[/\\]{2})/i.test(source);
  });
}

function getScreenshotImages(steps) {
  return steps.flatMap((step, stepIndex) => getScreenshotStepImages(step).map((image, imageInStep, images) => ({
    ...image, stepIndex, imageInStep, imageCount: images.length
  })));
}

function mergeScreenshotTranslations(current, stored) {
  if (!current || !stored || current === stored || current.id !== stored.id) return current;
  // A saved translation is reusable only while its original caption is still
  // identical. Current source images and groupings always take precedence.
  return {
    ...current,
    titleEn: current.titleEn || (current.title === stored.title ? stored.titleEn : ""),
    questionEn: current.questionEn || (current.question === stored.question ? stored.questionEn : ""),
    titleTranslations: { ...(current.title === stored.title ? stored.titleTranslations : {}), ...current.titleTranslations },
    questionTranslations: { ...(current.question === stored.question ? stored.questionTranslations : {}), ...current.questionTranslations },
    steps: (current.steps || []).map((step, index) => {
      const old = stored.steps?.[index];
      return old?.text === step.text ? { ...step,
        textEn: step.textEn || old.textEn,
        sectionEn: step.sectionEn || (step.section === old.section ? old.sectionEn : ""),
        translations: { ...old.translations, ...step.translations },
        sectionTranslations: { ...(step.section === old.section ? old.sectionTranslations : {}), ...step.sectionTranslations }
      } : step;
    })
  };
}



function createAnswerImageCollector() {
  const steps = [];
  let title = "";
  let heading = "";
  const pendingContext = [];
  let step;
  return {
    steps,
    get title() { return title; },
    addContext(text) {
      const paragraph = stripInlineMarkdown(text).trim();
      if (paragraph) pendingContext.push(paragraph);
    },
    setHeading(text, level) {
      heading = stripInlineMarkdown(text).trim();
      if (level === 1 && !title) title = heading;
      pendingContext.length = 0;
      step = null;
    },
    addImage(src, alt) {
      if (!step || pendingContext.length) {
        const text = pendingContext.join("\n") || heading || String(alt || t("noCaption"));
        const section = heading === title || heading === text ? "" : heading;
        step = { text, section, images: [] };
        steps.push(step);
        pendingContext.length = 0;
      }
      step.images.push({ src });
    }
  };
}



function renderScreenshotGuide(guide) {
  // Prefer the current local guide when restoring stored media.
  if (guide.id && !guide.fromAnswer) guide = mergeScreenshotTranslations(findScreenshotGuideById(guide.id) || guide, guide);
  const guideTitle = guide.fromAnswer ? guide.title : localizedGuideTitle(guide);
  const steps = guide.steps || [];
  const images = getScreenshotImages(steps);
  if (!steps.length || !images.length) {
    return `<div class="tutorial-empty" role="status">${escapeHtml(t("noImageTutorial"))}</div>`;
  }
  const brief = guide.fromAnswer || state.language !== "zh" ? guideTitle : getGuideBrief(guide);
  const hasUntranslatedSteps = !guide.fromAnswer && state.language !== "zh" && steps.some((step) => state.language === "en"
    ? !step.textEn || hasChineseText(step.textEn) : !step.translations?.[state.language]);
  const prerequisite = guide.fromAnswer || state.language !== "zh" || guide.source === "帮助中心（海外）" ? null : getGuidePrerequisite(guide);
  const stepCount = steps.length;
  return `
    <section class="screenshot-guide ${stepCount >= 6 ? "is-dense" : ""}" ${guide.language ? `lang="${escapeAttr(guide.language)}"` : ""} data-active-image="0" data-active-step="0" aria-label="${escapeAttr(t("imageTutorial"))}">
      <div class="guide-brief">
        <strong>${escapeHtml(brief)}</strong>
        ${hasUntranslatedSteps ? `<small class="guide-translation-notice">${escapeHtml(t("captionTranslationUnavailable"))}</small>` : ""}
        ${prerequisite ? `<div class="guide-prerequisite-inline">
          <span>开始前：${escapeHtml(prerequisite.label)}。${escapeHtml(prerequisite.reason)}</span>
          <button class="guide-prerequisite-action" type="button" data-followup="${escapeAttr(prerequisite.question)}">去查看</button>
        </div>` : ""}
      </div>
      <div class="screenshot-carousel" style="--step-column-width: ${getScreenshotStepColumnWidth(stepCount)}px; --screenshot-min-height: ${getScreenshotMinimumHeight(stepCount)}px;">
        <div class="screenshot-steps" aria-label="${t("operationSteps")}">
          ${steps.map((item, stepIndex) => {
            const section = guide.fromAnswer || !item.section ? item.section
              : item.sectionTranslations?.[state.language] || localizedText(item.section, item.sectionEn, "operationSteps");
            const caption = guide.fromAnswer ? item.text : localizedScreenshotStep(item);
            return `
            <button class="screenshot-step ${stepIndex === 0 ? "active" : ""}" type="button" data-screenshot-step="${stepIndex}" data-screenshot-first-image="${images.findIndex((image) => image.stepIndex === stepIndex)}" aria-current="${stepIndex === 0 ? "step" : "false"}">
              <span class="screenshot-step-index">${t("stepLabel", { step: stepIndex + 1 })}</span>
              <span class="screenshot-step-copy">${item.section ? `<span class="screenshot-step-section">${escapeHtml(section)}</span>` : ""}<span class="screenshot-step-text">${escapeHtml(caption)}</span>${getScreenshotStepImages(item).length > 1 ? `<span class="screenshot-step-image-count">${t("imageCount", { count: getScreenshotStepImages(item).length })}</span>` : ""}</span>
            </button>`;
          }).join("")}
        </div>
        <div class="screenshot-stage">
          <button class="screenshot-nav screenshot-nav-prev" type="button" data-screenshot-scroll="-1" aria-label="${t("previousImage")}" disabled>${uiIcon("arrow-left")}</button>
          <div class="screenshot-rail" tabindex="0" aria-label="${t("tutorialImages")}">
            ${images.map((image, index) => `
              <article class="screenshot-card" data-image-index="${index}" data-step-index="${image.stepIndex}" data-step-image-index="${image.imageInStep}" data-step-image-count="${image.imageCount}">
                <div class="screenshot-image-wrap">
                  <img src="${escapeAttr(tutorialImageUrl(image.src))}" alt="${escapeAttr(t("imageAlt", { title: guideTitle, step: image.stepIndex + 1, image: image.imageInStep + 1, count: image.imageCount }))}" loading="lazy" decoding="async" data-trim-screenshot>
                  <div class="screenshot-image-error" role="status" hidden>${t("localImageError")}</div>
                </div>
              </article>`).join("")}
          </div>
          <button class="screenshot-nav screenshot-nav-next" type="button" data-screenshot-scroll="1" aria-label="${t("nextImage")}" ${images.length < 2 ? "disabled" : ""}>${uiIcon("arrow-right")}</button>
        </div>
      </div>
      <div class="screenshot-status" role="status" aria-live="polite"></div>
    </section>`;
}

function getScreenshotStepColumnWidth(stepCount) {
  if (stepCount <= 2) return 280;
  if (stepCount === 3) return 250;
  if (stepCount === 4) return 220;
  return stepCount >= 6 ? 270 : 240;
}

function getScreenshotMinimumHeight(stepCount) {
  return stepCount >= 6 ? 420 : 320;
}

function prepareScreenshotImages(root = document) {
  root?.querySelectorAll?.(".screenshot-guide").forEach((guide) => {
    const rail = guide.querySelector(".screenshot-rail");
    if (!rail) return;
    if (!guide.dataset.carouselReady) {
      guide.dataset.carouselReady = "1";
      let framePending = false;
      const syncFromScroll = () => {
        if (framePending) return;
        framePending = true;
        window.requestAnimationFrame(() => {
          framePending = false;
          const width = rail.clientWidth;
          if (!width) return;
          const index = Math.round(rail.scrollLeft / width);
          // Do not flash intermediate steps during an intentional smooth jump.
          if (guide.dataset.targetImage !== undefined && index !== Number(guide.dataset.targetImage)) return;
          delete guide.dataset.targetImage;
          setActiveScreenshotImage(guide, index);
        });
      };
      rail.addEventListener("scroll", syncFromScroll, { passive: true });
      rail.addEventListener("scrollend", syncFromScroll);
      for (const eventName of ["pointerdown", "touchstart", "wheel"]) {
        rail.addEventListener(eventName, () => { delete guide.dataset.targetImage; }, { passive: true });
      }
      rail.addEventListener("keydown", (event) => {
        const last = rail.querySelectorAll(".screenshot-card").length - 1;
        const current = Number(guide.dataset.targetImage ?? guide.dataset.activeImage) || 0;
        const index = event.key === "ArrowLeft" ? current - 1 : event.key === "ArrowRight" ? current + 1 : event.key === "Home" ? 0 : event.key === "End" ? last : null;
        if (index === null) return;
        event.preventDefault();
        scrollScreenshotRailTo(rail, index);
      });
      if (typeof ResizeObserver !== "undefined") {
        let previousWidth = rail.clientWidth;
        const observer = new ResizeObserver(() => {
          const width = rail.clientWidth;
          if (!width || width === previousWidth) return;
          previousWidth = width;
          delete guide.dataset.targetImage;
          const index = Number(guide.dataset.activeImage) || 0;
          rail.scrollTo({ left: index * width, behavior: "instant" });
          const list = guide.querySelector(".screenshot-steps");
          if (getComputedStyle(list).flexDirection === "row") list.scrollTo({ top: 0, behavior: "instant" });
          setActiveScreenshotStep(guide, Number(guide.dataset.activeStep) || 0);
          scheduleActiveScreenshotHeightSync(guide, index);
        });
        observer.observe(rail);
      }
    }
    setActiveScreenshotImage(guide, Number(guide.dataset.activeImage) || 0, false);
  });
  root?.querySelectorAll?.("img[data-trim-screenshot]:not([data-trim-ready])").forEach((img) => {
    img.dataset.trimReady = "1";
    const onLoad = () => {
      img.hidden = false;
      const error = img.parentElement?.querySelector(".screenshot-image-error");
      if (error) error.hidden = true;
      syncScreenshotCarouselHeight(img);
    };
    const onError = () => {
      img.hidden = true;
      const error = img.parentElement?.querySelector(".screenshot-image-error");
      if (error) error.hidden = false;
    };
    img.addEventListener("load", onLoad);
    img.addEventListener("error", onError);
    if (img.complete) img.naturalWidth ? onLoad() : onError();
  });
}





function syncScreenshotCarouselHeight(img, force = false) {
  const carousel = img.closest(".screenshot-carousel");
  const guide = img.closest(".screenshot-guide");
  const card = img.closest(".screenshot-card");
  if (!force && card && Number(card.dataset.imageIndex) !== Number(guide?.dataset.activeImage || 0)) return;
  const width = guide?.querySelector(".screenshot-stage")?.clientWidth;
  if (!carousel || !width || !img.naturalWidth || !img.naturalHeight) return;
  const minimum = getScreenshotMinimumHeight(guide.querySelectorAll(".screenshot-step").length);
  const height = Math.min(640, Math.max(minimum, Math.round(width * img.naturalHeight / img.naturalWidth)));
  carousel.style.setProperty("--screenshot-image-height", `${height}px`);
}



function screenshotScrollBehavior() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

function scrollScreenshotGuide(button) {
  const guide = button.closest(".screenshot-guide");
  const rail = guide?.querySelector(".screenshot-rail");
  if (!rail) return;
  const currentIndex = Number(guide.dataset.targetImage ?? guide.dataset.activeImage) || 0;
  scrollScreenshotRailTo(rail, currentIndex + (Number(button.dataset.screenshotScroll) || 1));
}

function activateScreenshotStep(button) {
  const guide = button.closest(".screenshot-guide");
  const rail = guide?.querySelector(".screenshot-rail");
  if (!rail) return;
  const firstImage = Number(button.dataset.screenshotFirstImage);
  if (firstImage >= 0) scrollScreenshotRailTo(rail, firstImage);
}

function scrollScreenshotRailTo(rail, index) {
  const cards = rail.querySelectorAll(".screenshot-card");
  if (!cards.length) return;
  index = Math.max(0, Math.min(cards.length - 1, index));
  const guide = rail.closest(".screenshot-guide");
  guide.dataset.targetImage = String(index);
  setActiveScreenshotImage(guide, index);
  rail.scrollTo({ left: index * rail.clientWidth, behavior: screenshotScrollBehavior() });
}

function scheduleActiveScreenshotHeightSync(guide, index) {
  const img = guide?.querySelector(`.screenshot-card[data-image-index="${index}"] img`);
  if (!img) return;
  const sync = () => syncScreenshotCarouselHeight(img);
  if (!img.complete) img.addEventListener("load", sync, { once: true });
  window.requestAnimationFrame(sync);
}

function setActiveScreenshotImage(guide, index, scrollStep = true) {
  const cards = guide.querySelectorAll(".screenshot-card");
  const card = cards[index];
  if (!card) return;
  guide.dataset.activeImage = String(index);
  const stepIndex = Number(card.dataset.stepIndex);
  guide.dataset.activeStep = String(stepIndex);
  setActiveScreenshotStep(guide, stepIndex, scrollStep);
  const previous = guide.querySelector(".screenshot-nav-prev");
  const next = guide.querySelector(".screenshot-nav-next");
  if (previous) previous.disabled = index === 0;
  if (next) next.disabled = index === cards.length - 1;
  const status = guide.querySelector(".screenshot-status");
  const stepCount = guide.querySelectorAll(".screenshot-step").length;
  const inStep = Number(card.dataset.stepImageIndex) + 1;
  const imageCount = Number(card.dataset.stepImageCount);
  if (status) status.textContent = t("screenshotStatus", { step: stepIndex + 1, steps: stepCount,
    image: inStep, images: imageCount, index: index + 1, total: cards.length });
  scheduleActiveScreenshotHeightSync(guide, index);
}

function setActiveScreenshotStep(guide, index, scrollStep = true) {
  if (!guide) return;
  const previousStep = guide.querySelector(".screenshot-step.active");
  let active = null;
  guide.querySelectorAll(".screenshot-step").forEach((step, stepIndex) => {
    const selected = stepIndex === index;
    step.classList.toggle("active", selected);
    step.setAttribute("aria-current", selected ? "step" : "false");
    if (selected) active = step;
  });
  if (!active) return;
  const list = guide.querySelector(".screenshot-steps");
  list.style.setProperty("--screenshot-step-height", `${Math.min(220, active.offsetHeight + 24)}px`);
  if (!scrollStep) return;
  const horizontal = getComputedStyle(list).flexDirection === "row";
  // Reset the new step's reading position immediately, independently from
  // the horizontal animation (a later sync must not cancel a half-done reset).
  if (horizontal && active !== previousStep) list.scrollTo({ top: 0, behavior: "instant" });
  const bounds = list.getBoundingClientRect();
  const target = active.getBoundingClientRect();
  const options = { behavior: screenshotScrollBehavior() };
  if (horizontal) {
    if (target.left < bounds.left || target.right > bounds.right) {
      options.left = list.scrollLeft + target.left - bounds.left - 12;
    }
  } else if (target.top < bounds.top + 8 || target.bottom > bounds.bottom - 8) {
    options.top = list.scrollTop + target.top - bounds.top - 12;
  }
  if (options.left !== undefined || options.top !== undefined) list.scrollTo(options);
}

function shortenStepText(text) {
  return cleanSentence(text).replace(/^登录 uLearning 教师端。?/, "登录教师端");
}

function getGuideBrief(guide) {
  const title = String(guide.title || "这个功能").replace(/截图教程$/, "");
  if (guide.source === "帮助中心（海外）") return `${title}：按原文截图查看当前角色的操作入口与步骤。`;
  if (title.includes("创建课程")) return "创建课程：帮助老师先搭好课程空间，后续班级、课件、作业和考试都会在这里开展。";
  if (title.includes("班级")) return "班级：帮助老师按教学班管理学生，方便发布活动、统计学习情况和查看成绩。";
  if (title.includes("学生")) return "学生管理：帮助老师把学生加入正确班级，后续作业、测验和课堂互动才能准确发放。";
  if (title.includes("教师") || title.includes("教学团队")) return "教学团队：帮助课程管理员分配任课教师、助教和负责班级，让协同教学更清晰。";
  if (title.includes("课件")) return "课件：帮助老师组织章节内容和学习资源，学生可以按课程安排进行学习。";
  if (title.includes("上课") || title.includes("课堂")) return "课堂：帮助老师把课件和互动带到授课现场，方便边讲解边组织学习活动。";
  if (title.includes("AI")) return "AI 助手：帮助老师快速生成、整理或分析教学内容，减少重复准备时间。";
  return `${title}：帮助老师更快完成对应教学操作，让课程管理流程更清楚。`;
}

function getGuidePrerequisite(guide) {
  const title = String(guide.title || "");
  if (title.includes("添加学生") || title.includes("邀请学生") || title.includes("学生扫码") || title.includes("老师添加学生")) {
    return {
      label: "创建班级",
      reason: "还没有班级时，学生无法加入到正确的教学对象中。",
      question: "设置教学团队：创建班级"
    };
  }
  if (title.includes("指定教师")) {
    return {
      label: "添加老师到教学团队",
      reason: "需要先把老师加入教学团队，后续才能给老师指定负责班级。",
      question: "如何设置教学团队？"
    };
  }
  if (title.includes("关联课件")) {
    return {
      label: "创建或准备课件",
      reason: "没有可用课件时，无法把教学内容关联到班课。",
      question: "如何创建课件？"
    };
  }
  if (title.includes("开始上课") || title.includes("进入课堂")) {
    return {
      label: "关联课件",
      reason: "课堂中需要调用已准备好的教学内容，未关联课件会影响上课流程。",
      question: "引导步骤三：关联课件"
    };
  }
  return null;
}

function renderVideoMenu(groups) {
  return `
    <section class="video-menu" aria-label="${escapeAttr(t("videoMenuLabel"))}">
      ${Object.entries(groups)
        .map(([group, videos]) => {
          const groupLabel = state.language === "zh" ? group : t("videoTutorial");
          const buttons = videos
            .map(
              (video) =>
                `<button class="video-menu-button" type="button" data-followup="${escapeAttr(localizedText(video.question || video.title, video.questionEn || video.titleEn, "videoQuestionFallback"))}" data-query-question="${escapeAttr(video.question)}">${escapeHtml(localizedVideoTitle(video))}</button>`
            )
            .join("");
          return `<div class="video-menu-group"><h3>${escapeHtml(groupLabel)}</h3><div class="video-menu-buttons">${buttons}</div></div>`;
        })
        .join("")}
    </section>
  `;
}















function renderUnifiedTutorialTabs(answerHtml, guide, video) {
  return `
    <section class="answer-tutorial" data-answer-tutorial>
      <div class="tutorial-tabs" role="tablist" aria-label="${escapeAttr(t("chooseGuideFormat"))}">
        <button class="tutorial-tab active" type="button" role="tab" aria-selected="true" data-tutorial-tab="text">${escapeHtml(t("textAnswer"))}</button>
        <button class="tutorial-tab" type="button" role="tab" aria-selected="false" data-tutorial-tab="image">${escapeHtml(t("imageTutorial"))}</button>
        <button class="tutorial-tab" type="button" role="tab" aria-selected="false" data-tutorial-tab="video">${escapeHtml(t("videoTutorial"))}</button>
      </div>
      <div class="tutorial-panel active" role="tabpanel" data-tutorial-panel="text">
        <div class="message-content">${answerHtml}</div>
      </div>
      <div class="tutorial-panel" role="tabpanel" data-tutorial-panel="image" hidden>
        <template data-tutorial-template>${guide ? renderScreenshotGuide(guide) : `<div class="tutorial-empty" role="status">${escapeHtml(t("noImageTutorial"))}</div>`}</template>
      </div>
      <div class="tutorial-panel" role="tabpanel" data-tutorial-panel="video" hidden>
        <template data-tutorial-template>${renderVideoGuide(video)}</template>
      </div>
    </section>
  `;
}

function localizedScreenshotStep(step) {
  if (["fr", "ar"].includes(state.language)) return step.translations?.[state.language] || String(step.text || "").trim();
  if (state.language !== "en") return shortenStepText(step.text);
  const englishStep = String(step.textEn || "").trim();
  return englishStep && !hasChineseText(englishStep)
    ? englishStep
    : String(step.text || "").trim() || t("noCaption");
}

function switchTutorialTab(button) {
  const tutorial = button.closest("[data-answer-tutorial]");
  if (!tutorial) return;
  const target = button.dataset.tutorialTab;
  tutorial.querySelectorAll("[data-tutorial-tab]").forEach((tab) => {
    const active = tab.dataset.tutorialTab === target;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  });
  tutorial.querySelectorAll("[data-tutorial-panel]").forEach((panel) => {
    const active = panel.dataset.tutorialPanel === target;
    panel.classList.toggle("active", active);
    panel.hidden = !active;
    if (active) {
      const template = panel.querySelector("[data-tutorial-template]");
      if (template) template.replaceWith(template.content.cloneNode(true));
    } else panel.querySelectorAll("video").forEach((video) => video.pause());
  });
  if (target === "image") prepareScreenshotImages(tutorial);
}

function isExplicitActionPhrase(keyword) {
  return /^(创建|新建|设置|邀请|添加|发布|关联|查看|布置|批量导入|导入|引用|手动组卷|自动组卷|组卷|安排|批阅|阅卷|开始|打开|发起|结束|导出|修改|删除|联系|填充)/.test(keyword);
}



function findScreenshotGuideById(id) {
  return screenshotGuides.find((guide) => contentAllowed(guide) && (guide.id === id || guide.title === id || guide.legacyGuideIds?.includes(id)));
}

























function hasChineseText(value) {
  return /[\u4e00-\u9fff]/u.test(String(value || ""));
}

function localizedGuideTitle(guide) {
  if (guide?.titleTranslations?.[state.language]) return guide.titleTranslations[state.language];
  if (["fr", "ar"].includes(state.language)) return localizedText(guide?.title || guide?.question, guide?.titleEn, "imageTutorial");
  if (state.language !== "en") return String(guide?.title || guide?.question || "");
  const title = String(guide?.titleEn || guide?.questionEn || "").trim();
  return title && !hasChineseText(title) ? title : String(guide?.title || guide?.question || t("imageTutorial"));
}



const VIDEO_TITLES_EN = new Map([
  ["\u521b\u5efa\u8bfe\u4ef6", "Create courseware"],
  ["\u6dfb\u52a0\u7ae0\u8282\u7ed3\u6784", "Add chapter structure"],
  ["\u586b\u5145\u8bfe\u7a0b\u5185\u5bb9", "Add course content"],
  ["\u8bfe\u4ef6\u8bbe\u7f6e\u53ca\u53d1\u5e03", "Configure and publish courseware"],
  ["\u5173\u8054\u8bfe\u4ef6", "Link courseware"],
  ["\u6dfb\u52a0\u6559\u5b66\u56e2\u961f", "Set up the teaching team"],
  ["\u53d1\u5e03\u8bfe\u7a0b\u516c\u544a", "Publish a course announcement"],
  ["\u8bbe\u7f6e\u5b66\u4e60\u8ba1\u5212", "Set up a learning plan"],
  ["\u9080\u8bf7\u5b66\u751f\u52a0\u73ed", "Invite students to join a class"],
  ["\u67e5\u770b\u8fdb\u5ea6\u6210\u7ee9", "View progress and grades"],
  ["\u6dfb\u52a0\u8d44\u6e90", "Add resources"],
  ["\u4e2a\u4eba\u4f5c\u4e1a", "Assign individual homework"],
  ["\u5c0f\u7ec4\u4f5c\u4e1a", "Assign group homework"],
  ["\u53d1\u5e03\u6d4b\u9a8c", "Publish a quiz"],
  ["\u6279\u9605\u4f5c\u4e1a", "Grade homework"],
  ["\u53d1\u5e03\u8ba8\u8bba", "Start a discussion"],
  ["\u8bd5\u9898\u5e93-\u521b\u5efa\u8bd5\u9898", "Create question bank items"],
  ["\u8bd5\u5377\u5e93-\u6dfb\u52a0\u8bd5\u5377", "Add an exam paper"],
  ["\u8bbe\u7f6e\u8bfe\u7a0b\u8003\u6838\u89c4\u5219", "Set course assessment rules"],
  ["\u67e5\u770b\u8bfe\u7a0b\u5206\u6790", "View course analytics"],
  ["\u53d1\u8d77\u6295\u5c4f", "Start screen sharing"],
  ["\u7ed3\u675f\u6295\u5c4f\u548c\u5bfc\u51fa\u6570\u636e", "End screen sharing and export data"],
  ["\u5ba2\u670d", "Contact online support"],
  ["\u4fee\u6539\u4e2a\u4eba\u8d44\u6599\u3001\u5bc6\u7801", "Edit profile and password"],
  ["PC\u7aef\u53d1\u8d77\u76f4\u64ad", "Start a live stream from the PC"],
  ["\u53d1\u5e03\u8003\u8bd5", "Schedule an exam"],
  ["\u5ba2\u6237\u7aef\u53d1\u8d77\u76f4\u64ad", "Start a live stream from the client"],
  ["\u8003\u8bd5\u7ba1\u7406\u8003\u8bd5\u5206\u6790\u7b49", "Manage exams and analytics"],
  ["\u8bfe\u7a0b\u8bc1\u4e66", "Set up course certificates"],
]);

function localizedVideoTitle(video) {
  if (["fr", "ar"].includes(state.language)) return localizedText(video?.title, video?.titleEn, "videoTutorial");
  if (state.language !== "en") return String(video?.title || "");
  const title = String(video?.titleEn || VIDEO_TITLES_EN.get(video?.title) || "").trim();
  return title && !hasChineseText(title) ? title : t("videoTutorial");
}





function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch (error) { console.warn("Local storage is unavailable or full", error); }
}

function cleanSentence(value) {
  return String(value)
    .replace(/^先/, "")
    .replace(/[。？?；]+$/, "")
    .trim() + "。";
}

function normalize(value) {
  return String(value).toLowerCase().replace(/\s+/g, "");
}



function formatTime(value) {
  return new Date(value).toLocaleString(HelpI18n.locales[state.language], { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function formatFeedbackTime(value) {
  const date = value instanceof Date ? value : new Date(value);
  const pad = (number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function showToast(message) {
  nodes.toast.textContent = message;
  nodes.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => nodes.toast.classList.remove("show"), 2200);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
    return map[char];
  });
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}



// Initialize only after all translation/history catalogs are available.
init();
