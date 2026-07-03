const { ipcMain } = require('electron');

// Service test registry
const serviceTests = {
  // AI Core Services
  'aiEngine.summarize': async () => {
    const result = await global.aiEngine?.summarize('Test text');
    return { success: !!result, data: result };
  },
  'aiEngine.classify': async () => {
    const result = await global.aiEngine?.classify('Test content');
    return { success: !!result, data: result };
  },
  'aiEngine.enhance': async () => {
    const result = await global.aiEngine?.enhance('Test text');
    return { success: !!result, data: result };
  },
  'classifier.classify': async () => {
    const result = await global.classifier?.classify('Test content');
    return { success: !!result, data: result };
  },
  'classifier.getStats': async () => {
    const result = await global.classifier?.getStats();
    return { success: !!result, data: result };
  },
  'summarizer.summarize': async () => {
    const result = await global.summarizer?.summarize('Test content');
    return { success: !!result, data: result };
  },
  'summarizer.getCacheStats': async () => {
    const result = await global.summarizer?.getCacheStats();
    return { success: !!result, data: result };
  },
  
  // Clipboard Services
  'clipboard.getHistory': async () => {
    const result = await global.clipboardService?.getHistory();
    return { success: !!result, data: result?.slice(0, 3) };
  },
  'clipboard.addItem': async () => {
    const result = await global.clipboardService?.addItem({ content: 'Test', type: 'text' });
    return { success: !!result, data: result };
  },
  'clipboard.search': async () => {
    const result = await global.clipboardService?.search('test');
    return { success: !!result, data: result };
  },
  'clipboard.getStats': async () => {
    const result = await global.clipboardService?.getStats();
    return { success: !!result, data: result };
  },

  // AI Services
  'ai.summarize': async () => {
    const result = await global.aiService?.summarize('This is a test text for summarization');
    return { success: !!result, data: result };
  },
  'ai.enhance': async () => {
    const result = await global.aiService?.enhance('test text');
    return { success: !!result, data: result };
  },
  'ai.translate': async () => {
    const result = await global.aiService?.translate('Hello', 'ar');
    return { success: !!result, data: result };
  },
  'ai.analyze': async () => {
    const result = await global.aiService?.analyze('test content');
    return { success: !!result, data: result };
  },
  'ai.classify': async () => {
    const result = await global.aiService?.classify('test content');
    return { success: !!result, data: result };
  },

  // Storage Services
  'storage.save': async () => {
    const result = await global.storageService?.save('test-key', { data: 'test' });
    return { success: !!result, data: result };
  },
  'storage.load': async () => {
    const result = await global.storageService?.load('test-key');
    return { success: !!result, data: result };
  },
  'storage.export': async () => {
    const result = await global.storageService?.export();
    return { success: !!result, data: result };
  },
  'storage.getStats': async () => {
    const result = await global.storageService?.getStats();
    return { success: !!result, data: result };
  },

  // Security Services
  'security.encrypt': async () => {
    const result = await global.securityService?.encrypt('test data');
    return { success: !!result, data: result };
  },
  'security.decrypt': async () => {
    const result = await global.securityService?.decrypt('encrypted');
    return { success: !!result, data: result };
  },
  'security.checkPassword': async () => {
    const result = await global.securityService?.checkPassword('test123');
    return { success: result !== undefined, data: result };
  },

  // System Services
  'system.getInfo': async () => {
    const result = await global.systemService?.getInfo();
    return { success: !!result, data: result };
  },
  'system.getStats': async () => {
    const result = await global.systemService?.getStats();
    return { success: !!result, data: result };
  },
  'system.checkHealth': async () => {
    const result = await global.systemService?.checkHealth();
    return { success: !!result, data: result };
  },
};

// Run all tests
async function runAllTests() {
  const results = {};
  const startTime = Date.now();

  for (const [testName, testFn] of Object.entries(serviceTests)) {
    const testStart = Date.now();
    try {
      const result = await testFn();
      results[testName] = {
        status: result.success ? 'success' : 'failed',
        duration: Date.now() - testStart,
        data: result.data,
      };
    } catch (error) {
      results[testName] = {
        status: 'error',
        duration: Date.now() - testStart,
        error: error.message,
      };
    }
  }

  const totalDuration = Date.now() - startTime;
  const summary = {
    total: Object.keys(results).length,
    success: Object.values(results).filter(r => r.status === 'success').length,
    failed: Object.values(results).filter(r => r.status === 'failed').length,
    error: Object.values(results).filter(r => r.status === 'error').length,
    duration: totalDuration,
  };

  return { results, summary };
}

// Register IPC handler
function registerTestIPC() {
  ipcMain.handle('test:run-all', async () => {
    return await runAllTests();
  });

  ipcMain.handle('test:run-single', async (event, testName) => {
    const testFn = serviceTests[testName];
    if (!testFn) {
      return { status: 'error', error: 'Test not found' };
    }

    const testStart = Date.now();
    try {
      const result = await testFn();
      return {
        status: result.success ? 'success' : 'failed',
        duration: Date.now() - testStart,
        data: result.data,
      };
    } catch (error) {
      return {
        status: 'error',
        duration: Date.now() - testStart,
        error: error.message,
      };
    }
  });

  console.log('✅ Test IPC handlers registered');
}

module.exports = { registerTestIPC, runAllTests };
