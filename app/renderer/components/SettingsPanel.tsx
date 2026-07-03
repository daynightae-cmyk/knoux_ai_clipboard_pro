import React, { useState, useEffect } from 'react';
import { X, Save, RotateCcw, Download, Upload, Monitor, Moon, Sun, Globe, Bell, Shield, Cpu, HardDrive, Zap } from 'lucide-react';

interface SettingsData {
  language: 'en' | 'ar';
  theme: 'light' | 'dark';
  startWithSystem: boolean;
  runInBackground: boolean;
  notifications: boolean;
  clipboardMonitoring: boolean;
  performanceMode: 'low' | 'balanced' | 'high';
  clipboardLimit: number;
  autoCleanup: boolean;
  cleanupDays: number;
  aiEnabled: boolean;
  aiModel: 'local' | 'cloud';
  autoSummarize: boolean;
  showTrayIcon: boolean;
  minimizeToTray: boolean;
  showInTaskbar: boolean;
  encryption: boolean;
  dataRetention: number;
  anonymizeData: boolean;
}

interface SettingsPanelProps {
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const result = await window.electron?.ipcRenderer.invoke('settings:get-all');
      if (result?.success) {
        setSettings(result.data);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const updateSetting = (key: keyof SettingsData, value: any) => {
    if (!settings) return;
    
    setSettings(prev => ({ ...prev!, [key]: value }));
    setHasChanges(true);
  };

  const saveSettings = async () => {
    if (!settings || !hasChanges) return;
    
    setSaving(true);
    try {
      const result = await window.electron?.ipcRenderer.invoke('settings:update', settings);
      if (result?.success) {
        setHasChanges(false);
        
        // Apply theme immediately
        if (settings.theme === 'dark') {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
        } else {
          document.documentElement.classList.add('light');
          document.documentElement.classList.remove('dark');
        }
        
        // Apply language immediately
        if (settings.language === 'ar') {
          document.documentElement.dir = 'rtl';
          document.documentElement.lang = 'ar';
        } else {
          document.documentElement.dir = 'ltr';
          document.documentElement.lang = 'en';
        }
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = async () => {
    if (!confirm('Are you sure you want to reset all settings to defaults?')) return;
    
    try {
      const result = await window.electron?.ipcRenderer.invoke('settings:reset');
      if (result?.success) {
        setSettings(result.data);
        setHasChanges(false);
      }
    } catch (error) {
      console.error('Failed to reset settings:', error);
    }
  };

  const exportSettings = async () => {
    try {
      const result = await window.electron?.ipcRenderer.invoke('settings:export');
      if (result?.success) {
        const blob = new Blob([result.data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'knoux-settings.json';
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to export settings:', error);
    }
  };

  const importSettings = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const result = await window.electron?.ipcRenderer.invoke('settings:import', text);
      if (result?.success) {
        await loadSettings();
        setHasChanges(false);
      }
    } catch (error) {
      console.error('Failed to import settings:', error);
    }
  };

  if (!settings) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-gray-900 rounded-xl p-8">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-white mt-4">Loading settings...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Monitor },
    { id: 'clipboard', label: 'Clipboard', icon: HardDrive },
    { id: 'ai', label: 'AI', icon: Cpu },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <button
                onClick={saveSettings}
                disabled={saving}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save'}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar */}
          <div className="w-64 bg-gray-800 p-4 border-r border-gray-700">
            <nav className="space-y-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            <div className="mt-8 pt-4 border-t border-gray-700 space-y-2">
              <button
                onClick={exportSettings}
                className="w-full flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <label className="w-full flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={importSettings}
                  className="hidden"
                />
              </label>
              <button
                onClick={resetSettings}
                className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white mb-4">General Settings</h3>
                
                {/* Theme */}
                <div className="space-y-3">
                  <label className="text-white font-medium">Theme</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => updateSetting('theme', 'light')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                        settings.theme === 'light'
                          ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                          : 'border-gray-600 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <Sun className="w-4 h-4" />
                      Light
                    </button>
                    <button
                      onClick={() => updateSetting('theme', 'dark')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                        settings.theme === 'dark'
                          ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                          : 'border-gray-600 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <Moon className="w-4 h-4" />
                      Dark
                    </button>
                  </div>
                </div>

                {/* Language */}
                <div className="space-y-3">
                  <label className="text-white font-medium">Language</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => updateSetting('language', 'en')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                        settings.language === 'en'
                          ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                          : 'border-gray-600 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <Globe className="w-4 h-4" />
                      English
                    </button>
                    <button
                      onClick={() => updateSetting('language', 'ar')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                        settings.language === 'ar'
                          ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                          : 'border-gray-600 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <Globe className="w-4 h-4" />
                      العربية
                    </button>
                  </div>
                </div>

                {/* Startup Behavior */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-white">Startup Behavior</h4>
                  
                  <label className="flex items-center justify-between">
                    <span className="text-gray-300">Start with system</span>
                    <input
                      type="checkbox"
                      checked={settings.startWithSystem}
                      onChange={(e) => updateSetting('startWithSystem', e.target.checked)}
                      className="w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <span className="text-gray-300">Run in background</span>
                    <input
                      type="checkbox"
                      checked={settings.runInBackground}
                      onChange={(e) => updateSetting('runInBackground', e.target.checked)}
                      className="w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <span className="text-gray-300">Show tray icon</span>
                    <input
                      type="checkbox"
                      checked={settings.showTrayIcon}
                      onChange={(e) => updateSetting('showTrayIcon', e.target.checked)}
                      className="w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                    />
                  </label>
                </div>

                {/* Notifications */}
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">Enable notifications</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications}
                      onChange={(e) => updateSetting('notifications', e.target.checked)}
                      className="w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                    />
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'clipboard' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white mb-4">Clipboard Settings</h3>
                
                {/* Monitoring */}
                <label className="flex items-center justify-between">
                  <span className="text-gray-300">Enable clipboard monitoring</span>
                  <input
                    type="checkbox"
                    checked={settings.clipboardMonitoring}
                    onChange={(e) => updateSetting('clipboardMonitoring', e.target.checked)}
                    className="w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                  />
                </label>

                {/* History Size */}
                <div className="space-y-3">
                  <label className="text-white font-medium">Max history size</label>
                  <input
                    type="number"
                    min="100"
                    max="10000"
                    step="100"
                    value={settings.clipboardLimit}
                    onChange={(e) => updateSetting('clipboardLimit', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-400">Number of clipboard items to keep in history</p>
                </div>

                {/* Auto-clean */}
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <span className="text-gray-300">Auto-clean old items</span>
                    <input
                      type="checkbox"
                      checked={settings.autoCleanup}
                      onChange={(e) => updateSetting('autoCleanup', e.target.checked)}
                      className="w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                    />
                  </label>
                  
                  {settings.autoCleanup && (
                    <div className="space-y-3">
                      <label className="text-white font-medium">Clean items older than (days)</label>
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={settings.cleanupDays}
                        onChange={(e) => updateSetting('cleanupDays', parseInt(e.target.value))}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white mb-4">AI Settings</h3>
                
                {/* Enable AI */}
                <label className="flex items-center justify-between">
                  <span className="text-gray-300">Enable AI features</span>
                  <input
                    type="checkbox"
                    checked={settings.aiEnabled}
                    onChange={(e) => updateSetting('aiEnabled', e.target.checked)}
                    className="w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                  />
                </label>

                {settings.aiEnabled && (
                  <>
                    {/* Model Selection */}
                    <div className="space-y-3">
                      <label className="text-white font-medium">AI Model</label>
                      <div className="flex gap-3">
                        <button
                          onClick={() => updateSetting('aiModel', 'local')}
                          className={`flex-1 px-4 py-3 rounded-lg border transition-colors ${
                            settings.aiModel === 'local'
                              ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                              : 'border-gray-600 text-gray-300 hover:border-gray-500'
                          }`}
                        >
                          <div className="text-center">
                            <div className="font-medium">Local</div>
                            <div className="text-sm opacity-75">Runs on your device</div>
                          </div>
                        </button>
                        <button
                          onClick={() => updateSetting('aiModel', 'cloud')}
                          className={`flex-1 px-4 py-3 rounded-lg border transition-colors ${
                            settings.aiModel === 'cloud'
                              ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                              : 'border-gray-600 text-gray-300 hover:border-gray-500'
                          }`}
                        >
                          <div className="text-center">
                            <div className="font-medium">Cloud</div>
                            <div className="text-sm opacity-75">Better accuracy</div>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Auto Summarize */}
                    <label className="flex items-center justify-between">
                      <span className="text-gray-300">Auto-summarize long text</span>
                      <input
                        type="checkbox"
                        checked={settings.autoSummarize}
                        onChange={(e) => updateSetting('autoSummarize', e.target.checked)}
                        className="w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                      />
                    </label>
                  </>
                )}
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white mb-4">Security & Privacy</h3>
                
                {/* Encryption */}
                <label className="flex items-center justify-between">
                  <div>
                    <div className="text-gray-300">Enable encryption</div>
                    <div className="text-sm text-gray-500">Encrypt clipboard data at rest</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.encryption}
                    onChange={(e) => updateSetting('encryption', e.target.checked)}
                    className="w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                  />
                </label>

                {/* Data Retention */}
                <div className="space-y-3">
                  <label className="text-white font-medium">Data retention (days)</label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={settings.dataRetention}
                    onChange={(e) => updateSetting('dataRetention', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-400">Automatically delete data older than this</p>
                </div>

                {/* Anonymize Data */}
                <label className="flex items-center justify-between">
                  <div>
                    <div className="text-gray-300">Anonymize data</div>
                    <div className="text-sm text-gray-500">Remove personal information from analytics</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.anonymizeData}
                    onChange={(e) => updateSetting('anonymizeData', e.target.checked)}
                    className="w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;