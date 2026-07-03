/**
 * Advanced Settings System - نظام الإعدادات المتقدم
 * Knoux Clipboard AI - Professional Grade Settings Management
 */

export type SettingCategory =
  | 'appearance'
  | 'language'
  | 'privacy'
  | 'ai'
  | 'clipboard'
  | 'performance';

export interface SettingItem {
  key: string;
  category: SettingCategory;
  label_en: string;
  label_ar: string;
  description_en: string;
  description_ar: string;
  type: 'toggle' | 'select' | 'number' | 'text' | 'color' | 'slider';
  value: any;
  default: any;
  options?: { label_en: string; label_ar: string; value: any }[];
  min?: number;
  max?: number;
  icon?: string;
}

export interface SettingsGroup {
  category: SettingCategory;
  icon: string;
  label_en: string;
  label_ar: string;
  description_en: string;
  description_ar: string;
  items: SettingItem[];
}

export interface UserSettings {
  // Appearance Settings
  theme: 'light' | 'dark' | 'auto';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontScale: number; // 0.8 - 1.3
  compactMode: boolean;
  animationsEnabled: boolean;
  notificationsEnabled: boolean;
  soundEffectsEnabled: boolean;

  // Language Settings
  language: 'en' | 'ar';
  dateFormat: 'auto' | 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  textDirection: 'auto' | 'ltr' | 'rtl';

  // Privacy Settings
  storeHistory: boolean;
  encryptionEnabled: boolean;
  encryptionLevel: 'basic' | 'standard' | 'strong';
  sensitiveDataDetection: boolean;
  autoDeleteAfterDays: number | null; // null = disabled
  keepSensitiveOnly: boolean;
  allowAnalytics: boolean;
  allowCrashReports: boolean;

  // AI Settings
  aiEnabled: boolean;
  aiModel: 'lightweight' | 'standard' | 'advanced';
  autoClassification: boolean;
  autoSummarization: boolean;
  suggestionFrequency: 'never' | 'sometimes' | 'often' | 'always';
  aiLearnFromHistory: boolean;
  aiContextLevel: 'minimal' | 'normal' | 'full';

  // Clipboard Settings
  clipboardMonitoring: boolean;
  clipboardHistoryLimit: number;
  imageClippingsEnabled: boolean;
  autoFormatting: boolean;
  autoTagging: boolean;
  duplicateDetection: boolean;
  clipboardTimeout: number; // seconds

  // Performance Settings
  cachingEnabled: boolean;
  cacheSize: number; // MB
  lazyLoadingEnabled: boolean;
  maxWorkers: number;
  lowPowerMode: boolean;
  updateCheckFrequency: 'daily' | 'weekly' | 'monthly' | 'never';
  autoUpdateEnabled: boolean;
}

export class SettingsManager {
  private static instance: SettingsManager;
  private settings: UserSettings;
  private storageKey = 'knoux_user_settings';
  private listeners: ((settings: UserSettings) => void)[] = [];

  private constructor() {
    this.settings = this.loadSettings();
  }

  static getInstance(): SettingsManager {
    if (!SettingsManager.instance) {
      SettingsManager.instance = new SettingsManager();
    }
    return SettingsManager.instance;
  }

  // ==================== DEFAULTS ====================

  private getDefaults(): UserSettings {
    return {
      // Appearance
      theme: 'dark',
      primaryColor: '#6366f1',
      secondaryColor: '#8b5cf6',
      accentColor: '#ec4899',
      fontScale: 1,
      compactMode: false,
      animationsEnabled: true,
      notificationsEnabled: true,
      soundEffectsEnabled: false,

      // Language
      language: 'en',
      dateFormat: 'auto',
      timeFormat: '24h',
      textDirection: 'auto',

      // Privacy
      storeHistory: true,
      encryptionEnabled: true,
      encryptionLevel: 'standard',
      sensitiveDataDetection: true,
      autoDeleteAfterDays: null,
      keepSensitiveOnly: false,
      allowAnalytics: false,
      allowCrashReports: true,

      // AI
      aiEnabled: true,
      aiModel: 'standard',
      autoClassification: true,
      autoSummarization: false,
      suggestionFrequency: 'sometimes',
      aiLearnFromHistory: true,
      aiContextLevel: 'normal',

      // Clipboard
      clipboardMonitoring: true,
      clipboardHistoryLimit: 500,
      imageClippingsEnabled: true,
      autoFormatting: true,
      autoTagging: true,
      duplicateDetection: true,
      clipboardTimeout: 30,

      // Performance
      cachingEnabled: true,
      cacheSize: 100,
      lazyLoadingEnabled: true,
      maxWorkers: 4,
      lowPowerMode: false,
      updateCheckFrequency: 'weekly',
      autoUpdateEnabled: true,
    };
  }

  // ==================== STORAGE ====================

  private loadSettings(): UserSettings {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to ensure new settings are included
        return { ...this.getDefaults(), ...parsed };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
    return this.getDefaults();
  }

  private saveSettings(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  // ==================== GETTERS & SETTERS ====================

  getSettings(): UserSettings {
    return { ...this.settings };
  }

  getSetting<K extends keyof UserSettings>(key: K): UserSettings[K] {
    return this.settings[key];
  }

  setSetting<K extends keyof UserSettings>(key: K, value: UserSettings[K]): void {
    if (this.settings[key] !== value) {
      this.settings[key] = value;
      this.saveSettings();
    }
  }

  updateMultiple(updates: Partial<UserSettings>): void {
    Object.assign(this.settings, updates);
    this.saveSettings();
  }

  // ==================== CATEGORY OPERATIONS ====================

  getCategory(category: SettingCategory): Partial<UserSettings> {
    const result: any = {};
    const allSettings = this.getSettingsStructure();
    const group = allSettings.find(g => g.category === category);

    if (group) {
      group.items.forEach(item => {
        result[item.key] = this.settings[item.key as keyof UserSettings];
      });
    }

    return result;
  }

  // ==================== SETTINGS STRUCTURE ====================

  getSettingsStructure(): SettingsGroup[] {
    return [
      {
        category: 'appearance',
        icon: 'Palette',
        label_en: 'Appearance',
        label_ar: 'المظهر',
        description_en: 'Customize the look and feel of the application',
        description_ar: 'خصص شكل وإحساس التطبيق',
        items: [
          {
            key: 'theme',
            category: 'appearance',
            label_en: 'Theme',
            label_ar: 'المظهر',
            description_en: 'Choose between light, dark, or auto theme',
            description_ar: 'اختر بين المظهر الفاتح أو الداكن أو التلقائي',
            type: 'select',
            value: this.settings.theme,
            default: 'dark',
            options: [
              { label_en: 'Light', label_ar: 'فاتح', value: 'light' },
              { label_en: 'Dark', label_ar: 'داكن', value: 'dark' },
              { label_en: 'Auto', label_ar: 'تلقائي', value: 'auto' },
            ],
            icon: 'Moon',
          },
          {
            key: 'primaryColor',
            category: 'appearance',
            label_en: 'Primary Color',
            label_ar: 'اللون الأساسي',
            description_en: 'Main color of the application',
            description_ar: 'اللون الرئيسي للتطبيق',
            type: 'color',
            value: this.settings.primaryColor,
            default: '#6366f1',
            icon: 'Palette',
          },
          {
            key: 'fontScale',
            category: 'appearance',
            label_en: 'Font Size',
            label_ar: 'حجم الخط',
            description_en: 'Adjust text size (0.8 - 1.3)',
            description_ar: 'اضبط حجم النص (0.8 - 1.3)',
            type: 'slider',
            value: this.settings.fontScale,
            default: 1,
            min: 0.8,
            max: 1.3,
            icon: 'Type',
          },
          {
            key: 'compactMode',
            category: 'appearance',
            label_en: 'Compact Mode',
            label_ar: 'الوضع المضغوط',
            description_en: 'Use a more compact layout',
            description_ar: 'استخدم تخطيط أكثر إحكاماً',
            type: 'toggle',
            value: this.settings.compactMode,
            default: false,
            icon: 'Minimize',
          },
          {
            key: 'animationsEnabled',
            category: 'appearance',
            label_en: 'Animations',
            label_ar: 'الرسوم المتحركة',
            description_en: 'Enable smooth animations throughout the app',
            description_ar: 'فعّل الرسوم المتحركة السلسة',
            type: 'toggle',
            value: this.settings.animationsEnabled,
            default: true,
            icon: 'Zap',
          },
          {
            key: 'notificationsEnabled',
            category: 'appearance',
            label_en: 'Notifications',
            label_ar: 'الإشعارات',
            description_en: 'Show desktop notifications',
            description_ar: 'عرض إشعارات سطح المكتب',
            type: 'toggle',
            value: this.settings.notificationsEnabled,
            default: true,
            icon: 'Bell',
          },
        ],
      },
      {
        category: 'language',
        icon: 'Globe',
        label_en: 'Language & Region',
        label_ar: 'اللغة والمنطقة',
        description_en: 'Language and localization settings',
        description_ar: 'إعدادات اللغة والمحلية',
        items: [
          {
            key: 'language',
            category: 'language',
            label_en: 'Language',
            label_ar: 'اللغة',
            description_en: 'Choose your preferred language',
            description_ar: 'اختر لغتك المفضلة',
            type: 'select',
            value: this.settings.language,
            default: 'en',
            options: [
              { label_en: 'English', label_ar: 'الإنجليزية', value: 'en' },
              { label_en: 'العربية', label_ar: 'العربية', value: 'ar' },
            ],
            icon: 'Globe',
          },
          {
            key: 'dateFormat',
            category: 'language',
            label_en: 'Date Format',
            label_ar: 'صيغة التاريخ',
            description_en: 'How to display dates',
            description_ar: 'كيفية عرض التواريخ',
            type: 'select',
            value: this.settings.dateFormat,
            default: 'auto',
            options: [
              { label_en: 'Auto', label_ar: 'تلقائي', value: 'auto' },
              { label_en: 'DD/MM/YYYY', label_ar: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
              { label_en: 'MM/DD/YYYY', label_ar: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
              { label_en: 'YYYY-MM-DD', label_ar: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
            ],
            icon: 'Calendar',
          },
          {
            key: 'timeFormat',
            category: 'language',
            label_en: 'Time Format',
            label_ar: 'صيغة الوقت',
            description_en: 'Choose 12-hour or 24-hour format',
            description_ar: 'اختر صيغة 12 ساعة أو 24 ساعة',
            type: 'select',
            value: this.settings.timeFormat,
            default: '24h',
            options: [
              { label_en: '24-Hour', label_ar: '24 ساعة', value: '24h' },
              { label_en: '12-Hour', label_ar: '12 ساعة', value: '12h' },
            ],
            icon: 'Clock',
          },
        ],
      },
      {
        category: 'privacy',
        icon: 'Lock',
        label_en: 'Privacy & Security',
        label_ar: 'الخصوصية والأمان',
        description_en: 'Manage your privacy and security preferences',
        description_ar: 'إدارة تفضيلات الخصوصية والأمان الخاصة بك',
        items: [
          {
            key: 'encryptionEnabled',
            category: 'privacy',
            label_en: 'Enable Encryption',
            label_ar: 'تفعيل التشفير',
            description_en: 'Encrypt sensitive clipboard data',
            description_ar: 'تشفير بيانات الحافظة الحساسة',
            type: 'toggle',
            value: this.settings.encryptionEnabled,
            default: true,
            icon: 'Lock',
          },
          {
            key: 'encryptionLevel',
            category: 'privacy',
            label_en: 'Encryption Level',
            label_ar: 'مستوى التشفير',
            description_en: 'Choose encryption strength',
            description_ar: 'اختر قوة التشفير',
            type: 'select',
            value: this.settings.encryptionLevel,
            default: 'standard',
            options: [
              { label_en: 'Basic', label_ar: 'أساسي', value: 'basic' },
              { label_en: 'Standard', label_ar: 'معياري', value: 'standard' },
              { label_en: 'Strong', label_ar: 'قوي', value: 'strong' },
            ],
            icon: 'Shield',
          },
          {
            key: 'sensitiveDataDetection',
            category: 'privacy',
            label_en: 'Detect Sensitive Data',
            label_ar: 'كشف البيانات الحساسة',
            description_en: 'Automatically identify passwords, emails, etc.',
            description_ar: 'تحديد كلمات المرور والبريد الإلكتروني تلقائياً',
            type: 'toggle',
            value: this.settings.sensitiveDataDetection,
            default: true,
            icon: 'Eye',
          },
          {
            key: 'autoDeleteAfterDays',
            category: 'privacy',
            label_en: 'Auto-Delete History',
            label_ar: 'حذف السجل تلقائياً',
            description_en: 'Delete history after N days (0 = disabled)',
            description_ar: 'حذف السجل بعد N يوم (0 = معطّل)',
            type: 'number',
            value: this.settings.autoDeleteAfterDays,
            default: null,
            min: 0,
            max: 365,
            icon: 'Trash',
          },
          {
            key: 'allowAnalytics',
            category: 'privacy',
            label_en: 'Analytics',
            label_ar: 'تحليلات الاستخدام',
            description_en: 'Send anonymous usage data to improve the app',
            description_ar: 'إرسال بيانات الاستخدام المجهولة لتحسين التطبيق',
            type: 'toggle',
            value: this.settings.allowAnalytics,
            default: false,
            icon: 'BarChart',
          },
        ],
      },
      {
        category: 'ai',
        icon: 'Brain',
        label_en: 'AI & Intelligence',
        label_ar: 'الذكاء الاصطناعي',
        description_en: 'Configure AI features and behavior',
        description_ar: 'تكوين ميزات الذكاء الاصطناعي وسلوكه',
        items: [
          {
            key: 'aiEnabled',
            category: 'ai',
            label_en: 'Enable AI',
            label_ar: 'تفعيل الذكاء الاصطناعي',
            description_en: 'Power on all AI features',
            description_ar: 'تشغيل جميع ميزات الذكاء الاصطناعي',
            type: 'toggle',
            value: this.settings.aiEnabled,
            default: true,
            icon: 'Brain',
          },
          {
            key: 'aiModel',
            category: 'ai',
            label_en: 'AI Model',
            label_ar: 'نموذج الذكاء الاصطناعي',
            description_en: 'Balance between speed and accuracy',
            description_ar: 'التوازن بين السرعة والدقة',
            type: 'select',
            value: this.settings.aiModel,
            default: 'standard',
            options: [
              { label_en: 'Lightweight (Fast)', label_ar: 'خفيف الوزن (سريع)', value: 'lightweight' },
              { label_en: 'Standard (Balanced)', label_ar: 'معياري (متوازن)', value: 'standard' },
              { label_en: 'Advanced (Accurate)', label_ar: 'متقدم (دقيق)', value: 'advanced' },
            ],
            icon: 'Zap',
          },
          {
            key: 'autoClassification',
            category: 'ai',
            label_en: 'Auto Classification',
            label_ar: 'التصنيف التلقائي',
            description_en: 'Automatically categorize clipboard items',
            description_ar: 'تصنيف عناصر الحافظة تلقائياً',
            type: 'toggle',
            value: this.settings.autoClassification,
            default: true,
            icon: 'Tag',
          },
          {
            key: 'autoSummarization',
            category: 'ai',
            label_en: 'Auto Summarization',
            label_ar: 'الملخص التلقائي',
            description_en: 'Create summaries of long text',
            description_ar: 'إنشاء ملخصات للنصوص الطويلة',
            type: 'toggle',
            value: this.settings.autoSummarization,
            default: false,
            icon: 'FileText',
          },
          {
            key: 'suggestionFrequency',
            category: 'ai',
            label_en: 'AI Suggestions',
            label_ar: 'اقتراحات الذكاء الاصطناعي',
            description_en: 'How often AI suggests improvements',
            description_ar: 'كم مرة يقترح الذكاء الاصطناعي التحسينات',
            type: 'select',
            value: this.settings.suggestionFrequency,
            default: 'sometimes',
            options: [
              { label_en: 'Never', label_ar: 'أبداً', value: 'never' },
              { label_en: 'Sometimes', label_ar: 'أحياناً', value: 'sometimes' },
              { label_en: 'Often', label_ar: 'غالباً', value: 'often' },
              { label_en: 'Always', label_ar: 'دائماً', value: 'always' },
            ],
            icon: 'Lightbulb',
          },
          {
            key: 'aiLearnFromHistory',
            category: 'ai',
            label_en: 'Learn from History',
            label_ar: 'التعلم من السجل',
            description_en: 'Improve AI based on your usage patterns',
            description_ar: 'تحسين الذكاء الاصطناعي بناءً على أنماط استخدامك',
            type: 'toggle',
            value: this.settings.aiLearnFromHistory,
            default: true,
            icon: 'TrendingUp',
          },
        ],
      },
      {
        category: 'clipboard',
        icon: 'Copy',
        label_en: 'Clipboard',
        label_ar: 'الحافظة',
        description_en: 'Configure clipboard monitoring and behavior',
        description_ar: 'تكوين مراقبة الحافظة والسلوك',
        items: [
          {
            key: 'clipboardMonitoring',
            category: 'clipboard',
            label_en: 'Enable Monitoring',
            label_ar: 'تفعيل المراقبة',
            description_en: 'Watch for clipboard changes',
            description_ar: 'راقب التغييرات في الحافظة',
            type: 'toggle',
            value: this.settings.clipboardMonitoring,
            default: true,
            icon: 'Eye',
          },
          {
            key: 'clipboardHistoryLimit',
            category: 'clipboard',
            label_en: 'History Limit',
            label_ar: 'حد السجل',
            description_en: 'Maximum items to keep (10-10000)',
            description_ar: 'الحد الأقصى للعناصر المراد الاحتفاظ بها',
            type: 'number',
            value: this.settings.clipboardHistoryLimit,
            default: 500,
            min: 10,
            max: 10000,
            icon: 'Database',
          },
          {
            key: 'imageClippingsEnabled',
            category: 'clipboard',
            label_en: 'Image Clippings',
            label_ar: 'اقتطاعات الصور',
            description_en: 'Store copied images',
            description_ar: 'حفظ الصور المنسوخة',
            type: 'toggle',
            value: this.settings.imageClippingsEnabled,
            default: true,
            icon: 'Image',
          },
          {
            key: 'autoFormatting',
            category: 'clipboard',
            label_en: 'Auto Formatting',
            label_ar: 'التنسيق التلقائي',
            description_en: 'Automatically format copied text',
            description_ar: 'تنسيق النص المنسوخ تلقائياً',
            type: 'toggle',
            value: this.settings.autoFormatting,
            default: true,
            icon: 'Wand',
          },
          {
            key: 'duplicateDetection',
            category: 'clipboard',
            label_en: 'Duplicate Detection',
            label_ar: 'كشف التكرار',
            description_en: 'Prevent storing duplicate items',
            description_ar: 'منع تخزين العناصر المكررة',
            type: 'toggle',
            value: this.settings.duplicateDetection,
            default: true,
            icon: 'Copy',
          },
        ],
      },
      {
        category: 'performance',
        icon: 'Zap',
        label_en: 'Performance',
        label_ar: 'الأداء',
        description_en: 'Optimize application performance',
        description_ar: 'تحسين أداء التطبيق',
        items: [
          {
            key: 'cachingEnabled',
            category: 'performance',
            label_en: 'Caching',
            label_ar: 'التخزين المؤقت',
            description_en: 'Cache frequently accessed data',
            description_ar: 'تخزين البيانات المستخدمة بشكل متكرر مؤقتاً',
            type: 'toggle',
            value: this.settings.cachingEnabled,
            default: true,
            icon: 'Zap',
          },
          {
            key: 'cacheSize',
            category: 'performance',
            label_en: 'Cache Size',
            label_ar: 'حجم الذاكرة المؤقتة',
            description_en: 'Cache size in MB (50-500)',
            description_ar: 'حجم الذاكرة المؤقتة بالميجابايت',
            type: 'number',
            value: this.settings.cacheSize,
            default: 100,
            min: 50,
            max: 500,
            icon: 'Database',
          },
          {
            key: 'lazyLoadingEnabled',
            category: 'performance',
            label_en: 'Lazy Loading',
            label_ar: 'التحميل الكسول',
            description_en: 'Load items on demand',
            description_ar: 'تحميل العناصر عند الطلب',
            type: 'toggle',
            value: this.settings.lazyLoadingEnabled,
            default: true,
            icon: 'Download',
          },
          {
            key: 'lowPowerMode',
            category: 'performance',
            label_en: 'Low Power Mode',
            label_ar: 'وضع الطاقة المنخفضة',
            description_en: 'Reduce animations and processing',
            description_ar: 'تقليل الرسوم المتحركة والمعالجة',
            type: 'toggle',
            value: this.settings.lowPowerMode,
            default: false,
            icon: 'Battery',
          },
          {
            key: 'autoUpdateEnabled',
            category: 'performance',
            label_en: 'Auto Updates',
            label_ar: 'التحديثات التلقائية',
            description_en: 'Automatically update the application',
            description_ar: 'تحديث التطبيق تلقائياً',
            type: 'toggle',
            value: this.settings.autoUpdateEnabled,
            default: true,
            icon: 'RefreshCw',
          },
        ],
      },
    ];
  }

  // ==================== RESET ====================

  resetToDefaults(): void {
    this.settings = this.getDefaults();
    this.saveSettings();
  }

  resetCategory(category: SettingCategory): void {
    const defaults = this.getDefaults();
    const allSettings = this.getSettingsStructure();
    const group = allSettings.find(g => g.category === category);

    if (group) {
      group.items.forEach(item => {
        this.settings[item.key as keyof UserSettings] =
          defaults[item.key as keyof UserSettings];
      });
      this.saveSettings();
    }
  }

  // ==================== LISTENERS ====================

  onChange(callback: (settings: UserSettings) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener({ ...this.settings }));
  }

  // ==================== EXPORT/IMPORT ====================

  exportSettings(): string {
    return JSON.stringify(this.settings, null, 2);
  }

  importSettings(json: string): boolean {
    try {
      const parsed = JSON.parse(json);
      this.settings = { ...this.getDefaults(), ...parsed };
      this.saveSettings();
      return true;
    } catch (error) {
      console.error('Failed to import settings:', error);
      return false;
    }
  }
}

export default SettingsManager.getInstance();
