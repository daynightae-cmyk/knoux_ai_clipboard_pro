/**
 * App.tsx - INTEGRATED VERSION
 * النسخة المتكاملة من التطبيق الرئيسي
 *
 * This version uses the unified ServiceManager for all operations
 * تستخدم هذه النسخة ServiceManager الموحد لجميع العمليات
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardCopy,
  Search,
  Settings,
  Zap,
  Lock,
  RefreshCw,
  Trash2,
  Star,
  Maximize2,
  Copy as CopyIcon,
  Trash,
  Clock,
  Activity,
  Shield,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Loader,
} from 'lucide-react';
import SplashScreen from './components/SplashScreen';
import SettingsPanel from './components/SettingsPanel';
import UnifiedAppContainer from './containers/UnifiedAppContainer';
import { getServiceManager } from '../backend/service-manager';

interface ClipboardItemData {
  id: string;
  content: string;
  format: string;
  timestamp: string;
  tags: string[];
  metadata?: {
    sensitive?: boolean;
    isUrl?: boolean;
  };
  favorite?: boolean;
  analyzed?: boolean;
  classification?: {
    type: string;
    confidence: number;
  };
}

interface DashboardStats {
  totalItems: number;
  formats: number;
  sensitiveItems: number;
  urlItems: number;
  todayItems: number;
  totalSize: number;
}

interface ServiceStatus {
  name: string;
  ready: boolean;
  loading: boolean;
  error?: string;
}

function AppIntegrated() {
  // ==================== STATE MANAGEMENT ====================

  const [showSplash, setShowSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);
  const [serviceStatuses, setServiceStatuses] = useState<ServiceStatus[]>([
    { name: 'Clipboard', ready: false, loading: true },
    { name: 'AI Engine', ready: false, loading: true },
    { name: 'Security', ready: false, loading: true },
    { name: 'Storage', ready: false, loading: true },
    { name: 'IPC', ready: false, loading: true },
    { name: 'UI', ready: false, loading: true },
  ]);

  const [clipboardItems, setClipboardItems] = useState<ClipboardItemData[]>([]);
  const [filteredItems, setFilteredItems] = useState<ClipboardItemData[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalItems: 0,
    formats: 0,
    sensitiveItems: 0,
    urlItems: 0,
    todayItems: 0,
    totalSize: 0,
  });
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [initProgress, setInitProgress] = useState(0);

  // ==================== INITIALIZATION ====================

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Initializing Knoux Clipboard AI...');

        // Get Service Manager
        const serviceManager = getServiceManager();

        // Initialize services sequentially
        setInitProgress(10);
        console.log('📦 Initializing Storage Service...');
        await serviceManager.getStorageService().initialize();
        setServiceStatuses((prev) =>
          prev.map((s) => (s.name === 'Storage' ? { ...s, ready: true, loading: false } : s))
        );
        setInitProgress(25);

        setInitProgress(30);
        console.log('🔒 Initializing Security Service...');
        await serviceManager.getSecurityService().initialize();
        setServiceStatuses((prev) =>
          prev.map((s) => (s.name === 'Security' ? { ...s, ready: true, loading: false } : s))
        );
        setInitProgress(40);

        setInitProgress(50);
        console.log('📋 Initializing Clipboard Service...');
        await serviceManager.getClipboardService().initialize();
        setServiceStatuses((prev) =>
          prev.map((s) => (s.name === 'Clipboard' ? { ...s, ready: true, loading: false } : s))
        );
        setInitProgress(60);

        setInitProgress(70);
        console.log('🧠 Initializing AI Service...');
        await serviceManager.getAIService().initialize();
        setServiceStatuses((prev) =>
          prev.map((s) => (s.name === 'AI Engine' ? { ...s, ready: true, loading: false } : s))
        );
        setInitProgress(80);

        setInitProgress(85);
        console.log('🔗 Initializing IPC Service...');
        await serviceManager.getIPCService().initialize();
        setServiceStatuses((prev) =>
          prev.map((s) => (s.name === 'IPC' ? { ...s, ready: true, loading: false } : s))
        );
        setInitProgress(90);

        setInitProgress(95);
        console.log('🎨 Initializing UI Service...');
        await serviceManager.getUIService().initialize();
        setServiceStatuses((prev) =>
          prev.map((s) => (s.name === 'UI' ? { ...s, ready: true, loading: false } : s))
        );
        setInitProgress(100);

        // Load clipboard history
        console.log('📥 Loading clipboard history...');
        const history = await serviceManager.getClipboardService().getHistory();
        setClipboardItems(history as ClipboardItemData[]);

        // Start monitoring
        console.log('👁️ Starting clipboard monitoring...');
        serviceManager.getClipboardService().on('update', (items) => {
          setClipboardItems(items as ClipboardItemData[]);
          setLastSync(new Date());
        });

        setIsMonitoring(true);
        setAppReady(true);
        console.log('✅ All services initialized successfully!');

        // Hide splash after 1 second
        setTimeout(() => {
          setShowSplash(false);
        }, 1000);

      } catch (error) {
        console.error('❌ Initialization failed:', error);
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        setServiceStatuses((prev) =>
          prev.map((s) => ({
            ...s,
            loading: false,
            error: errorMsg,
          }))
        );
      }
    };

    initializeApp();
  }, []);

  // ==================== STATISTICS CALCULATION ====================

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sensitiveCount = clipboardItems.filter((i) => i.metadata?.sensitive).length;
    const urlCount = clipboardItems.filter((i) => i.metadata?.isUrl).length;
    const todayCount = clipboardItems.filter((i) => new Date(i.timestamp) > today).length;
    const totalSize = clipboardItems.reduce((sum, i) => sum + i.content.length, 0);

    setStats({
      totalItems: clipboardItems.length,
      formats: new Set(clipboardItems.map((i) => i.format)).size,
      sensitiveItems: sensitiveCount,
      urlItems: urlCount,
      todayItems: todayCount,
      totalSize: totalSize,
    });
  }, [clipboardItems]);

  // ==================== FILTERING ====================

  useEffect(() => {
    let filtered = clipboardItems;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter((item) =>
        selectedTags.some((tag) => item.tags.includes(tag))
      );
    }

    setFilteredItems(filtered);
  }, [clipboardItems, searchQuery, selectedTags]);

  // ==================== HANDLERS ====================

  const handleCopyItem = useCallback((item: ClipboardItemData) => {
    navigator.clipboard.writeText(item.content);
    const serviceManager = getServiceManager();
    serviceManager.getUIService().showNotification(`Copied to clipboard! ✨`, 'success');
  }, []);

  const handleDeleteItem = useCallback((id: string) => {
    const serviceManager = getServiceManager();
    setClipboardItems((prev) => prev.filter((i) => i.id !== id));
    serviceManager.getUIService().showNotification(`Item deleted`, 'info');
  }, []);

  const handleClearHistory = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all clipboard history?')) {
      const serviceManager = getServiceManager();
      setClipboardItems([]);
      serviceManager.getStorageService().clear();
      serviceManager.getUIService().showNotification(`History cleared`, 'warning');
    }
  }, []);

  const handleToggleFavorite = useCallback((id: string) => {
    setClipboardItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, favorite: !item.favorite } : item
      )
    );
  }, []);

  // ==================== RENDER ====================

  if (!appReady) {
    return (
      <UnifiedAppContainer
        services={serviceStatuses}
        progress={initProgress}
        isInitializing={!showSplash}
      />
    );
  }

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

      {!showSplash && (
        <div className="flex h-full">
          {/* ==================== SIDEBAR ====================  */}
          <div className="w-64 bg-slate-900 border-r border-slate-700 flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <ClipboardCopy className="w-6 h-6 text-blue-400" />
                <span className="text-xl font-bold">Knoux</span>
              </div>
              <p className="text-xs text-gray-400">Clipboard AI Assistant</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              <button className="w-full text-left px-4 py-3 rounded-lg bg-blue-600 text-white flex items-center gap-2 hover:bg-blue-700 transition">
                <Activity className="w-4 h-4" />
                Dashboard
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg text-gray-300 flex items-center gap-2 hover:bg-slate-700 transition">
                <TrendingUp className="w-4 h-4" />
                Analytics
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg text-gray-300 flex items-center gap-2 hover:bg-slate-700 transition">
                <Shield className="w-4 h-4" />
                Security
              </button>
            </nav>

            {/* Settings Button */}
            <div className="p-4 border-t border-slate-700">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="w-full px-4 py-2 rounded-lg bg-slate-700 text-gray-300 flex items-center gap-2 hover:bg-slate-600 transition"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>
          </div>

          {/* ==================== MAIN CONTENT ====================  */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-8 py-4 border-b border-slate-700 flex items-center justify-between bg-slate-800 bg-opacity-50">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search clipboard..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-lg bg-slate-700 border border-slate-600 focus:border-blue-500 outline-none w-80"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-400">
                  Last sync: {lastSync ? lastSync.toLocaleTimeString() : 'Never'}
                </div>
                <button
                  onClick={() => setClipboardItems([...clipboardItems])}
                  className="p-2 rounded-lg hover:bg-slate-700 transition"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8">
              {/* Stats */}
              <div className="grid grid-cols-6 gap-4 mb-8">
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <div className="text-gray-400 text-sm mb-2">Total Items</div>
                  <div className="text-3xl font-bold">{stats.totalItems}</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <div className="text-gray-400 text-sm mb-2">Formats</div>
                  <div className="text-3xl font-bold">{stats.formats}</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <div className="text-gray-400 text-sm mb-2">🔒 Sensitive</div>
                  <div className="text-3xl font-bold text-yellow-400">{stats.sensitiveItems}</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <div className="text-gray-400 text-sm mb-2">🔗 URLs</div>
                  <div className="text-3xl font-bold text-blue-400">{stats.urlItems}</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <div className="text-gray-400 text-sm mb-2">Today</div>
                  <div className="text-3xl font-bold text-green-400">{stats.todayItems}</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <div className="text-gray-400 text-sm mb-2">Total Size</div>
                  <div className="text-2xl font-bold">{(stats.totalSize / 1024).toFixed(2)} KB</div>
                </div>
              </div>

              {/* Service Status Alert */}
              {!isMonitoring && (
                <div className="mb-6 p-4 rounded-lg bg-yellow-900 bg-opacity-30 border border-yellow-600 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-300">Clipboard monitoring is not active</span>
                </div>
              )}

              {isMonitoring && (
                <div className="mb-6 p-4 rounded-lg bg-green-900 bg-opacity-30 border border-green-600 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-green-300">Clipboard monitoring is active</span>
                </div>
              )}

              {/* Clipboard Items */}
              <div className="space-y-2">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <ClipboardCopy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No clipboard items found</p>
                  </div>
                ) : (
                  filteredItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item.id)}
                      className={`p-4 rounded-lg border cursor-pointer transition ${
                        selectedItem === item.id
                          ? 'bg-blue-900 border-blue-500'
                          : 'bg-slate-800 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-400 mb-2">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {new Date(item.timestamp).toLocaleString()}
                          </p>
                          <p className="text-white font-mono truncate">{item.content.substring(0, 100)}</p>
                          {item.classification && (
                            <div className="mt-2 inline-block px-2 py-1 rounded bg-purple-900 bg-opacity-50 border border-purple-600 text-xs text-purple-300">
                              {item.classification.type} ({(item.classification.confidence * 100).toFixed(0)}%)
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyItem(item);
                            }}
                            className="p-2 rounded-lg hover:bg-slate-700 transition"
                            title="Copy"
                          >
                            <CopyIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFavorite(item.id);
                            }}
                            className={`p-2 rounded-lg transition ${item.favorite ? 'text-yellow-400' : 'hover:bg-slate-700'}`}
                            title="Favorite"
                          >
                            <Star className="w-4 h-4" fill={item.favorite ? 'currentColor' : 'none'} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteItem(item.id);
                            }}
                            className="p-2 rounded-lg hover:bg-red-900 hover:bg-opacity-30 transition text-red-400"
                            title="Delete"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Clear History Button */}
              {clipboardItems.length > 0 && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={handleClearHistory}
                    className="px-4 py-2 rounded-lg bg-red-900 bg-opacity-30 border border-red-600 text-red-400 hover:bg-red-900 hover:bg-opacity-50 transition flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear History
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ==================== SETTINGS PANEL ====================  */}
          {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
        </div>
      )}
    </div>
  );
}

export default AppIntegrated;
