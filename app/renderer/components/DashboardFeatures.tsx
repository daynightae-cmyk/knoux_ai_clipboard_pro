/**
 * Dashboard Features Component
 * لوحة الميزات الرئيسية | Main Features Dashboard
 * التصميم المتقدم الذي يطابق الصورة
 */

import React, { useState } from 'react';
import {
  Zap,
  Brain,
  Languages,
  BarChart3,
  Save,
  Pencil,
  Shield,
  Palette,
  Copy,
  Trash2,
  Sparkles,
  Loader2
} from 'lucide-react';

interface Feature {
  id: string;
  icon: React.ReactNode;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  color: string;
  gradient: string;
  action: () => void;
  isLoading?: boolean;
}

interface DashboardFeaturesProps {
  onFormatText?: () => void;
  onClassify?: () => void;
  onTranslate?: () => void;
  onAnalytics?: () => void;
  onSaveHistory?: () => void;
  onManageRules?: () => void;
  onSecurityCheck?: () => void;
  onCustomize?: () => void;
  stats?: {
    totalItems: number;
    todayItems: number;
    totalSize: string;
  };
}

const DashboardFeatures: React.FC<DashboardFeaturesProps> = ({
  onFormatText = () => {},
  onClassify = () => {},
  onTranslate = () => {},
  onAnalytics = () => {},
  onSaveHistory = () => {},
  onManageRules = () => {},
  onSecurityCheck = () => {},
  onCustomize = () => {},
  stats = {
    totalItems: 0,
    todayItems: 0,
    totalSize: '0 B'
  }
}) => {
  const [loading, setLoading] = useState<string | null>(null);

  const features: Feature[] = [
    {
      id: 'format',
      icon: <Zap className="w-8 h-8" />,
      title: 'Quick Format',
      titleAr: 'تنسيق سريع',
      description: 'Auto format your clipboard',
      descriptionAr: 'تنسيق تلقائي للنسخة',
      color: 'from-orange-500 to-red-500',
      gradient: 'hover:from-orange-600 hover:to-red-600',
      action: async () => {
        setLoading('format');
        await new Promise(r => setTimeout(r, 800));
        onFormatText();
        setLoading(null);
      }
    },
    {
      id: 'classify',
      icon: <Brain className="w-8 h-8" />,
      title: 'Smart Recognition',
      titleAr: 'التعرف الذكي',
      description: 'Classify content types',
      descriptionAr: 'تصنيف أنواع المحتوى',
      color: 'from-blue-500 to-cyan-500',
      gradient: 'hover:from-blue-600 hover:to-cyan-600',
      action: async () => {
        setLoading('classify');
        await new Promise(r => setTimeout(r, 800));
        onClassify();
        setLoading(null);
      }
    },
    {
      id: 'translate',
      icon: <Languages className="w-8 h-8" />,
      title: 'Quick Translate',
      titleAr: 'ترجمة سريعة',
      description: 'Instant translation',
      descriptionAr: 'ترجمة فورية',
      color: 'from-purple-500 to-pink-500',
      gradient: 'hover:from-purple-600 hover:to-pink-600',
      action: async () => {
        setLoading('translate');
        await new Promise(r => setTimeout(r, 800));
        onTranslate();
        setLoading(null);
      }
    },
    {
      id: 'analytics',
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Analytics',
      titleAr: 'الرسائل التحليلي',
      description: 'View statistics',
      descriptionAr: 'عرض الإحصائيات',
      color: 'from-green-500 to-emerald-500',
      gradient: 'hover:from-green-600 hover:to-emerald-600',
      action: async () => {
        setLoading('analytics');
        await new Promise(r => setTimeout(r, 800));
        onAnalytics();
        setLoading(null);
      }
    },
    {
      id: 'history',
      icon: <Save className="w-8 h-8" />,
      title: 'Save History',
      titleAr: 'حفظ النسجل',
      description: 'Archive clipboard',
      descriptionAr: 'أرشفة المحفوظات',
      color: 'from-indigo-500 to-blue-500',
      gradient: 'hover:from-indigo-600 hover:to-blue-600',
      action: async () => {
        setLoading('history');
        await new Promise(r => setTimeout(r, 800));
        onSaveHistory();
        setLoading(null);
      }
    },
    {
      id: 'rules',
      icon: <Pencil className="w-8 h-8" />,
      title: 'Text Rules',
      titleAr: 'قوائم النصوص',
      description: 'Edit rules',
      descriptionAr: 'أدارة قواعد',
      color: 'from-yellow-500 to-orange-500',
      gradient: 'hover:from-yellow-600 hover:to-orange-600',
      action: async () => {
        setLoading('rules');
        await new Promise(r => setTimeout(r, 800));
        onManageRules();
        setLoading(null);
      }
    },
    {
      id: 'security',
      icon: <Shield className="w-8 h-8" />,
      title: 'Quick Tools',
      titleAr: 'الأدوات السريعة',
      description: 'Tools',
      descriptionAr: 'أدوات متقدمة',
      color: 'from-red-500 to-pink-500',
      gradient: 'hover:from-red-600 hover:to-pink-600',
      action: async () => {
        setLoading('security');
        await new Promise(r => setTimeout(r, 800));
        onSecurityCheck();
        setLoading(null);
      }
    },
    {
      id: 'customize',
      icon: <Palette className="w-8 h-8" />,
      title: 'Security & Privacy',
      titleAr: 'الأمان والخصوصية',
      description: 'Secure your data',
      descriptionAr: 'حماية بيانات',
      color: 'from-teal-500 to-green-500',
      gradient: 'hover:from-teal-600 hover:to-green-600',
      action: async () => {
        setLoading('customize');
        await new Promise(r => setTimeout(r, 800));
        onCustomize();
        setLoading(null);
      }
    }
  ];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
          مدير المحفوظات الذكي
        </h2>
        <p className="text-gray-400 text-sm">
          Smart Clipboard Manager | إدارة متقدمة للمحفوظات
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {features.map((feature) => (
          <button
            key={feature.id}
            onClick={feature.action}
            disabled={loading !== null && loading !== feature.id}
            className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
            style={{
              background: `linear-gradient(135deg, rgba(15, 15, 26, 0.8), rgba(26, 26, 46, 0.8))`,
              border: '1px solid rgba(138, 43, 226, 0.3)',
              boxShadow: '0 10px 30px rgba(138, 43, 226, 0.1)'
            }}
          >
            {/* Animated Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-all duration-300`} />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-center gap-3">
              {/* Icon */}
              <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} text-white shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                {loading === feature.id ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  feature.icon
                )}
              </div>

              {/* Titles */}
              <div>
                <h3 className="font-bold text-white text-sm mb-1">
                  {feature.title}
                </h3>
                <p className="text-xs text-purple-300 font-semibold">
                  {feature.titleAr}
                </p>
              </div>

              {/* Descriptions */}
              <p className="text-xs text-gray-400 leading-relaxed">
                {feature.description}
              </p>
              <p className="text-xs text-gray-500">
                {feature.descriptionAr}
              </p>

              {/* Sparkle Effect */}
              {loading === feature.id && (
                <div className="mt-2">
                  <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                </div>
              )}
            </div>

            {/* Border Animation */}
            <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-purple-500/50 transition-colors duration-300" />
          </button>
        ))}
      </div>

      {/* Bottom Stats & Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Clipboard Stats */}
        <div
          className="p-6 rounded-2xl flex items-center gap-4"
          style={{
            background: `linear-gradient(135deg, rgba(15, 15, 26, 0.8), rgba(26, 26, 46, 0.8))`,
            border: '1px solid rgba(138, 43, 226, 0.3)',
            boxShadow: '0 10px 30px rgba(138, 43, 226, 0.1)'
          }}
        >
          <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl text-white">
            <Copy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-400 text-xs">Clipboard Stats</p>
            <p className="text-white font-bold">
              {stats.totalItems} <span className="text-gray-400">items</span>
            </p>
            <p className="text-gray-500 text-xs">
              {stats.todayItems} اليوم
            </p>
          </div>
        </div>

        {/* Total Size */}
        <div
          className="p-6 rounded-2xl flex items-center gap-4"
          style={{
            background: `linear-gradient(135deg, rgba(15, 15, 26, 0.8), rgba(26, 26, 46, 0.8))`,
            border: '1px solid rgba(138, 43, 226, 0.3)',
            boxShadow: '0 10px 30px rgba(138, 43, 226, 0.1)'
          }}
        >
          <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl text-white">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-400 text-xs">Storage Usage</p>
            <p className="text-white font-bold">{stats.totalSize}</p>
            <p className="text-gray-500 text-xs">Used</p>
          </div>
        </div>

        {/* Clear Memory */}
        <button
          onClick={() => {
            setLoading('clear');
            setTimeout(() => setLoading(null), 800);
          }}
          className="p-6 rounded-2xl hover:shadow-lg transition-all duration-300 group"
          style={{
            background: `linear-gradient(135deg, rgba(15, 15, 26, 0.8), rgba(26, 26, 46, 0.8))`,
            border: '1px solid rgba(138, 43, 226, 0.3)',
            boxShadow: '0 10px 30px rgba(138, 43, 226, 0.1)'
          }}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl text-white group-hover:scale-110 transition-transform duration-300">
              {loading === 'clear' ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Trash2 className="w-6 h-6" />
              )}
            </div>
            <div className="text-left">
              <p className="text-gray-400 text-xs">تنظيف الذاكرة</p>
              <p className="text-white font-bold">Clear Memory</p>
            </div>
          </div>
        </button>
      </div>

      {/* Footer Message */}
      <div className="mt-8 text-center">
        <p className="text-gray-400 text-sm">
          سيطر بكفاءة والمحفوظات بإحترافك! | Power Your Clipboard Experience!
        </p>
      </div>
    </div>
  );
};

export default DashboardFeatures;
