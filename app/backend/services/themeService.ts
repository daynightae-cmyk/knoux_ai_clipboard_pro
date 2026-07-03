/**
 * Theme Service - Knoux Clipboard AI
 * Glassmorphic theme system with dark/light modes
 */

import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

export type Theme = 'light' | 'dark';
export type GlassIntensity = 'normal' | 'high' | 'ultra';

export interface ThemeConfig {
  mode: Theme;
  glassIntensity: GlassIntensity;
  accentColor: string;
  customCSS?: string;
  animations: boolean;
  blurEnabled: boolean;
  transparency: number; // 0-100
}

class ThemeService {
  private currentTheme: ThemeConfig;
  private listeners: Set<(theme: ThemeConfig) => void> = new Set();

  constructor() {
    this.currentTheme = this.loadSavedTheme();
  }

  private loadSavedTheme(): ThemeConfig {
    try {
      const configPath = path.join(app.getPath('userData'), 'knoux-settings.json');
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        if (config.theme) {
          return config.theme;
        }
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }

    return {
      mode: 'dark',
      glassIntensity: 'high',
      accentColor: '#667eea',
      animations: true,
      blurEnabled: true,
      transparency: 70
    };
  }

  private saveTheme(): void {
    try {
      const configPath = path.join(app.getPath('userData'), 'knoux-settings.json');
      let config: any = {};
      
      if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      }
      
      config.theme = this.currentTheme;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      console.log('✅ Theme saved:', this.currentTheme);
    } catch (error) {
      console.error('❌ Error saving theme:', error);
    }
  }

  setTheme(mode: Theme): void {
    this.currentTheme.mode = mode;
    this.saveTheme();
    this.notifyListeners();
  }

  setGlassIntensity(intensity: GlassIntensity): void {
    this.currentTheme.glassIntensity = intensity;
    this.saveTheme();
    this.notifyListeners();
  }

  setAccentColor(color: string): void {
    this.currentTheme.accentColor = color;
    this.saveTheme();
    this.notifyListeners();
  }

  setAnimations(enabled: boolean): void {
    this.currentTheme.animations = enabled;
    this.saveTheme();
    this.notifyListeners();
  }

  setBlurEnabled(enabled: boolean): void {
    this.currentTheme.blurEnabled = enabled;
    this.saveTheme();
    this.notifyListeners();
  }

  setTransparency(value: number): void {
    this.currentTheme.transparency = Math.max(0, Math.min(100, value));
    this.saveTheme();
    this.notifyListeners();
  }

  getTheme(): ThemeConfig {
    return { ...this.currentTheme };
  }

  toggleTheme(): void {
    this.setTheme(this.currentTheme.mode === 'dark' ? 'light' : 'dark');
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getTheme()));
  }

  onThemeChange(callback: (theme: ThemeConfig) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  getGlassmorphicCSS(): string {
    const { mode, glassIntensity, accentColor, transparency, blurEnabled } = this.currentTheme;
    
    const blurValues = {
      normal: blurEnabled ? '8px' : '0px',
      high: blurEnabled ? '12px' : '0px',
      ultra: blurEnabled ? '16px' : '0px'
    };

    const bgValues = {
      dark: {
        glass: `rgba(30, 30, 50, ${transparency / 100})`,
        border: 'rgba(255, 255, 255, 0.1)',
        shadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        text: 'rgba(255, 255, 255, 0.95)',
        textSecondary: 'rgba(255, 255, 255, 0.7)',
        bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
      },
      light: {
        glass: `rgba(255, 255, 255, ${transparency / 100})`,
        border: 'rgba(0, 0, 0, 0.1)',
        shadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        text: 'rgba(0, 0, 0, 0.95)',
        textSecondary: 'rgba(0, 0, 0, 0.7)',
        bg: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
      }
    };

    return `
      :root {
        --theme-mode: '${mode}';
        --glass-blur: ${blurValues[glassIntensity]};
        --glass-bg: ${bgValues[mode].glass};
        --glass-border: ${bgValues[mode].border};
        --glass-shadow: ${bgValues[mode].shadow};
        --accent-color: ${accentColor};
        --text-primary: ${bgValues[mode].text};
        --text-secondary: ${bgValues[mode].textSecondary};
        --bg-gradient: ${bgValues[mode].bg};
        --transparency: ${transparency}%;
        --animations: ${this.currentTheme.animations ? 'enabled' : 'disabled'};
      }

      body {
        background: var(--bg-gradient);
        background-attachment: fixed;
        color: var(--text-primary);
        transition: all 0.3s ease;
      }

      .glass-container {
        background: var(--glass-bg);
        backdrop-filter: blur(var(--glass-blur));
        -webkit-backdrop-filter: blur(var(--glass-blur));
        border: 1px solid var(--glass-border);
        border-radius: 20px;
        box-shadow: var(--glass-shadow);
        padding: 30px;
        transition: all 0.3s ease;
      }

      .glass-card {
        background: var(--glass-bg);
        backdrop-filter: blur(calc(var(--glass-blur) * 0.7));
        -webkit-backdrop-filter: blur(calc(var(--glass-blur) * 0.7));
        border: 1px solid var(--glass-border);
        border-radius: 16px;
        padding: 20px;
        margin: 10px 0;
        transition: all 0.3s ease;
      }

      .glass-card:hover {
        background: ${mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'};
        transform: translateY(-2px);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
      }

      .glass-button {
        background: ${mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid var(--glass-border);
        border-radius: 12px;
        padding: 12px 24px;
        color: var(--text-primary);
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .glass-button:hover {
        background: ${mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'};
        border-color: var(--accent-color);
        transform: translateY(-2px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
      }

      .glass-button:active {
        transform: translateY(0);
        background: ${mode === 'dark' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.15)'};
      }

      .glass-input {
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-radius: 10px;
        padding: 12px 16px;
        color: var(--text-primary);
        font-size: 14px;
        transition: all 0.3s ease;
      }

      .glass-input:focus {
        background: ${mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'};
        border-color: var(--accent-color);
        outline: none;
        box-shadow: 0 0 0 3px ${accentColor}20;
      }

      .glass-input::placeholder {
        color: var(--text-secondary);
      }

      /* Animated gradient background */
      .animated-bg {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        background: ${mode === 'dark' 
          ? 'linear-gradient(-45deg, #1a1a2e, #16213e, #0f3460, #1a1a2e)'
          : 'linear-gradient(-45deg, #f8fafc, #e2e8f0, #cbd5e1, #f8fafc)'
        };
        background-size: 400% 400%;
        animation: ${this.currentTheme.animations ? 'gradientShift 15s ease infinite' : 'none'};
      }

      @keyframes gradientShift {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }

      /* Glassmorphic scrollbar */
      ::-webkit-scrollbar {
        width: 8px;
      }

      ::-webkit-scrollbar-track {
        background: var(--glass-bg);
        border-radius: 10px;
      }

      ::-webkit-scrollbar-thumb {
        background: var(--glass-border);
        border-radius: 10px;
        transition: background 0.3s;
      }

      ::-webkit-scrollbar-thumb:hover {
        background: var(--accent-color);
      }

      /* RTL support */
      [dir="rtl"] .glass-card {
        text-align: right;
      }

      [dir="rtl"] .glass-button {
        margin-left: 0;
        margin-right: 8px;
      }
    `;
  }

  // Preset themes
  applyPreset(preset: 'glass-dark' | 'glass-light' | 'minimal' | 'cyberpunk'): void {
    const presets = {
      'glass-dark': {
        mode: 'dark' as Theme,
        glassIntensity: 'high' as GlassIntensity,
        accentColor: '#667eea',
        animations: true,
        blurEnabled: true,
        transparency: 70
      },
      'glass-light': {
        mode: 'light' as Theme,
        glassIntensity: 'high' as GlassIntensity,
        accentColor: '#3b82f6',
        animations: true,
        blurEnabled: true,
        transparency: 80
      },
      'minimal': {
        mode: 'light' as Theme,
        glassIntensity: 'normal' as GlassIntensity,
        accentColor: '#6b7280',
        animations: false,
        blurEnabled: false,
        transparency: 90
      },
      'cyberpunk': {
        mode: 'dark' as Theme,
        glassIntensity: 'ultra' as GlassIntensity,
        accentColor: '#f59e0b',
        animations: true,
        blurEnabled: true,
        transparency: 60
      }
    };

    this.currentTheme = { ...this.currentTheme, ...presets[preset] };
    this.saveTheme();
    this.notifyListeners();
  }
}

// Singleton instance
export const themeService = new ThemeService();
