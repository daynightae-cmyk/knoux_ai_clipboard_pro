/**
 * Real IPC Handlers - Knoux Clipboard AI
 * Connected to actual backend services
 */

import { ipcMain } from 'electron';
import { clipboard } from 'electron';
import { initBackendServices } from '../init';
import { logger } from '../../shared/logger';

// Import real services
import { ClipboardWatcher } from '../clipboard/watcher';
import { HistoryStore } from '../clipboard/history-store';
import { ClipboardNormalizer } from '../clipboard/normalizer';
import { ClipboardFormatter } from '../clipboard/formatter';
import { AIEngine } from '../ai/ai-engine';
import { ContentEnhancer } from '../ai/enhancer';
import { databaseService } from '../services/databaseService';

// Service instances
let clipboardWatcher: ClipboardWatcher | null = null;
let historyStore: HistoryStore | null = null;
let aiEngine: AIEngine | null = null;
let contentEnhancer: ContentEnhancer | null = null;
let normalizer: ClipboardNormalizer | null = null;
let formatter: ClipboardFormatter | null = null;

/**
 * Initialize real services
 */
export async function initializeRealServices(): Promise<void> {
  try {
    logger.info('🚀 Initializing real backend services for IPC...');

    // Initialize services
    historyStore = new HistoryStore();
    await historyStore.initialize();
    logger.info('✅ History Store initialized');

    aiEngine = new AIEngine();
    await aiEngine.initialize();
    logger.info('✅ AI Engine initialized');

    contentEnhancer = new ContentEnhancer();
    logger.info('✅ Content Enhancer initialized');

    normalizer = new ClipboardNormalizer();
    logger.info('✅ Normalizer initialized');

    formatter = new ClipboardFormatter();
    logger.info('✅ Formatter initialized');

    clipboardWatcher = new ClipboardWatcher();
    await clipboardWatcher.initialize();
    logger.info('✅ Clipboard Watcher initialized');

    logger.info('✅ All real services initialized successfully');
  } catch (error) {
    logger.error('❌ Failed to initialize real services:', error);
    throw error;
  }
}

/**
 * Register real clipboard IPC handlers
 */
export function registerRealClipboardHandlers(): void {
  // Read clipboard items
  ipcMain.handle('knoux.clipboard.read', async () => {
    try {
      if (!historyStore) {
        throw new Error('History store not initialized');
      }
      
      const items = await historyStore.getRecentItems(50);
      return { ok: true, data: items };
    } catch (error) {
      logger.error('❌ Error reading clipboard:', error);
      return { ok: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  // Write clipboard item
  ipcMain.handle('knoux.clipboard.write', async (event, item) => {
    try {
      if (!historyStore) {
        throw new Error('History store not initialized');
      }

      await historyStore.addItem(item);
      return { ok: true };
    } catch (error) {
      logger.error('❌ Error writing clipboard:', error);
      return { ok: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  // Get clipboard history
  ipcMain.handle('knoux.clipboard.history', async () => {
    try {
      if (!historyStore) {
        throw new Error('History store not initialized');
      }

      const history = await historyStore.getAllItems();
      return { ok: true, data: history };
    } catch (error) {
      logger.error('❌ Error getting clipboard history:', error);
      return { ok: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  // Normalize content
  ipcMain.handle('knoux.clipboard.normalize', async (event, content) => {
    try {
      if (!normalizer) {
        throw new Error('Normalizer not initialized');
      }

      const normalized = await normalizer.normalize(content);
      return { ok: true, data: normalized };
    } catch (error) {
      logger.error('❌ Error normalizing content:', error);
      return { ok: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  // Format content
  ipcMain.handle('knoux.clipboard.format', async (event, { content, format }) => {
    try {
      if (!formatter) {
        throw new Error('Formatter not initialized');
      }

      const formatted = await formatter.format(content, format);
      return { ok: true, data: formatted };
    } catch (error) {
      logger.error('❌ Error formatting content:', error);
      return { ok: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });
}

/**
 * Register real AI IPC handlers
 */
export function registerRealAIHandlers(): void {
  // Summarize text
  ipcMain.handle('knoux.ai.summarize', async (event, text) => {
    try {
      if (!aiEngine) {
        throw new Error('AI Engine not initialized');
      }

      const summary = await aiEngine.summarize(text);
      return { ok: true, data: summary };
    } catch (error) {
      logger.error('❌ Error summarizing text:', error);
      return { ok: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  // Enhance text
  ipcMain.handle('knoux.ai.enhance', async (event, text, options) => {
    try {
      if (!contentEnhancer) {
        throw new Error('Content Enhancer not initialized');
      }

      const enhanced = await contentEnhancer.enhance(text, options);
      return { ok: true, data: enhanced };
    } catch (error) {
      logger.error('❌ Error enhancing text:', error);
      return { ok: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  // Predict content
  ipcMain.handle('knoux.ai.predict', async (event, context) => {
    try {
      if (!aiEngine) {
        throw new Error('AI Engine not initialized');
      }

      const prediction = await aiEngine.predict(context);
      return { ok: true, data: prediction };
    } catch (error) {
      logger.error('❌ Error predicting content:', error);
      return { ok: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });
}

/**
 * Register real storage IPC handlers
 */
export function registerRealStorageHandlers(): void {
  // Get value from storage
  ipcMain.handle('knoux.storage.get', async (event, key) => {
    try {
      if (!databaseService) {
        throw new Error('Database service not initialized');
      }

      const value = await databaseService.get(key);
      return { ok: true, data: value };
    } catch (error) {
      logger.error('❌ Error getting storage value:', error);
      return { ok: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  // Set value in storage
  ipcMain.handle('knoux.storage.set', async (event, key, value) => {
    try {
      if (!databaseService) {
        throw new Error('Database service not initialized');
      }

      await databaseService.set(key, value);
      return { ok: true };
    } catch (error) {
      logger.error('❌ Error setting storage value:', error);
      return { ok: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  // Export storage data
  ipcMain.handle('knoux.storage.export', async () => {
    try {
      if (!databaseService) {
        throw new Error('Database service not initialized');
      }

      const data = await databaseService.exportData();
      return { ok: true, data };
    } catch (error) {
      logger.error('❌ Error exporting storage:', error);
      return { ok: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });
}

/**
 * Register all real handlers
 */
export function registerAllRealHandlers(): void {
  registerRealClipboardHandlers();
  registerRealAIHandlers();
  registerRealStorageHandlers();
  logger.info('✅ All real IPC handlers registered');
}