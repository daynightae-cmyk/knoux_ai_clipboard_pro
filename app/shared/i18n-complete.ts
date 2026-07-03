/**
 * Comprehensive i18n System - نظام التدويل الشامل
 * Knoux Clipboard AI - Arabic + English Support
 * RTL/LTR + Proper Fonts + Full Translation
 */

export type Language = 'en' | 'ar';
export type TextDirection = 'ltr' | 'rtl';

// ==================== COMPLETE TRANSLATIONS ====================

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    // ========== APP BASICS ==========
    'app.name': 'Knoux Clipboard AI',
    'app.tagline': 'Smart Clipboard Management with AI',
    'app.version': 'v1.0.0',

    // ========== NAVIGATION ==========
    'nav.dashboard': 'Dashboard',
    'nav.clipboard': 'Clipboard',
    'nav.settings': 'Settings',
    'nav.about': 'About',
    'nav.vip': 'VIP',
    'nav.help': 'Help',
    'nav.profile': 'Profile',

    // ========== COMMON ACTIONS ==========
    'action.search': 'Search',
    'action.copy': 'Copy',
    'action.paste': 'Paste',
    'action.delete': 'Delete',
    'action.save': 'Save',
    'action.cancel': 'Cancel',
    'action.back': 'Back',
    'action.next': 'Next',
    'action.close': 'Close',
    'action.confirm': 'Confirm',
    'action.clear': 'Clear',
    'action.reset': 'Reset',
    'action.apply': 'Apply',
    'action.export': 'Export',
    'action.import': 'Import',
    'action.share': 'Share',
    'action.more': 'More',
    'action.settings': 'Settings',

    // ========== DASHBOARD ==========
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Welcome back!',
    'dashboard.stats': 'Your Statistics',
    'dashboard.recent': 'Recent Items',
    'dashboard.quickActions': 'Quick Actions',

    // ========== CLIPBOARD ==========
    'clipboard.title': 'Clipboard History',
    'clipboard.empty': 'No items yet',
    'clipboard.noResults': 'No results found',
    'clipboard.copySuccess': 'Copied to clipboard',
    'clipboard.deleteSuccess': 'Item deleted',
    'clipboard.clearAll': 'Clear All',
    'clipboard.clearConfirm': 'Are you sure you want to clear all items?',
    'clipboard.searchPlaceholder': 'Search in history...',
    'clipboard.format': 'Format',
    'clipboard.size': 'Size',
    'clipboard.timestamp': 'Time',
    'clipboard.favorite': 'Favorite',
    'clipboard.sensitive': 'Sensitive',

    // ========== SETTINGS ==========
    'settings.title': 'Settings',
    'settings.appearance': 'Appearance',
    'settings.language': 'Language',
    'settings.privacy': 'Privacy & Security',
    'settings.ai': 'AI & Intelligence',
    'settings.clipboard': 'Clipboard',
    'settings.performance': 'Performance',

    // ========== APPEARANCE ==========
    'appearance.theme': 'Theme',
    'appearance.themeLight': 'Light',
    'appearance.themeDark': 'Dark',
    'appearance.themeAuto': 'Auto',
    'appearance.primaryColor': 'Primary Color',
    'appearance.fontSize': 'Font Size',
    'appearance.compactMode': 'Compact Mode',
    'appearance.animations': 'Animations',
    'appearance.notifications': 'Notifications',

    // ========== LANGUAGE & REGION ==========
    'language.language': 'Language',
    'language.english': 'English',
    'language.arabic': 'العربية',
    'language.dateFormat': 'Date Format',
    'language.timeFormat': 'Time Format',
    'language.auto': 'Auto',

    // ========== PRIVACY & SECURITY ==========
    'privacy.encryption': 'Encryption',
    'privacy.encryptionLevel': 'Encryption Level',
    'privacy.sensitiveData': 'Sensitive Data Detection',
    'privacy.autoDelete': 'Auto-Delete History',
    'privacy.analytics': 'Analytics',
    'privacy.crashReports': 'Crash Reports',

    // ========== AI SETTINGS ==========
    'ai.enabled': 'Enable AI',
    'ai.model': 'AI Model',
    'ai.autoClassification': 'Auto Classification',
    'ai.autoSummarization': 'Auto Summarization',
    'ai.suggestions': 'Suggestions',
    'ai.learning': 'Learn from History',

    // ========== CLIPBOARD SETTINGS ==========
    'clipboard.monitoring': 'Monitor Clipboard',
    'clipboard.historyLimit': 'History Limit',
    'clipboard.images': 'Store Images',
    'clipboard.formatting': 'Auto Formatting',
    'clipboard.duplicates': 'Duplicate Detection',

    // ========== PERFORMANCE ==========
    'performance.caching': 'Caching',
    'performance.lazyLoading': 'Lazy Loading',
    'performance.lowPower': 'Low Power Mode',
    'performance.autoUpdate': 'Auto Updates',

    // ========== MESSAGES & FEEDBACK ==========
    'msg.success': 'Success!',
    'msg.error': 'Error',
    'msg.warning': 'Warning',
    'msg.info': 'Information',
    'msg.loading': 'Loading...',
    'msg.noConnection': 'No internet connection',
    'msg.tryAgain': 'Try Again',

    // ========== VIP SECTION ==========
    'vip.title': 'Knoux Elite (VIP)',
    'vip.subtitle': 'Upgrade to unlock premium features',
    'vip.currentPlan': 'Current Plan',
    'vip.upgrade': 'Upgrade Now',
    'vip.features': 'Features',
    'vip.monthlyBilling': 'Monthly Billing',
    'vip.yearlyBilling': 'Yearly Billing',
    'vip.save20': 'Save 20% with yearly',
    'vip.comparePlans': 'Compare Plans',
    'vip.startTrial': 'Start Free Trial',
    'vip.trialEnds': 'Your trial ends in',
    'vip.days': 'days',

    // ========== VIP FEATURES ==========
    'vip.unlimited': 'Unlimited',
    'vip.priority': 'Priority Support',
    'vip.customThemes': 'Custom Themes',
    'vip.advancedSecurity': 'Advanced Security',
    'vip.apiAccess': 'API Access',
    'vip.teamManagement': 'Team Management',

    // ========== ABOUT ==========
    'about.title': 'About Knoux',
    'about.description': 'Smart clipboard management with AI-powered intelligence',
    'about.version': 'Version',
    'about.developer': 'Developer',
    'about.website': 'Website',
    'about.email': 'Email',
    'about.license': 'License',
    'about.licenses': 'Licenses',

    // ========== DIALOGS & MODALS ==========
    'dialog.confirmDelete': 'Are you sure?',
    'dialog.confirmClear': 'Clear all items?',
    'dialog.unsavedChanges': 'You have unsaved changes',
    'dialog.leaveWithoutSaving': 'Leave without saving?',

    // ========== ERRORS ==========
    'error.loading': 'Failed to load data',
    'error.saving': 'Failed to save',
    'error.network': 'Network error',
    'error.unknown': 'Unknown error occurred',
    'error.fileNotFound': 'File not found',
    'error.permissionDenied': 'Permission denied',

    // ========== AI ASSISTANT ==========
    'ai.assistant': 'AI Assistant',
    'ai.chat': 'Chat with Knoux AI',
    'ai.askMe': 'Ask me anything...',
    'ai.thinking': 'Knoux is thinking...',
    'ai.noResponse': 'Sorry, I did not understand',
    'ai.tryAgain': 'Please try again',
    'ai.helpful': 'Was this helpful?',

    // ========== STATS & METRICS ==========
    'stats.totalItems': 'Total Items',
    'stats.todayItems': 'Today',
    'stats.formats': 'Formats',
    'stats.storage': 'Storage Used',
    'stats.uptime': 'Uptime',
    'stats.avgResponse': 'Avg Response',

    // ========== TIME FORMATS ==========
    'time.now': 'Just now',
    'time.minutesAgo': 'Minutes ago',
    'time.hoursAgo': 'Hours ago',
    'time.daysAgo': 'Days ago',
    'time.weeksAgo': 'Weeks ago',
    'time.monthsAgo': 'Months ago',

    // ========== SIZE FORMATS ==========
    'size.bytes': 'Bytes',
    'size.kb': 'KB',
    'size.mb': 'MB',
    'size.gb': 'GB',

    // ========== CONTENT TYPES ==========
    'type.text': 'Text',
    'type.html': 'HTML',
    'type.json': 'JSON',
    'type.code': 'Code',
    'type.image': 'Image',
    'type.url': 'URL',
    'type.email': 'Email',
    'type.phone': 'Phone',
    'type.address': 'Address',
    'type.password': 'Password (Sensitive)',
    'type.creditCard': 'Credit Card (Sensitive)',
    'type.ssn': 'SSN (Sensitive)',
    'type.other': 'Other',

    // ========== TOOLTIPS & HELP TEXT ==========
    'tooltip.copy': 'Copy to clipboard',
    'tooltip.delete': 'Delete this item',
    'tooltip.favorite': 'Add to favorites',
    'tooltip.unfavorite': 'Remove from favorites',
    'tooltip.sensitive': 'This item contains sensitive data',
    'tooltip.settings': 'Open settings',
    'tooltip.search': 'Search in history',
    'tooltip.expand': 'Expand',
    'tooltip.collapse': 'Collapse',

    // ========== PLACEHOLDERS ==========
    'placeholder.search': 'Search clipboard history...',
    'placeholder.noData': 'No data available',
    'placeholder.loading': 'Loading...',
    'placeholder.emptyState': 'Start copying to see items here',

    // ========== FOOTER ==========
    'footer.copyright': '© 2026 Knoux. All rights reserved.',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.contact': 'Contact Us',
    'footer.feedback': 'Send Feedback',
  },

  ar: {
    // ========== APP BASICS ==========
    'app.name': 'نوكس كليببورد إيه آي',
    'app.tagline': 'إدارة الحافظة الذكية بالذكاء الاصطناعي',
    'app.version': 'v1.0.0',

    // ========== NAVIGATION ==========
    'nav.dashboard': 'لوحة التحكم',
    'nav.clipboard': 'الحافظة',
    'nav.settings': 'الإعدادات',
    'nav.about': 'حول',
    'nav.vip': 'VIP',
    'nav.help': 'مساعدة',
    'nav.profile': 'الملف الشخصي',

    // ========== COMMON ACTIONS ==========
    'action.search': 'بحث',
    'action.copy': 'نسخ',
    'action.paste': 'لصق',
    'action.delete': 'حذف',
    'action.save': 'حفظ',
    'action.cancel': 'إلغاء',
    'action.back': 'رجوع',
    'action.next': 'التالي',
    'action.close': 'إغلاق',
    'action.confirm': 'تأكيد',
    'action.clear': 'مسح',
    'action.reset': 'إعادة تعيين',
    'action.apply': 'تطبيق',
    'action.export': 'تصدير',
    'action.import': 'استيراد',
    'action.share': 'مشاركة',
    'action.more': 'المزيد',
    'action.settings': 'الإعدادات',

    // ========== DASHBOARD ==========
    'dashboard.title': 'لوحة التحكم',
    'dashboard.welcome': 'أهلا بك!',
    'dashboard.stats': 'إحصائياتك',
    'dashboard.recent': 'العناصر الأخيرة',
    'dashboard.quickActions': 'الإجراءات السريعة',

    // ========== CLIPBOARD ==========
    'clipboard.title': 'سجل الحافظة',
    'clipboard.empty': 'لا توجد عناصر حتى الآن',
    'clipboard.noResults': 'لم يتم العثور على نتائج',
    'clipboard.copySuccess': 'تم النسخ إلى الحافظة',
    'clipboard.deleteSuccess': 'تم حذف العنصر',
    'clipboard.clearAll': 'مسح الكل',
    'clipboard.clearConfirm': 'هل أنت متأكد من رغبتك في مسح جميع العناصر؟',
    'clipboard.searchPlaceholder': 'ابحث في السجل...',
    'clipboard.format': 'الصيغة',
    'clipboard.size': 'الحجم',
    'clipboard.timestamp': 'الوقت',
    'clipboard.favorite': 'المفضل',
    'clipboard.sensitive': 'حساس',

    // ========== SETTINGS ==========
    'settings.title': 'الإعدادات',
    'settings.appearance': 'المظهر',
    'settings.language': 'اللغة',
    'settings.privacy': 'الخصوصية والأمان',
    'settings.ai': 'الذكاء الاصطناعي',
    'settings.clipboard': 'الحافظة',
    'settings.performance': 'الأداء',

    // ========== APPEARANCE ==========
    'appearance.theme': 'المظهر',
    'appearance.themeLight': 'فاتح',
    'appearance.themeDark': 'داكن',
    'appearance.themeAuto': 'تلقائي',
    'appearance.primaryColor': 'اللون الأساسي',
    'appearance.fontSize': 'حجم الخط',
    'appearance.compactMode': 'الوضع المضغوط',
    'appearance.animations': 'الرسوم المتحركة',
    'appearance.notifications': 'الإشعارات',

    // ========== LANGUAGE & REGION ==========
    'language.language': 'اللغة',
    'language.english': 'English',
    'language.arabic': 'العربية',
    'language.dateFormat': 'صيغة التاريخ',
    'language.timeFormat': 'صيغة الوقت',
    'language.auto': 'تلقائي',

    // ========== PRIVACY & SECURITY ==========
    'privacy.encryption': 'التشفير',
    'privacy.encryptionLevel': 'مستوى التشفير',
    'privacy.sensitiveData': 'كشف البيانات الحساسة',
    'privacy.autoDelete': 'حذف السجل تلقائياً',
    'privacy.analytics': 'التحليلات',
    'privacy.crashReports': 'تقارير الأعطال',

    // ========== AI SETTINGS ==========
    'ai.enabled': 'تفعيل الذكاء الاصطناعي',
    'ai.model': 'نموذج الذكاء الاصطناعي',
    'ai.autoClassification': 'التصنيف التلقائي',
    'ai.autoSummarization': 'الملخص التلقائي',
    'ai.suggestions': 'الاقتراحات',
    'ai.learning': 'التعلم من السجل',

    // ========== CLIPBOARD SETTINGS ==========
    'clipboard.monitoring': 'مراقبة الحافظة',
    'clipboard.historyLimit': 'حد السجل',
    'clipboard.images': 'حفظ الصور',
    'clipboard.formatting': 'التنسيق التلقائي',
    'clipboard.duplicates': 'كشف التكرار',

    // ========== PERFORMANCE ==========
    'performance.caching': 'التخزين المؤقت',
    'performance.lazyLoading': 'التحميل الكسول',
    'performance.lowPower': 'وضع الطاقة المنخفضة',
    'performance.autoUpdate': 'التحديثات التلقائية',

    // ========== MESSAGES & FEEDBACK ==========
    'msg.success': 'نجح!',
    'msg.error': 'خطأ',
    'msg.warning': 'تحذير',
    'msg.info': 'معلومات',
    'msg.loading': 'جاري التحميل...',
    'msg.noConnection': 'لا توجد اتصال بالإنترنت',
    'msg.tryAgain': 'حاول مرة أخرى',

    // ========== VIP SECTION ==========
    'vip.title': 'نوكس إليت (VIP)',
    'vip.subtitle': 'ترقِ للوصول إلى الميزات المتميزة',
    'vip.currentPlan': 'الخطة الحالية',
    'vip.upgrade': 'ترقِ الآن',
    'vip.features': 'الميزات',
    'vip.monthlyBilling': 'الفواتير الشهرية',
    'vip.yearlyBilling': 'الفواتير السنوية',
    'vip.save20': 'وفّر 20% مع السنوي',
    'vip.comparePlans': 'قارن الخطط',
    'vip.startTrial': 'ابدأ الإصدار التجريبي المجاني',
    'vip.trialEnds': 'ينتهي إصدارك التجريبي في',
    'vip.days': 'أيام',

    // ========== VIP FEATURES ==========
    'vip.unlimited': 'غير محدود',
    'vip.priority': 'دعم الأولوية',
    'vip.customThemes': 'مواضيع مخصصة',
    'vip.advancedSecurity': 'الأمان المتقدم',
    'vip.apiAccess': 'وصول API',
    'vip.teamManagement': 'إدارة الفريق',

    // ========== ABOUT ==========
    'about.title': 'حول نوكس',
    'about.description': 'إدارة الحافظة الذكية بمساعدة الذكاء الاصطناعي',
    'about.version': 'الإصدار',
    'about.developer': 'المطور',
    'about.website': 'الموقع',
    'about.email': 'البريد الإلكتروني',
    'about.license': 'الترخيص',
    'about.licenses': 'التراخيص',

    // ========== DIALOGS & MODALS ==========
    'dialog.confirmDelete': 'هل أنت متأكد؟',
    'dialog.confirmClear': 'مسح جميع العناصر؟',
    'dialog.unsavedChanges': 'لديك تغييرات غير محفوظة',
    'dialog.leaveWithoutSaving': 'المغادرة بدون حفظ؟',

    // ========== ERRORS ==========
    'error.loading': 'فشل في تحميل البيانات',
    'error.saving': 'فشل في الحفظ',
    'error.network': 'خطأ في الشبكة',
    'error.unknown': 'حدث خطأ غير معروف',
    'error.fileNotFound': 'لم يتم العثور على الملف',
    'error.permissionDenied': 'تم رفض الإذن',

    // ========== AI ASSISTANT ==========
    'ai.assistant': 'مساعد الذكاء الاصطناعي',
    'ai.chat': 'تحدث مع نوكس AI',
    'ai.askMe': 'اسأل عن أي شيء...',
    'ai.thinking': 'نوكس يفكر...',
    'ai.noResponse': 'عذراً، لم أفهم',
    'ai.tryAgain': 'يرجى المحاولة مرة أخرى',
    'ai.helpful': 'هل كان هذا مفيداً؟',

    // ========== STATS & METRICS ==========
    'stats.totalItems': 'إجمالي العناصر',
    'stats.todayItems': 'اليوم',
    'stats.formats': 'الصيغ',
    'stats.storage': 'المساحة المستخدمة',
    'stats.uptime': 'وقت التشغيل',
    'stats.avgResponse': 'متوسط الاستجابة',

    // ========== TIME FORMATS ==========
    'time.now': 'الآن',
    'time.minutesAgo': 'قبل دقائق',
    'time.hoursAgo': 'قبل ساعات',
    'time.daysAgo': 'قبل أيام',
    'time.weeksAgo': 'قبل أسابيع',
    'time.monthsAgo': 'قبل شهور',

    // ========== SIZE FORMATS ==========
    'size.bytes': 'بايت',
    'size.kb': 'كيلوبايت',
    'size.mb': 'ميجابايت',
    'size.gb': 'جيجابايت',

    // ========== CONTENT TYPES ==========
    'type.text': 'نص',
    'type.html': 'HTML',
    'type.json': 'JSON',
    'type.code': 'كود',
    'type.image': 'صورة',
    'type.url': 'رابط',
    'type.email': 'بريد إلكتروني',
    'type.phone': 'هاتف',
    'type.address': 'عنوان',
    'type.password': 'كلمة مرور (حساسة)',
    'type.creditCard': 'بطاقة ائتمان (حساسة)',
    'type.ssn': 'رقم الهوية (حساس)',
    'type.other': 'أخرى',

    // ========== TOOLTIPS & HELP TEXT ==========
    'tooltip.copy': 'نسخ إلى الحافظة',
    'tooltip.delete': 'حذف هذا العنصر',
    'tooltip.favorite': 'إضافة إلى المفضلة',
    'tooltip.unfavorite': 'إزالة من المفضلة',
    'tooltip.sensitive': 'هذا العنصر يحتوي على بيانات حساسة',
    'tooltip.settings': 'فتح الإعدادات',
    'tooltip.search': 'البحث في السجل',
    'tooltip.expand': 'توسيع',
    'tooltip.collapse': 'طي',

    // ========== PLACEHOLDERS ==========
    'placeholder.search': 'ابحث في سجل الحافظة...',
    'placeholder.noData': 'لا توجد بيانات متاحة',
    'placeholder.loading': 'جاري التحميل...',
    'placeholder.emptyState': 'ابدأ في النسخ لترى العناصر هنا',

    // ========== FOOTER ==========
    'footer.copyright': '© 2026 نوكس. جميع الحقوق محفوظة.',
    'footer.privacy': 'سياسة الخصوصية',
    'footer.terms': 'شروط الخدمة',
    'footer.contact': 'اتصل بنا',
    'footer.feedback': 'أرسل تعليقاتك',
  },
};

// ==================== I18N SYSTEM ====================

export class I18nManager {
  private static instance: I18nManager;
  private currentLanguage: Language = 'en';
  private storageKey = 'knoux_language';
  private listeners: ((lang: Language) => void)[] = [];

  private constructor() {
    this.loadLanguage();
  }

  static getInstance(): I18nManager {
    if (!I18nManager.instance) {
      I18nManager.instance = new I18nManager();
    }
    return I18nManager.instance;
  }

  // ==================== LANGUAGE MANAGEMENT ====================

  private loadLanguage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored && (stored === 'en' || stored === 'ar')) {
        this.currentLanguage = stored;
      } else {
        // Auto-detect from system
        this.currentLanguage = this.getSystemLanguage();
      }
    } catch {
      this.currentLanguage = 'en';
    }
    this.applyLanguage();
  }

  private getSystemLanguage(): Language {
    if (typeof navigator !== 'undefined') {
      const lang = navigator.language.toLowerCase();
      return lang.startsWith('ar') ? 'ar' : 'en';
    }
    return 'en';
  }

  setLanguage(lang: Language): void {
    if (lang !== 'en' && lang !== 'ar') return;
    this.currentLanguage = lang;
    try {
      localStorage.setItem(this.storageKey, lang);
    } catch {
      // Ignore storage errors
    }
    this.applyLanguage();
    this.notifyListeners();
  }

  getLanguage(): Language {
    return this.currentLanguage;
  }

  getTextDirection(): TextDirection {
    return this.currentLanguage === 'ar' ? 'rtl' : 'ltr';
  }

  private applyLanguage(): void {
    const html = document.documentElement;
    html.lang = this.currentLanguage;
    html.dir = this.getTextDirection();
    document.body.dir = this.getTextDirection();
  }

  // ==================== TRANSLATION ====================

  t(key: string, defaultValue?: string): string {
    const translation = TRANSLATIONS[this.currentLanguage]?.[key];
    if (translation) return translation;

    // Fallback to English
    const englishTranslation = TRANSLATIONS.en[key];
    if (englishTranslation) return englishTranslation;

    return defaultValue || key;
  }

  // Translate with parameters
  tParam(key: string, params: Record<string, string | number>): string {
    let text = this.t(key);
    Object.entries(params).forEach(([param, value]) => {
      text = text.replace(`{${param}}`, String(value));
    });
    return text;
  }

  // ==================== UTILITIES ====================

  isArabic(): boolean {
    return this.currentLanguage === 'ar';
  }

  isRTL(): boolean {
    return this.getTextDirection() === 'rtl';
  }

  formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return new Intl.DateTimeFormat(this.currentLanguage, options).format(date);
  }

  formatTime(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Intl.DateTimeFormat(this.currentLanguage, options).format(date);
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat(this.currentLanguage).format(num);
  }

  // ==================== LISTENERS ====================

  onChange(callback: (lang: Language) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentLanguage));
  }
}

export const i18n = I18nManager.getInstance();
export default i18n;

// ==================== HELPER FUNCTION ====================

export function t(key: string, defaultValue?: string): string {
  return i18n.t(key, defaultValue);
}
