const { contextBridge, ipcRenderer } = require('electron');

const allowedInvokeChannels = new Set([
  'app:quit',
  'clipboard:get-history',
  'clipboard:add-item',
  'clipboard:delete-item',
  'clipboard:search',
  'clipboard:start-monitoring',
  'clipboard:get-stats',
  'clipboard:normalize',
  'clipboard:format',
  'ai:chat',
  'ai:summarize',
  'ai:enhance',
  'ai:translate',
  'ai:analyze',
  'ai:classify',
  'ai:predict',
  'ai-engine:summarize',
  'ai-engine:classify',
  'ai-engine:enhance',
  'classifier:classify',
  'classifier:getStats',
  'summarizer:summarize',
  'summarizer:getCacheStats',
  'settings:get',
  'settings:get-all',
  'settings:update',
  'settings:reset',
  'settings:export',
  'settings:import',
  'storage:save',
  'storage:load',
  'storage:export',
  'storage:get-stats',
  'theme:get',
  'theme:set',
  'language:get',
  'language:set',
  'get-system-info',
  'system:get-stats',
  'system:check-health',
  'shell:open-external',
  'test:run-all',
  'test:run-single'
]);

const allowedEvents = new Set([
  'clipboard:changed',
  'settings:changed',
  'theme:changed',
  'language:changed',
  'app:ready'
]);

const fail = (error) => ({
  ok: false,
  success: false,
  error: error?.message || String(error || 'Unknown error')
});

const blocked = (channel) => ({
  ok: false,
  success: false,
  error: `Blocked IPC channel: ${channel}`
});

const invokeSafe = async (channel, ...args) => {
  if (!allowedInvokeChannels.has(channel)) {
    return blocked(channel);
  }

  try {
    return await ipcRenderer.invoke(channel, ...args);
  } catch (error) {
    return fail(error);
  }
};

const clipboardApi = Object.freeze({
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
});

const aiApi = Object.freeze({
  chat: (message) => invokeSafe('ai:chat', message),
  summarize: (text) => invokeSafe('ai:summarize', text),
  enhance: (text, options) => invokeSafe('ai:enhance', text, options),
  translate: (text, targetLang) => invokeSafe('ai:translate', text, targetLang),
  analyze: (content) => invokeSafe('ai:analyze', content),
  classify: (content) => invokeSafe('ai:classify', content),
  predict: (context) => invokeSafe('ai:predict', context),
});

const storageApi = Object.freeze({
  get: (key) => invokeSafe('storage:load', key),
  set: (key, value) => invokeSafe('storage:save', key, value),
  save: (key, value) => invokeSafe('storage:save', key, value),
  load: (key) => invokeSafe('storage:load', key),
  export: () => invokeSafe('storage:export'),
  getStats: () => invokeSafe('storage:get-stats'),
});

const settingsApi = Object.freeze({
  get: () => invokeSafe('settings:get'),
  getAll: () => invokeSafe('settings:get-all'),
  update: (settings) => invokeSafe('settings:update', settings),
  reset: () => invokeSafe('settings:reset'),
  export: () => invokeSafe('settings:export'),
  import: (payload) => invokeSafe('settings:import', payload),
});

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    invoke: (channel, ...args) => invokeSafe(channel, ...args),
    on: (channel, callback) => {
      if (!allowedEvents.has(channel)) {
        return () => undefined;
      }
      const subscription = (_event, ...args) => callback(...args);
      ipcRenderer.on(channel, subscription);
      return () => ipcRenderer.removeListener(channel, subscription);
    },
    removeAllListeners: (channel) => {
      if (allowedEvents.has(channel)) {
        ipcRenderer.removeAllListeners(channel);
      }
    },
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

  test: Object.freeze({
    runAll: () => invokeSafe('test:run-all'),
    runSingle: (testName) => invokeSafe('test:run-single', testName),
  }),
  aiEngine: Object.freeze({
    summarize: (text) => invokeSafe('ai-engine:summarize', text),
    classify: (content) => invokeSafe('ai-engine:classify', content),
    enhance: (text) => invokeSafe('ai-engine:enhance', text),
  }),
  classifier: Object.freeze({
    classify: (content, options) => invokeSafe('classifier:classify', content, options),
    getStats: () => invokeSafe('classifier:getStats'),
  }),
  summarizer: Object.freeze({
    summarize: (content, options) => invokeSafe('summarizer:summarize', content, options),
    getCacheStats: () => invokeSafe('summarizer:getCacheStats'),
  }),
  clipboard: clipboardApi,
  ai: aiApi,
  storage: storageApi,
  settings: settingsApi,
  system: Object.freeze({
    getInfo: () => invokeSafe('get-system-info'),
    getStats: () => invokeSafe('system:get-stats'),
    checkHealth: () => invokeSafe('system:check-health'),
  }),
  theme: Object.freeze({
    get: () => invokeSafe('theme:get'),
    set: (theme) => invokeSafe('theme:set', theme),
  }),
  language: Object.freeze({
    get: () => invokeSafe('language:get'),
    set: (lang) => invokeSafe('language:set', lang),
  }),
});

contextBridge.exposeInMainWorld('backendAPI', {
  status: () => Promise.resolve({
    ok: true,
    success: true,
    data: 'Experimental backend modules are isolated in Labs until verified.'
  })
});
