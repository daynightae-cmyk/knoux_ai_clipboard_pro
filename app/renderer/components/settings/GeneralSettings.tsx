/**
 * General Settings Component
 * Handles general application settings
 */

import React, { useState } from 'react';
import { useSettings } from '@hooks/useSettings';
import { logger } from '@shared/logger';
import {
  Globe,
  Palette,
  Type,
  Zap,
  Eye,
  Bell
} from 'lucide-react';

interface GeneralSettingsProps {
  onSave?: () => void;
  onCancel?: () => void;
}

const GeneralSettings: React.FC<GeneralSettingsProps> = ({ onSave, onCancel }) => {
  const { settings, updateSetting } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings);

  const handleChange = (key: keyof typeof settings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    Object.entries(localSettings).forEach(([key, value]) => {
      updateSetting(key as keyof typeof settings, value);
    });
    onSave?.();
    logger.info('General settings saved');
  };

  const handleReset = () => {
    setLocalSettings(settings);
    onCancel?.();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <Globe className="w-5 h-5 mr-2" />
          General Settings
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Language */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Language
          </label>
          <select
            value={localSettings.language}
            onChange={(e) => handleChange('language', e.target.value)}
            className="input-field"
          >
            <option value="en">English</option>
            <option value="ar">Arabic</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
        </div>

        {/* Theme */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Theme
          </label>
          <select
            value={localSettings.theme}
            onChange={(e) => handleChange('theme', e.target.value)}
            className="input-field"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto</option>
          </select>
        </div>

        {/* Font Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Font Size: {localSettings.fontSize}px
          </label>
          <input
            type="range"
            min="8"
            max="24"
            value={localSettings.fontSize}
            onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Animations */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Enable Animations
          </label>
          <button
            onClick={() => handleChange('animations', !localSettings.animations)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full ${
              localSettings.animations ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
              localSettings.animations ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        {/* Tooltips */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Show Tooltips
          </label>
          <button
            onClick={() => handleChange('tooltips', !localSettings.tooltips)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full ${
              localSettings.tooltips ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
              localSettings.tooltips ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Enable Notifications
          </label>
          <button
            onClick={() => handleChange('notifications', !localSettings.notifications)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full ${
              localSettings.notifications ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
              localSettings.notifications ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default GeneralSettings;
