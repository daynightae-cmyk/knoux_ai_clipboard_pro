/**
 * Comprehensive IPC Service Integration - Knoux Clipboard AI
 * Unified IPC handler registration and service exposure
 */

const { ipcMain } = require('electron');
const { serviceIntegrationManager } = require('../service-integration-manager');

// Import existing IPC handlers
const { registerClipboardIPC, cleanupClipboardIPC } = require('./clipboard-ipc');
const { registerAIIPC } = require('./ai-ipc');
const { registerStorageIPC, cleanupStorageIPC } = require('./storage-ipc');

function registerComprehensiveIPC() {
  console.log('🔗 Registering comprehensive IPC handlers...');

  // Register existing enhanced handlers
  registerClipboardIPC();
  registerAIIPC();
  registerStorageIPC();

  // Service Management IPC
  ipcMain.handle('knoux.services.status', async () => {
    try {
      const healthCheck = await serviceIntegrationManager.healthCheck();
      return { ok: true, data: healthCheck };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  });

  ipcMain.handle('knoux.services.list', async () => {
    try {
      const services = serviceIntegrationManager.getAllServiceStatuses();
      return { ok: true, data: services };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  });

  ipcMain.handle('knoux.services.get', async (event, serviceName) => {
    try {
      const service = serviceIntegrationManager.getService(serviceName);
      const status = serviceIntegrationManager.getServiceStatus(serviceName);
      return { 
        ok: true, 
        data: { 
          available: !!service, 
          status: status?.status || 'unknown',
          lastCheck: status?.lastCheck || 0
        } 
      };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  });

  // AI Service Integration
  ipcMain.handle('knoux.ai.chat', async (event, request) => {
    try {
      const aiService = serviceIntegrationManager.getService('aiService');
      if (!aiService) {
        return { ok: false, error: 'AI service not available' };
      }
      
      const response = await aiService.chat(request);
      return { ok: true, data: response };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  });

  ipcMain.handle('knoux.ai.process', async (event, request) => {
    try {
      const aiService = serviceIntegrationManager.getService('aiService');
      if (!aiService) {
        return { ok: false, error: 'AI service not available' };
      }
      
      const response = await aiService.processText(request);
      return { ok: true, data: response };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  });

  // Creative Engine Integration
  ipcMain.handle('knoux.creative.generate', async (event, request) => {
    try {
      const creativeEngine = serviceIntegrationManager.getService('creativeEngine');
      if (!creativeEngine) {
        return { ok: false, error: 'Creative engine not available' };
      }
      
      const response = await creativeEngine.generate(request);
      return { ok: true, data: response };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  });

  // Universal Translator Integration
  ipcMain.handle('knoux.translator.translate', async (event, request) => {
    try {
      const translator = serviceIntegrationManager.getService('universalTranslator');
      if (!translator) {
        return { ok: false, error: 'Translator not available' };
      }
      
      const response = await translator.translate(request);
      return { ok: true, data: response };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  });

  // Pattern Recognition Integration
  ipcMain.handle('knoux.patterns.analyze', async (event, data) => {
    try {
      const patternRecognizer = serviceIntegrationManager.getService('patternRecognizer');
      if (!patternRecognizer) {
        return { ok: false, error: 'Pattern recognizer not available' };
      }
      
      const response = await patternRecognizer.analyze(data);
      return { ok: true, data: response };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  });

  // Security Integration
  ipcMain.handle('knoux.security.encrypt', async (event, data) => {
    try {
      const encryptor = serviceIntegrationManager.getService('encryptor');
      if (!encryptor) {
        return { ok: false, error: 'Encryptor not available' };
      }
      
      const encrypted = await encryptor.encrypt(data);
      return { ok: true, data: encrypted };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  });

  ipcMain.handle('knoux.security.decrypt', async (event, encryptedData) => {
    try {
      const encryptor = serviceIntegrationManager.getService('encryptor');
      if (!encryptor) {
        return { ok: false, error: 'Encryptor not available' };
      }
      
      const decrypted = await encryptor.decrypt(encryptedData);
      return { ok: true, data: decrypted };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  });

  // Settings Integration
  ipcMain.handle('knoux.settings.get-all', async () => {
    try {
      const settingsService = serviceIntegrationManager.getService('settingsService');
      if (!settingsService) {
        return { ok: false, error: 'Settings service not available' };
      }
      
      const settings = await settingsService.getAllSettings();
      return { ok: true, data: settings };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  });

  ipcMain.handle('knoux.settings.update', async (event, settings) => {
    try {
      const settingsService = serviceIntegrationManager.getService('settingsService');
      if (!settingsService) {
        return { ok: false, error: 'Settings service not available' };
      }
      
      await settingsService.updateSettings(settings);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  });

  // Language Service Integration
  ipcMain.handle('knoux.language.get', async () => {
    try {
      const languageService = serviceIntegrationManager.getService('languageService');
      if (!languageService) {
        return { ok: false, error: 'Language service not available' };
      }
      
      const language = await languageService.getCurrentLanguage();
      return { ok: true, data: language };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  });

  ipcMain.handle('knoux.language.set', async (event, language) => {
    try {
      const languageService = serviceIntegrationManager.getService('languageService');
      if (!languageService) {
        return { ok: false, error: 'Language service not available' };
      }
      
      await languageService.setLanguage(language);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  });

  // Theme Service Integration
  ipcMain.handle('knoux.theme.get', async () => {
    try {
      const themeService = serviceIntegrationManager.getService('themeService');
      if (!themeService) {
        return { ok: false, error: 'Theme service not available' };
      }
      
      const theme = await themeService.getCurrentTheme();
      return { ok: true, data: theme };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  });

  ipcMain.handle('knoux.theme.set', async (event, theme) => {
    try {
      const themeService = serviceIntegrationManager.getService('themeService');
      if (!themeService) {
        return { ok: false, error: 'Theme service not available' };
      }
      
      await themeService.setTheme(theme);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  });

  // System Information
  ipcMain.handle('knoux.system.info', async () => {
    try {
      const info = {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        electronVersion: process.versions.electron,
        servicesCount: serviceIntegrationManager.getAllServiceStatuses().length,
        wiredServices: serviceIntegrationManager.getWiredServices().length,
        failedServices: serviceIntegrationManager.getFailedServices().length,
        timestamp: Date.now()
      };
      
      return { ok: true, data: info };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  });

  console.log('✅ Comprehensive IPC handlers registered');
}

function cleanupComprehensiveIPC() {
  try {
    cleanupClipboardIPC();
    cleanupStorageIPC();
    console.log('✅ Comprehensive IPC cleanup completed');
  } catch (error) {
    console.error('❌ IPC cleanup error:', error);
  }
}

module.exports = { 
  registerComprehensiveIPC, 
  cleanupComprehensiveIPC 
};