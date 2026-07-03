const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('knoux', {
  // Test API
  test: {
    runAll: () => ipcRenderer.invoke('test:run-all'),
    runSingle: (testName) => ipcRenderer.invoke('test:run-single', testName),
  },
  
  // AI Engine
  aiEngine: {
    summarize: (text) => ipcRenderer.invoke('ai-engine:summarize', text),
    classify: (content) => ipcRenderer.invoke('ai-engine:classify', content),
    enhance: (text) => ipcRenderer.invoke('ai-engine:enhance', text),
  },
  
  // Classifier
  classifier: {
    classify: (content, options) => ipcRenderer.invoke('classifier:classify', content, options),
    getStats: () => ipcRenderer.invoke('classifier:getStats'),
  },
  
  // Summarizer
  summarizer: {
    summarize: (content, options) => ipcRenderer.invoke('summarizer:summarize', content, options),
    getCacheStats: () => ipcRenderer.invoke('summarizer:getCacheStats'),
  },
  
  // Clipboard API
  clipboard: {
    getHistory: () => ipcRenderer.invoke('clipboard:get-history'),
    addItem: (item) => ipcRenderer.invoke('clipboard:add-item', item),
    deleteItem: (id) => ipcRenderer.invoke('clipboard:delete-item', id),
    search: (query) => ipcRenderer.invoke('clipboard:search', query),
    startMonitoring: () => ipcRenderer.invoke('clipboard:start-monitoring'),
    getStats: () => ipcRenderer.invoke('clipboard:get-stats'),
  },
  
  // AI API
  ai: {
    chat: (message) => ipcRenderer.invoke('ai:chat', message),
    summarize: (text) => ipcRenderer.invoke('ai:summarize', text),
    enhance: (text) => ipcRenderer.invoke('ai:enhance', text),
    translate: (text, targetLang) => ipcRenderer.invoke('ai:translate', text, targetLang),
    analyze: (content) => ipcRenderer.invoke('ai:analyze', content),
    classify: (content) => ipcRenderer.invoke('ai:classify', content),
  },
  
  // Creative API
  features: {
    creative: {
      generate: (options) => ipcRenderer.invoke('creative:generate', options),
      enhance: (content) => ipcRenderer.invoke('creative:enhance', content),
      analyze: (content) => ipcRenderer.invoke('creative:analyze', content),
    },
    patterns: {
      detect: (content) => ipcRenderer.invoke('patterns:detect', content),
      analyze: (data) => ipcRenderer.invoke('patterns:analyze', data),
    },
  },
  
  // Security API
  security: {
    encrypt: (data) => ipcRenderer.invoke('security:encrypt', data),
    decrypt: (encrypted) => ipcRenderer.invoke('security:decrypt', encrypted),
    checkPassword: (password) => ipcRenderer.invoke('security:check-password', password),
    lock: () => ipcRenderer.invoke('security:lock'),
  },
  
  // Storage API
  storage: {
    save: (key, value) => ipcRenderer.invoke('storage:save', key, value),
    load: (key) => ipcRenderer.invoke('storage:load', key),
    export: () => ipcRenderer.invoke('storage:export'),
    getStats: () => ipcRenderer.invoke('storage:get-stats'),
  },
  
  // System API
  system: {
    getInfo: () => ipcRenderer.invoke('system:get-info'),
    getStats: () => ipcRenderer.invoke('system:get-stats'),
    checkHealth: () => ipcRenderer.invoke('system:check-health'),
  },
  
  // Settings API
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    update: (settings) => ipcRenderer.invoke('settings:update', settings),
  },
  
  // Theme API
  theme: {
    get: () => ipcRenderer.invoke('theme:get'),
    set: (theme) => ipcRenderer.invoke('theme:set', theme),
  },
  
  // Language API
  language: {
    get: () => ipcRenderer.invoke('language:get'),
    set: (lang) => ipcRenderer.invoke('language:set', lang),
  },
});

// Extended Backend API for new features
contextBridge.exposeInMainWorld('backendAPI', {
  voice: {
    getProfiles: () => ipcRenderer.invoke('voice:getProfiles'),
    customize: (audioData, options) => ipcRenderer.invoke('voice:customize', audioData, options),
  },
  
  quantum: {
    secureClip: (clipData, securityLevel) => ipcRenderer.invoke('quantum:secureClip', clipData, securityLevel),
    audit: () => ipcRenderer.invoke('quantum:audit'),
    getAnalytics: () => ipcRenderer.invoke('quantum:getAnalytics'),
    backup: (data) => ipcRenderer.invoke('quantum:backup', data),
    activateShield: () => ipcRenderer.invoke('quantum:activateShield'),
  },
  
  security: {
    storeClip: (clipData) => ipcRenderer.invoke('security:storeClip', clipData),
    retrieveClip: (clipId) => ipcRenderer.invoke('security:retrieveClip', clipId),
    getMetrics: () => ipcRenderer.invoke('security:getMetrics'),
    audit: () => ipcRenderer.invoke('security:audit'),
    verify: (clipId) => ipcRenderer.invoke('security:verify', clipId),
  },
  
  arvr: {
    createVRClip: (clipData, options) => ipcRenderer.invoke('arvr:createVRClip', clipData, options),
    getMetrics: () => ipcRenderer.invoke('arvr:getMetrics'),
    search: (query) => ipcRenderer.invoke('arvr:search', query),
  },
  
  ui: {
    getProfiles: () => ipcRenderer.invoke('ui:getProfiles'),
    morph: (morphType, options) => ipcRenderer.invoke('ui:morph', morphType, options),
    switchStyle: (styleId) => ipcRenderer.invoke('ui:switchStyle', styleId),
  },
});
