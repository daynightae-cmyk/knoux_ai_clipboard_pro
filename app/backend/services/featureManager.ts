/**
 * Feature Management System - Knoux Clipboard AI
 * Dynamic feature control with real-time updates
 */

export interface Feature {
  id: string;
  name: string;
  description: string;
  category: 'core' | 'ai' | 'ui' | 'security' | 'premium' | 'experimental';
  enabled: boolean;
  vipOnly: boolean;
  dependencies?: string[];
  config?: Record<string, any>;
  version: string;
  author: string;
}

export interface FeatureCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  features: Feature[];
}

class FeatureManager {
  private features: Map<string, Feature> = new Map();
  private listeners: Set<(features: Feature[]) => void> = new Set();

  constructor() {
    this.initializeDefaultFeatures();
  }

  private initializeDefaultFeatures(): void {
    const defaultFeatures: Feature[] = [
      // Core Features
      {
        id: 'clipboard-monitoring',
        name: 'Clipboard Monitoring',
        description: 'Real-time clipboard content monitoring',
        category: 'core',
        enabled: true,
        vipOnly: false,
        version: '1.0.0',
        author: 'Knoux Team',
        config: {
          interval: 500,
          maxItems: 1000,
          autoCleanup: true
        }
      },
      {
        id: 'search-engine',
        name: 'Advanced Search',
        description: 'Full-text search with filters and patterns',
        category: 'core',
        enabled: true,
        vipOnly: false,
        version: '1.0.0',
        author: 'Knoux Team',
        config: {
          fuzzySearch: true,
          regexSupport: true,
          indexing: true
        }
      },
      
      // AI Features
      {
        id: 'ai-text-analysis',
        name: 'AI Text Analysis',
        description: 'Automatic text classification and enhancement',
        category: 'ai',
        enabled: true,
        vipOnly: false,
        version: '1.0.0',
        author: 'Knoux Team',
        config: {
          autoSummarize: false,
          languageDetection: true,
          sentimentAnalysis: false
        }
      },
      {
        id: 'ai-smart-suggestions',
        name: 'Smart Suggestions',
        description: 'AI-powered content suggestions and completions',
        category: 'ai',
        enabled: false,
        vipOnly: true,
        version: '1.0.0',
        author: 'Knoux Team',
        config: {
          contextAware: true,
          learningEnabled: true,
          suggestionCount: 5
        }
      },
      {
        id: 'ai-translation',
        name: 'Real-time Translation',
        description: 'Instant translation between multiple languages',
        category: 'ai',
        enabled: false,
        vipOnly: true,
        version: '1.0.0',
        author: 'Knoux Team',
        config: {
          autoDetect: true,
          supportedLanguages: ['en', 'ar', 'fr', 'es', 'de'],
          cacheTranslations: true
        }
      },

      // UI Features
      {
        id: 'glassmorphic-ui',
        name: 'Glassmorphic Interface',
        description: 'Modern glass-effect user interface',
        category: 'ui',
        enabled: true,
        vipOnly: false,
        version: '1.0.0',
        author: 'Knoux Team',
        config: {
          blurIntensity: 'high',
          transparency: 70,
          animations: true
        }
      },
      {
        id: 'custom-themes',
        name: 'Custom Themes',
        description: 'Create and apply custom color themes',
        category: 'ui',
        enabled: false,
        vipOnly: true,
        version: '1.0.0',
        author: 'Knoux Team',
        config: {
          themeEditor: true,
          importExport: true,
          presets: ['cyberpunk', 'minimal', 'neon']
        }
      },
      {
        id: 'rtl-support',
        name: 'RTL Language Support',
        description: 'Right-to-left language support with Arabic fonts',
        category: 'ui',
        enabled: true,
        vipOnly: false,
        version: '1.0.0',
        author: 'Knoux Team',
        config: {
          arabicFonts: true,
          layoutMirroring: true,
          textDirection: 'auto'
        }
      },

      // Security Features
      {
        id: 'data-encryption',
        name: 'Data Encryption',
        description: 'AES-256 encryption for sensitive data',
        category: 'security',
        enabled: false,
        vipOnly: false,
        version: '1.0.0',
        author: 'Knoux Team',
        config: {
          algorithm: 'AES-256-GCM',
          keyDerivation: 'PBKDF2',
          saltLength: 32
        }
      },
      {
        id: 'password-protection',
        name: 'Password Protection',
        description: 'Secure app access with password authentication',
        category: 'security',
        enabled: false,
        vipOnly: false,
        version: '1.0.0',
        author: 'Knoux Team',
        config: {
          lockTimeout: 300,
          biometricAuth: false,
          sessionTimeout: 3600
        }
      },
      {
        id: 'secure-delete',
        name: 'Secure Delete',
        description: 'Permanently delete sensitive clipboard data',
        category: 'security',
        enabled: false,
        vipOnly: true,
        version: '1.0.0',
        author: 'Knoux Team',
        config: {
          overwritePasses: 3,
          autoSecureDelete: false,
          confirmDelete: true
        }
      },

      // Premium Features
      {
        id: 'cloud-sync',
        name: 'Cloud Synchronization',
        description: 'Sync clipboard data across multiple devices',
        category: 'premium',
        enabled: false,
        vipOnly: true,
        version: '1.0.0',
        author: 'Knoux Team',
        config: {
          provider: 'knoux-cloud',
          encryption: true,
          autoSync: true,
          conflictResolution: 'latest'
        }
      },
      {
        id: 'unlimited-history',
        name: 'Unlimited History',
        description: 'Store unlimited clipboard history items',
        category: 'premium',
        enabled: false,
        vipOnly: true,
        version: '1.0.0',
        author: 'Knoux Team',
        config: {
          compressionEnabled: true,
          archiveOldItems: true,
          searchIndexing: true
        }
      },

      // Experimental Features
      {
        id: 'voice-commands',
        name: 'Voice Commands',
        description: 'Control app using voice commands',
        category: 'experimental',
        enabled: false,
        vipOnly: true,
        version: '0.9.0',
        author: 'Knoux Labs',
        config: {
          language: 'en',
          wakeWord: 'hey knoux',
          confidence: 0.8
        }
      },
      {
        id: 'gesture-control',
        name: 'Gesture Control',
        description: 'Mouse gesture shortcuts for quick actions',
        category: 'experimental',
        enabled: false,
        vipOnly: false,
        version: '0.8.0',
        author: 'Knoux Labs',
        config: {
          sensitivity: 'medium',
          customGestures: true,
          visualFeedback: true
        }
      }
    ];

    defaultFeatures.forEach(feature => {
      this.features.set(feature.id, feature);
    });
  }

  // Feature Management
  enableFeature(featureId: string): boolean {
    const feature = this.features.get(featureId);
    if (!feature) return false;

    // Check dependencies
    if (feature.dependencies) {
      for (const depId of feature.dependencies) {
        const dep = this.features.get(depId);
        if (!dep || !dep.enabled) {
          throw new Error(`Dependency ${depId} is not enabled`);
        }
      }
    }

    feature.enabled = true;
    this.notifyListeners();
    return true;
  }

  disableFeature(featureId: string): boolean {
    const feature = this.features.get(featureId);
    if (!feature) return false;

    // Check if other features depend on this
    const dependents = Array.from(this.features.values())
      .filter(f => f.dependencies?.includes(featureId) && f.enabled);
    
    if (dependents.length > 0) {
      throw new Error(`Cannot disable: ${dependents.map(f => f.name).join(', ')} depend on this feature`);
    }

    feature.enabled = false;
    this.notifyListeners();
    return true;
  }

  toggleFeature(featureId: string): boolean {
    const feature = this.features.get(featureId);
    if (!feature) return false;

    return feature.enabled ? this.disableFeature(featureId) : this.enableFeature(featureId);
  }

  // Feature Configuration
  updateFeatureConfig(featureId: string, config: Record<string, any>): boolean {
    const feature = this.features.get(featureId);
    if (!feature) return false;

    feature.config = { ...feature.config, ...config };
    this.notifyListeners();
    return true;
  }

  getFeatureConfig(featureId: string): Record<string, any> | null {
    const feature = this.features.get(featureId);
    return feature?.config || null;
  }

  // Feature Queries
  getAllFeatures(): Feature[] {
    return Array.from(this.features.values());
  }

  getEnabledFeatures(): Feature[] {
    return Array.from(this.features.values()).filter(f => f.enabled);
  }

  getFeaturesByCategory(category: Feature['category']): Feature[] {
    return Array.from(this.features.values()).filter(f => f.category === category);
  }

  getFeature(featureId: string): Feature | null {
    return this.features.get(featureId) || null;
  }

  isFeatureEnabled(featureId: string): boolean {
    const feature = this.features.get(featureId);
    return feature?.enabled || false;
  }

  // Custom Features
  addCustomFeature(feature: Omit<Feature, 'version' | 'author'>): boolean {
    const customFeature: Feature = {
      ...feature,
      version: '1.0.0-custom',
      author: 'Custom'
    };

    this.features.set(feature.id, customFeature);
    this.notifyListeners();
    return true;
  }

  removeCustomFeature(featureId: string): boolean {
    const feature = this.features.get(featureId);
    if (!feature || feature.author !== 'Custom') return false;

    this.features.delete(featureId);
    this.notifyListeners();
    return true;
  }

  // Feature Categories
  getCategories(): FeatureCategory[] {
    const categories: FeatureCategory[] = [
      {
        id: 'core',
        name: 'Core Features',
        icon: '⚡',
        description: 'Essential application functionality',
        features: this.getFeaturesByCategory('core')
      },
      {
        id: 'ai',
        name: 'AI Features',
        icon: '🤖',
        description: 'Artificial intelligence powered features',
        features: this.getFeaturesByCategory('ai')
      },
      {
        id: 'ui',
        name: 'User Interface',
        icon: '🎨',
        description: 'Visual and interaction enhancements',
        features: this.getFeaturesByCategory('ui')
      },
      {
        id: 'security',
        name: 'Security',
        icon: '🔒',
        description: 'Data protection and privacy features',
        features: this.getFeaturesByCategory('security')
      },
      {
        id: 'premium',
        name: 'Premium Features',
        icon: '💎',
        description: 'Advanced features for VIP users',
        features: this.getFeaturesByCategory('premium')
      },
      {
        id: 'experimental',
        name: 'Experimental',
        icon: '🧪',
        description: 'Beta features under development',
        features: this.getFeaturesByCategory('experimental')
      }
    ];

    return categories;
  }

  // Event Listeners
  onFeaturesChanged(callback: (features: Feature[]) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    const features = this.getAllFeatures();
    this.listeners.forEach(listener => listener(features));
  }

  // Import/Export
  exportFeatures(): string {
    const exportData = {
      features: Array.from(this.features.values()),
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
    return JSON.stringify(exportData, null, 2);
  }

  importFeatures(data: string): boolean {
    try {
      const importData = JSON.parse(data);
      if (!importData.features || !Array.isArray(importData.features)) {
        return false;
      }

      importData.features.forEach((feature: Feature) => {
        this.features.set(feature.id, feature);
      });

      this.notifyListeners();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Feature Statistics
  getFeatureStats() {
    const all = this.getAllFeatures();
    const enabled = this.getEnabledFeatures();
    
    return {
      total: all.length,
      enabled: enabled.length,
      disabled: all.length - enabled.length,
      byCategory: {
        core: this.getFeaturesByCategory('core').length,
        ai: this.getFeaturesByCategory('ai').length,
        ui: this.getFeaturesByCategory('ui').length,
        security: this.getFeaturesByCategory('security').length,
        premium: this.getFeaturesByCategory('premium').length,
        experimental: this.getFeaturesByCategory('experimental').length
      },
      vipFeatures: all.filter(f => f.vipOnly).length,
      customFeatures: all.filter(f => f.author === 'Custom').length
    };
  }
}

export const featureManager = new FeatureManager();