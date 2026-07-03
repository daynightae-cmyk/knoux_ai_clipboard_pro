/**
 * Language Hook - Knoux Clipboard AI
 * Manages language switching and translations
 */

import { useState, useEffect, useCallback } from 'react';
import type { ElectronAPI } from '../types/electron';

interface UseLanguageReturn {
  language: 'en' | 'ar';
  isRTL: boolean;
  isLoading: boolean;

  // Actions
  changeLanguage: (lang: 'en' | 'ar') => Promise<void>;
  translate: (key: string) => string;

  // Getters
  getAllTranslations: (lang?: 'en' | 'ar') => any;
}

export const useLanguage = (): UseLanguageReturn => {
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [isRTL, setIsRTL] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial language
  useEffect(() => {
    loadLanguage();
  }, []);

  // Apply RTL/LTR to document
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [isRTL, language]);

  const loadLanguage = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await window.electron.ipcRenderer.invoke('language:get');

      if (response.success) {
        const lang = response.data;
        setLanguage(lang);
        setIsRTL(lang === 'ar');
      } else {
        throw new Error(response.error || 'Failed to load language');
      }
    } catch (err) {
      console.error('Failed to load language:', err);
      // Fallback to English
      setLanguage('en');
      setIsRTL(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const changeLanguage = useCallback(async (lang: 'en' | 'ar') => {
    try {
      const response = await window.electron.ipcRenderer.invoke('language:set', lang);

      if (response.success) {
        setLanguage(lang);
        setIsRTL(lang === 'ar');
      } else {
        throw new Error(response.error || 'Failed to change language');
      }
    } catch (err) {
      console.error('Failed to change language:', err);
    }
  }, []);

  const translate = useCallback((key: string): string => {
    try {
      return window.electron.ipcRenderer.sendSync('language:translate', key);
    } catch (err) {
      console.error('Failed to translate:', err);
      return key; // Return key if translation fails
    }
  }, []);

  const getAllTranslations = useCallback((lang?: 'en' | 'ar') => {
    try {
      return window.electron.ipcRenderer.sendSync('language:get-all-translations', lang);
    } catch (err) {
      console.error('Failed to get translations:', err);
      return {};
    }
  }, []);

  return {
    language,
    isRTL,
    isLoading,

    changeLanguage,
    translate,

    getAllTranslations,
  };
};

export default useLanguage;
