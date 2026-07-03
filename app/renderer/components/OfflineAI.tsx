import React, { useState, useEffect } from 'react';
import { Brain, Cpu, Zap, Shield, Download, Activity, CheckCircle } from 'lucide-react';

interface OfflineAIProps {
  userId: string;
}

export const OfflineAI: React.FC<OfflineAIProps> = ({ userId }) => {
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [capabilities, setCapabilities] = useState<any>(null);
  const [loadedModels, setLoadedModels] = useState<any[]>([]);
  const [processing, setProcessing] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    loadAIData();
  }, []);

  const loadAIData = async () => {
    const status = await window.electron.invoke('ai:getStatus');
    setSystemStatus(status);
    
    const caps = await window.electron.invoke('ai:getCapabilities');
    setCapabilities(caps);
    
    const modelManager = await window.electron.invoke('ai:getModelManager');
    setLoadedModels(modelManager.loadedModels || []);
  };

  const testAIFeature = async (feature: string) => {
    setProcessing(true);
    
    try {
      let result;
      switch (feature) {
        case 'nlp':
          result = await window.electron.invoke('ai:analyzeText', { text: 'هذا نص تجريبي للذكاء الاصطناعي' });
          break;
        case 'vision':
          result = await window.electron.invoke('ai:analyzeImage', { image: 'test-image-data' });
          break;
        case 'audio':
          result = await window.electron.invoke('ai:speechToText', { audio: 'test-audio-data' });
          break;
        case 'privacy':
          result = await window.electron.invoke('ai:encryptData', { data: { test: 'data' } });
          break;
        default:
          result = { success: true, message: 'Test completed' };
      }
      
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, error: error.message });
    }
    
    setProcessing(false);
  };

  return (
    <div className="offline-ai-container p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-600 rounded-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">⚡ الذكاء الاصطناعي المحلي</h2>
            <p className="text-sm text-gray-600">يعمل بالكامل دون اتصال بالإنترنت</p>
          </div>
        </div>
      </div>

      {/* System Status */}
      {systemStatus && (
        <div className="mb-6 p-4 bg-white rounded-xl shadow">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-800">حالة النظام</h3>
          </div>
          
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{systemStatus.models}</p>
              <p className="text-xs text-gray-600">نماذج محملة</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{systemStatus.memory}MB</p>
              <p className="text-xs text-gray-600">ذاكرة مستخدمة</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{systemStatus.performance}%</p>
              <p className="text-xs text-gray-600">أداء النظام</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-600">
                {systemStatus.connectivity ? '🌐' : '📴'}
              </p>
              <p className="text-xs text-gray-600">
                {systemStatus.connectivity ? 'متصل' : 'غير متصل'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Capabilities */}
      {capabilities && (
        <div className="mb-6 p-4 bg-white rounded-xl shadow">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-gray-800">القدرات المتاحة</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-blue-800">💬 معالجة اللغة</span>
                <span className="text-sm text-blue-600">{capabilities.nlp?.length || 0}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {capabilities.nlp?.slice(0, 3).map((task: string, i: number) => (
                  <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                    {task}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-green-800">🖼️ رؤية حاسوبية</span>
                <span className="text-sm text-green-600">{capabilities.vision?.length || 0}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {capabilities.vision?.slice(0, 3).map((task: string, i: number) => (
                  <span key={i} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                    {task}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-purple-800">🎵 معالجة الصوت</span>
                <span className="text-sm text-purple-600">{capabilities.audio?.length || 0}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {capabilities.audio?.slice(0, 3).map((task: string, i: number) => (
                  <span key={i} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                    {task}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-orange-800">🛡️ الخصوصية</span>
                <span className="text-sm text-orange-600">{capabilities.privacy?.length || 0}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {capabilities.privacy?.slice(0, 3).map((task: string, i: number) => (
                  <span key={i} className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                    {task}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-3 p-2 bg-gray-50 rounded-lg text-center">
            <span className="text-sm text-gray-700">
              إجمالي: <strong>{capabilities.total}</strong> مهمة | 
              جاهزة دون اتصال: <strong>{capabilities.offlineReady}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Loaded Models */}
      {loadedModels.length > 0 && (
        <div className="mb-6 p-4 bg-white rounded-xl shadow">
          <div className="flex items-center gap-2 mb-3">
            <Cpu className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-800">النماذج المحملة</h3>
          </div>
          
          <div className="space-y-2">
            {loadedModels.map((model, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-800">{model.name}</p>
                    <p className="text-xs text-gray-600">{model.type} • {model.size}MB</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">{Math.round(model.accuracy * 100)}%</p>
                  <p className="text-xs text-gray-500">دقة</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test Features */}
      <div className="mb-6 p-4 bg-white rounded-xl shadow">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-800">اختبار المميزات</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => testAIFeature('nlp')}
            disabled={processing}
            className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            💬 اختبار NLP
          </button>
          <button
            onClick={() => testAIFeature('vision')}
            disabled={processing}
            className="p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            🖼️ اختبار الرؤية
          </button>
          <button
            onClick={() => testAIFeature('audio')}
            disabled={processing}
            className="p-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
          >
            🎵 اختبار الصوت
          </button>
          <button
            onClick={() => testAIFeature('privacy')}
            disabled={processing}
            className="p-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            🛡️ اختبار الخصوصية
          </button>
        </div>
        
        {processing && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg text-center">
            <p className="text-blue-700">⚡ جاري المعالجة...</p>
          </div>
        )}
        
        {testResult && !processing && (
          <div className={`mt-3 p-3 rounded-lg ${testResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
            <p className={`font-medium ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
              {testResult.success ? '✅ نجح الاختبار' : '❌ فشل الاختبار'}
            </p>
            {testResult.output && (
              <p className="text-sm text-gray-600 mt-1">
                النتيجة: {JSON.stringify(testResult.output).substring(0, 100)}...
              </p>
            )}
            {testResult.processingTime && (
              <p className="text-xs text-gray-500 mt-1">
                الوقت: {testResult.processingTime}ms
              </p>
            )}
          </div>
        )}
      </div>

      {/* Privacy Notice */}
      <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border-2 border-green-200">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">🔒 خصوصية كاملة</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✓ جميع المعالجات تتم محلياً على جهازك</li>
              <li>✓ لا توجد بيانات ترسل إلى الخارج</li>
              <li>✓ تشفير كامل للبيانات المخزنة</li>
              <li>✓ يعمل بالكامل دون اتصال بالإنترنت</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfflineAI;
