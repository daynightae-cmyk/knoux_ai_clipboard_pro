type Lang = "en" | "ar";

const TRANSLATIONS: Record<string, string> = {
  "Workspace Overview": "نظرة عامة على مساحة العمل",
  "Clipboard Hub": "مركز الحافظة",
  "Universal Search": "البحث الشامل",
  "Knoux AI Co-Pilot": "مساعد كنوكس الذكي",
  "Security & Local Vault": "الأمان والخزنة المحلية",
  "Preferences": "الإعدادات",
  "Experimental Labs": "المختبرات المتقدمة",
  "About KNOUX": "عن كنوكس",
  "Overview": "لوحة التحكم",
  "Deep Search": "البحث العميق",
  "AI Co-Pilot": "مساعد الذكاء",
  "Barcode Scanner": "ماسح الباركود",
  "Security & Trust": "الأمان والثقة",
  "Developer Studio": "استوديو المطورين",
  "Advanced Workspace": "الأدوات المتقدمة",
  "Secure Environment": "بيئة آمنة",
  "Local Vault Active": "الخزنة المحلية نشطة",
  "AI Provider Guarded": "مزود الذكاء محمي",
  "Search clip history, code snippets, secure vaults (Ctrl+K)...": "ابحث في سجل الحافظة والأكواد والخزنة الآمنة (Ctrl+K)...",
  "Search clip history, code snippets, secure vaults": "ابحث في سجل الحافظة والأكواد والخزنة الآمنة",
  "Elevate Your Flow with Knoux AI": "ارفع إنتاجيتك مع كنوكس AI",
  "Your clipboard history is local-first and augmented by guarded OpenRouter AI routes.": "سجل الحافظة محلي أولًا ومدعوم بمسارات ذكاء محمية.",
  "Summarize, rewrite, translate, and review copied snippets without exposing provider secrets.": "لخّص وأعد الصياغة وترجم وراجع المقاطع المنسوخة دون كشف مفاتيح المزود.",
  "Deploy AI Assistant": "تشغيل مساعد الذكاء",
  "Launch Clipboard Hub": "فتح مركز الحافظة",
  "Productivity Boost": "تعزيز الإنتاجية",
  "Guarded Items": "عناصر محمية",
  "AI Enhancements": "تحسينات الذكاء",
  "Pinned Snippets": "مقاطع مثبتة",
  "Active History": "السجل النشط",
  "One-Tap Quick Clipboard Actions": "إجراءات الحافظة السريعة",
  "Secure Note": "ملاحظة آمنة",
  "Extract Text": "استخراج النص",
  "Format as Code": "تنسيق كود",
  "Commit Secret": "حفظ آمن",
  "Open Scanner": "فتح الماسح",
  "Format Clip": "تنسيق المقطع",
  "System Service Health": "حالة خدمات النظام",
  "Recent Clipboard Clips": "أحدث عناصر الحافظة",
  "Recent AI-Processed Actions": "آخر إجراءات الذكاء",
  "Smart Clipboard Inbox": "صندوق الحافظة الذكي",
  "Today": "اليوم",
  "Yesterday": "أمس",
  "This Week": "هذا الأسبوع",
  "Older": "الأقدم",
  "Client services active": "خدمات العملاء نشطة",
  "Web Limited Runtime": "تشغيل ويب محدود",
  "Electron Runtime": "تشغيل إلكترون",
  "Offline": "غير متصل",
  "AI Provider Missing until OpenRouter check passes": "مزود الذكاء غير جاهز حتى ينجح الفحص",
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
  "Dedupe": "إزالة المكرر",
  "JSON": "JSON",
  "CSV": "CSV",
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
  "New Snippet": "مقطع جديد",
  "Select Mode": "وضع التحديد",
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
  "PDF & Documents": "PDF ومستندات",
  "Important": "مهم",
  "No records found matching filters": "لا توجد سجلات مطابقة للفلاتر",
  "Create Custom Snippet Card": "إنشاء بطاقة مقطع مخصصة",
  "Snippet Content": "محتوى المقطع",
  "Type Designation": "نوع المقطع",
  "Save to Local Vault": "حفظ في الخزنة المحلية",
  "KNOUX Production Settings": "إعدادات تشغيل كنوكس",
  "Operational controls for AI, storage, security, and deployment readiness.": "تحكم تشغيلي كامل للذكاء والتخزين والأمان وجاهزية النشر.",
  "Readiness": "الجاهزية",
  "Clips": "المقاطع",
  "AI Items": "عناصر الذكاء",
  "Secure": "آمن",
  "Language / اللغة": "اللغة",
  "English": "الإنجليزية",
  "العربية": "العربية",
  "Appearance": "المظهر",
  "day": "نهاري",
  "night": "ليلي",
  "system": "النظام",
  "compact": "مضغوط",
  "comfortable": "مريح",
  "low": "منخفض",
  "medium": "متوسط",
  "high": "مرتفع",
  "OpenRouter AI Provider": "مزود الذكاء OpenRouter",
  "local key saved": "مفتاح محلي محفوظ",
  "provider_not_configured": "المزود غير مهيأ",
  "Save Local Key": "حفظ المفتاح المحلي",
  "Clear Key": "مسح المفتاح",
  "Test Connection": "اختبار الاتصال",
  "Storage & Backup": "التخزين والنسخ الاحتياطي",
  "Export Backup": "تصدير نسخة احتياطية",
  "Import Backup": "استيراد نسخة احتياطية",
  "Clear History": "مسح السجل",
  "AI Tools Studio": "استوديو أدوات الذكاء",
  "Input — Paste or type your content": "الإدخال — الصق أو اكتب المحتوى",
  "AI Result — Generated with AI": "نتيجة الذكاء — تم إنشاؤها بالذكاء",
  "Summarize": "تلخيص",
  "Rewrite": "إعادة صياغة",
  "Translate": "ترجمة",
  "Analyze": "تحليل",
  "Format": "تنسيق",
  "Run AI": "تشغيل الذكاء",
  "Copy": "نسخ",
  "Save": "حفظ",
  "Share": "مشاركة",
  "Search everything...": "ابحث في كل شيء...",
  "Fast": "سريع",
  "Accurate": "دقيق",
  "Intelligent": "ذكي",
  "Private": "خاص",
  "Smart Filters": "فلاتر ذكية",
  "Content Types": "أنواع المحتوى",
  "Text": "نص",
  "File": "ملف",
  "Image": "صورة",
  "Note": "ملاحظة",
  "Instant Results": "نتائج فورية",
  "Recent Searches": "عمليات بحث حديثة",
  "Search Suggestions": "اقتراحات البحث",
  "View all": "عرض الكل",
  "KNOUX Developer Studio": "استوديو مطوري كنوكس",
  "Live production diagnostics": "تشخيصات إنتاج مباشرة",
  "Service Health": "صحة الخدمات",
  "Healthy": "سليم",
  "Runtime": "بيئة التشغيل",
  "Records": "السجلات",
  "AI Route": "مسار الذكاء",
  "Live AI Route Tester": "اختبار مسار الذكاء المباشر",
  "Run": "تشغيل",
  "Records by Type": "السجلات حسب النوع",
  "Content Volume": "حجم المحتوى",
  "Flags": "العلامات",
  "Full Diagnostics Export": "تصدير التشخيصات الكامل",
  "Copy JSON": "نسخ JSON",
  "Download": "تنزيل",
  "Developer Service Console": "لوحة خدمات المطورين",
  "API Action Builder": "منشئ إجراءات API",
  "Regex Lab": "مختبر Regex",
  "JSON Formatter": "منسق JSON",
  "Markdown Builder": "منشئ Markdown",
  "Commit Message Generator": "مولد رسائل Git",
  "README Block Generator": "مولد بلوكات README",
  "Environment Checklist": "قائمة فحص البيئة",
  "PDF Brief Builder": "منشئ ملخص PDF",
  "Document Card Classifier": "مصنف بطاقات المستندات",
  "Markdown Export": "تصدير Markdown"
};

const TITLE_TRANSLATIONS: Record<string, string> = {
  "Refresh clipboard stream": "تحديث تدفق الحافظة",
  "Open AI Smart Assistant": "فتح مساعد الذكاء",
  "Open Preferences": "فتح الإعدادات",
  "Toggle system metrics side panel": "إظهار أو إخفاء لوحة المقاييس",
  "Copy again": "نسخ مرة أخرى",
  "Pin item": "تثبيت العنصر",
  "Delete item": "حذف العنصر",
  "Move to Collection": "نقل إلى مجموعة"
};

const getLang = (): Lang => {
  try {
    const raw = localStorage.getItem("knoux_settings");
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.language === "ar" ? "ar" : "en";
  } catch {
    return "en";
  }
};

const shouldSkip = (element: Element | null) => {
  if (!element) return false;
  return Boolean(element.closest("code, pre, textarea, input, select, .font-mono, .ltr-only, [data-i18n-skip='true']"));
};

const translateTextNode = (node: Text, lang: Lang) => {
  if (lang !== "ar" || shouldSkip(node.parentElement)) return;
  const original = node.nodeValue || "";
  const trimmed = original.trim();
  if (!trimmed) return;
  const translated = TRANSLATIONS[trimmed];
  if (!translated) return;
  node.nodeValue = original.replace(trimmed, translated);
};

const translateAttributes = (el: Element, lang: Lang) => {
  if (lang !== "ar") return;
  const htmlEl = el as HTMLElement;
  const title = htmlEl.getAttribute("title");
  if (title && TITLE_TRANSLATIONS[title]) htmlEl.setAttribute("title", TITLE_TRANSLATIONS[title]);
  const placeholder = htmlEl.getAttribute("placeholder");
  if (placeholder && TRANSLATIONS[placeholder]) htmlEl.setAttribute("placeholder", TRANSLATIONS[placeholder]);
  const aria = htmlEl.getAttribute("aria-label");
  if (aria && TRANSLATIONS[aria]) htmlEl.setAttribute("aria-label", TRANSLATIONS[aria]);
};

export function applyRuntimeTranslations(lang: Lang = getLang()) {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.documentElement.dataset.language = lang;
  if (lang !== "ar") return;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  nodes.forEach((node) => translateTextNode(node, lang));
  document.querySelectorAll("[title], [placeholder], [aria-label]").forEach((el) => translateAttributes(el, lang));
}

export function startRuntimeI18n() {
  let lastLang = getLang();
  const run = () => {
    const lang = getLang();
    if (lang !== lastLang) lastLang = lang;
    applyRuntimeTranslations(lang);
  };
  window.setTimeout(run, 80);
  const observer = new MutationObserver(() => window.requestAnimationFrame(run));
  observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["placeholder", "title", "aria-label"] });
  window.setInterval(run, 600);
}
