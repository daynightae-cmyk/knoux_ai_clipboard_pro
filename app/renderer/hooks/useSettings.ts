/**
 * Settings Hook - Knoux Clipboard AI
 * Simplified settings management connected to enhanced IPC handlers
 */

import { useState, useEffect, useCallback } from 'react';

export interface UserSettings {
  // Language & Theme
  language: 'en' | 'ar';
  theme: 'light' | 'dark';

  // System Preferences
  startWithSystem: boolean;
  runInBackground: boolean;
  notifications: boolean;
  clipboardMonitoring: boolean;
  performanceMode: 'low' | 'balanced' | 'high';

  // Clipboard Settings
  clipboardLimit: number;
  autoCleanup: boolean;
  cleanupDays: number;

  // AI Settings
  aiEnabled: boolean;
  aiModel: 'local' | 'cloud';
  autoSummarize: boolean;

  // UI Settings
  showTrayIcon: boolean;
  minimizeToTray: boolean;
  showInTaskbar: boolean;

  // Privacy & Security
  encryption: boolean;
  dataRetention: number;
  anonymizeData: boolean;
}

interface UseSettingsReturn {
  settings: UserSettings | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  
  // Actions
  updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => Promise<void>;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  exportSettings: () => Promise<string>;
  importSettings: (settingsJson: string) => Promise<boolean>;
  
  // Getters
  getSetting: <K extends keyof UserSettings>(key: K) => UserSettings[K] | undefined;
}

export const useSettings = (): UseSettingsReturn => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await window.electron.ipcRenderer.invoke('settings:get-all');
      
      if (response.success) {
        setSettings(response.data);
      } else {
        throw new Error(response.error || 'Failed to load settings');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('Failed to load settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSetting = useCallback(async <K extends keyof UserSettings>(
    key: K, 
    value: UserSettings[K]
  ) => {
    if (!settings) return;

    try {
      setIsSaving(true);
      setError(null);

      const response = await window.electron.ipcRenderer.invoke('settings:set', key, value);

      if (response.success) {
        setSettings(response.data);
      } else {
        throw new Error(response.error || 'Failed to update setting');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('Failed to update setting:', err);
    } finally {
      setIsSaving(false);
    }
  }, [settings]);

  const updateSettings = useCallback(async (updates: Partial<UserSettings>) => {
    if (!settings) return;

    try {
      setIsSaving(true);
      setError(null);
      
      const response = await window.electron.ipcRenderer.invoke('settings:update', updates);

      if (response.success) {
        setSettings(response.data);
      } else {
        throw new Error(response.error || 'Failed to update settings');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('Failed to update settings:', err);
    } finally {
      setIsSaving(false);
    }
  }, [settings]);

  const resetSettings = useCallback(async () => {
    try {
      setIsSaving(true);
      setError(null);
      
      const response = await window.electron.ipcRenderer.invoke('settings:reset');
      
      if (response.success) {
        setSettings(response.data);
      } else {
        throw new Error(response.error || 'Failed to reset settings');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('Failed to reset settings:', err);
    } finally {
      setIsSaving(false);
    }
  }, []);

  const exportSettings = useCallback(async (): Promise<string> => {
    try {
      const response = await window.electron.ipcRenderer.invoke('settings:export');
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to export settings');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('Failed to export settings:', err);
      throw err;
    }
  }, []);

  const importSettings = useCallback(async (settingsJson: string): Promise<boolean> => {
    try {
      setIsSaving(true);
      setError(null);
      
      const response = await window.electron.ipcRenderer.invoke('settings:import', settingsJson);
      
      if (response.success) {
        await loadSettings(); // Reload settings after import
        return true;
      } else {
        throw new Error(response.error || 'Failed to import settings');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('Failed to import settings:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [loadSettings]);

  const getSetting = useCallback(<K extends keyof UserSettings>(key: K): UserSettings[K] | undefined => {
    return settings?.[key];
  }, [settings]);

  return {
    settings,
    isLoading,
    isSaving,
    error,

    updateSetting,
    updateSettings,
    resetSettings,
    exportSettings,
    importSettings,
    
    getSetting,
  };
};

export default useSettings;
