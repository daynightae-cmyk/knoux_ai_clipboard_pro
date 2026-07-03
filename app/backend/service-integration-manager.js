/**
 * Service Integration Manager - Knoux Clipboard AI
 * Central service registry and integration manager
 */

const { EventEmitter } = require("events");

class ServiceIntegrationManager extends EventEmitter {
  constructor() {
    super();
    this.services = new Map();
    this.serviceStatuses = new Map();
    this.wiredServices = new Set();
    this.failedServices = new Set();
    this.healthCheckInterval = null;
    this.isInitialized = false;
  }

  async initialize() {
    console.log("🔧 Initializing Service Integration Manager...");

    try {
      // Register core services
      await this.registerCoreServices();

      // Start health monitoring
      this.startHealthMonitoring();

      this.isInitialized = true;
      console.log("✅ Service Integration Manager initialized");
      this.emit("initialized");
    } catch (error) {
      console.error(
        "❌ Failed to initialize Service Integration Manager:",
        error,
      );
      this.emit("initialization-error", error);
      throw error;
    }
  }

  async registerCoreServices() {
    console.log("🔧 Registering core services...");

    // Register clipboard service
    try {
      const { ClipboardHistoryStore } = require("./clipboard/history-store");
      const clipboardService = new ClipboardHistoryStore();
      await this.registerService("clipboard", clipboardService);
      console.log("✅ Clipboard service registered");
    } catch (error) {
      console.error("❌ Failed to register clipboard service:", error);
      this.failedServices.add("clipboard");
    }

    // Register AI service
    try {
      const { AIService } = require("./ai/ai-service");
      const aiService = new AIService();
      await this.registerService("aiService", aiService);
      console.log("✅ AI service registered");
    } catch (error) {
      console.error("❌ Failed to register AI service:", error);
      this.failedServices.add("aiService");
    }

    // Register storage service
    try {
      const { StorageService } = require("./storage/storage-service");
      const storageService = new StorageService();
      await this.registerService("storageService", storageService);
      console.log("✅ Storage service registered");
    } catch (error) {
      console.error("❌ Failed to register storage service:", error);
      this.failedServices.add("storageService");
    }

    // Register settings service
    try {
      const { SettingsService } = require("./settings/settings-service");
      const settingsService = new SettingsService();
      await this.registerService("settingsService", settingsService);
      console.log("✅ Settings service registered");
    } catch (error) {
      console.error("❌ Failed to register settings service:", error);
      this.failedServices.add("settingsService");
    }

    // Register language service
    try {
      const { LanguageService } = require("./language/language-service");
      const languageService = new LanguageService();
      await this.registerService("languageService", languageService);
      console.log("✅ Language service registered");
    } catch (error) {
      console.error("❌ Failed to register language service:", error);
      this.failedServices.add("languageService");
    }

    // Register theme service
    try {
      const { ThemeService } = require("./theme/theme-service");
      const themeService = new ThemeService();
      await this.registerService("themeService", themeService);
      console.log("✅ Theme service registered");
    } catch (error) {
      console.error("❌ Failed to register theme service:", error);
      this.failedServices.add("themeService");
    }

    // Register security services
    try {
      const { EncryptorService } = require("./security/encryptor-service");
      const encryptorService = new EncryptorService();
      await this.registerService("encryptor", encryptorService);
      console.log("✅ Encryptor service registered");
    } catch (error) {
      console.error("❌ Failed to register encryptor service:", error);
      this.failedServices.add("encryptor");
    }

    // Register creative services
    try {
      const { CreativeEngine } = require("./creative/creative-engine");
      const creativeEngine = new CreativeEngine();
      await this.registerService("creativeEngine", creativeEngine);
      console.log("✅ Creative engine registered");
    } catch (error) {
      console.error("❌ Failed to register creative engine:", error);
      this.failedServices.add("creativeEngine");
    }

    // Register pattern recognition
    try {
      const { PatternRecognizer } = require("./patterns/pattern-recognizer");
      const patternRecognizer = new PatternRecognizer();
      await this.registerService("patternRecognizer", patternRecognizer);
      console.log("✅ Pattern recognizer registered");
    } catch (error) {
      console.error("❌ Failed to register pattern recognizer:", error);
      this.failedServices.add("patternRecognizer");
    }

    // Register universal translator
    try {
      const {
        UniversalTranslator,
      } = require("./translator/universal-translator");
      const universalTranslator = new UniversalTranslator();
      await this.registerService("universalTranslator", universalTranslator);
      console.log("✅ Universal translator registered");
    } catch (error) {
      console.error("❌ Failed to register universal translator:", error);
      this.failedServices.add("universalTranslator");
    }
  }

  async registerService(name, service) {
    try {
      this.services.set(name, service);
      this.serviceStatuses.set(name, {
        name,
        status: "registered",
        lastCheck: Date.now(),
        error: null,
      });

      // Wire up service if it has lifecycle methods
      if (service.initialize) {
        await service.initialize();
        this.wiredServices.add(name);
        this.updateServiceStatus(name, "active");
      }

      this.emit("service-registered", { name, service });
      console.log(`✅ Service '${name}' registered successfully`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to register service '${name}':`, error);
      this.failedServices.add(name);
      this.updateServiceStatus(name, "failed", error.message);
      this.emit("service-registration-failed", { name, error });
      return false;
    }
  }

  getService(name) {
    return this.services.get(name);
  }

  getServiceStatus(name) {
    return this.serviceStatuses.get(name);
  }

  getAllServiceStatuses() {
    return Array.from(this.serviceStatuses.values());
  }

  getWiredServices() {
    return Array.from(this.wiredServices);
  }

  getFailedServices() {
    return Array.from(this.failedServices);
  }

  updateServiceStatus(name, status, error = null) {
    const serviceStatus = this.serviceStatuses.get(name);
    if (serviceStatus) {
      serviceStatus.status = status;
      serviceStatus.lastCheck = Date.now();
      serviceStatus.error = error;
      this.emit("service-status-changed", { name, status, error });
    }
  }

  async healthCheck() {
    const results = {};

    for (const [name, service] of this.services) {
      try {
        if (service.healthCheck) {
          const health = await service.healthCheck();
          results[name] = { status: "healthy", details: health };
          this.updateServiceStatus(name, "active");
        } else {
          results[name] = {
            status: "unknown",
            details: "No health check available",
          };
        }
      } catch (error) {
        results[name] = { status: "unhealthy", error: error.message };
        this.updateServiceStatus(name, "error", error.message);
      }
    }

    return results;
  }

  startHealthMonitoring() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.healthCheck();
      } catch (error) {
        console.error("❌ Health check failed:", error);
      }
    }, 30000); // Check every 30 seconds

    console.log("✅ Health monitoring started");
  }

  stopHealthMonitoring() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
      console.log("✅ Health monitoring stopped");
    }
  }

  async shutdown() {
    console.log("🔧 Shutting down Service Integration Manager...");

    this.stopHealthMonitoring();

    // Cleanup services
    for (const [name, service] of this.services) {
      try {
        if (service.cleanup) {
          await service.cleanup();
          console.log(`✅ Service '${name}' cleaned up`);
        }
      } catch (error) {
        console.error(`❌ Failed to cleanup service '${name}':`, error);
      }
    }

    this.services.clear();
    this.serviceStatuses.clear();
    this.wiredServices.clear();
    this.failedServices.clear();
    this.isInitialized = false;

    console.log("✅ Service Integration Manager shutdown completed");
    this.emit("shutdown");
  }
}

// Create singleton instance
const serviceIntegrationManager = new ServiceIntegrationManager();

module.exports = { serviceIntegrationManager };
