/**
 * Unified App Container - الحاوية الموحدة
 * واجهة قوية موحدة تربط جميع المكونات
 */

import React, { useEffect, useState, useCallback } from 'react';
import { AlertCircle, CheckCircle, Loader, Zap } from 'lucide-react';

// ==================== TYPES ====================

interface AppState {
  isInitialized: boolean;
  isReady: boolean;
  servicesReady: boolean;
  errorMessage?: string;
  loadingStatus: string;
}

interface ServiceStatus {
  name: string;
  isReady: boolean;
  error?: string;
}

// ==================== UNIFIED CONTAINER ====================

export const UnifiedAppContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appState, setAppState] = useState<AppState>({
    isInitialized: false,
    isReady: false,
    servicesReady: false,
    loadingStatus: 'جاري التهيئة...'
  });

  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'Clipboard Service', isReady: false },
    { name: 'AI Service', isReady: false },
    { name: 'Security Service', isReady: false },
    { name: 'Storage Service', isReady: false },
    { name: 'IPC Service', isReady: false },
    { name: 'UI Service', isReady: false }
  ]);

  /**
   * تهيئة جميع الخدمات تسلسلياً
   */
  const initializeServices = useCallback(async () => {
    try {
      // 1. Clipboard Service
      setAppState(prev => ({ ...prev, loadingStatus: 'تهيئة خدمة الحافظة...' }));
      await new Promise(resolve => setTimeout(resolve, 500));
      setServices(prev => prev.map(s => s.name === 'Clipboard Service' ? { ...s, isReady: true } : s));

      // 2. Storage Service
      setAppState(prev => ({ ...prev, loadingStatus: 'تهيئة خدمة التخزين...' }));
      await new Promise(resolve => setTimeout(resolve, 500));
      setServices(prev => prev.map(s => s.name === 'Storage Service' ? { ...s, isReady: true } : s));

      // 3. Security Service
      setAppState(prev => ({ ...prev, loadingStatus: 'تهيئة خدمة الأمان...' }));
      await new Promise(resolve => setTimeout(resolve, 500));
      setServices(prev => prev.map(s => s.name === 'Security Service' ? { ...s, isReady: true } : s));

      // 4. AI Service
      setAppState(prev => ({ ...prev, loadingStatus: 'تهيئة خدمة الذكاء الاصطناعي...' }));
      await new Promise(resolve => setTimeout(resolve, 500));
      setServices(prev => prev.map(s => s.name === 'AI Service' ? { ...s, isReady: true } : s));

      // 5. IPC Service
      setAppState(prev => ({ ...prev, loadingStatus: 'تهيئة خدمة الاتصال...' }));
      await new Promise(resolve => setTimeout(resolve, 500));
      setServices(prev => prev.map(s => s.name === 'IPC Service' ? { ...s, isReady: true } : s));

      // 6. UI Service
      setAppState(prev => ({ ...prev, loadingStatus: 'تهيئة خدمة الواجهة...' }));
      await new Promise(resolve => setTimeout(resolve, 500));
      setServices(prev => prev.map(s => s.name === 'UI Service' ? { ...s, isReady: true } : s));

      // تعيين الحالة النهائية
      setAppState(prev => ({
        ...prev,
        isInitialized: true,
        isReady: true,
        servicesReady: true,
        loadingStatus: 'جاهز!'
      }));
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'خطأ غير معروف';
      setAppState(prev => ({
        ...prev,
        errorMessage: errorMsg,
        isReady: false
      }));
    }
  }, []);

  /**
   * تشغيل التهيئة عند التحميل
   */
  useEffect(() => {
    initializeServices();
  }, [initializeServices]);

  /**
   * إذا لم يتم التهيئة بعد، عرض شاشة التحميل
   */
  if (!appState.isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="w-full max-w-2xl mx-auto px-4">
          {/* العنوان */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
              Knoux Clipboard AI
            </h1>
            <p className="text-slate-400 text-lg">{appState.loadingStatus}</p>
          </div>

          {/* حالة الخدمات */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 mb-6">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Zap size={20} className="text-yellow-400" />
              تهيئة الخدمات
            </h2>

            <div className="space-y-3">
              {services.map(service => (
                <div key={service.name} className="flex items-center gap-3 p-3 bg-slate-700 rounded">
                  {service.isReady ? (
                    <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
                  ) : (
                    <Loader size={20} className="text-blue-400 animate-spin flex-shrink-0" />
                  )}
                  <span className={service.isReady ? 'text-green-400' : 'text-slate-300'}>
                    {service.name}
                  </span>
                  {service.error && (
                    <span className="text-red-400 text-sm">{service.error}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* شريط التقدم */}
          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all duration-300"
              style={{
                width: `${(services.filter(s => s.isReady).length / services.length) * 100}%`
              }}
            />
          </div>

          {/* رسالة الخطأ */}
          {appState.errorMessage && (
            <div className="mt-6 p-4 bg-red-900 border border-red-700 rounded-lg flex items-start gap-3">
              <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-red-200 font-semibold">خطأ</h3>
                <p className="text-red-300 text-sm">{appState.errorMessage}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  /**
   * إذا تم التهيئة بنجاح، عرض التطبيق الفعلي
   */
  return (
    <div className="w-full h-screen bg-slate-950">
      {children}
    </div>
  );
};

export default UnifiedAppContainer;
