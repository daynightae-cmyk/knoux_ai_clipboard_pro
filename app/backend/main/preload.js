// preload.js - Preload script for Electron
// Bridge between main process and renderer

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('knoux', {
  clipboard: {
    read: () => ipcRenderer.invoke('knoux.clipboard.read'),
    write: (item) => ipcRenderer.invoke('knoux.clipboard.write', item),
    history: () => ipcRenderer.invoke('knoux.clipboard.history'),
    normalize: (content) => ipcRenderer.invoke('knoux.clipboard.normalize', content),
    format: (content, format) => ipcRenderer.invoke('knoux.clipboard.format', content, format)
  },
  ai: {
    summarize: (text) => ipcRenderer.invoke('knoux.ai.summarize', text),
    enhance: (text, opts) => ipcRenderer.invoke('knoux.ai.enhance', text, opts),
    predict: (context) => ipcRenderer.invoke('knoux.ai.predict', context)
  },
  storage: {
    get: (key) => ipcRenderer.invoke('knoux.storage.get', key),
    set: (key, value) => ipcRenderer.invoke('knoux.storage.set', key, value),
    export: () => ipcRenderer.invoke('knoux.storage.export')
  }
});

contextBridge.exposeInMainWorld(
    'electronAPI', {
        // Clipboard operations
        copyToClipboard: (text) => ipcRenderer.invoke('clipboard:copy', text),
        readClipboard: () => ipcRenderer.invoke('clipboard:read'),
        getClipboardHistory: () => ipcRenderer.invoke('clipboard:history'),
        
        // AI operations
        processWithAI: (text, operation) => ipcRenderer.invoke('ai:process', text, operation),
        summarizeText: (text) => ipcRenderer.invoke('ai:summarize', text),
        classifyText: (text) => ipcRenderer.invoke('ai:classify', text),
        
        // Settings operations
        getSettings: () => ipcRenderer.invoke('settings:get'),
        updateSettings: (settings) => ipcRenderer.invoke('settings:update', settings),
        
        // System operations
        getSystemInfo: () => ipcRenderer.invoke('system:info'),
        minimizeWindow: () => ipcRenderer.send('window:minimize'),
        maximizeWindow: () => ipcRenderer.send('window:maximize'),
        closeWindow: () => ipcRenderer.send('window:close'),
        
        // File operations
        exportData: (data, format) => ipcRenderer.invoke('export:data', data, format),
        importData: (filePath) => ipcRenderer.invoke('import:data', filePath),
        
        // Events
        onClipboardUpdate: (callback) => ipcRenderer.on('clipboard:update', (event, data) => callback(data)),
        onAIProcessComplete: (callback) => ipcRenderer.on('ai:process:complete', (event, data) => callback(data)),
        onSettingsUpdate: (callback) => ipcRenderer.on('settings:update:complete', (event, data) => callback(data))
    }
);
