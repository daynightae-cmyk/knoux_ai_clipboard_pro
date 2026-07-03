// Global TypeScript declarations for Electron renderer APIs

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.ico' {
  const src: string;
  export default src;
}

type KnouxResult<T = any> = Promise<{
  ok?: boolean;
  success?: boolean;
  data?: T;
  error?: string;
}>;

interface Window {
  electron: {
    ipcRenderer: {
      invoke: (channel: string, ...args: any[]) => Promise<any>;
      on: (channel: string, func: (...args: any[]) => void) => (() => void) | void;
      removeAllListeners: (channel: string) => void;
    };
    shell: {
      openExternal: (url: string) => Promise<any>;
    };
  };

  electronAPI: {
    getSettings: () => KnouxResult<any>;
    updateSettings: (settings: any) => KnouxResult<any>;
    getLanguage: () => KnouxResult<'en' | 'ar'>;
    setLanguage: (lang: 'en' | 'ar') => KnouxResult<'en' | 'ar'>;
    getTheme: () => KnouxResult<any>;
    setTheme: (theme: string) => KnouxResult<any>;
    getClipboardItems: (limit?: number, offset?: number) => KnouxResult<any[]>;
    searchClipboard: (query: string) => KnouxResult<any[]>;
    getSystemInfo: () => KnouxResult<any>;
  };

  knoux: {
    isAppReady: () => boolean;
    onAppReady: (callback: () => void) => void;
    quitApp: () => KnouxResult;

    getSettings: () => KnouxResult<any>;
    saveSettings: (settings: any) => KnouxResult<any>;
    getClipboardHistory: () => KnouxResult<any[]>;
    copyToClipboard: (content: string) => KnouxResult;
    processWithAI: (options: any) => KnouxResult<any>;

    test?: any;
    aiEngine?: any;
    classifier?: any;
    summarizer?: any;

    clipboard: {
      read: () => KnouxResult<any[]>;
      write: (item: any) => KnouxResult;
      history: () => KnouxResult<any[]>;
      getHistory: () => KnouxResult<any[]>;
      addItem: (item: any) => KnouxResult;
      deleteItem: (id: string) => KnouxResult;
      search: (query: string) => KnouxResult<any[]>;
      startMonitoring: () => KnouxResult;
      getStats: () => KnouxResult<any>;
      normalize: (content: string) => KnouxResult<any>;
      format: (content: string, format: string) => KnouxResult<any>;
    };

    ai: {
      chat: (message: string) => KnouxResult<any>;
      summarize: (text: string) => KnouxResult<string>;
      enhance: (text: string, opts?: any) => KnouxResult<string>;
      translate: (text: string, targetLang: string) => KnouxResult<string>;
      analyze: (content: any) => KnouxResult<any>;
      classify: (content: any) => KnouxResult<any>;
      predict: (context: any) => KnouxResult<any>;
    };

    storage: {
      get: (key: string) => KnouxResult<any>;
      set: (key: string, value: any) => KnouxResult;
      save: (key: string, value: any) => KnouxResult;
      load: (key: string) => KnouxResult<any>;
      export: () => KnouxResult<any>;
      getStats: () => KnouxResult<any>;
    };

    settings: any;
    system: any;
    theme: any;
    language: any;
    security: any;
    features: any;
  };

  backendAPI: any;
}

declare namespace NodeJS {
  interface Process {
    versions: {
      electron: string;
      chrome: string;
      node: string;
    };
  }
}
