/**
 * IPC Handlers for Knoux Clipboard AI
 * Main communication bridge between renderer and main process
 */

import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { logger } from '../shared/logger';
import { UserPreferences, ClipboardItem, AIResponse, SystemInfo } from '../shared/types';
import { AIEngine } from '../ai/ai-engine';
import { ClipboardWatcher } from '../clipboard/watcher';
import { HistoryStore } from '../clipboard/history-store';
import { ContentClassifier } from '../ai/classifier';
import { ContentEnhancer } from '../ai/enhancer';
import { ContentSummarizer } from '../ai/summarizer';

// Initialize services
const aiEngine = new AIEngine();
const clipboardWatcher = new ClipboardWatcher();
const historyStore = new HistoryStore();
const classifier = new ContentClassifier();
const enhancer = new ContentEnhancer();
const summarizer = new ContentSummarizer();

// Settings handlers
export function registerSettingsHandlers() {
  ipcMain.handle('get-settings', async (): Promise<any> => {
    try {
      const settings = await historyStore.getSettings();
      return { success: true, data: settings };
    } catch (error) {
      logger.error('Failed to get settings:', error);
      return { success: false, error: 'Failed to load settings' };
    }
  });

  ipcMain.handle('save-settings', async (event: IpcMainInvokeEvent, settings: UserPreferences): Promise<any> => {
    try {
      await historyStore.saveSettings(settings);
      logger.info('Settings saved successfully');
      return { success: true };
    } catch (error) {
      logger.error('Failed to save settings:', error);
      return { success: false, error: 'Failed to save settings' };
    }
  });

  ipcMain.handle('reset-settings', async (): Promise<any> => {
    try {
      await historyStore.resetSettings();
      logger.info('Settings reset to defaults');
      return { success: true };
    } catch (error) {
      logger.error('Failed to reset settings:', error);
      return { success: false, error: 'Failed to reset settings' };
    }
  });
}

// Clipboard handlers
export function registerClipboardHandlers() {
  ipcMain.handle('get-clipboard-history', async (event: IpcMainInvokeEvent, options?: {
    limit?: number;
    offset?: number;
    filter?: string;
  }): Promise<any> => {
    try {
      const items = await historyStore.getHistory(options);
      const total = await historyStore.getTotalCount();
      return { success: true, data: items, total };
    } catch (error) {
      logger.error('Failed to get clipboard history:', error);
      return { success: false, error: 'Failed to load history' };
    }
  });

  ipcMain.handle('clear-clipboard-history', async (): Promise<any> => {
    try {
      const deletedCount = await historyStore.clearHistory();
      logger.info(`Cleared ${deletedCount} items from history`);
      return { success: true, deletedCount };
    } catch (error) {
      logger.error('Failed to clear clipboard history:', error);
      return { success: false, error: 'Failed to clear history' };
    }
  });

  ipcMain.handle('copy-to-clipboard', async (event: IpcMainInvokeEvent, content: string, format?: string): Promise<any> => {
    try {
      await clipboardWatcher.copyToClipboard(content, format);
      return { success: true };
    } catch (error) {
      logger.error('Failed to copy to clipboard:', error);
      return { success: false, error: 'Failed to copy content' };
    }
  });

  ipcMain.handle('get-current-clipboard', async (): Promise<any> => {
    try {
      const content = await clipboardWatcher.getCurrentClipboard();
      return { success: true, data: content };
    } catch (error) {
      logger.error('Failed to get clipboard content:', error);
      return { success: false, error: 'Failed to get clipboard content' };
    }
  });
}

// AI handlers
export function registerAIHandlers() {
  ipcMain.handle('get-ai-status', async (): Promise<any> => {
    try {
      const status = await aiEngine.getStatus();
      return { success: true, data: status };
    } catch (error) {
      logger.error('Failed to get AI status:', error);
      return { success: false, error: 'Failed to get AI status' };
    }
  });

  ipcMain.handle('process-with-ai', async (event: IpcMainInvokeEvent, options: {
    content: string;
    operation: string;
    model?: string;
    parameters?: Record<string, any>;
  }): Promise<any> => {
    try {
      let result: AIResponse;
      
      switch (options.operation) {
        case 'classify':
          result = await classifier.classify(options.content);
          break;
        case 'enhance':
          result = await enhancer.enhance(options.content);
          break;
        case 'summarize':
          result = await summarizer.summarize(options.content);
          break;
        default:
          result = await aiEngine.process(options);
      }
      
      return { success: true, data: result };
    } catch (error) {
      logger.error('Failed to process with AI:', error);
      return { success: false, error: 'Failed to process content' };
    }
  });

  ipcMain.handle('batch-process', async (event: IpcMainInvokeEvent, items: string[], operation: string): Promise<any> => {
    try {
      const results: AIResponse[] = [];
      
      for (const item of items) {
        const result = await aiEngine.process({ content: item, operation });
        results.push(result);
      }
      
      return { success: true, data: results };
    } catch (error) {
      logger.error('Failed to batch process:', error);
      return { success: false, error: 'Failed to batch process' };
    }
  });
}

// Database handlers
export function registerDatabaseHandlers() {
  ipcMain.handle('search-clipboard', async (event: IpcMainInvokeEvent, query: string, options?: {
    limit?: number;
    offset?: number;
    filter?: Record<string, any>;
  }): Promise<any> => {
    try {
      const results = await historyStore.search(query, options);
      const total = await historyStore.getSearchCount(query, options?.filter);
      return { success: true, data: results, total };
    } catch (error) {
      logger.error('Failed to search clipboard:', error);
      return { success: false, error: 'Search failed' };
    }
  });

  ipcMain.handle('export-data', async (event: IpcMainInvokeEvent, format: 'json' | 'csv' | 'html', options?: {
    includeSensitive?: boolean;
    dateRange?: { start: Date; end: Date };
  }): Promise<any> => {
    try {
      const data = await historyStore.exportData(format, options);
      const fileName = `knoux-export-${Date.now()}.${format}`;
      return { success: true, data, fileName };
    } catch (error) {
      logger.error('Failed to export data:', error);
      return { success: false, error: 'Export failed' };
    }
  });

  ipcMain.handle('import-data', async (event: IpcMainInvokeEvent, data: string, format: 'json' | 'csv'): Promise<any> => {
    try {
      const importedCount = await historyStore.importData(data, format);
      logger.info(`Imported ${importedCount} items`);
      return { success: true, importedCount };
    } catch (error) {
      logger.error('Failed to import data:', error);
      return { success: false, error: 'Import failed' };
    }
  });
}

// System handlers
export function registerSystemHandlers() {
  ipcMain.handle('get-system-info', async (): Promise<any> => {
    try {
      const info: SystemInfo = {
        platform: process.platform,
        arch: process.arch,
        version: process.version,
        electronVersion: process.versions.electron,
        chromeVersion: process.versions.chrome,
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        uptime: process.uptime()
      };
      return { success: true, data: info };
    } catch (error) {
      logger.error('Failed to get system info:', error);
      return { success: false, error: 'Failed to get system info' };
    }
  });

  ipcMain.handle('get-analytics', async (event: IpcMainInvokeEvent, period: 'day' | 'week' | 'month' | 'year'): Promise<any> => {
    try {
      const analytics = await historyStore.getAnalytics(period);
      return { success: true, data: analytics };
    } catch (error) {
      logger.error('Failed to get analytics:', error);
      return { success: false, error: 'Failed to get analytics' };
    }
  });

  ipcMain.handle('clear-analytics', async (): Promise<any> => {
    try {
      await historyStore.clearAnalytics();
      return { success: true };
    } catch (error) {
      logger.error('Failed to clear analytics:', error);
      return { success: false, error: 'Failed to clear analytics' };
    }
  });
}

// Security handlers
export function registerSecurityHandlers() {
  ipcMain.handle('encrypt-text', async (event: IpcMainInvokeEvent, text: string, password?: string): Promise<any> => {
    try {
      // Implementation would use crypto module
      const encrypted = btoa(text); // Simple base64 for demo
      return { success: true, data: encrypted };
    } catch (error) {
      logger.error('Failed to encrypt text:', error);
      return { success: false, error: 'Encryption failed' };
    }
  });

  ipcMain.handle('decrypt-text', async (event: IpcMainInvokeEvent, encrypted: string, password?: string): Promise<any> => {
    try {
      // Implementation would use crypto module
      const decrypted = atob(encrypted); // Simple base64 for demo
      return { success: true, data: decrypted };
    } catch (error) {
      logger.error('Failed to decrypt text:', error);
      return { success: false, error: 'Decryption failed' };
    }
  });
}

// Initialize all handlers
export function initializeIpcHandlers() {
  registerSettingsHandlers();
  registerClipboardHandlers();
  registerAIHandlers();
  registerDatabaseHandlers();
  registerSystemHandlers();
  registerSecurityHandlers();
  
  // Import and setup creative handlers
  const { setupCreativeStudioIPC } = require('./creative-handlers');
  setupCreativeStudioIPC();
  
  logger.info('IPC handlers initialized successfully');
}

export const setupIPC = initializeIpcHandlers;
