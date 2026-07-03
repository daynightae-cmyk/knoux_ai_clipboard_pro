import { contextBridge, ipcRenderer } from "electron";

// Generic IPC wrapper for flexibility
const ipcWrapper = {
  ipcRenderer: {
    invoke: (channel: string, ...args: any[]) =>
      ipcRenderer.invoke(channel, ...args),
    on: (channel: string, listener: (...args: any[]) => void) => {
      const subscription = (_event: any, ...args: any[]) => listener(...args);
      ipcRenderer.on(channel, subscription);
      return () => ipcRenderer.removeListener(channel, subscription);
    },
    off: (channel: string, listener: (...args: any[]) => void) =>
      ipcRenderer.removeListener(channel, listener),
    send: (channel: string, ...args: any[]) =>
      ipcRenderer.send(channel, ...args),
  },
  invoke: (channel: string, ...args: any[]) =>
    ipcRenderer.invoke(channel, ...args),
};

// Expose APIs matching all UI component expectations

// 1. Standard Electron API
contextBridge.exposeInMainWorld("electron", ipcWrapper);

// 2. Legacy/Specific ElectronAPI
contextBridge.exposeInMainWorld("electronAPI", {
  invoke: ipcWrapper.invoke,
  ...ipcWrapper.ipcRenderer,
});

// 3. Knoux Specific Namespace
contextBridge.exposeInMainWorld("knoux", {
  // Core
  clipboard: {
    read: () => ipcRenderer.invoke("knoux.clipboard.read"),
    write: (item: any) => ipcRenderer.invoke("knoux.clipboard.write", item),
    history: () => ipcRenderer.invoke("knoux.clipboard.history"),
    normalize: (content: string) =>
      ipcRenderer.invoke("knoux.clipboard.normalize", content),
    format: (content: string, format: string) =>
      ipcRenderer.invoke("knoux.clipboard.format", { content, format }),
  },
  ai: {
    summarize: (text: string) => ipcRenderer.invoke("knoux.ai.summarize", text),
    enhance: (text: string, opts: any) =>
      ipcRenderer.invoke("knoux.ai.enhance", text, opts),
    predict: (context: any) => ipcRenderer.invoke("knoux.ai.predict", context),
  },
  storage: {
    get: (key: string) => ipcRenderer.invoke("knoux.storage.get", key),
    set: (key: string, value: any) =>
      ipcRenderer.invoke("knoux.storage.set", key, value),
    export: () => ipcRenderer.invoke("knoux.storage.export"),
  },
  // Direct access for advanced components
  shell: {
    openExternal: (url: string) => ipcRenderer.invoke("open-external", url),
  },
  analyzeContent: (content: string, options?: any) =>
    ipcRenderer.invoke("analyze-content", content, options),
  classifyContent: (content: string) =>
    ipcRenderer.invoke("classify-content", content),
  enhanceContent: (content: string, options?: any) =>
    ipcRenderer.invoke("enhance-content", content, options),
  getSuggestions: (content: string, options?: any) =>
    ipcRenderer.invoke("get-suggestions", content, options),
  getSystemInfo: () => ipcRenderer.invoke("get-system-info"),
  getAIStatus: () => ipcRenderer.invoke("get-ai-status"),
});
