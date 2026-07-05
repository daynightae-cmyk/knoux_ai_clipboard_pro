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

const applyLanguageLayout = () => {
  const language = readLanguage();
  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  document.documentElement.dataset.language = language;
  const direction = language === "ar" ? "rtl" : "ltr";
  [document.body, document.querySelector(".knoux-window"), document.querySelector("main")].forEach((node) => {
    if (node instanceof HTMLElement) node.style.setProperty("direction", direction, "important");
  });
};

startRuntimeI18n();
applyLanguageLayout();
window.setInterval(applyLanguageLayout, 500);
