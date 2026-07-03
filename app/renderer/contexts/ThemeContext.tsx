import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'professional' | 'ai' | 'contrast';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  availableThemes: { id: Theme; label: string; color: string }[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  defaultTheme = 'dark' 
}) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('knoux-theme');
    // Validate saved theme
    if (saved && ['light', 'dark', 'professional', 'ai', 'contrast'].includes(saved)) {
      return saved as Theme;
    }
    return defaultTheme;
  });

  const availableThemes: { id: Theme; label: string; color: string }[] = [
    { id: 'dark', label: 'Midnight', color: '#0F0F1A' },
    { id: 'light', label: 'Daylight', color: '#F8FAFC' },
    { id: 'professional', label: 'Professional', color: '#0056b3' },
    { id: 'ai', label: 'AI Green', color: '#064E3B' },
    { id: 'contrast', label: 'High Contrast', color: '#000000' }
  ];

  useEffect(() => {
    localStorage.setItem('knoux-theme', theme);
    document.documentElement.classList.remove('light', 'dark', 'professional', 'ai', 'contrast');
    document.documentElement.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, availableThemes }}>
      {children}
    </ThemeContext.Provider>
  );
};
