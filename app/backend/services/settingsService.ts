/**
 * Settings Service - Knoux Clipboard AI
 * Real persistent settings with database storage
 */

import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

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
  dataRetention: number; // days
  anonymizeData: boolean;
}

class SettingsService {
  private configPath: string;
  private settings: UserSettings;
  private listeners: Set<(settings: UserSettings) => void> = new Set();

  constructor() {
    this.configPath = path.join(app.getPath('userData'), 'knoux-settings.json');
    this.settings = this.loadSettings();
    this.ensureDefaults();
  }

  private getDefaults(): UserSettings {
    return {
      // Language & Theme
      language: 'en',
      theme: 'dark',
      
      // System Preferences
      startWithSystem: false,
      runInBackground: true,
      notifications: true,
      clipboardMonitoring: true,
      performanceMode: 'balanced',
      
      // Clipboard Settings
      clipboardLimit: 1000,
      autoCleanup: false,
      cleanupDays: 30,
      
      // AI Settings
      aiEnabled: true,
      aiModel: 'local',
      autoSummarize: false,
      
      // UI Settings
      showTrayIcon: true,
      minimizeToTray: true,
      showInTaskbar: true,
      
      // Privacy & Security
      encryption: false,
      dataRetention: 90,
      anonymizeData: false
    };
  }

  private loadSettings(): UserSettings {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, 'utf-8');
        const loaded = JSON.parse(data);
        return loaded;
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
    return this.getDefaults();
  }

  private ensureDefaults(): void {
    const defaults = this.getDefaults();
    let needsSave = false;

    // Ensure all default properties exist
    for (const key in defaults) {
      if (!(key in this.settings)) {
        (this.settings as any)[key] = (defaults as any)[key];
        needsSave = true;
      }
    }

    if (needsSave) {
      this.saveSettings();
    }
  }

  private saveSettings(): void {
    try {
      const dir = path.dirname(this.configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(
        this.configPath,
        JSON.stringify(this.settings, null, 2),
        'utf-8'
      );

      console.log('✅ Settings saved to:', this.configPath);
      this.notifyListeners();
    } catch (error) {
      console.error('❌ Error saving settings:', error);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener({ ...this.settings }));
  }

  // Public API
  getAllSettings(): UserSettings {
    return { ...this.settings };
  }

  getSetting<K extends keyof UserSettings>(key: K): UserSettings[K] {
    return this.settings[key];
  }

  updateSettings(updates: Partial<UserSettings>): void {
    this.settings = { ...this.settings, ...updates };
    this.saveSettings();
  }

  setSetting<K extends keyof UserSettings>(key: K, value: UserSettings[K]): void {
    this.settings[key] = value;
    this.saveSettings();
  }

  resetSettings(): void {
    this.settings = this.getDefaults();
    this.saveSettings();
  }

  // Event listeners
  onSettingsChanged(callback: (settings: UserSettings) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  // Utility methods
  exportSettings(): string {
    return JSON.stringify(this.settings, null, 2);
  }

  importSettings(settingsJson: string): boolean {
    try {
      const imported = JSON.parse(settingsJson);
      this.settings = { ...this.getDefaults(), ...imported };
      this.saveSettings();
      return true;
    } catch (error) {
      console.error('Error importing settings:', error);
      return false;
    }
  }

  // System integration
  applySystemSettings(): void {
    // Apply startup with system
    app.setLoginItemSettings({
      openAtLogin: this.settings.startWithSystem,
      openAsHidden: this.settings.runInBackground
    });

    console.log('✅ System settings applied');
  }
}

// Singleton instance
export const settingsService = new SettingsService();
