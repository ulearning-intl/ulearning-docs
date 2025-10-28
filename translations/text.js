/**
 * @typedef {"en-US"} DefaultLocale
 * @typedef {DefaultLocale | "zh-CN" | "zh-TW" | "es-ES" | "fr-FR" | "pt-BR" | "ja" | "ko" | "ru" | "id-ID" | "th-TH" | "ar"} Locale
 */

/** @type {Readonly<Record<Locale, string>>} */
export const languageMap = {
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

/** @type {Readonly<Record<Locale, string>>} */
export const titleMap = {
  "en-US": "Smart Education Provider",
  "zh-CN": "智能教育提供者",
  "zh-TW": "智慧教育服务商",
  "es-ES": "Proveedor de Educación Inteligente",
  "fr-FR": "Fournisseur d'Éducation Intelligente",
  "pt-BR": "Provedor de Educação Inteligente",
  "ja": "スマート教育プロバイダー",
  "ko": "스마트 교육 제공자",
  "ru": "Провайдер Умного Образования",
  "id-ID": "Penyedia Pendidikan Cerdas",
  "th-TH": "ผู้ให้บริการการศึกษาอัจฉริยะ",
  "ar": "مزود التعليم الذكي",
};

/** @type {Readonly<Record<Locale, {lightweight:string;realtime?:string;suspense?:string;pagination?:string;backendAgnostic?:string;renderingStrategies?:string;typescript?:string;remoteLocal?:string;}>>} */
export const featuresMap = {
  "en-US": {
    lightweight: "Lightweight",
    realtime: "Realtime",
    suspense: "Suspense",
    pagination: "Pagination",
    backendAgnostic: "Backend Agnostic",
    renderingStrategies: "SSR / SSG Ready",
    typescript: "TypeScript Ready",
    remoteLocal: "Remote + Local",
  },
  "fr-FR": {
    lightweight: "Léger",
    realtime: "Temps réel",
    backendAgnostic: "Indépendant du Backend",
  },
  "pt-BR": {
    lightweight: "Leve",
    realtime: "Tempo-real",
    suspense: "Suspense",
    pagination: "Paginação",
    backendAgnostic: "Backend Agnóstico",
    renderingStrategies: "Pronto para SSR / SSG",
    typescript: "Pronto para TypeScript",
    remoteLocal: "Remoto + Local",
  },
  "ru": {
    lightweight: "Лёгкий",
    realtime: "В реальном времени",
    suspense: "Задержка",
    pagination: "Пагинация",
    backendAgnostic: "Бэкэнд-независимый",
    renderingStrategies: "SSR / SSG",
    typescript: "TypeScript",
    remoteLocal: "Удалённо + Локально",
  },
};

/** @type {Readonly<Record<Locale, string>>} */
export const headDescriptionMap = {
  "en-US": "SWR is a React Hooks library for data fetching. SWR first returns the data from cache (stale), then sends the fetch request (revalidate), and finally comes with the up-to-date data again.",
  "fr-FR": "SWR est une libraire de React Hooks pour récupérer des données. SWR retourne d'abord les données en cache (stale), puis envoie la requête (revalidate), et enfin retourne les données à jour.",
  "pt-BR": "SWR é uma biblioteca React Hooks para data fetching. SWR primeiro retorna os dados do cache (stale), então envia a requisição de busca (revalidate), e finalmente vem com os dados atualizados novamente.",
  "ru": "SWR — это библиотека React хуков для получения данных. SWR сначала возвращает данные из кеша (устаревшие), затем отправляет запрос на выборку (ревалидация) и, наконец, снова получает актуальные данные.",
};

/** @type {Readonly<Record<Locale, string>>} */
export const feedbackLinkMap = {
  "en-US": "Question? Give us feedback →",
  "es-ES": "¿Dudas? Danos tu feedback →",
  "fr-FR": "Question? Donnez-nous votre avis →",
  "pt-BR": "Dúvidas? Nos dê feedback →",
  "zh-CN": "有疑问？给我们反馈 →",
  "ko": "질문이 있으신가요? 피드백을 남겨주세요 →",
  "ru": "Вопросы? Оставьте нам отзыв →",
  "zh-TW": "有疑問？給我們反饋 →",
  "id-ID": "Pertanyaan? Berikan kami umpan balik →",
  "th-TH": "มีคำถาม? ให้คำติชมกับเรา →",
  "ar": "لديك سؤال؟ أعطنا رأيك →",
};

/** @type {Readonly<Record<Locale, string>>} */
export const editTextMap = {
  "en-US": "Edit this page on GitHub →",
  "es-ES": "Edite esta página en GitHub →",
  "fr-FR": "Modifier cette page sur GitHub →",
  "pt-BR": "Edite essa página no GitHub →",
  "zh-CN": "在 GitHub 上编辑本页 →",
  "ja": "Github で編集する →",
  "ko": "Github에서 이 페이지 편집하기 →",
  "ru": "Редактировать эту страницу на GitHub →",
  "zh-TW": "在 GitHub 上編輯此頁面 →",
  "id-ID": "Edit halaman ini di GitHub →",
  "th-TH": "แก้ไขหน้านี้บน GitHub →",
  "ar": "تحرير هذه الصفحة على جيثب →",
};

/** @type {Readonly<Record<Locale, { utmSource: string; text: string; suffix?: string | undefined }>>} */
export const footerTextMap = {
  "en-US": { utmSource: "swr", text: "Powered by" },
  "es-ES": { utmSource: "swr_es-es", text: "Desarrollado por" },
  "fr-FR": { utmSource: "swr_fr-fr", text: "Propulsé par" },
  "pt-BR": { utmSource: "swr_pt-br", text: "Desenvolvido por" },
  "zh-CN": { utmSource: "swr_zh-cn", text: "由", suffix: "驱动" },
  "ja": { utmSource: "swr_ja", text: "提供" },
  "ko": { utmSource: "swr_ko", text: "Powered by" },
  "ru": { utmSource: "swr_ru", text: "Работает на" },
  "zh-TW": { utmSource: "swr_zh-tw", text: "由", suffix: "驅動" },
  "id-ID": { utmSource: "swr_id-id", text: "Ditenagai oleh" },
  "th-TH": { utmSource: "swr_th-th", text: "ขับเคลื่อนโดย" },
  "ar": { utmSource: "swr_ar", text: "مشغل بواسطة" },
};

/** @type {Readonly<Record<Locale, string>>} */
export const tableOfContentsTitleMap = {
  "en-US": "On This Page",
  "es-ES": "En esta página",
  "fr-FR": "Sur cette page",
  "pt-BR": "Nessa página",
  "ru": "На этой странице",
  "zh-TW": "在此頁面上",
  "id-ID": "Pada Halaman Ini",
  "th-TH": "ในหน้านี้",
  "ar": "في هذه الصفحة",
};

/** @type {Readonly<Record<Locale, string>>} */
export const searchPlaceholderMap = {
  "en-US": "Search documentation...",
  "es-ES": "Buscar documento...",
  "fr-FR": "Rechercher dans la doc...",
  "pt-BR": "Buscar documentação...",
  "ko": "문서 검색...",
  "ru": "Искать в документации...",
  "zh-CN": "搜索文档...",
  "zh-TW": "搜索文檔...",
  "id-ID": "Cari dokumentasi...",
  "th-TH": "ค้นหาเอกสาร...",
  "ar": "بحث في التوثيق...",
};

/** @type {Readonly<Record<Locale, string>>} */
export const gitTimestampMap = {
  "en-US": "Last updated on",
  "fr-FR": "Dernière mise à jour le",
  "ru": "Последнее обновление",
  "zh-CN": "最后更新于",
  "zh-TW": "最後更新於",
  "id-ID": "Terakhir diperbarui pada",
  "th-TH": "อัปเดตล่าสุดเมื่อ",
  "ar": "آخر تحديث في",
};
