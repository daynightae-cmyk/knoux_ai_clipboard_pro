/**
 * Theme Hook - Knoux Clipboard AI
 * Manages theme switching and glassmorphic styling
 */

import { useState, useEffect, useCallback } from 'react';
import type { ElectronAPI } from '../types/electron';

export interface ThemeConfig {
  mode: 'light' | 'dark';
  glassIntensity: 'normal' | 'high' | 'ultra';
  accentColor: string;
  animations: boolean;
  blurEnabled: boolean;
  transparency: number;
}

interface UseThemeReturn {
  theme: ThemeConfig | null;
  isLoading: boolean;

  // Actions
  setThemeMode: (mode: 'light' | 'dark') => Promise<void>;
  toggleTheme: () => Promise<void>;
  setGlassIntensity: (intensity: 'normal' | 'high' | 'ultra') => Promise<void>;
  setAccentColor: (color: string) => Promise<void>;
  setAnimations: (enabled: boolean) => Promise<void>;
  setTransparency: (value: number) => Promise<void>;
  applyPreset: (preset: 'glass-dark' | 'glass-light' | 'minimal' | 'cyberpunk') => Promise<void>;

  // Getters
  getCSS: () => string;
}

export const useTheme = (): UseThemeReturn => {
  const [theme, setThemeState] = useState<ThemeConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial theme
  useEffect(() => {
    loadTheme();
  }, []);

  // Apply theme CSS to document
  useEffect(() => {
    if (theme) {
      applyThemeToDocument(theme);
    }
  }, [theme]);

  const loadTheme = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await window.electron.ipcRenderer.invoke('theme:get');

      if (response.success) {
        setThemeState(response.data);
      } else {
        throw new Error(response.error || 'Failed to load theme');
      }
    } catch (err) {
      console.error('Failed to load theme:', err);
      // Fallback to dark theme
      setThemeState({
        mode: 'dark',
        glassIntensity: 'high',
        accentColor: '#667eea',
        animations: true,
        blurEnabled: true,
        transparency: 70
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const applyThemeToDocument = useCallback((themeConfig: ThemeConfig) => {
    try {
      const css = window.electron.ipcRenderer.sendSync('theme:get-css');

      // Remove existing theme style
      const existingStyle = document.getElementById('theme-styles');
      if (existingStyle) {
        existingStyle.remove();
      }

      // Add new theme style
      const style = document.createElement('style');
      style.id = 'theme-styles';
      style.textContent = css;
      document.head.appendChild(style);

      // Apply theme class to body
      document.body.className = `theme-${themeConfig.mode}`;
    } catch (err) {
      console.error('Failed to apply theme:', err);
    }
  }, []);

  const setThemeMode = useCallback(async (mode: 'light' | 'dark') => {
    try {
      const response = await window.electron.ipcRenderer.invoke('theme:set-mode', mode);

      if (response.success) {
        setThemeState(response.data);
      } else {
        throw new Error(response.error || 'Failed to set theme mode');
      }
    } catch (err) {
      console.error('Failed to set theme mode:', err);
    }
  }, []);

  const toggleTheme = useCallback(async () => {
    try {
      const response = await window.electron.ipcRenderer.invoke('theme:toggle');

      if (response.success) {
        setThemeState(response.data);
      } else {
        throw new Error(response.error || 'Failed to toggle theme');
      }
    } catch (err) {
      console.error('Failed to toggle theme:', err);
    }
  }, []);

  const setGlassIntensity = useCallback(async (intensity: 'normal' | 'high' | 'ultra') => {
    try {
      const response = await window.electron.ipcRenderer.invoke('theme:set-glass-intensity', intensity);

      if (response.success) {
        setThemeState(response.data);
      } else {
        throw new Error(response.error || 'Failed to set glass intensity');
      }
    } catch (err) {
      console.error('Failed to set glass intensity:', err);
    }
  }, []);

  const setAccentColor = useCallback(async (color: string) => {
    try {
      const response = await window.electron.ipcRenderer.invoke('theme:set-accent-color', color);

      if (response.success) {
        setThemeState(response.data);
      } else {
        throw new Error(response.error || 'Failed to set accent color');
      }
    } catch (err) {
      console.error('Failed to set accent color:', err);
    }
  }, []);

  const setAnimations = useCallback(async (enabled: boolean) => {
    try {
      const response = await window.electron.ipcRenderer.invoke('theme:set-animations', enabled);

      if (response.success) {
        setThemeState(response.data);
      } else {
        throw new Error(response.error || 'Failed to set animations');
      }
    } catch (err) {
      console.error('Failed to set animations:', err);
    }
  }, []);

  const setTransparency = useCallback(async (value: number) => {
    try {
      const response = await window.electron.ipcRenderer.invoke('theme:set-transparency', value);

      if (response.success) {
        setThemeState(response.data);
      } else {
        throw new Error(response.error || 'Failed to set transparency');
      }
    } catch (err) {
      console.error('Failed to set transparency:', err);
    }
  }, []);

  const applyPreset = useCallback(async (preset: 'glass-dark' | 'glass-light' | 'minimal' | 'cyberpunk') => {
    try {
      const response = await window.electron.ipcRenderer.invoke('theme:apply-preset', preset);

      if (response.success) {
        setThemeState(response.data);
      } else {
        throw new Error(response.error || 'Failed to apply preset');
      }
    } catch (err) {
      console.error('Failed to apply preset:', err);
    }
  }, []);

  const getCSS = useCallback((): string => {
    try {
      return window.electron.ipcRenderer.sendSync('theme:get-css');
    } catch (err) {
      console.error('Failed to get theme CSS:', err);
      return '';
    }
  }, []);

  return {
    theme,
    isLoading,

    setThemeMode,
    toggleTheme,
    setGlassIntensity,
    setAccentColor,
    setAnimations,
    setTransparency,
    applyPreset,

    getCSS,
  };
};

export default useTheme;
