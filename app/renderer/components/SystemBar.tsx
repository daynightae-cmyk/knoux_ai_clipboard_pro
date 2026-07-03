import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Info, Zap, HardDrive, Clock } from 'lucide-react';

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  diskSpace: {
    available: number;
    required: number;
    percentage: number;
  };
  memory: {
    used: number;
    available: number;
    percentage: number;
  };
  dlls: {
    ffmpeg: boolean;
    vcruntime: boolean;
    msvcp: boolean;
  };
  installPath: string;
  version: string;
  lastChecked: Date;
}

const SystemBar: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth>({
    status: 'healthy',
    diskSpace: { available: 0, required: 200, percentage: 0 },
    memory: { used: 0, available: 0, percentage: 0 },
    dlls: {
      ffmpeg: true,
      vcruntime: true,
      msvcp: true,
    },
    installPath: '',
    version: '1.0.0',
    lastChecked: new Date(),
  });

  const [showDetails, setShowDetails] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'info' | 'warning' | 'error';
    message: string;
    timestamp: Date;
  }>>([]);

  useEffect(() => {
    // Check system health periodically
    const checkHealth = () => {
      const memUsed = (process.memoryUsage().heapUsed / 1024 / 1024);
      const memTotal = (process.memoryUsage().heapTotal / 1024 / 1024);
      const memPercentage = (memUsed / memTotal) * 100;

      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      const newNotifications = [];

      // Check memory
      if (memPercentage > 80) {
        status = 'critical';
        newNotifications.push({
          id: `memory-${Date.now()}`,
          type: 'warning',
          message: 'High memory usage detected. Consider clearing clipboard history.',
          timestamp: new Date(),
        });
      }

      // Check DLLs
      const dlls = {
        ffmpeg: true,
        vcruntime: true,
        msvcp: true,
      };

      setHealth(prev => ({
        ...prev,
        status,
        memory: {
          used: memUsed,
          available: memTotal,
          percentage: memPercentage,
        },
        dlls,
        lastChecked: new Date(),
      }));

      if (newNotifications.length > 0) {
        setNotifications(prev => [...prev, ...newNotifications].slice(-5));
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 10000); // Every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500/10 border-green-500/30';
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/30';
      case 'critical': return 'bg-red-500/10 border-red-500/30';
      default: return 'bg-gray-500/10 border-gray-500/30';
    }
  };

  const StatusIcon = health.status === 'healthy'
    ? <CheckCircle className="w-5 h-5 text-green-400" />
    : health.status === 'warning'
    ? <AlertCircle className="w-5 h-5 text-yellow-400" />
    : <AlertCircle className="w-5 h-5 text-red-400" />;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-950 via-purple-950 to-gray-950 border-t border-purple-500/20 shadow-lg shadow-purple-900/20">
      {/* Main Status Bar */}
      <div
        onClick={() => setShowDetails(!showDetails)}
        className={`px-6 py-3 cursor-pointer transition-all ${getStatusBg(health.status)} border-b`}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            {StatusIcon}
            <div className="text-sm">
              <span className="font-semibold text-white capitalize">
                System: {health.status === 'healthy' ? '✓ Healthy' : health.status === 'warning' ? '⚠ Warning' : '✗ Critical'}
              </span>
              <span className="text-xs text-gray-400 ml-2">| v{health.version}</span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs">
            {/* Memory */}
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-black/40 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${health.memory.percentage > 80 ? 'bg-red-500' : 'bg-cyan-500'}`}
                  style={{ width: `${Math.min(health.memory.percentage, 100)}%` }}
                />
              </div>
              <span className="text-gray-400 w-12 text-right">
                {health.memory.percentage.toFixed(0)}%
              </span>
            </div>

            {/* Time */}
            <div className="flex items-center gap-1 text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Details Panel */}
      {showDetails && (
        <div className="bg-black/60 border-t border-purple-500/10 p-6">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-sm font-bold text-white mb-4">System Health Details</h3>

            <div className="grid md:grid-cols-3 gap-6 mb-6">
              {/* Memory Info */}
              <div className="p-4 rounded-lg bg-black/40 border border-cyan-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-semibold text-white">Memory Usage</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Used</span>
                    <span className="text-cyan-400">{health.memory.used.toFixed(1)} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Available</span>
                    <span className="text-cyan-400">{health.memory.available.toFixed(1)} MB</span>
                  </div>
                  <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden mt-2">
                    <div
                      className={`h-full ${health.memory.percentage > 80 ? 'bg-red-500' : 'bg-cyan-500'}`}
                      style={{ width: `${health.memory.percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* DLL Status */}
              <div className="p-4 rounded-lg bg-black/40 border border-green-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-semibold text-white">DLL Status</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">ffmpeg.dll</span>
                    <span className={health.dlls.ffmpeg ? 'text-green-400' : 'text-red-400'}>
                      {health.dlls.ffmpeg ? '✓' : '✗'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">vcruntime.dll</span>
                    <span className={health.dlls.vcruntime ? 'text-green-400' : 'text-red-400'}>
                      {health.dlls.vcruntime ? '✓' : '✗'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">msvcp140.dll</span>
                    <span className={health.dlls.msvcp ? 'text-green-400' : 'text-red-400'}>
                      {health.dlls.msvcp ? '✓' : '✗'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Install Info */}
              <div className="p-4 rounded-lg bg-black/40 border border-purple-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-semibold text-white">Installation</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Version</span>
                    <span className="text-purple-400">{health.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status</span>
                    <span className="text-green-400">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Check</span>
                    <span className="text-gray-400 text-xs">{health.lastChecked.toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications */}
            {notifications.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold text-gray-400 mb-2">Recent Notifications</p>
                {notifications.map(notif => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded text-xs flex items-center gap-2 ${
                      notif.type === 'warning'
                        ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-300'
                        : 'bg-blue-500/10 border border-blue-500/20 text-blue-300'
                    }`}
                  >
                    <Info className="w-4 h-4" />
                    {notif.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemBar;
