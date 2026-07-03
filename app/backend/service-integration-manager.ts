/**
 * Service Integration Manager - Knoux Clipboard AI
 * Centralized service wiring and dependency management
 */

import { aiService } from './services/aiService';
import { databaseService } from './services/databaseService';
import { settingsService } from './services/settingsService';
import { languageService } from './services/languageService';
import { themeService } from './services/themeService';
import { logger } from '../shared/logger';

// Import AI modules
import { AIEngine } from './ai/ai-engine';
import { CreativeEngine } from './ai/creative-engine';
import { Summarizer } from './ai/summarizer';
import { Enhancer } from './ai/enhancer';
import { Classifier } from './ai/classifier';
import { UniversalTranslator } from './ai/universal-translator';
import { PatternRecognizer } from './ai/pattern-recognizer';
import { PredictiveEngine } from './ai/predictive-engine';

// Import clipboard modules
import { ClipboardWatcher } from './clipboard/watcher';
import { HistoryStore } from './clipboard/history-store';
import { Formatter } from './clipboard/formatter';
import { Normalizer } from './clipboard/normalizer';

// Import security modules
import { SecurityManager } from './security/security-manager';
import { Encryptor } from './security/encryptor';
import { PermissionGuard } from './security/permission-guard';

// Import storage modules
import { Cache } from './storage/cache';
import { LocalDB } from './storage/local-db';

export interface ServiceStatus {
  name: string;
  status: 'wired' | 'wired-with-warnings' | 'needs-work' | 'failed';
  path: string;
  dependencies: string[];
  lastCheck: number;
  error?: string;
}

class ServiceIntegrationManager {
  private services: Map<string, any> = new Map();
  private serviceStatus: Map<string, ServiceStatus> = new Map();
  private initialized = false;

  async initializeAllServices(): Promise<void> {
    logger.info('🔧 Starting comprehensive service integration...');

    try {
      // Phase 1: Core Services
      await this.initializeCoreServices();
      
      // Phase 2: AI Services
      await this.initializeAIServices();
      
      // Phase 3: Clipboard Services
      await this.initializeClipboardServices();
      
      // Phase 4: Security Services
      await this.initializeSecurityServices();
      
      // Phase 5: Storage Services
      await this.initializeStorageServices();
      
      // Phase 6: Wire Dependencies
      await this.wireServiceDependencies();
      
      this.initialized = true;
      logger.info('✅ All services integrated successfully');
      
    } catch (error) {
      logger.error('❌ Service integration failed:', error);
      throw error;
    }
  }

  private async initializeCoreServices(): Promise<void> {
    logger.info('📊 Initializing core services...');

    // Database Service
    await this.registerService('databaseService', databaseService, 'app/backend/services/databaseService.ts', []);
    
    // Settings Service
    await this.registerService('settingsService', settingsService, 'app/backend/services/settingsService.ts', ['databaseService']);
    
    // Language Service
    await this.registerService('languageService', languageService, 'app/backend/services/languageService.ts', ['settingsService']);
    
    // Theme Service
    await this.registerService('themeService', themeService, 'app/backend/services/themeService.ts', ['settingsService']);
    
    // AI Service
    await this.registerService('aiService', aiService, 'app/backend/services/aiService.ts', ['databaseService']);
  }

  private async initializeAIServices(): Promise<void> {
    logger.info('🧠 Initializing AI services...');

    const aiServices = [
      { name: 'aiEngine', class: AIEngine, path: 'app/backend/ai/ai-engine.ts', deps: ['aiService'] },
      { name: 'creativeEngine', class: CreativeEngine, path: 'app/backend/ai/creative-engine.ts', deps: ['aiService'] },
      { name: 'summarizer', class: Summarizer, path: 'app/backend/ai/summarizer.ts', deps: ['aiService'] },
      { name: 'enhancer', class: Enhancer, path: 'app/backend/ai/enhancer.ts', deps: ['aiService'] },
      { name: 'classifier', class: Classifier, path: 'app/backend/ai/classifier.ts', deps: ['aiService'] },
      { name: 'universalTranslator', class: UniversalTranslator, path: 'app/backend/ai/universal-translator.ts', deps: ['aiService'] },
      { name: 'patternRecognizer', class: PatternRecognizer, path: 'app/backend/ai/pattern-recognizer.ts', deps: ['aiService'] },
      { name: 'predictiveEngine', class: PredictiveEngine, path: 'app/backend/ai/predictive-engine.ts', deps: ['aiService'] }
    ];

    for (const service of aiServices) {
      try {
        const instance = new service.class();
        await this.registerService(service.name, instance, service.path, service.deps);
      } catch (error) {
        logger.warn(`⚠️ Failed to initialize ${service.name}:`, error);
        this.serviceStatus.set(service.name, {
          name: service.name,
          status: 'needs-work',
          path: service.path,
          dependencies: service.deps,
          lastCheck: Date.now(),
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  private async initializeClipboardServices(): Promise<void> {
    logger.info('📋 Initializing clipboard services...');

    const clipboardServices = [
      { name: 'clipboardWatcher', class: ClipboardWatcher, path: 'app/backend/clipboard/watcher.ts', deps: ['databaseService'] },
      { name: 'historyStore', class: HistoryStore, path: 'app/backend/clipboard/history-store.ts', deps: ['databaseService'] },
      { name: 'formatter', class: Formatter, path: 'app/backend/clipboard/formatter.ts', deps: [] },
      { name: 'normalizer', class: Normalizer, path: 'app/backend/clipboard/normalizer.ts', deps: [] }
    ];

    for (const service of clipboardServices) {
      try {
        const instance = new service.class();
        await this.registerService(service.name, instance, service.path, service.deps);
      } catch (error) {
        logger.warn(`⚠️ Failed to initialize ${service.name}:`, error);
        this.serviceStatus.set(service.name, {
          name: service.name,
          status: 'needs-work',
          path: service.path,
          dependencies: service.deps,
          lastCheck: Date.now(),
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  private async initializeSecurityServices(): Promise<void> {
    logger.info('🔒 Initializing security services...');

    const securityServices = [
      { name: 'securityManager', class: SecurityManager, path: 'app/backend/security/security-manager.ts', deps: ['settingsService'] },
      { name: 'encryptor', class: Encryptor, path: 'app/backend/security/encryptor.ts', deps: [] },
      { name: 'permissionGuard', class: PermissionGuard, path: 'app/backend/security/permission-guard.ts', deps: ['settingsService'] }
    ];

    for (const service of securityServices) {
      try {
        const instance = new service.class();
        await this.registerService(service.name, instance, service.path, service.deps);
      } catch (error) {
        logger.warn(`⚠️ Failed to initialize ${service.name}:`, error);
        this.serviceStatus.set(service.name, {
          name: service.name,
          status: 'needs-work',
          path: service.path,
          dependencies: service.deps,
          lastCheck: Date.now(),
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  private async initializeStorageServices(): Promise<void> {
    logger.info('💾 Initializing storage services...');

    const storageServices = [
      { name: 'cache', class: Cache, path: 'app/backend/storage/cache.ts', deps: [] },
      { name: 'localDB', class: LocalDB, path: 'app/backend/storage/local-db.ts', deps: ['databaseService'] }
    ];

    for (const service of storageServices) {
      try {
        const instance = new service.class();
        await this.registerService(service.name, instance, service.path, service.deps);
      } catch (error) {
        logger.warn(`⚠️ Failed to initialize ${service.name}:`, error);
        this.serviceStatus.set(service.name, {
          name: service.name,
          status: 'needs-work',
          path: service.path,
          dependencies: service.deps,
          lastCheck: Date.now(),
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  private async registerService(name: string, instance: any, path: string, dependencies: string[]): Promise<void> {
    try {
      // Initialize service if it has an initialize method
      if (typeof instance.initialize === 'function') {
        await instance.initialize();
      }

      this.services.set(name, instance);
      this.serviceStatus.set(name, {
        name,
        status: 'wired',
        path,
        dependencies,
        lastCheck: Date.now()
      });

      logger.info(`✅ Service registered: ${name}`);
    } catch (error) {
      logger.error(`❌ Failed to register service ${name}:`, error);
      this.serviceStatus.set(name, {
        name,
        status: 'failed',
        path,
        dependencies,
        lastCheck: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  private async wireServiceDependencies(): Promise<void> {
    logger.info('🔗 Wiring service dependencies...');

    // Wire AI services to core services
    const aiEngine = this.getService('aiEngine');
    if (aiEngine && typeof aiEngine.setDatabaseService === 'function') {
      aiEngine.setDatabaseService(this.getService('databaseService'));
    }

    // Wire clipboard services
    const clipboardWatcher = this.getService('clipboardWatcher');
    if (clipboardWatcher) {
      if (typeof clipboardWatcher.setHistoryStore === 'function') {
        clipboardWatcher.setHistoryStore(this.getService('historyStore'));
      }
      if (typeof clipboardWatcher.setAIService === 'function') {
        clipboardWatcher.setAIService(this.getService('aiService'));
      }
    }

    // Wire security services
    const securityManager = this.getService('securityManager');
    if (securityManager) {
      if (typeof securityManager.setEncryptor === 'function') {
        securityManager.setEncryptor(this.getService('encryptor'));
      }
      if (typeof securityManager.setPermissionGuard === 'function') {
        securityManager.setPermissionGuard(this.getService('permissionGuard'));
      }
    }

    logger.info('✅ Service dependencies wired');
  }

  getService<T = any>(name: string): T | null {
    return this.services.get(name) || null;
  }

  getServiceStatus(name: string): ServiceStatus | null {
    return this.serviceStatus.get(name) || null;
  }

  getAllServiceStatuses(): ServiceStatus[] {
    return Array.from(this.serviceStatus.values());
  }

  getWiredServices(): string[] {
    return Array.from(this.serviceStatus.entries())
      .filter(([_, status]) => status.status === 'wired')
      .map(([name]) => name);
  }

  getFailedServices(): string[] {
    return Array.from(this.serviceStatus.entries())
      .filter(([_, status]) => status.status === 'failed' || status.status === 'needs-work')
      .map(([name]) => name);
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async healthCheck(): Promise<{ healthy: boolean; services: ServiceStatus[] }> {
    const services = this.getAllServiceStatuses();
    const healthy = services.every(s => s.status === 'wired' || s.status === 'wired-with-warnings');
    
    return { healthy, services };
  }
}

// Singleton instance
export const serviceIntegrationManager = new ServiceIntegrationManager();