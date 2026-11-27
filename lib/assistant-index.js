import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const PAGES_ROOT = path.join(ROOT, "pages");
const CONTENT_ROOT = path.join(ROOT, "assistant-content");
const SOURCE_ROOTS = [PAGES_ROOT, CONTENT_ROOT];
const PUBLIC_ROOT = path.join(ROOT, "public");
const IGNORED_PAGE_DIRECTORIES = new Set(["api", "assistant", "blog", "docs", "practices", "sample", "solutions"]);
const KNOWN_ROLES = new Map([
  ["teacher", "teacher"],
  ["student", "student"],
  ["admin", "admin"],
  ["administrator", "admin"],
  ["reviewer", "supervisor"],
  ["supervisor", "supervisor"],
]);
const QUICK_START_ROLES = new Map([
  ["quick-start-for-administrators", "admin"],
  ["quick-start-for-students", "student"],
  ["quick-start-for-teachers", "teacher"],
  ["quick-start-for-supervisors", "supervisor"],
]);
const LOCALE_ALIASES = {
  "zh-CN": "zh",
  "en-US": "en",
  "fr-FR": "fr",
  ar: "ar",
};

let cached = null;
let cachedAt = 0;

function languageCode(locale) {
  if (typeof locale !== "string") return "en";
  return Object.hasOwn(LOCALE_ALIASES, locale) ? LOCALE_ALIASES[locale] : locale.split("-")[0].toLowerCase();
}

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

function frontmatterTitle(source) {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*(?:\n|$)/);
  if (!match) return "";
  const title = match[1].match(/^title:\s*["']?(.+?)["']?\s*$/m);
  return title ? title[1].trim() : "";
}

function stripMarkdown(value) {
  return String(value || "")
    .replace(/<[^>]+>/g, "")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[`*_~]/g, "")
    .replace(/^\s*(?:[-*+]\s+|\d+[.)]\s+)/, "")
    .replace(/^\s*#{1,6}\s+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

const IMAGE_TYPES = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".avif", ".svg"]);

function imageSource(raw, sourceFile) {
  const value = raw.trim().replace(/^<|>$/g, "");
  if (/^https:\/\//i.test(value)) return value;
  if (value.startsWith("//") || value.includes("\\") || /^[a-z][\w+.-]*:/i.test(value)) return "";
  let relative;
  try { relative = decodeURIComponent(value.split(/[?#]/, 1)[0]); }
  catch { return ""; }
  const candidates = relative.startsWith("/")
    ? [path.resolve(PUBLIC_ROOT, "." + relative)]
    : [path.resolve(path.dirname(sourceFile), relative), path.resolve(PUBLIC_ROOT, relative)];
  for (const candidate of candidates) {
    const assetPath = path.relative(ROOT, candidate).replaceAll(path.sep, "/");
    if (getAssistantImage(assetPath)) return `/api/assistant/image?path=${encodeURIComponent(assetPath)}`;
  }
  return "";
}

function parseArticle(sourceFile, language, product, role, documentId) {
  const source = fs.readFileSync(sourceFile, "utf8").replace(/^\uFEFF/, "");
  const blocks = [];
  let inCode = false;
  const body = source.replace(/^---\s*\n[\s\S]*?\n---\s*(?:\n|$)/, "");

  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line.startsWith("```") || line.startsWith("~~~")) {
      inCode = !inCode;
      continue;
    }
    if (inCode || !line || line.startsWith("import ") || line.startsWith("export ")) continue;
    if (/^<\/?(?:Callout|[A-Z][A-Za-z]+)(?:\s|>)/.test(line)) continue;

    const heading = line.match(/^(#{1,6})\s+(.+?)\s*#*$/);
    if (heading) {
      const text = stripMarkdown(heading[2]);
      if (text) blocks.push({ type: "heading", level: heading[1].length, text });
      continue;
    }

    const imagePattern = /!\[([^\]]*)\]\(\s*(<[^>]+>|[^\s)]+)(?:\s+["'][^"']*["'])?\s*\)/g;
    let cursor = 0;
    let match;
    let hadImage = false;
    while ((match = imagePattern.exec(line))) {
      hadImage = true;
      const before = stripMarkdown(line.slice(cursor, match.index));
      if (before) blocks.push({ type: "paragraph", text: before });
      blocks.push({ type: "image", src: imageSource(match[2], sourceFile), alt: stripMarkdown(match[1]) });
      cursor = match.index + match[0].length;
    }
    if (hadImage) {
      const after = stripMarkdown(line.slice(cursor));
      if (after) blocks.push({ type: "paragraph", text: after });
      continue;
    }

    const text = stripMarkdown(line);
    if (text) blocks.push({ type: "paragraph", text });
  }

  const bodyText = blocks.filter((block) => block.type === "paragraph").map((block) => block.text).join(" ");
  if (!bodyText) return null;
  const title = blocks.find((block) => block.type === "heading" && block.level === 1)?.text
    || frontmatterTitle(source) || documentId.split("/").at(-1).replaceAll("-", " ");
  return {
    id: documentId,
    product,
    role,
    language,
    title,
    blocks,
    bodyText,
    sourcePath: path.relative(ROOT, sourceFile).replaceAll(path.sep, "/"),
  };
}

function productCode(product) {
  return product === "ulearning" ? "ulms" : product;
}

function scanFiles() {
  const articles = [];
  for (const sourceRoot of SOURCE_ROOTS) {
    if (!fs.existsSync(sourceRoot)) continue;
    for (const entry of fs.readdirSync(sourceRoot, { withFileTypes: true })) {
      if (!entry.isDirectory() || IGNORED_PAGE_DIRECTORIES.has(entry.name)) continue;
      const product = productCode(entry.name);
      const productRoot = path.join(sourceRoot, entry.name);
      for (const file of walk(productRoot)) {
        if (!file.endsWith(".mdx") && !file.endsWith(".md")) continue;
        const relative = path.relative(sourceRoot, file).replaceAll(path.sep, "/");
        const parts = relative.split("/");
        if (parts.length < 3) continue;
        const filename = parts.at(-1).replace(/\.(?:mdx|md)$/i, "");
        const separator = filename.lastIndexOf(".");
        const slug = separator > 0 ? filename.slice(0, separator) : filename;
        const locale = separator > 0 ? filename.slice(separator + 1) : "zh-CN";
        // Index the locales actually exposed by the documentation site.
        if (!Object.hasOwn(LOCALE_ALIASES, locale)) continue;
        const role = KNOWN_ROLES.get(parts[1])
          || (parts[1] === "quick-start" && QUICK_START_ROLES.get(slug));
        if (!role) continue;
        const language = languageCode(locale);
        const documentId = [...parts.slice(0, -1), slug].join("/").replace(/\/index$/, "");
        try {
          const article = parseArticle(file, language, product, role, documentId);
          if (article) articles.push(article);
        } catch {
          // Ignore an unreadable article and keep the rest of the documentation available.
        }
      }
    }
  }
  return articles;
}

function fingerprint(files) {
  return files.map((file) => {
    const stat = fs.statSync(file);
    return `${file}:${stat.mtimeMs}:${stat.size}`;
  }).join("|");
}

function getIndex() {
  const files = SOURCE_ROOTS.flatMap((sourceRoot) =>
    walk(sourceRoot).filter((file) => file.endsWith(".mdx") || file.endsWith(".md"))
  ).sort();
  const now = Date.now();
  if (cached && now - cachedAt < 2000) return cached;
  const currentFingerprint = fingerprint(files);
  if (!cached || cached.fingerprint !== currentFingerprint) {
    const articles = scanFiles();
    const byId = new Map();
    for (const article of articles) {
      if (!byId.has(article.id)) byId.set(article.id, new Map());
      byId.get(article.id).set(article.language, article);
    }
    cached = { fingerprint: currentFingerprint, articles, byId };
  }
  cachedAt = now;
  return cached;
}

function canRead(article, role) {
  return role === "admin" || article.role === role;
}

function productLabel(product) {
  return {
    ulearning: "uLMS",
    ulms: "uLMS",
    uagent: "uAgent",
    utest: "uTest",
    ulcms: "uLCMS",
    uclass: "uClass",
    urecord: "uRecord",
  }[product] || product.replace(/[-_]/g, " ").replace(/\b\w/g, (value) => value.toUpperCase());
}

function catalog(language, role, selectedProduct = "") {
  const index = getIndex();
  const groups = Object.create(null);
  for (const article of index.articles) {
    if (article.language !== language || !canRead(article, role)) continue;
    if (selectedProduct && article.product !== selectedProduct) continue;
    const translations = Object.fromEntries(index.byId.get(article.id) || []);
    const question = {
      faqId: `doc:${article.id}`,
      queryQuestion: `doc:${article.id}`,
      question: article.title,
      label: article.title,
      questionTranslations: Object.fromEntries(Object.entries(translations).map(([code, value]) => [code, value.title])),
      labelTranslations: Object.fromEntries(Object.entries(translations).map(([code, value]) => [code, value.title])),
      questionEn: translations.en?.title || "",
      labelEn: translations.en?.title || "",
      contentLanguage: language,
      product: article.product,
      audienceRole: article.role,
      sourceDocument: article.title,
      sourcePath: article.sourcePath,
      available: true,
    };
    const group = groups[article.product] ||= {
      product: article.product,
      label: productLabel(article.product),
      questions: [],
      recommendedQuestions: [],
    };
    group.questions.push(question);
  }
  for (const group of Object.values(groups)) {
    group.questions.sort((left, right) => left.question.localeCompare(right.question));
    group.recommendedQuestions = group.questions.slice(0, 6);
  }
  return {
    language,
    role,
    products: Object.fromEntries(Object.values(groups).map((group) => [group.product, group.questions.length])),
    groups,
    questions: Object.values(groups).flatMap((group) => group.recommendedQuestions).slice(0, 8),
    faqCount: Object.values(groups).reduce((total, group) => total + group.questions.length, 0),
  };
}

function searchArticle(message, language, role, product, documentId) {
  const index = getIndex();
  const text = typeof message === "string" ? message.trim() : "";
  const pageQuestion = /^(?:this (?:page|article|guide)|cette page|ce guide|هذه الصفحة|当前(?:页面|文档)|这篇文档)[?？!.。؟ ]*$/i;
  const directId = text.startsWith("doc:") ? text.slice(4) : pageQuestion.test(text) ? documentId : "";
  if (directId) {
    const article = index.byId.get(directId)?.get(language);
    if (article && canRead(article, role) && (!product || article.product === product)) return article;
    return null;
  }
  const normalize = (value) => value.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  const query = normalize(text);
  if (!query) return null;
  const terms = new Set(query.replace(/如何|怎么|怎样|请问/g, " ").split(/\s+/)
    .filter((term) => term && !/^(?:a|an|i|do|how|to|the|de|un|une|la|le|comment|كيف)$/i.test(term)));
  const candidates = index.articles.filter((article) => article.language === language
    && canRead(article, role) && (!product || article.product === product));
  const ranked = candidates.map((article) => {
    const title = normalize(article.title);
    const body = normalize(article.bodyText);
    const titleHits = [...terms].filter((term) => title.includes(term)).length;
    const bodyHits = [...terms].filter((term) => body.includes(term)).length;
    const score = title === query ? 1000 : titleHits * 8 + bodyHits;
    return { article, score: score >= 8 || (bodyHits >= 2 && bodyHits === terms.size) ? score : 0 };
  }).filter((entry) => entry.score > 0).sort((left, right) =>
    right.score - left.score || Number(right.article.id === documentId) - Number(left.article.id === documentId));
  return ranked[0]?.article || null;
}

export function getAssistantCatalog({ language = "en", role = "teacher", product = "" } = {}) {
  return catalog(languageCode(language), role, productCode(product));
}

export function getAssistantAnswer({ message, language = "en", role = "teacher", product = "", documentId = "" } = {}) {
  const selectedLanguage = languageCode(language);
  const article = searchArticle(message, selectedLanguage, role, productCode(product), documentId);
  if (!article) {
    return {
      answer: "No help article is available for this language and role.",
      intent: "docs_unavailable",
      matched: false,
      language: selectedLanguage,
      role,
      knowledgeSource: "ulearning-docs",
      matches: [],
    };
  }
  return {
    answer: article.blocks.filter((block) => block.text).map((block) => block.text).join("\n\n"),
    intent: "docs_article",
    matched: true,
    language: selectedLanguage,
    contentLanguage: article.language,
    role,
    product: article.product,
    knowledgeSource: "ulearning-docs",
    documentId: article.id,
    resolvedQuestion: article.title,
    sourcePath: article.sourcePath,
    articleBlocks: article.blocks,
    matches: [{ id: `doc:${article.id}`, question: article.title, source: "ulearning-docs" }],
    relatedQuestions: [],
  };
}

export function getAssistantImage(value) {
  if (typeof value !== "string" || value.includes("\\") || value.split("/").some((part) => /^\./.test(part))) return null;
  const root = value.startsWith("public/")
    ? PUBLIC_ROOT
    : value.startsWith("pages/")
      ? PAGES_ROOT
      : value.startsWith("assistant-content/")
        ? CONTENT_ROOT
        : null;
  if (!root || !IMAGE_TYPES.has(path.extname(value).toLowerCase())) return null;
  try {
    const target = fs.realpathSync(path.resolve(ROOT, value));
    const relative = path.relative(fs.realpathSync(root), target);
    if (path.isAbsolute(relative) || relative === ".." || relative.startsWith(`..${path.sep}`)) return null;
    if (!IMAGE_TYPES.has(path.extname(target).toLowerCase())) return null;
    return fs.statSync(target).isFile() ? target : null;
  } catch {
    return null;
  }
}
