/**
 * Dashboard View - Knoux Clipboard AI (Final Refactored Version)
 * Real-time dashboard with clock and system status
 * Performance optimized with proper error handling and accessibility
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDatabase } from '../hooks/useDatabase';
import { useAISimple } from '../hooks/useAISimple';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';
import { useSettings } from '../hooks/useSettings';
import { useToast } from '../hooks/useToast';
import {
  Activity,
  Database,
  Cpu,
  Trash2,
  Pause,
  Play,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import StatusCard from '../components/StatusCard';
import ActionButton from '../components/ActionButton';
import ItemPreview from '../components/ItemPreview';
import { dashboardConfig } from '../config/dashboardConfig';
import './Dashboard.css';

interface SystemStatus {
  clipboard: 'active' | 'idle' | 'error';
  ai: 'active' | 'idle' | 'error';
  database: 'active' | 'idle' | 'error';
  memory: number;
}

const Dashboard: React.FC = () => {
  const { translate, language, isRTL } = useLanguage();
  const { theme } = useTheme();
  const { settings } = useSettings();
  const { items, stats, isLoading } = useDatabase();
  const { isAIReady, modelStatus } = useAISimple();
  const { addToast } = useToast();
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    clipboard: 'idle',
    ai: 'idle',
    database: 'idle',
    memory: 0
  });
  const [isSystemStatusLoading, setIsSystemStatusLoading] = useState(false);

  // Memoized formatting functions
  const formatTime = useCallback((date: Date) => {
    return date.toLocaleTimeString(isRTL ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }, [isRTL]);

  const formatDate = useCallback((date: Date) => {
    return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, [isRTL]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'idle': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'idle': return <Pause className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      default: return <div className="w-4 h-4" />;
    }
  }, []);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Update system status with reduced polling
  useEffect(() => {
    const updateStatus = async () => {
      try {
        setIsSystemStatusLoading(true);
        
        const [memoryUsage, clipboardStatus] = await Promise.allSettled([
          window.electron.ipcRenderer.invoke('system:get-memory-usage'),
          window.electron.ipcRenderer.invoke('clipboard-monitor:status')
        ]);

        const newStatus: SystemStatus = {
          clipboard: clipboardStatus.status === 'fulfilled' && clipboardStatus.value 
            ? 'active' 
            : 'idle',
          ai: isAIReady ? 'active' : 'error',
          database: 'active',
          memory: memoryUsage.status === 'fulfilled' ? memoryUsage.value || 0 : 0
        };

        setSystemStatus(newStatus);
      } catch (error) {
        console.error('Failed to update system status:', error);
        addToast({
          type: 'error',
          message: translate('dashboard.statusUpdateFailed') || 'Failed to update system status',
          duration: 3000
        });
      } finally {
        setIsSystemStatusLoading(false);
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, dashboardConfig.systemStatusInterval);
    
    return () => clearInterval(interval);
  }, [isAIReady, addToast, translate]);

  const handleClearClipboard = async () => {
    try {
      const result = await window.electron.ipcRenderer.invoke('clipboard:clear');
      if (result.success) {
        addToast({
          type: 'success',
          message: translate('dashboard.clipboardCleared') || 'Clipboard cleared successfully',
          duration: 2000
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      addToast({
        type: 'error',
        message: translate('dashboard.clearClipboardFailed') || 'Failed to clear clipboard',
        duration: 3000
      });
    }
  };

  const handleToggleMonitoring = async () => {
    try {
      const isActive = systemStatus.clipboard === 'active';
      const action = isActive ? 'stop' : 'start';
      
      const result = await window.electron.ipcRenderer.invoke(`clipboard-monitor:${action}`);
      
      if (result.success) {
        setSystemStatus(prev => ({
          ...prev,
          clipboard: isActive ? 'idle' : 'active'
        }));
        
        addToast({
          type: 'success',
          message: translate(`dashboard.monitoring${isActive ? 'Stopped' : 'Started'}`) || 
                  (isActive ? 'Clipboard monitoring stopped' : 'Clipboard monitoring started'),
          duration: 2000
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      addToast({
        type: 'error',
        message: translate('dashboard.toggleMonitoringFailed') || 'Failed to toggle monitoring',
        duration: 3000
      });
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  // Memoized status cards configuration
  const statusCards = useMemo(() => [
    {
      id: 'clipboard',
      icon: <Database className="w-6 h-6" />,
      title: translate('dashboard.clipboardStatus') || 'Clipboard Status',
      status: systemStatus.clipboard,
      stats: [
        { label: 'Total Items', value: stats.total.toString() },
        { label: 'Favorites', value: stats.favorites.toString() }
      ]
    },
    {
      id: 'ai',
      icon: <Cpu className="w-6 h-6" />,
      title: translate('dashboard.aiStatus') || 'AI Status',
      status: systemStatus.ai,
      stats: [
        { label: 'Ready', value: isAIReady ? '✓' : '✗' }
      ]
    },
    {
      id: 'database',
      icon: <Activity className="w-6 h-6" />,
      title: translate('dashboard.databaseStatus') || 'Database Status',
      status: systemStatus.database,
      stats: [
        { label: 'Memory', value: `${systemStatus.memory.toFixed(1)}MB` }
      ]
    }
  ], [systemStatus, stats, isAIReady, translate]);

  // Memoized actions configuration
  const actions = useMemo(() => [
    {
      id: 'clear',
      icon: <Trash2 className="w-4 h-4" />,
      label: translate('dashboard.clearClipboard') || 'Clear Clipboard',
      onClick: handleClearClipboard,
      disabled: isLoading
    },
    {
      id: 'monitoring',
      icon: systemStatus.clipboard === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />,
      label: translate('dashboard.pauseMonitoring') || 'Pause Monitoring',
      onClick: handleToggleMonitoring,
      disabled: isSystemStatusLoading
    },
    {
      id: 'refresh',
      icon: <RefreshCw className="w-4 h-4" />,
      label: 'Refresh',
      onClick: handleRefresh,
      disabled: false
    }
  ], [systemStatus.clipboard, isLoading, isSystemStatusLoading, translate]);

  // Memoized recent items with virtual scrolling support
  const recentItems = useMemo(() => {
    return items.slice(0, dashboardConfig.maxRecentItems).map(item => ({
      ...item,
      key: `item-${item.id}`,
      truncatedContent: item.content.length > dashboardConfig.maxContentLength 
        ? item.content.substring(0, dashboardConfig.maxContentLength) + '...'
        : item.content
    }));
  }, [items]);

  return (
    <div className={`dashboard-view ${isRTL ? 'rtl' : 'ltr'}`} role="main" aria-label="Dashboard">
      <div className="dashboard-container">
        
        {/* Header with Clock */}
        <header className="dashboard-header">
          <section className="clock-section" aria-labelledby="clock-title">
            <div className="digital-clock">
              <div className="time-display" aria-live="polite" aria-atomic="true">
                {formatTime(currentTime)}
              </div>
              <div className="date-display">
                {formatDate(currentTime)}
              </div>
            </div>
            <div className="clock-title">
              <h2 id="clock-title">{translate('dashboard.officialTime') || 'Official Time'}</h2>
            </div>
          </section>
        </header>

        {/* System Status Cards */}
        <section className="status-grid" aria-label="System Status">
          {statusCards.map(card => (
            <StatusCard
              key={card.id}
              {...card}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
              isLoading={isSystemStatusLoading}
            />
          ))}
        </section>

        {/* Quick Actions */}
        <section className="quick-actions" aria-labelledby="actions-title">
          <h2 id="actions-title">{translate('dashboard.quickActions') || 'Quick Actions'}</h2>
          <div className="actions-grid">
            {actions.map(action => (
              <ActionButton
                key={action.id}
                {...action}
                className="action-button"
                ariaLabel={action.label}
              />
            ))}
          </div>
        </section>

        {/* Recent Items Preview */}
        <section className="recent-items" aria-labelledby="recent-title">
          <h2 id="recent-title">Recent Clipboard Items</h2>
          <div className="items-preview" role="list">
            {recentItems.length > 0 ? (
              recentItems.map(item => (
                <ItemPreview
                  key={item.key}
                  item={item}
                  isRTL={isRTL}
                  getStatusColor={getStatusColor}
                />
              ))
            ) : (
              <div className="empty-state" role="status">
                <p>No clipboard items yet</p>
                <small>Copy something to get started!</small>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};

export default Dashboard;
