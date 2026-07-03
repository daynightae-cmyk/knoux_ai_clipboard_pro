import enTranslations from './i18n/en.json';
import arTranslations from './i18n/ar.json';

type Language = 'en' | 'ar';
type TranslationKey = string;

class I18nManager {
  private currentLanguage: Language = 'en';
  private translations: Record<Language, any> = {
    en: enTranslations,
    ar: arTranslations
  };
  private listeners: Set<(language: Language) => void> = new Set();

  constructor() {
    // Load saved language
    const saved = localStorage.getItem('knoux_language') as Language;
    if (saved && (saved === 'en' || saved === 'ar')) {
      this.currentLanguage = saved;
    }
    this.applyLanguage();
  }

  setLanguage(language: Language): void {
    if (this.currentLanguage === language) return;
    
    this.currentLanguage = language;
    localStorage.setItem('knoux_language', language);
    this.applyLanguage();
    this.notifyListeners();
    
    // Update IPC if available
    if (window.electron?.ipcRenderer) {
      window.electron.ipcRenderer.invoke('language:set', language);
    }
  }

  getCurrentLanguage(): Language {
    return this.currentLanguage;
  }

  isRTL(): boolean {
    return this.currentLanguage === 'ar';
  }

  t(key: TranslationKey, fallback?: string): string {
    const keys = key.split('.');
    let value = this.translations[this.currentLanguage];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English if key not found in current language
        if (this.currentLanguage !== 'en') {
          let englishValue = this.translations.en;
          for (const k2 of keys) {
            if (englishValue && typeof englishValue === 'object' && k2 in englishValue) {
              englishValue = englishValue[k2];
            } else {
              englishValue = null;
              break;
            }
          }
          if (englishValue && typeof englishValue === 'string') {
            return englishValue;
          }
        }
        return fallback || key;
      }
    }
    
    return typeof value === 'string' ? value : (fallback || key);
  }

  private applyLanguage(): void {
    const html = document.documentElement;
    
    // Set language and direction
    html.lang = this.currentLanguage;
    html.dir = this.isRTL() ? 'rtl' : 'ltr';
    
    // Add language class
    html.classList.remove('lang-en', 'lang-ar');
    html.classList.add(`lang-${this.currentLanguage}`);
    
    // Add RTL class
    if (this.isRTL()) {
      html.classList.add('rtl');
      html.classList.remove('ltr');
    } else {
      html.classList.add('ltr');
      html.classList.remove('rtl');
    }

    // Apply font family for Arabic
    if (this.currentLanguage === 'ar') {
      document.body.style.fontFamily = '"Noto Sans Arabic", "Cairo", "Amiri", "Tajawal", system-ui, sans-serif';
    } else {
      document.body.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentLanguage));
  }

  onLanguageChange(callback: (language: Language) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  // Utility methods
  formatNumber(num: number): string {
    if (this.currentLanguage === 'ar') {
      return new Intl.NumberFormat('ar-SA').format(num);
    }
    return new Intl.NumberFormat('en-US').format(num);
  }

  formatDate(date: Date): string {
    if (this.currentLanguage === 'ar') {
      return new Intl.DateTimeFormat('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    }
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  formatTime(date: Date): string {
    if (this.currentLanguage === 'ar') {
      return new Intl.DateTimeFormat('ar-SA', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(date);
    }
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  }

  formatFileSize(bytes: number): string {
    const units = this.currentLanguage === 'ar' 
      ? ['بايت', 'ك.بايت', 'م.بايت', 'ج.بايت', 'ت.بايت']
      : ['B', 'KB', 'MB', 'GB', 'TB'];
    
    if (bytes === 0) return `0 ${units[0]}`;
    
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const size = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
    
    return `${this.formatNumber(size)} ${units[i]}`;
  }

  // Pluralization helper
  plural(count: number, singular: string, plural?: string): string {
    if (this.currentLanguage === 'ar') {
      // Arabic pluralization rules (simplified)
      if (count === 0) return this.t(`${singular}.zero`, this.t(singular));
      if (count === 1) return this.t(`${singular}.one`, this.t(singular));
      if (count === 2) return this.t(`${singular}.two`, this.t(singular));
      if (count >= 3 && count <= 10) return this.t(`${singular}.few`, this.t(singular));
      return this.t(`${singular}.many`, this.t(singular));
    } else {
      // English pluralization
      if (count === 1) return this.t(singular);
      return this.t(plural || `${singular}.other`, this.t(singular));
    }
  }
}

// Create singleton instance
const i18n = new I18nManager();

export default i18n;
export type { Language, TranslationKey };