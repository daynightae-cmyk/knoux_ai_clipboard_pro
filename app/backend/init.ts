import { ClipboardWatcher } from './clipboard/watcher';
import { HistoryStore } from './clipboard/history-store';
import { AIEngine } from './ai/ai-engine';
import { SecurityManager } from './security/security-manager';
import { logger } from '../shared/logger';
import { databaseService } from './services/databaseService';
import { settingsService } from './services/settingsService';
import { languageService } from './services/languageService';
import { themeService } from './services/themeService';
import { serviceIntegrationManager } from './service-integration-manager';

let clipboardWatcher: ClipboardWatcher | null = null;
let historyStore: HistoryStore | null = null;
let aiEngine: AIEngine | null = null;
let securityManager: SecurityManager | null = null;

export async function initBackendServices(): Promise<void> {
  try {
    logger.info('🔧 Initializing backend services with integration manager...');

    // Use the comprehensive service integration manager
    await serviceIntegrationManager.initializeAllServices();
    
    // Get initialized services from manager
    clipboardWatcher = serviceIntegrationManager.getService('clipboardWatcher');
    historyStore = serviceIntegrationManager.getService('historyStore');
    aiEngine = serviceIntegrationManager.getService('aiEngine');
    securityManager = serviceIntegrationManager.getService('securityManager');

    // Perform health check
    const healthCheck = await serviceIntegrationManager.healthCheck();
    if (healthCheck.healthy) {
      logger.info('✅ All services healthy and integrated');
    } else {
      logger.warn('⚠️ Some services have issues:', healthCheck.services.filter(s => s.status !== 'wired'));
    }

    logger.info('✅ Backend services initialization completed with integration manager');
  } catch (error) {
    logger.error('❌ Critical backend initialization failed:', error);
    // Don't throw - allow app to continue with limited functionality
  }
}

export function getClipboardWatcher(): ClipboardWatcher {
  return serviceIntegrationManager.getService('clipboardWatcher') || 
    (() => { throw new Error('ClipboardWatcher not initialized'); })();
}

export function getHistoryStore(): HistoryStore {
  return serviceIntegrationManager.getService('historyStore') || 
    (() => { throw new Error('HistoryStore not initialized'); })();
}

export function getAIEngine(): AIEngine {
  return serviceIntegrationManager.getService('aiEngine') || 
    (() => { throw new Error('AIEngine not initialized'); })();
}

export function getSecurityManager(): SecurityManager {
  return serviceIntegrationManager.getService('securityManager') || 
    (() => { throw new Error('SecurityManager not initialized'); })();
}

export function getSettingsService() {
  return serviceIntegrationManager.getService('settingsService') || settingsService;
}

export function getLanguageService() {
  return serviceIntegrationManager.getService('languageService') || languageService;
}

export function getThemeService() {
  return serviceIntegrationManager.getService('themeService') || themeService;
}

export function getDatabaseService() {
  return serviceIntegrationManager.getService('databaseService') || databaseService;
}

export function getServiceIntegrationManager() {
  return serviceIntegrationManager;
}

export function cleanupServices(): void {
  logger.info('🧹 Cleaning up backend services...');
  if (clipboardWatcher) {
    clipboardWatcher.stop();
  }
  logger.info('✅ Cleanup completed');
}
