import React, { useState, useEffect } from 'react';
import { logger } from '../../shared/logger';
import { formatDateTimeArEg } from '../../shared/format-utils';
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  Key,
  Fingerprint,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings,
  Database,
  Cloud,
  HardDrive,
  UserCheck,
  ShieldCheck,
  Clock,
  Calendar,
  Download,
  Upload
} from 'lucide-react';

interface SecurityStatus {
  encryption: boolean;
  autoLock: boolean;
  passwordProtected: boolean;
  sensitiveDetection: boolean;
  anonymizeData: boolean;
  lastScan: string;
  threatsDetected: number;
  lastBackup: string;
}

interface SecurityAlert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  resolved: boolean;
}

const SecurityCenter: React.FC = () => {
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    encryption: true,
    autoLock: true,
    passwordProtected: false,
    sensitiveDetection: true,
    anonymizeData: true,
    lastScan: '2024-01-24T14:30:00',
    threatsDetected: 2,
    lastBackup: '2024-01-23T20:15:00'
  });

  const [alerts, setAlerts] = useState<SecurityAlert[]>([
    {
      id: '1',
      title: 'كلمة مرور ضعيفة',
      description: 'يوصى بتعيين كلمة مرور أقوى للتطبيق',
      severity: 'medium',
      timestamp: '2024-01-24T10:30:00',
      resolved: false
    },
    {
      id: '2',
      title: 'حماية الحساسية مفعلة',
      description: 'تم اكتشاف 5 عناصر حساسة وتشفيرها',
      severity: 'low',
      timestamp: '2024-01-24T09:15:00',
      resolved: true
    },
    {
      id: '3',
      title: 'نسخ احتياطي قديم',
      description: 'آخر نسخ احتياطي كان منذ أكثر من أسبوع',
      severity: 'high',
      timestamp: '2024-01-24T08:00:00',
      resolved: false
    }
  ]);

  const [showPassword, setShowPassword] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);

  const toggleSetting = (setting: keyof SecurityStatus) => {
    setSecurityStatus(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    
    logger.info('Security setting toggled', { setting, value: !securityStatus[setting] });
  };

  const runSecurityScan = async () => {
    setIsScanning(true);
    logger.info('Starting security scan...');
    
    // Simulate scan
    setTimeout(() => {
      setIsScanning(false);
      setSecurityStatus(prev => ({
        ...prev,
        lastScan: new Date().toISOString(),
        threatsDetected: Math.floor(Math.random() * 5)
      }));
      logger.info('Security scan completed');
    }, 2000);
  };

  const createBackup = async () => {
    setBackupProgress(0);
    logger.info('Starting backup creation...');
    
    // Simulate backup progress
    const interval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setSecurityStatus(prev => ({
            ...prev,
            lastBackup: new Date().toISOString()
          }));
          logger.info('Backup completed');
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const resolveAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, resolved: true } : alert
    ));
    logger.info('Alert resolved', { id });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'critical': return 'حرج';
      case 'high': return 'مرتفع';
      case 'medium': return 'متوسط';
      case 'low': return 'منخفض';
      default: return 'غير معروف';
    }
  };

  const formatDate = formatDateTimeArEg;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl ml-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              مركز الأمان
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              إدارة وإعدادات أمان تطبيق Knoux
            </p>
          </div>
        </div>

        {/* Security Score */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-bold mb-2">89/100</div>
              <div className="text-white/90">درجة الأمان العامة</div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-90">حالة جيدة</div>
              <div className="text-xs opacity-80">آخر تحديث: {formatDate(new Date().toISOString())}</div>
            </div>
          </div>
          <div className="mt-4 h-2 bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full" style={{ width: '89%' }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Security Settings */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              إعدادات الأمان
            </h2>
            
            <div className="space-y-4">
              {/* Encryption */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <div className="flex items-center">
                  <Lock className="w-5 h-5 text-blue-500 ml-2" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">تشفير البيانات</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">تشفير جميع البيانات المخزنة</div>
                  </div>
                </div>
                <button
                  onClick={() => toggleSetting('encryption')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${securityStatus.encryption ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${securityStatus.encryption ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Auto Lock */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-purple-500 ml-2" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">قفل تلقائي</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">قفل التطبيق بعد 30 دقيقة من عدم النشاط</div>
                  </div>
                </div>
                <button
                  onClick={() => toggleSetting('autoLock')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${securityStatus.autoLock ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${securityStatus.autoLock ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Password Protection */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <div className="flex items-center">
                  <Key className="w-5 h-5 text-green-500 ml-2" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">حماية بكلمة مرور</div>
                    <div className="text-sm text-gray-600 dark:text-gray400">مطلوبة لفتح التطبيق</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {securityStatus.passwordProtected ? (
                    <>
                      <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300">
                        تغيير كلمة المرور
                      </button>
                      <button
                        onClick={() => toggleSetting('passwordProtected')}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        تعطيل
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => toggleSetting('passwordProtected')}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                    >
                      تفعيل
                    </button>
                  )}
                </div>
              </div>

              {/* Sensitive Detection */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <div className="flex items-center">
                  <Eye className="w-5 h-5 text-orange-500 ml-2" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">كشف البيانات الحساسة</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">اكتشاف وتشفير البيانات الحساسة تلقائياً</div>
                  </div>
                </div>
                <button
                  onClick={() => toggleSetting('sensitiveDetection')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${securityStatus.sensitiveDetection ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${securityStatus.sensitiveDetection ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Anonymize Data */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <div className="flex items-center">
                  <UserCheck className="w-5 h-5 text-indigo-500 ml-2" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">إخفاء الهوية</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">إخفاء البيانات الشخصية للتحليلات</div>
                  </div>
                </div>
                <button
                  onClick={() => toggleSetting('anonymizeData')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${securityStatus.anonymizeData ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${securityStatus.anonymizeData ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Security Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              إجراءات أمنية
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={runSecurityScan}
                disabled={isScanning}
                className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-between"
              >
                <div className="flex items-center">
                  <ShieldCheck className="w-5 h-5 ml-2" />
                  <span>فحص أمني</span>
                </div>
                {isScanning ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <div className="text-xs opacity-90">آخر فحص: {formatDate(securityStatus.lastScan)}</div>
                )}
              </button>

              <button
                onClick={createBackup}
                className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white hover:opacity-90 transition-opacity flex items-center justify-between"
              >
                <div className="flex items-center">
                  <HardDrive className="w-5 h-5 ml-2" />
                  <span>نسخ احتياطي</span>
                </div>
                <div className="text-xs opacity-90">آخر نسخ: {formatDate(securityStatus.lastBackup)}</div>
              </button>

              <button className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white hover:opacity-90 transition-opacity flex items-center justify-between">
                <div className="flex items-center">
                  <Download className="w-5 h-5 ml-2" />
                  <span>تصدير البيانات</span>
                </div>
                <div className="text-xs opacity-90">جميع التنسيقات</div>
              </button>

              <button className="p-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-white hover:opacity-90 transition-opacity flex items-center justify-between">
                <div className="flex items-center">
                  <XCircle className="w-5 h-5 ml-2" />
                  <span>مسح جميع البيانات</span>
                </div>
                <div className="text-xs opacity-90">نهائي وغير قابل للاسترجاع</div>
              </button>
            </div>

            {/* Backup Progress */}
            {backupProgress > 0 && backupProgress < 100 && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300">جاري إنشاء النسخ الاحتياطي...</span>
                  <span className="text-sm font-medium">{backupProgress}%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
                    style={{ width: `${backupProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Alerts & Status */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                التنبيهات الأمنية
              </h2>
              <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs font-medium rounded-full">
                {alerts.filter(a => !a.resolved).length} نشطة
              </span>
            </div>

            <div className="space-y-4">
              {alerts.map(alert => (
                <div 
                  key={alert.id}
                  className={`p-4 rounded-xl border ${
                    alert.resolved
                      ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                      : alert.severity === 'critical'
                      ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                      : alert.severity === 'high'
                      ? 'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${getSeverityColor(alert.severity)} ml-2`} />
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {alert.title}
                      </h4>
                    </div>
                    {!alert.resolved && (
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        حل
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {alert.description}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className={`px-2 py-1 rounded-full ${
                      alert.severity === 'critical' 
                        ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        : alert.severity === 'high'
                        ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
                        : alert.severity === 'medium'
                        ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                        : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    }`}>
                      {getSeverityText(alert.severity)}
                    </span>
                    <span className="text-gray-500 dark:text-gray-500">
                      {formatDate(alert.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security Status */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              حالة النظام
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">آخر فحص أمني</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatDate(securityStatus.lastScan)}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">تهديدات مكتشفة</span>
                <span className={`font-medium ${securityStatus.threatsDetected > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                  {securityStatus.threatsDetected}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">آخر نسخ احتياطي</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatDate(securityStatus.lastBackup)}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">حماية التشفير</span>
                <span className={`font-medium ${securityStatus.encryption ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {securityStatus.encryption ? 'مفعل' : 'معطل'}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">كشف الحساسية</span>
                <span className={`font-medium ${securityStatus.sensitiveDetection ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {securityStatus.sensitiveDetection ? 'مفعل' : 'معطل'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="mt-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-6 text-white">
        <div className="flex items-center mb-4">
          <AlertTriangle className="w-6 h-6 ml-2" />
          <h3 className="text-xl font-bold">نصائح أمنية</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white/10 rounded-xl">
            <div className="font-medium mb-2">💡 قم بتعيين كلمة مرور قوية</div>
            <div className="text-sm opacity-90">استخدم مزيجاً من الأحرف والأرقام والرموز</div>
          </div>
          <div className="p-4 bg-white/10 rounded-xl">
            <div className="font-medium mb-2">🔄 أنشئ نسخاً احتياطية منتظمة</div>
            <div className="text-sm opacity-90">احفظ بياناتك بشكل آمن خارج التطبيق</div>
          </div>
          <div className="p-4 bg-white/10 rounded-xl">
            <div className="font-medium mb-2">🔒 فعّل التشفير دائماً</div>
            <div className="text-sm opacity-90">يحمي بياناتك من الوصول غير المصرح به</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityCenter;
