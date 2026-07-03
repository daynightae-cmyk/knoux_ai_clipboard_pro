/**
 * Theme System - نظام الثيم الاحترافي
 * Knoux Clipboard AI - Professional Grade Theme Management
 * Dark/Light Mode + Custom Colors + Smooth Transitions
 */

export type ThemeMode = 'light' | 'dark' | 'auto';
export type ThemeName = 'default' | 'ocean' | 'forest' | 'sunset' | 'midnight' | 'custom';

export interface ThemeColors {
  // Primitives
  background: string;
  surface: string;
  surfaceVariant: string;
  border: string;

  // Text Colors
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverted: string;
  };

  // Component Colors
  primary: string;
  secondary: string;
  accent: string;
  destructive: string;
  success: string;
  warning: string;
  info: string;

  // Semantic Colors
  semantic: {
    divider: string;
    disabled: string;
    hover: string;
    focus: string;
    active: string;
  };

  // Status Colors
  status: {
    online: string;
    offline: string;
    idle: string;
    error: string;
  };
}

export interface Theme {
  name: ThemeName;
  label: string;
  mode: 'light' | 'dark';
  colors: ThemeColors;
}

export interface ThemeState {
  currentMode: ThemeMode;
  currentTheme: ThemeName;
  preferredTheme: ThemeName;
  customColors: Partial<ThemeColors>;
}

// ==================== THEME DEFINITIONS ====================

const LIGHT_BASE: ThemeColors = {
  background: '#ffffff',
  surface: '#f8f9fa',
  surfaceVariant: '#e9ecef',
  border: '#dee2e6',

  text: {
    primary: '#212529',
    secondary: '#6c757d',
    tertiary: '#adb5bd',
    inverted: '#ffffff',
  },

  primary: '#6366f1',
  secondary: '#8b5cf6',
  accent: '#ec4899',
  destructive: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',
  info: '#3b82f6',

  semantic: {
    divider: '#e5e7eb',
    disabled: '#d1d5db',
    hover: '#f3f4f6',
    focus: '#dbeafe',
    active: '#e0e7ff',
  },

  status: {
    online: '#10b981',
    offline: '#6b7280',
    idle: '#f59e0b',
    error: '#ef4444',
  },
};

const DARK_BASE: ThemeColors = {
  background: '#0f172a',
  surface: '#1e293b',
  surfaceVariant: '#334155',
  border: '#475569',

  text: {
    primary: '#f1f5f9',
    secondary: '#cbd5e1',
    tertiary: '#94a3b8',
    inverted: '#0f172a',
  },

  primary: '#818cf8',
  secondary: '#a78bfa',
  accent: '#f472b6',
  destructive: '#f87171',
  success: '#34d399',
  warning: '#fbbf24',
  info: '#60a5fa',

  semantic: {
    divider: '#334155',
    disabled: '#475569',
    hover: '#1e293b',
    focus: '#1e3a8a',
    active: '#3730a3',
  },

  status: {
    online: '#34d399',
    offline: '#9ca3af',
    idle: '#fbbf24',
    error: '#f87171',
  },
};

// ==================== THEME PRESETS ====================

export const THEME_PRESETS: Record<ThemeName, { light: Theme; dark: Theme }> = {
  default: {
    light: {
      name: 'default',
      label: 'Default',
      mode: 'light',
      colors: LIGHT_BASE,
    },
    dark: {
      name: 'default',
      label: 'Default',
      mode: 'dark',
      colors: DARK_BASE,
    },
  },

  ocean: {
    light: {
      name: 'ocean',
      label: 'Ocean',
      mode: 'light',
      colors: {
        ...LIGHT_BASE,
        primary: '#0284c7',
        secondary: '#0369a1',
        accent: '#06b6d4',
        success: '#06b6d4',
        text: { ...LIGHT_BASE.text, primary: '#0c4a6e' },
      },
    },
    dark: {
      name: 'ocean',
      label: 'Ocean',
      mode: 'dark',
      colors: {
        ...DARK_BASE,
        primary: '#0ea5e9',
        secondary: '#06b6d4',
        accent: '#22d3ee',
        success: '#22d3ee',
      },
    },
  },

  forest: {
    light: {
      name: 'forest',
      label: 'Forest',
      mode: 'light',
      colors: {
        ...LIGHT_BASE,
        primary: '#059669',
        secondary: '#10b981',
        accent: '#34d399',
        success: '#10b981',
        text: { ...LIGHT_BASE.text, primary: '#064e3b' },
      },
    },
    dark: {
      name: 'forest',
      label: 'Forest',
      mode: 'dark',
      colors: {
        ...DARK_BASE,
        primary: '#34d399',
        secondary: '#6ee7b7',
        accent: '#a7f3d0',
        success: '#34d399',
      },
    },
  },

  sunset: {
    light: {
      name: 'sunset',
      label: 'Sunset',
      mode: 'light',
      colors: {
        ...LIGHT_BASE,
        primary: '#ea580c',
        secondary: '#f97316',
        accent: '#fb923c',
        warning: '#f97316',
        text: { ...LIGHT_BASE.text, primary: '#7c2d12' },
      },
    },
    dark: {
      name: 'sunset',
      label: 'Sunset',
      mode: 'dark',
      colors: {
        ...DARK_BASE,
        primary: '#fb923c',
        secondary: '#fdba74',
        accent: '#fecaca',
        warning: '#fb923c',
      },
    },
  },

  midnight: {
    light: {
      name: 'midnight',
      label: 'Midnight',
      mode: 'light',
      colors: {
        ...LIGHT_BASE,
        primary: '#7c3aed',
        secondary: '#a855f7',
        accent: '#d946ef',
        text: { ...LIGHT_BASE.text, primary: '#3f0f5c' },
      },
    },
    dark: {
      name: 'midnight',
      label: 'Midnight',
      mode: 'dark',
      colors: {
        ...DARK_BASE,
        primary: '#c084fc',
        secondary: '#d8b4fe',
        accent: '#f0abfc',
      },
    },
  },

  custom: {
    light: {
      name: 'custom',
      label: 'Custom',
      mode: 'light',
      colors: LIGHT_BASE,
    },
    dark: {
      name: 'custom',
      label: 'Custom',
      mode: 'dark',
      colors: DARK_BASE,
    },
  },
};

// ==================== THEME MANAGER ====================

export class ThemeManager {
  private static instance: ThemeManager;
  private state: ThemeState;
  private listeners: ((theme: Theme) => void)[] = [];
  private root: HTMLElement;
  private storageKey = 'knoux_theme_state';
  private systemColorSchemeListener: ((e: MediaQueryListEvent) => void) | null = null;

  private constructor() {
    this.root = document.documentElement;
    this.state = this.loadState();
    this.applyTheme();
    this.setupSystemColorSchemeListener();
  }

  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  // ==================== STATE MANAGEMENT ====================

  private loadState(): ThemeState {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load theme state:', error);
    }

    return {
      currentMode: 'auto',
      currentTheme: 'default',
      preferredTheme: 'default',
      customColors: {},
    };
  }

  private saveState(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (error) {
      console.error('Failed to save theme state:', error);
    }
  }

  // ==================== SYSTEM COLOR SCHEME DETECTION ====================

  private setupSystemColorSchemeListener(): void {
    if (!window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    this.systemColorSchemeListener = (e: MediaQueryListEvent) => {
      if (this.state.currentMode === 'auto') {
        this.applyTheme();
        this.notifyListeners();
      }
    };

    mediaQuery.addEventListener('change', this.systemColorSchemeListener);
  }

  private getSystemMode(): 'light' | 'dark' {
    if (!window.matchMedia) return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  // ==================== THEME APPLICATION ====================

  private getEffectiveMode(): 'light' | 'dark' {
    if (this.state.currentMode === 'auto') {
      return this.getSystemMode();
    }
    return this.state.currentMode as 'light' | 'dark';
  }

  getCurrentTheme(): Theme {
    const mode = this.getEffectiveMode();
    const preset = THEME_PRESETS[this.state.currentTheme];
    const baseTheme = mode === 'dark' ? preset.dark : preset.light;

    // Apply custom colors if any
    if (Object.keys(this.state.customColors).length > 0) {
      return {
        ...baseTheme,
        colors: {
          ...baseTheme.colors,
          ...this.state.customColors,
        },
      };
    }

    return baseTheme;
  }

  private applyTheme(): void {
    const theme = this.getCurrentTheme();
    const mode = this.getEffectiveMode();

    // Apply CSS variables
    const root = this.root;
    const colors = theme.colors;

    // Background & Surfaces
    root.style.setProperty('--bg-primary', colors.background);
    root.style.setProperty('--bg-surface', colors.surface);
    root.style.setProperty('--bg-surface-variant', colors.surfaceVariant);
    root.style.setProperty('--border-color', colors.border);

    // Text
    root.style.setProperty('--text-primary', colors.text.primary);
    root.style.setProperty('--text-secondary', colors.text.secondary);
    root.style.setProperty('--text-tertiary', colors.text.tertiary);

    // Colors
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-destructive', colors.destructive);
    root.style.setProperty('--color-success', colors.success);
    root.style.setProperty('--color-warning', colors.warning);
    root.style.setProperty('--color-info', colors.info);

    // Semantic
    root.style.setProperty('--semantic-divider', colors.semantic.divider);
    root.style.setProperty('--semantic-disabled', colors.semantic.disabled);
    root.style.setProperty('--semantic-hover', colors.semantic.hover);
    root.style.setProperty('--semantic-focus', colors.semantic.focus);
    root.style.setProperty('--semantic-active', colors.semantic.active);

    // Apply mode to HTML element
    root.setAttribute('data-theme-mode', mode);
    root.classList.toggle('dark', mode === 'dark');
  }

  // ==================== PUBLIC API ====================

  setMode(mode: ThemeMode): void {
    this.state.currentMode = mode;
    this.saveState();
    this.applyTheme();
    this.notifyListeners();
  }

  setTheme(themeName: ThemeName): void {
    if (THEME_PRESETS[themeName]) {
      this.state.currentTheme = themeName;
      this.state.preferredTheme = themeName;
      this.saveState();
      this.applyTheme();
      this.notifyListeners();
    }
  }

  setCustomColor(key: keyof ThemeColors, value: string): void {
    this.state.customColors[key] = value;
    this.saveState();
    this.applyTheme();
    this.notifyListeners();
  }

  resetCustomColors(): void {
    this.state.customColors = {};
    this.saveState();
    this.applyTheme();
    this.notifyListeners();
  }

  getState(): ThemeState {
    return { ...this.state };
  }

  getAvailableThemes(): ThemeName[] {
    return Object.keys(THEME_PRESETS) as ThemeName[];
  }

  // ==================== LISTENERS ====================

  onChange(callback: (theme: Theme) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners(): void {
    const theme = this.getCurrentTheme();
    this.listeners.forEach(listener => listener(theme));
  }

  // ==================== CLEANUP ====================

  destroy(): void {
    if (this.systemColorSchemeListener && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.removeEventListener('change', this.systemColorSchemeListener);
    }
  }
}

export const themeManager = ThemeManager.getInstance();
export default themeManager;
