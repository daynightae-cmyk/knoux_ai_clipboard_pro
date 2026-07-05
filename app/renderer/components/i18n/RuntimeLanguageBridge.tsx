import { useEffect } from "react";

interface Props { language?: string; }

const AR: Record<string, string> = {
  "Workspace Overview": "نظرة عامة على مساحة العمل",
  "Clipboard Hub": "مركز الحافظة",
  "Universal Search": "البحث الشامل",
  "Deep Search": "بحث عميق",
  "Knoux AI Co-Pilot": "مساعد كنوكس الذكي",
  "AI Assistant": "مساعد الذكاء",
  "AI Co-Pilot": "مساعد الذكاء",
  "Barcode Scanner": "ماسح الباركود",
  "Security & Vault": "الأمان والخزنة",
  "Security & Local Vault": "الأمان والخزنة المحلية",
  "Settings": "الإعدادات",
  "Preferences": "الإعدادات",
  "Developer Studio": "استوديو المطورين",
  "Experimental Labs": "مختبرات متقدمة",
  "About KNOUX": "عن كنوكس",
  "Advanced Workspace": "أدوات متقدمة",
  "AI Provider Guarded": "مزود الذكاء محمي",
  "Web Limited Runtime": "تشغيل ويب محدود",
  "Electron Runtime": "تشغيل إلكترون",
  "Offline": "غير متصل",
  "Client services active": "خدمات العملاء نشطة",
  "Smart Clipboard Inbox": "صندوق الحافظة الذكي",
  "Today": "اليوم",
  "Yesterday": "أمس",
  "This Week": "هذا الأسبوع",
  "Older": "الأقدم",
  "Sensitive": "حساس",
  "Pinned": "مثبت",
  "Duplicates": "مكررات",
  "All": "الكل",
  "Developer": "مطوّر",
  "Office": "مكتب",
  "Customer Support": "دعم العملاء",
  "E-commerce": "تجارة إلكترونية",
  "Personal": "شخصي",
  "Clean Text": "تنظيف النص",
  "Extract": "استخراج",
  "Dedupe": "إزالة التكرار",
  "AI Guarded": "ذكاء محمي",
  "One-click templates": "قوالب بنقرة واحدة",
  "Service card status": "حالة بطاقات الخدمة",
  "All Clips": "كل المقاطع",
  "Plain Text": "نص عادي",
  "Code Blocks": "كتل كود",
  "Hyperlinks": "روابط",
  "Custom Notes": "ملاحظات مخصصة",
  "Favorites": "المفضلة",
  "Secure Vault": "الخزنة الآمنة",
  "AI Processed": "معالج بالذكاء",
  "Select Mode": "وضع التحديد",
  "New Snippet": "مقطع جديد",
  "Export": "تصدير",
  "Clear Hub": "مسح المركز",
  "Collections": "المجموعات",
  "New Collection": "مجموعة جديدة",
  "General": "عام",
  "Work": "عمل",
  "Code": "كود",
  "Links": "روابط",
  "Replies": "ردود",
  "Shipping": "شحن",
  "Invoices": "فواتير",
  "PDF & Documents": "PDF والمستندات",
  "Important": "مهم",
  "Local vault ready.": "الخزنة المحلية جاهزة.",
  "Universal Semantic Search Core": "نواة البحث الدلالي الشامل",
  "Recommended Searches:": "عمليات بحث مقترحة:",
  "Awaiting Query Input": "بانتظار إدخال البحث",
  "Ready for search retrieval": "جاهز لاسترجاع نتائج البحث",
  "Target Clipboard Text Block": "كتلة نص الحافظة المستهدفة",
  "OpenRouter Processed Output": "مخرجات OpenRouter المعالجة",
  "Ready for Prompt": "جاهز للتوجيه",
  "Select AI Operator": "اختر أداة الذكاء",
  "Clear Input": "مسح الإدخال",
  "Character Volume:": "عدد الأحرف:",
  "Words:": "الكلمات:",
  "Target Language:": "اللغة المستهدفة:",
  "Summarize": "تلخيص",
  "Enhance Text": "تحسين النص",
  "Rewrite Corp": "إعادة صياغة احترافية",
  "Translate": "ترجمة",
  "Deep Analyze": "تحليل عميق",
  "Suggest Tags": "اقتراح وسوم",
  "Extract Points": "استخراج النقاط",
  "Smart Reply": "رد ذكي",
  "Explain Code": "شرح الكود",
  "Format Markdown": "تنسيق Markdown",
  "KNOUX Barcode Scanner": "ماسح باركود كنوكس",
  "Real QR and barcode scanning for clipboard workflows.": "مسح QR والباركود فعليًا لتدفقات الحافظة.",
  "Camera": "الكاميرا",
  "Refresh Cameras": "تحديث الكاميرات",
  "Start ZXing Camera Scan": "بدء مسح الكاميرا ZXing",
  "Stop Camera": "إيقاف الكاميرا",
  "Scan Uploaded Image": "فحص صورة مرفوعة",
  "Scan Clipboard Image": "فحص صورة من الحافظة",
  "Status": "الحالة",
  "Camera preview appears here.": "معاينة الكاميرا تظهر هنا.",
  "Decoded / Manual Value": "القيمة المقروءة / اليدوية",
  "Copy": "نسخ",
  "Save": "حفظ",
  "KNOUX Developer Studio": "استوديو مطوري كنوكس",
  "Developer Control Deck": "لوحة تحكم المطورين",
  "Service Command Center": "مركز أوامر الخدمات",
  "Production service cards with real actions.": "بطاقات خدمات إنتاجية بإجراءات حقيقية.",
  "19 Developer Utilities": "19 أداة للمطورين",
  "Every developer card has three specific actions.": "كل بطاقة مطور تحتوي على ثلاثة إجراءات محددة.",
  "Service Output": "مخرجات الخدمة",
  "Runtime": "بيئة التشغيل",
  "Handler": "المعالج",
  "Run": "تشغيل",
  "Sample": "عينة",
  "Output": "المخرج",
  "Handoff Report": "تقرير التسليم",
  "Download JSON": "تنزيل JSON",
  "Copy JSON": "نسخ JSON",
  "AI Route Diagnostics": "تشخيص مسار الذكاء",
  "Check Now": "افحص الآن",
  "Provider": "المزود",
  "Model": "النموذج",
  "Build & Packaging Commands": "أوامر البناء والتغليف",
  "Live Report": "تقرير مباشر",
  "PDF Brief Builder": "منشئ ملخص PDF",
  "PDF / Markdown Handoff Export": "تصدير تسليم PDF / Markdown",
  "Document Card Classifier": "مصنف بطاقات المستندات",
  "Document Brief Builder": "منشئ ملخص المستندات",
  "Ready": "جاهز",
  "Active": "نشط",
  "Guarded": "محمي",
  "Planned": "مخطط",
  "Missing": "مفقود",
  "Disabled": "معطل",
  "Text": "نص",
  "File": "ملف",
  "Image": "صورة",
  "Note": "ملاحظة",
  "Language": "اللغة",
  "Arabic": "العربية",
  "English": "الإنجليزية",
  "Theme": "السمة",
  "Day": "نهاري",
  "Night": "ليلي",
  "System": "النظام"
};

const SKIP = new Set(["SCRIPT", "STYLE", "CODE", "PRE", "TEXTAREA", "INPUT", "OPTION", "SELECT"]);
const entries = Object.entries(AR).sort((a, b) => b[0].length - a[0].length);

function restore() {
  document.querySelectorAll<HTMLElement>("[data-i18n-original]").forEach((el) => { el.textContent = el.dataset.i18nOriginal || el.textContent; delete el.dataset.i18nOriginal; });
  document.querySelectorAll<HTMLElement>("[data-i18n-placeholder]").forEach((el) => { el.setAttribute("placeholder", el.dataset.i18nPlaceholder || ""); delete el.dataset.i18nPlaceholder; });
  document.querySelectorAll<HTMLElement>("[data-i18n-title]").forEach((el) => { el.setAttribute("title", el.dataset.i18nTitle || ""); delete el.dataset.i18nTitle; });
  document.querySelectorAll<HTMLElement>("[data-i18n-aria]").forEach((el) => { el.setAttribute("aria-label", el.dataset.i18nAria || ""); delete el.dataset.i18nAria; });
}

function translateValue(value: string) {
  const trimmed = value.replace(/\s+/g, " ").trim();
  if (!trimmed) return null;
  if (AR[trimmed]) return value.replace(value.trim(), AR[trimmed]);
  let next = value;
  let changed = false;
  for (const [source, target] of entries) {
    if (source.length < 4) continue;
    if (next.includes(source)) { next = next.split(source).join(target); changed = true; }
  }
  return changed ? next : null;
}

function translateNow() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let node = walker.nextNode();
  while (node) { nodes.push(node as Text); node = walker.nextNode(); }
  nodes.forEach((textNode) => {
    const parent = textNode.parentElement;
    if (!parent || SKIP.has(parent.tagName) || parent.closest("code, pre, textarea, input, select, .font-mono, .ltr-only, [data-i18n-skip='true']") || parent.dataset.i18nOriginal) return;
    const original = textNode.textContent || "";
    const translated = translateValue(original);
    if (!translated || translated === original) return;
    parent.dataset.i18nOriginal = original;
    textNode.textContent = translated;
  });
  document.querySelectorAll<HTMLElement>("[placeholder]").forEach((el) => {
    const original = el.getAttribute("placeholder") || "";
    if (el.dataset.i18nPlaceholder) return;
    const translated = translateValue(original);
    if (!translated) return;
    el.dataset.i18nPlaceholder = original;
    el.setAttribute("placeholder", translated);
  });
  document.querySelectorAll<HTMLElement>("[title]").forEach((el) => {
    const original = el.getAttribute("title") || "";
    if (el.dataset.i18nTitle) return;
    const translated = translateValue(original);
    if (!translated) return;
    el.dataset.i18nTitle = original;
    el.setAttribute("title", translated);
  });
  document.querySelectorAll<HTMLElement>("[aria-label]").forEach((el) => {
    const original = el.getAttribute("aria-label") || "";
    if (el.dataset.i18nAria) return;
    const translated = translateValue(original);
    if (!translated) return;
    el.dataset.i18nAria = original;
    el.setAttribute("aria-label", translated);
  });
}

export default function RuntimeLanguageBridge({ language = "en" }: Props) {
  useEffect(() => {
    restore();
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.dataset.language = language;
    if (language !== "ar") return;
    translateNow();
    const observer = new MutationObserver(() => window.requestAnimationFrame(translateNow));
    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["placeholder", "title", "aria-label"] });
    const timer = window.setInterval(translateNow, 700);
    return () => { observer.disconnect(); window.clearInterval(timer); };
  }, [language]);
  return null;
}
