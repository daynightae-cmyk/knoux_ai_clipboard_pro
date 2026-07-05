import { startRuntimeI18n } from "./i18nRuntime";

const readLanguage = () => {
  try {
    const raw = localStorage.getItem("knoux_settings");
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.language === "ar" ? "ar" : "en";
  } catch {
    return "en";
  }
};

let lastLanguage = readLanguage();

const applyLanguageLayout = () => {
  const language = readLanguage();
  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  document.documentElement.dataset.language = language;
  const direction = language === "ar" ? "rtl" : "ltr";
  [document.body, document.querySelector(".knoux-window"), document.querySelector("main")].forEach((node) => {
    if (node instanceof HTMLElement) node.style.setProperty("direction", direction, "important");
  });

  if (language !== lastLanguage) {
    const guardKey = "knoux_language_reload_guard";
    const guard = sessionStorage.getItem(guardKey);
    sessionStorage.setItem("knoux_last_language", language);
    lastLanguage = language;
    if (guard !== language) {
      sessionStorage.setItem(guardKey, language);
      window.setTimeout(() => window.location.reload(), 80);
    }
  } else {
    sessionStorage.removeItem("knoux_language_reload_guard");
  }
};

startRuntimeI18n();
applyLanguageLayout();
window.setInterval(applyLanguageLayout, 500);
