// Global TypeScript declarations for Electron
interface Window {
  electron: {
    ipcRenderer: {
      invoke: (channel: string, ...args: any[]) => Promise<any>;
      send: (channel: string, ...args: any[]) => void;
      on: (channel: string, func: (...args: any[]) => void) => void;
      once: (channel: string, func: (...args: any[]) => void) => void;
      removeListener: (channel: string, func: (...args: any[]) => void) => void;
    };
  };
  
  electronAPI: {
    // Settings
    getSettings: () => Promise<{ success: boolean; data?: any; error?: string }>;
    updateSettings: (settings: any) => Promise<{ success: boolean; data?: any; error?: string }>;
    
    // Language
    getLanguage: () => Promise<{ success: boolean; data?: 'en' | 'ar'; error?: string }>;
    setLanguage: (lang: 'en' | 'ar') => Promise<{ success: boolean; data?: 'en' | 'ar'; error?: string }>;
    
    // Theme
    getTheme: () => Promise<{ success: boolean; data?: any; error?: string }>;
    setTheme: (theme: 'light' | 'dark') => Promise<{ success: boolean; data?: any; error?: string }>;
    
    // Clipboard
    getClipboardItems: (limit?: number, offset?: number) => Promise<{ success: boolean; data?: any[]; error?: string }>;
    searchClipboard: (query: string) => Promise<{ success: boolean; data?: any[]; error?: string }>;
    
    // System
    getSystemInfo: () => Promise<{ success: boolean; data?: any; error?: string }>;
  };
  
  knoux: {
    // App lifecycle
    isAppReady: () => boolean;
    onAppReady: (callback: () => void) => void;
    quitApp: () => Promise<{ success: boolean }>;
    
    // Settings
    getSettings: () => Promise<{
      success: boolean;
      data?: any;
      error?: string;
    }>;
    saveSettings: (settings: any) => Promise<{
      success: boolean;
      error?: string;
    }>;
    
    // Clipboard
    getClipboardHistory: () => Promise<{
      success: boolean;
      data?: any[];
      error?: string;
    }>;
    copyToClipboard: (content: string) => Promise<{
      success: boolean;
      error?: string;
    }>;
    
    // AI operations
    processWithAI: (options: any) => Promise<{
      success: boolean;
      data?: any;
      error?: string;
    }>;
  };
}

// Add Node.js process types
declare namespace NodeJS {
  interface Process {
    versions: {
      electron: string;
      chrome: string;
      node: string;
    };
  }
}
