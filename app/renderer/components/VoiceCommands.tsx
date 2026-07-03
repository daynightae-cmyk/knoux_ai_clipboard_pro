import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Languages, Settings, Shield, Activity } from 'lucide-react';

interface VoiceCommandsProps {
  userId: string;
}

export const VoiceCommands: React.FC<VoiceCommandsProps> = ({ userId }) => {
  const [isListening, setIsListening] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('ar');
  const [lastCommand, setLastCommand] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [commands, setCommands] = useState<any[]>([]);

  useEffect(() => {
    loadVoiceData();
  }, []);

  const loadVoiceData = async () => {
    const availableCommands = await window.electron.invoke('voice:getCommands', { category: 'clipboard', language: currentLanguage });
    setCommands(availableCommands.commands || []);
    
    const voiceStats = await window.electron.invoke('voice:getStats', { userId });
    setStats(voiceStats);
  };

  const toggleListening = async () => {
    if (isListening) {
      await window.electron.invoke('voice:stopListening');
      setIsListening(false);
    } else {
      await window.electron.invoke('voice:startListening', { language: currentLanguage });
      setIsListening(true);
    }
  };

  const processVoiceCommand = async (command: string) => {
    const result = await window.electron.invoke('voice:processCommand', { command, language: currentLanguage });
    setLastCommand(result);
  };

  const switchLanguage = async (lang: string) => {
    await window.electron.invoke('voice:switchLanguage', { language: lang });
    setCurrentLanguage(lang);
    loadVoiceData();
  };

  return (
    <div className="voice-commands-container p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-600 rounded-lg">
            <Mic className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">🔊 الأوامر الصوتية</h2>
            <p className="text-sm text-gray-600">تحكم كامل بالحافظة عبر الصوت</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors">
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors">
            <Shield className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Microphone Control */}
      <div className="mb-6 p-6 bg-white rounded-xl shadow-lg">
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={toggleListening}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all transform hover:scale-105 ${
              isListening 
                ? 'bg-red-500 animate-pulse shadow-lg shadow-red-300' 
                : 'bg-purple-600 hover:bg-purple-700 shadow-lg'
            }`}
          >
            {isListening ? (
              <MicOff className="w-12 h-12 text-white" />
            ) : (
              <Mic className="w-12 h-12 text-white" />
            )}
          </button>
          
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-800">
              {isListening ? '🎙️ جاري الاستماع...' : '🎤 اضغط للبدء'}
            </p>
            <p className="text-sm text-gray-600">
              {isListening ? 'قل أمرك الآن' : 'انقر على الميكروفون للتحدث'}
            </p>
          </div>
        </div>

        {/* Last Command */}
        {lastCommand && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-green-600" />
              <span className="font-semibold text-green-800">آخر أمر:</span>
            </div>
            <p className="text-gray-700">"{lastCommand.input}"</p>
            <p className="text-sm text-gray-600 mt-1">
              ✅ {lastCommand.response} ({Math.round(lastCommand.confidence * 100)}% دقة)
            </p>
          </div>
        )}
      </div>

      {/* Language Selector */}
      <div className="mb-6 p-4 bg-white rounded-xl shadow">
        <div className="flex items-center gap-2 mb-3">
          <Languages className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-800">اللغة</h3>
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          {['ar', 'en', 'fr', 'es'].map(lang => (
            <button
              key={lang}
              onClick={() => switchLanguage(lang)}
              className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                currentLanguage === lang
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {lang === 'ar' ? '🇸🇦 عربي' : lang === 'en' ? '🇬🇧 English' : lang === 'fr' ? '🇫🇷 Français' : '🇪🇸 Español'}
            </button>
          ))}
        </div>
      </div>

      {/* Available Commands */}
      <div className="mb-6 p-4 bg-white rounded-xl shadow">
        <h3 className="font-semibold text-gray-800 mb-3">📋 الأوامر المتاحة</h3>
        
        <div className="grid grid-cols-2 gap-2">
          {commands.slice(0, 8).map((cmd, idx) => (
            <div
              key={idx}
              className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200"
            >
              <p className="font-medium text-gray-800">{cmd.name}</p>
              <p className="text-xs text-gray-600">{cmd.patterns[0]}</p>
            </div>
          ))}
        </div>
        
        <button className="mt-3 w-full p-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium">
          عرض جميع الأوامر ({commands.length})
        </button>
      </div>

      {/* Quick Actions */}
      <div className="mb-6 p-4 bg-white rounded-xl shadow">
        <h3 className="font-semibold text-gray-800 mb-3">⚡ أوامر سريعة</h3>
        
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => processVoiceCommand('انسخ')}
            className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            📋 انسخ
          </button>
          <button
            onClick={() => processVoiceCommand('الصق')}
            className="p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            📌 الصق
          </button>
          <button
            onClick={() => processVoiceCommand('ابحث')}
            className="p-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            🔍 ابحث
          </button>
          <button
            onClick={() => processVoiceCommand('احفظ')}
            className="p-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            💾 احفظ
          </button>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="p-4 bg-white rounded-xl shadow">
          <h3 className="font-semibold text-gray-800 mb-3">📊 الإحصائيات</h3>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{stats.totalCommands}</p>
              <p className="text-xs text-gray-600">إجمالي الأوامر</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{Math.round(stats.recognitionAccuracy * 100)}%</p>
              <p className="text-xs text-gray-600">دقة التعرف</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{stats.favoriteCommands?.length || 0}</p>
              <p className="text-xs text-gray-600">أوامر مفضلة</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceCommands;
