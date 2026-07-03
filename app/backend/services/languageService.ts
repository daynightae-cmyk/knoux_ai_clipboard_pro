/**
 * Language Service - Knoux Clipboard AI
 * Complete language system with Arabic RTL support
 */

import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

export interface Translations {
  [key: string]: string | Translations;
}

class LanguageService {
  private currentLanguage: 'en' | 'ar' = 'en';
  private translations: { en: Translations; ar: Translations };
  private listeners: Set<(lang: 'en' | 'ar') => void> = new Set();

  constructor() {
    this.translations = {
      en: this.loadLanguageFile('en'),
      ar: this.loadLanguageFile('ar')
    };
    this.loadSavedLanguage();
  }

  private loadLanguageFile(lang: 'en' | 'ar'): Translations {
    try {
      const candidatePaths = [
        path.join(app.getAppPath(), 'app', 'renderer', 'i18n', `${lang}.json`),
        path.join(app.getAppPath(), 'renderer', 'i18n', `${lang}.json`),
        path.join(app.getAppPath(), 'locales', `${lang}.json`)
      ];

      for (const langPath of candidatePaths) {
        if (fs.existsSync(langPath)) {
          const data = fs.readFileSync(langPath, 'utf-8');
          return JSON.parse(data);
        }
      }
    } catch (error) {
      console.error(`❌ Error loading ${lang} translations:`, error);
    }
    return this.getDefaultTranslations(lang);
  }

  private getDefaultTranslations(lang: 'en' | 'ar'): Translations {
    if (lang === 'ar') {
      return {
        app: {
          name: 'كنوكس كليببورد ذكي',
          tagline: 'إدارة ذكية للحافظة مع قوة الذكاء الاصطناعي'
        },
        sidebar: {
          dashboard: 'لوحة التحكم',
          clipboardHistory: 'سجل الحافظة',
          aiAssistant: 'المساعد الذكي',
          smartActions: 'الإجراءات الذكية',
          settings: 'الإعدادات',
          about: 'حول كنوكس',
          vip: 'VIP'
        },
        settings: {
          language: 'اللغة',
          theme: 'السمة',
          darkMode: 'الوضع الليلي',
          lightMode: 'الوضع النهاري',
          notifications: 'الإشعارات',
          startWithSystem: 'البدء مع النظام',
          runInBackground: 'العمل في الخلفية',
          clipboardMonitoring: 'مراقبة الحافظة',
          performanceMode: 'وضع الأداء',
          clipboardLimit: 'حد الحافظة',
          autoCleanup: 'تنظيف تلقائي',
          cleanupDays: 'أيام التنظيف',
          aiEnabled: 'تفعيل الذكاء الاصطناعي',
          aiModel: 'نموذج الذكاء الاصطناعي',
          autoSummarize: 'تلخيص تلقائي',
          showTrayIcon: 'إظهار أيقونة الشريط',
          minimizeToTray: 'تصغير إلى الشريط',
          showInTaskbar: 'إظهار في شريط المهام',
          encryption: 'التشفير',
          dataRetention: 'احتفاظ البيانات',
          anonymizeData: 'إخفاء هوية البيانات'
        },
        dashboard: {
          officialTime: 'التوقيت الرسمي لمساكن حي الزهور 🦾',
          clipboardStatus: 'حالة الحافظة',
          aiStatus: 'حالة المحرك الذكي',
          databaseStatus: 'حالة قاعدة البيانات',
          active: 'نشط',
          idle: 'خامل',
          clearClipboard: 'مسح الحافظة',
          pauseMonitoring: 'إيقاف المراقبة مؤقتًا',
          resumeMonitoring: 'استئناف المراقبة',
          systemInfo: 'معلومات النظام',
          quickActions: 'إجراءات سريعة'
        },
        ai: {
          askQuestion: 'اطرح سؤالاً',
          summarize: 'تلخيص',
          rephrase: 'إعادة صياغة',
          translate: 'ترجمة',
          processing: 'جارٍ المعالجة...',
          error: 'حدث خطأ',
          chatHistory: 'سجل المحادثة',
          clearHistory: 'مسح السجل',
          quickActions: 'إجراءات سريعة',
          recentClipboard: 'الحافظة الأخيرة'
        },
        about: {
          title: 'كنوكس كليببورد ذكي',
          developer: 'المطور: كنوكس – أبو رتج',
          vision: 'الرؤية',
          version: 'الإصدار',
          builtWith: 'مبني بـ',
          systemInfo: 'معلومات النظام'
        },
        vip: {
          title: 'عضوية VIP',
          currentStatus: 'الحالة الحالية',
          free: 'مجاني',
          premium: 'مميز',
          features: 'المميزات',
          upgrade: 'ترقية',
          unlimitedHistory: 'سجل غير محدود',
          advancedAI: 'ذكاء اصطناعي متقدم',
          cloudSync: 'مزامنة سحابية',
          premiumThemes: 'سمات مميزة',
          prioritySupport: 'دعم أولوي',
          enhancedSecurity: 'أمان معزز'
        },
        common: {
          save: 'حفظ',
          cancel: 'إلغاء',
          delete: 'حذف',
          edit: 'تحرير',
          copy: 'نسخ',
          paste: 'لصق',
          search: 'بحث',
          filter: 'فلتر',
          clear: 'مسح',
          close: 'إغلاق',
          back: 'رجوع',
          next: 'التالي',
          previous: 'السابق',
          loading: 'جاري التحميل...',
          error: 'خطأ',
          success: 'نجح',
          warning: 'تحذير',
          info: 'معلومات'
        }
      };
    }

    // English translations
    return {
      app: {
        name: 'Knoux Clipboard AI',
        tagline: 'Intelligent Clipboard Management with AI Power'
      },
      sidebar: {
        dashboard: 'Dashboard',
        clipboardHistory: 'Clipboard History',
        aiAssistant: 'AI Assistant',
        smartActions: 'Smart Actions',
        settings: 'Settings',
        about: 'About Knoux',
        vip: 'VIP'
      },
      settings: {
        language: 'Language',
        theme: 'Theme',
        darkMode: 'Dark Mode',
        lightMode: 'Light Mode',
        notifications: 'Notifications',
        startWithSystem: 'Start with System',
        runInBackground: 'Run in Background',
        clipboardMonitoring: 'Clipboard Monitoring',
        performanceMode: 'Performance Mode',
        clipboardLimit: 'Clipboard Limit',
        autoCleanup: 'Auto Cleanup',
        cleanupDays: 'Cleanup Days',
        aiEnabled: 'Enable AI',
        aiModel: 'AI Model',
        autoSummarize: 'Auto Summarize',
        showTrayIcon: 'Show Tray Icon',
        minimizeToTray: 'Minimize to Tray',
        showInTaskbar: 'Show in Taskbar',
        encryption: 'Encryption',
        dataRetention: 'Data Retention',
        anonymizeData: 'Anonymize Data'
      },
      dashboard: {
        officialTime: 'Official Time for Al-Zuhour Residences 🦾',
        clipboardStatus: 'Clipboard Status',
        aiStatus: 'AI Engine Status',
        databaseStatus: 'Database Status',
        active: 'Active',
        idle: 'Idle',
        clearClipboard: 'Clear Clipboard',
        pauseMonitoring: 'Pause Monitoring',
        resumeMonitoring: 'Resume Monitoring',
        systemInfo: 'System Information',
        quickActions: 'Quick Actions'
      },
      ai: {
        askQuestion: 'Ask a Question',
        summarize: 'Summarize',
        rephrase: 'Rephrase',
        translate: 'Translate',
        processing: 'Processing...',
        error: 'An error occurred',
        chatHistory: 'Chat History',
        clearHistory: 'Clear History',
        quickActions: 'Quick Actions',
        recentClipboard: 'Recent Clipboard'
      },
      about: {
        title: 'Knoux Clipboard AI',
        developer: 'Developer: Knoux – Abu Retaj',
        vision: 'Vision',
        version: 'Version',
        builtWith: 'Built With',
        systemInfo: 'System Information'
      },
      vip: {
        title: 'VIP Membership',
        currentStatus: 'Current Status',
        free: 'Free',
        premium: 'Premium',
        features: 'Features',
        upgrade: 'Upgrade',
        unlimitedHistory: 'Unlimited History',
        advancedAI: 'Advanced AI',
        cloudSync: 'Cloud Sync',
        premiumThemes: 'Premium Themes',
        prioritySupport: 'Priority Support',
        enhancedSecurity: 'Enhanced Security'
      },
      common: {
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        copy: 'Copy',
        paste: 'Paste',
        search: 'Search',
        filter: 'Filter',
        clear: 'Clear',
        close: 'Close',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        warning: 'Warning',
        info: 'Info'
      }
    };
  }

  private loadSavedLanguage(): void {
    try {
      const configPath = path.join(app.getPath('userData'), 'knoux-settings.json');
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        if (config.language) {
          this.currentLanguage = config.language;
        }
      }
    } catch (error) {
      console.error('Error loading saved language:', error);
    }
  }

  setLanguage(lang: 'en' | 'ar'): void {
    this.currentLanguage = lang;
    
    // Save to settings
    this.saveLanguagePreference(lang);
    
    // Notify all listeners
    this.listeners.forEach(listener => listener(lang));
    
    console.log(`✅ Language changed to: ${lang}`);
  }

  private saveLanguagePreference(lang: 'en' | 'ar'): void {
    try {
      const configPath = path.join(app.getPath('userData'), 'knoux-settings.json');
      let config: any = {};
      
      if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      }
      
      config.language = lang;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  }

  getCurrentLanguage(): 'en' | 'ar' {
    return this.currentLanguage;
  }

  translate(key: string): string {
    const keys = key.split('.');
    let value: any = this.translations[this.currentLanguage];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }
    
    return typeof value === 'string' ? value : key;
  }

  t(key: string): string {
    return this.translate(key);
  }

  isRTL(): boolean {
    return this.currentLanguage === 'ar';
  }

  onLanguageChange(callback: (lang: 'en' | 'ar') => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  // Get all translations for a language
  getAllTranslations(lang?: 'en' | 'ar'): Translations {
    return this.translations[lang || this.currentLanguage];
  }

  // Add or update translation dynamically
  addTranslation(lang: 'en' | 'ar', key: string, value: string): void {
    const keys = key.split('.');
    let current: any = this.translations[lang];
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]] || typeof current[keys[i]] !== 'object') {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
  }
}

// Singleton instance
export const languageService = new LanguageService();
