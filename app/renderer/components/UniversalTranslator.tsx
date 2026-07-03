import React, { useState, useEffect } from 'react';
import { Languages, ArrowRight, Volume2, Image, FileText, MessageCircle, Zap } from 'lucide-react';

interface UniversalTranslatorProps {
  userId: string;
}

export const UniversalTranslator: React.FC<UniversalTranslatorProps> = ({ userId }) => {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('ar');
  const [targetLang, setTargetLang] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [languages, setLanguages] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadTranslatorData();
  }, []);

  const loadTranslatorData = async () => {
    const langs = await window.electron.invoke('translator:getLanguages');
    setLanguages(langs);
    
    const translationStats = await window.electron.invoke('translator:getStats', { timeframe: '7d' });
    setStats(translationStats);
  };

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;
    
    setIsTranslating(true);
    
    const result = await window.electron.invoke('translator:translate', {
      sourceText,
      sourceLanguage: sourceLang,
      targetLanguage: targetLang
    });
    
    setTranslatedText(result.target.text);
    setIsTranslating(false);
  };

  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  return (
    <div className="universal-translator-container p-6 bg-gradient-to-br from-blue-50 to-green-50 rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600 rounded-lg">
            <Languages className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">🌐 المترجم الكوني</h2>
            <p className="text-sm text-gray-600">ترجمة فورية بين 100+ لغة</p>
          </div>
        </div>
      </div>

      {/* Language Selector */}
      <div className="mb-6 p-4 bg-white rounded-xl shadow">
        <div className="flex items-center justify-between gap-4">
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            className="flex-1 p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
          >
            <option value="ar">🇸🇦 العربية</option>
            <option value="en">🇬🇧 English</option>
            <option value="fr">🇫🇷 Français</option>
            <option value="es">🇪🇸 Español</option>
            <option value="de">🇩🇪 Deutsch</option>
          </select>
          
          <button
            onClick={swapLanguages}
            className="p-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
          >
            <ArrowRight className="w-5 h-5 transform rotate-180" />
          </button>
          
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="flex-1 p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
          >
            <option value="en">🇬🇧 English</option>
            <option value="ar">🇸🇦 العربية</option>
            <option value="fr">🇫🇷 Français</option>
            <option value="es">🇪🇸 Español</option>
            <option value="de">🇩🇪 Deutsch</option>
          </select>
        </div>
      </div>

      {/* Translation Area */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-xl shadow">
          <h3 className="font-semibold text-gray-800 mb-3">النص الأصلي</h3>
          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="اكتب أو الصق النص هنا..."
            className="w-full h-40 p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-gray-600">{sourceText.length} حرف</span>
            <button
              onClick={handleTranslate}
              disabled={isTranslating || !sourceText.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTranslating ? '⚡ جاري الترجمة...' : '🌐 ترجم'}
            </button>
          </div>
        </div>
        
        <div className="p-4 bg-white rounded-xl shadow">
          <h3 className="font-semibold text-gray-800 mb-3">الترجمة</h3>
          <div className="w-full h-40 p-3 bg-gray-50 border-2 border-gray-200 rounded-lg overflow-y-auto">
            {translatedText || (
              <span className="text-gray-400">ستظهر الترجمة هنا...</span>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-gray-600">{translatedText.length} حرف</span>
            {translatedText && (
              <button className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors">
                <Volume2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6 p-4 bg-white rounded-xl shadow">
        <h3 className="font-semibold text-gray-800 mb-3">⚡ ترجمة سريعة</h3>
        <div className="grid grid-cols-4 gap-2">
          <button className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="text-sm">نص</span>
          </button>
          <button className="p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
            <Volume2 className="w-4 h-4" />
            <span className="text-sm">صوت</span>
          </button>
          <button className="p-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-2">
            <Image className="w-4 h-4" />
            <span className="text-sm">صورة</span>
          </button>
          <button className="p-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">دردشة</span>
          </button>
        </div>
      </div>

      {/* Languages Info */}
      {languages && (
        <div className="mb-6 p-4 bg-white rounded-xl shadow">
          <h3 className="font-semibold text-gray-800 mb-3">🌍 اللغات المدعومة</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{languages.total}</p>
              <p className="text-xs text-gray-600">إجمالي اللغات</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{languages.fullySupported}</p>
              <p className="text-xs text-gray-600">دعم كامل</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{languages.partiallySupported}</p>
              <p className="text-xs text-gray-600">دعم جزئي</p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      {stats && (
        <div className="p-4 bg-white rounded-xl shadow">
          <h3 className="font-semibold text-gray-800 mb-3">📊 الإحصائيات</h3>
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xl font-bold text-gray-800">{stats.totalTranslations}</p>
              <p className="text-xs text-gray-600">ترجمات</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xl font-bold text-gray-800">{stats.charactersTranslated.toLocaleString()}</p>
              <p className="text-xs text-gray-600">أحرف</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xl font-bold text-gray-800">{stats.languagesUsed}</p>
              <p className="text-xs text-gray-600">لغات</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xl font-bold text-gray-800">{Math.round(stats.accuracy * 100)}%</p>
              <p className="text-xs text-gray-600">دقة</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversalTranslator;
