const { contextBridge, ipcRenderer } = require('electron');

const ok = (data) => ({ ok: true, success: true, data });
const fail = (error) => ({ ok: false, success: false, error: error?.message || String(error || 'Unknown error') });
const invokeSafe = async (channel, ...args) => {
  try {
    return await ipcRenderer.invoke(channel, ...args);
  } catch (error) {
    return fail(error);
  }
};

const clipboardApi = {
  read: () => invokeSafe('clipboard:get-history'),
  history: () => invokeSafe('clipboard:get-history'),
  getHistory: () => invokeSafe('clipboard:get-history'),
  addItem: (item) => invokeSafe('clipboard:add-item', item),
  write: (item) => invokeSafe('clipboard:add-item', item),
  deleteItem: (id) => invokeSafe('clipboard:delete-item', id),
  search: (query) => invokeSafe('clipboard:search', query),
  startMonitoring: () => invokeSafe('clipboard:start-monitoring'),
  getStats: () => invokeSafe('clipboard:get-stats'),
  normalize: (content) => invokeSafe('clipboard:normalize', content),
  format: (content, format) => invokeSafe('clipboard:format', content, format),
};

const aiApi = {
  chat: (message) => invokeSafe('ai:chat', message),
  summarize: (text) => invokeSafe('ai:summarize', text),
  enhance: (text, options) => invokeSafe('ai:enhance', text, options),
  translate: (text, targetLang) => invokeSafe('ai:translate', text, targetLang),
  analyze: (content) => invokeSafe('ai:analyze', content),
  classify: (content) => invokeSafe('ai:classify', content),
  predict: (context) => invokeSafe('ai:predict', context),
};

const storageApi = {
  get: (key) => invokeSafe('storage:load', key),
  set: (key, value) => invokeSafe('storage:save', key, value),
  save: (key, value) => invokeSafe('storage:save', key, value),
  load: (key) => invokeSafe('storage:load', key),
  export: () => invokeSafe('storage:export'),
  getStats: () => invokeSafe('storage:get-stats'),
};

const settingsApi = {
  get: () => invokeSafe('settings:get'),
  getAll: () => invokeSafe('settings:get-all'),
  update: (settings) => invokeSafe('settings:update', settings),
  reset: () => invokeSafe('settings:reset'),
  export: () => invokeSafe('settings:export'),
  import: (payload) => invokeSafe('settings:import', payload),
};

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    invoke: (channel, ...args) => invokeSafe(channel, ...args),
    on: (channel, callback) => {
      const subscription = (_event, ...args) => callback(...args);
      ipcRenderer.on(channel, subscription);
      return () => ipcRenderer.removeListener(channel, subscription);
    },
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  },
  shell: {
    openExternal: (url) => invokeSafe('shell:open-external', url),
  },
});

contextBridge.exposeInMainWorld('electronAPI', {
  getSettings: () => settingsApi.getAll(),
  updateSettings: (settings) => settingsApi.update(settings),
  getLanguage: () => invokeSafe('language:get'),
  setLanguage: (lang) => invokeSafe('language:set', lang),
  getTheme: () => invokeSafe('theme:get'),
  setTheme: (theme) => invokeSafe('theme:set', theme),
  getClipboardItems: (limit, offset) => invokeSafe('clipboard:get-history', { limit, offset }),
  searchClipboard: (query) => clipboardApi.search(query),
  getSystemInfo: () => invokeSafe('get-system-info'),
});

contextBridge.exposeInMainWorld('knoux', {
  isAppReady: () => true,
  onAppReady: (callback) => setTimeout(callback, 0),
  quitApp: () => invokeSafe('app:quit'),

  getSettings: () => settingsApi.getAll(),
  saveSettings: (settings) => settingsApi.update(settings),
  getClipboardHistory: () => clipboardApi.getHistory(),
  copyToClipboard: (content) => clipboardApi.write({ content, timestamp: Date.now() }),
  processWithAI: (options) => aiApi.analyze(options),

  test: {
    runAll: () => invokeSafe('test:run-all'),
    runSingle: (testName) => invokeSafe('test:run-single', testName),
  },
  aiEngine: {
    summarize: (text) => invokeSafe('ai-engine:summarize', text),
    classify: (content) => invokeSafe('ai-engine:classify', content),
    enhance: (text) => invokeSafe('ai-engine:enhance', text),
  },
  classifier: {
    classify: (content, options) => invokeSafe('classifier:classify', content, options),
    getStats: () => invokeSafe('classifier:getStats'),
  },
  summarizer: {
    summarize: (content, options) => invokeSafe('summarizer:summarize', content, options),
    getCacheStats: () => invokeSafe('summarizer:getCacheStats'),
  },
  clipboard: clipboardApi,
  ai: aiApi,
  features: {
    creative: {
      generate: (options) => invokeSafe('creative:generate', options),
      enhance: (content) => invokeSafe('creative:enhance', content),
      analyze: (content) => invokeSafe('creative:analyze', content),
    },
    patterns: {
      detect: (content) => invokeSafe('patterns:detect', content),
      analyze: (data) => invokeSafe('patterns:analyze', data),
    },
  },
  security: {
    encrypt: (data) => invokeSafe('security:encrypt', data),
    decrypt: (encrypted) => invokeSafe('security:decrypt', encrypted),
    checkPassword: (password) => invokeSafe('security:check-password', password),
    lock: () => invokeSafe('security:lock'),
  },
  storage: storageApi,
  settings: settingsApi,
  system: {
    getInfo: () => invokeSafe('get-system-info'),
    getStats: () => invokeSafe('system:get-stats'),
    checkHealth: () => invokeSafe('system:check-health'),
  },
  theme: {
    get: () => invokeSafe('theme:get'),
    set: (theme) => invokeSafe('theme:set', theme),
  },
  language: {
    get: () => invokeSafe('language:get'),
    set: (lang) => invokeSafe('language:set', lang),
  },
});

contextBridge.exposeInMainWorld('backendAPI', {
  voice: {
    getProfiles: () => invokeSafe('voice:getProfiles'),
    customize: (audioData, options) => invokeSafe('voice:customize', audioData, options),
  },
  quantum: {
    secureClip: (clipData, securityLevel) => invokeSafe('quantum:secureClip', clipData, securityLevel),
    audit: () => invokeSafe('quantum:audit'),
    getAnalytics: () => invokeSafe('quantum:getAnalytics'),
    backup: (data) => invokeSafe('quantum:backup', data),
    activateShield: () => invokeSafe('quantum:activateShield'),
  },
  security: {
    storeClip: (clipData) => invokeSafe('security:storeClip', clipData),
    retrieveClip: (clipId) => invokeSafe('security:retrieveClip', clipId),
    getMetrics: () => invokeSafe('security:getMetrics'),
    audit: () => invokeSafe('security:audit'),
    verify: (clipId) => invokeSafe('security:verify', clipId),
  },
  arvr: {
    createVRClip: (clipData, options) => invokeSafe('arvr:createVRClip', clipData, options),
    getMetrics: () => invokeSafe('arvr:getMetrics'),
    search: (query) => invokeSafe('arvr:search', query),
  },
  ui: {
    getProfiles: () => invokeSafe('ui:getProfiles'),
    morph: (morphType, options) => invokeSafe('ui:morph', morphType, options),
    switchStyle: (styleId) => invokeSafe('ui:switchStyle', styleId),
  },
});
