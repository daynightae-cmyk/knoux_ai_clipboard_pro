import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Toggle, 
  Zap, 
  Bot, 
  Palette, 
  Shield, 
  Crown, 
  Flask,
  Search,
  Download,
  Upload,
  Plus,
  Trash2,
  Info,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import i18n from '../utils/i18n';

interface Feature {
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

interface FeatureCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  features: Feature[];
}

const categoryIcons = {
  core: Zap,
  ai: Bot,
  ui: Palette,
  security: Shield,
  premium: Crown,
  experimental: Flask
};

const categoryColors = {
  core: 'from-blue-500 to-cyan-500',
  ai: 'from-purple-500 to-pink-500',
  ui: 'from-green-500 to-teal-500',
  security: 'from-red-500 to-orange-500',
  premium: 'from-yellow-500 to-amber-500',
  experimental: 'from-indigo-500 to-purple-500'
};

export default function FeatureManager({ onClose }: { onClose: () => void }) {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [categories, setCategories] = useState<FeatureCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfig, setShowConfig] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const isRTL = i18n.isRTL();

  useEffect(() => {
    loadFeatures();
  }, []);

  const loadFeatures = async () => {
    try {
      // Load from IPC
      const result = await window.electronAPI?.invoke?.('features:get-all');
      if (result?.success) {
        setFeatures(result.data.features);
        setCategories(result.data.categories);
        setStats(result.data.stats);
      } else {
        // Fallback mock data
        loadMockData();
      }
    } catch (error) {
      console.warn('Failed to load features, using mock data');
      loadMockData();
    }
  };

  const loadMockData = () => {
    const mockFeatures: Feature[] = [
      {
        id: 'clipboard-monitoring',
        name: 'Clipboard Monitoring',
        description: 'Real-time clipboard content monitoring',
        category: 'core',
        enabled: true,
        vipOnly: false,
        version: '1.0.0',
        author: 'Knoux Team',
        config: { interval: 500, maxItems: 1000 }
      },
      {
        id: 'ai-text-analysis',
        name: 'AI Text Analysis',
        description: 'Automatic text classification and enhancement',
        category: 'ai',
        enabled: true,
        vipOnly: false,
        version: '1.0.0',
        author: 'Knoux Team',
        config: { autoSummarize: false, languageDetection: true }
      },
      {
        id: 'glassmorphic-ui',
        name: 'Glassmorphic Interface',
        description: 'Modern glass-effect user interface',
        category: 'ui',
        enabled: true,
        vipOnly: false,
        version: '1.0.0',
        author: 'Knoux Team',
        config: { blurIntensity: 'high', transparency: 70 }
      },
      {
        id: 'cloud-sync',
        name: 'Cloud Synchronization',
        description: 'Sync clipboard data across devices',
        category: 'premium',
        enabled: false,
        vipOnly: true,
        version: '1.0.0',
        author: 'Knoux Team',
        config: { provider: 'knoux-cloud', encryption: true }
      }
    ];

    const mockCategories: FeatureCategory[] = [
      {
        id: 'core',
        name: 'Core Features',
        icon: '⚡',
        description: 'Essential functionality',
        features: mockFeatures.filter(f => f.category === 'core')
      },
      {
        id: 'ai',
        name: 'AI Features',
        icon: '🤖',
        description: 'AI-powered features',
        features: mockFeatures.filter(f => f.category === 'ai')
      },
      {
        id: 'ui',
        name: 'User Interface',
        icon: '🎨',
        description: 'Visual enhancements',
        features: mockFeatures.filter(f => f.category === 'ui')
      },
      {
        id: 'premium',
        name: 'Premium Features',
        icon: '💎',
        description: 'VIP exclusive features',
        features: mockFeatures.filter(f => f.category === 'premium')
      }
    ];

    setFeatures(mockFeatures);
    setCategories(mockCategories);
    setStats({
      total: mockFeatures.length,
      enabled: mockFeatures.filter(f => f.enabled).length,
      vipFeatures: mockFeatures.filter(f => f.vipOnly).length
    });
  };

  const toggleFeature = async (featureId: string) => {
    try {
      const result = await window.electronAPI?.invoke?.('features:toggle', featureId);
      if (result?.success) {
        setFeatures(prev => prev.map(f => 
          f.id === featureId ? { ...f, enabled: !f.enabled } : f
        ));
      }
    } catch (error) {
      // Fallback for demo
      setFeatures(prev => prev.map(f => 
        f.id === featureId ? { ...f, enabled: !f.enabled } : f
      ));
    }
  };

  const updateFeatureConfig = async (featureId: string, config: Record<string, any>) => {
    try {
      const result = await window.electronAPI?.invoke?.('features:update-config', featureId, config);
      if (result?.success) {
        setFeatures(prev => prev.map(f => 
          f.id === featureId ? { ...f, config: { ...f.config, ...config } } : f
        ));
      }
    } catch (error) {
      // Fallback for demo
      setFeatures(prev => prev.map(f => 
        f.id === featureId ? { ...f, config: { ...f.config, ...config } } : f
      ));
    }
  };

  const filteredFeatures = features.filter(feature => {
    const matchesCategory = selectedCategory === 'all' || feature.category === selectedCategory;
    const matchesSearch = feature.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         feature.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const FeatureCard = ({ feature }: { feature: Feature }) => {
    const IconComponent = categoryIcons[feature.category];
    const colorClass = categoryColors[feature.category];

    return (
      <div className="glass-card hover:bg-white/10 transition-all duration-300">
        <div className={`flex items-start gap-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClass} shadow-lg`}>
            <IconComponent className="w-6 h-6 text-white" />
          </div>
          
          <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
            <div className={`flex items-center justify-between mb-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  {feature.name}
                  {feature.vipOnly && <Crown className="w-4 h-4 text-yellow-400" />}
                  {feature.author === 'Custom' && <Plus className="w-4 h-4 text-green-400" />}
                </h3>
                <p className="text-sm text-gray-400">{feature.description}</p>
              </div>
              
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                <button
                  onClick={() => setShowConfig(showConfig === feature.id ? null : feature.id)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  title="Configure"
                >
                  <Settings className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => toggleFeature(feature.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    feature.enabled ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      feature.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
            
            <div className={`flex items-center gap-4 text-xs text-gray-500 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              <span>v{feature.version}</span>
              <span>by {feature.author}</span>
              <span className={`px-2 py-1 rounded-full bg-gradient-to-r ${colorClass} text-white`}>
                {feature.category}
              </span>
              {feature.enabled && <CheckCircle className="w-4 h-4 text-green-400" />}
            </div>
            
            {/* Feature Configuration */}
            {showConfig === feature.id && feature.config && (
              <div className="mt-4 p-4 bg-black/20 rounded-lg border border-white/10">
                <h4 className="text-sm font-semibold text-white mb-3">Configuration</h4>
                <div className="space-y-3">
                  {Object.entries(feature.config).map(([key, value]) => (
                    <div key={key} className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                      <label className="text-sm text-gray-300 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      {typeof value === 'boolean' ? (
                        <button
                          onClick={() => updateFeatureConfig(feature.id, { [key]: !value })}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            value ? 'bg-blue-500' : 'bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                              value ? 'translate-x-5' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      ) : typeof value === 'number' ? (
                        <input
                          type="number"
                          value={value}
                          onChange={(e) => updateFeatureConfig(feature.id, { [key]: parseInt(e.target.value) })}
                          className="w-20 px-2 py-1 text-sm bg-white/10 border border-white/20 rounded text-white"
                        />
                      ) : (
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => updateFeatureConfig(feature.id, { [key]: e.target.value })}
                          className="w-32 px-2 py-1 text-sm bg-white/10 border border-white/20 rounded text-white"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen bg-knoux-background p-6 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className={`flex items-center justify-between mb-8 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Feature Manager
            </h1>
            <p className="text-gray-400 mt-2">Customize and control all application features</p>
          </div>
          
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-all"
          >
            {isRTL ? 'إغلاق' : 'Close'}
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="glass-card text-center">
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-sm text-gray-400">Total Features</div>
            </div>
            <div className="glass-card text-center">
              <div className="text-2xl font-bold text-green-400">{stats.enabled}</div>
              <div className="text-sm text-gray-400">Enabled</div>
            </div>
            <div className="glass-card text-center">
              <div className="text-2xl font-bold text-yellow-400">{stats.vipFeatures}</div>
              <div className="text-sm text-gray-400">VIP Features</div>
            </div>
            <div className="glass-card text-center">
              <div className="text-2xl font-bold text-purple-400">{stats.total - stats.enabled}</div>
              <div className="text-sm text-gray-400">Available</div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className={`flex flex-col md:flex-row gap-4 mb-8 ${isRTL ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
          {/* Search */}
          <div className="relative flex-1">
            <Search className={`absolute top-3 w-5 h-5 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              placeholder="Search features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400`}
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-400"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>

          {/* Actions */}
          <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <button className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-all">
              <Download className="w-5 h-5" />
            </button>
            <button className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-all">
              <Upload className="w-5 h-5" />
            </button>
            <button className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white transition-all">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="space-y-4">
          {filteredFeatures.length > 0 ? (
            filteredFeatures.map(feature => (
              <FeatureCard key={feature.id} feature={feature} />
            ))
          ) : (
            <div className="glass-card text-center py-12">
              <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No features found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}