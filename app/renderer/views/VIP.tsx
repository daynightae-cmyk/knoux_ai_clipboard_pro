import React from 'react';
import { Crown, Check, Star, Zap, Shield, Globe } from 'lucide-react';
import i18n from '../utils/i18n';

const VIP: React.FC = () => {
  const features = [
    {
      icon: <Star className="w-6 h-6 text-yellow-400" />,
      title: i18n.t('vip.unlimitedHistory') || 'Unlimited History',
      description: 'Store unlimited clipboard items forever.'
    },
    {
      icon: <Brain className="w-6 h-6 text-purple-400" />,
      title: i18n.t('vip.advancedAI') || 'Advanced AI Models',
      description: 'Access to GPT-4 and Claude 3 Opus for smarter analysis.'
    },
    {
      icon: <Globe className="w-6 h-6 text-blue-400" />,
      title: i18n.t('vip.cloudSync') || 'Cloud Sync',
      description: 'Sync your clipboard across all your devices instantly.'
    },
    {
      icon: <Zap className="w-6 h-6 text-orange-400" />,
      title: i18n.t('vip.prioritySupport') || 'Priority Support',
      description: 'Get 24/7 dedicated support from our engineering team.'
    },
    {
      icon: <Shield className="w-6 h-6 text-green-400" />,
      title: i18n.t('vip.enhancedSecurity') || 'Military-Grade Encryption',
      description: 'End-to-end encryption for your sensitive data.'
    },
    {
      icon: <Crown className="w-6 h-6 text-pink-400" />,
      title: i18n.t('vip.premiumThemes') || 'Exclusive Themes',
      description: 'Unlock 20+ premium glassmorphism themes.'
    }
  ];

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-yellow-500/20 rounded-full blur-3xl"></div>
          <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4 relative z-10 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
          <h1 className="text-4xl font-black text-white mb-4 tracking-tight">
            Knoux <span className="text-yellow-400">VIP</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Unlock the full potential of your clipboard with our premium membership.
            Experience power, speed, and intelligence without limits.
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl p-8 mb-12 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Crown className="w-64 h-64 text-yellow-500" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{i18n.t('vip.currentStatus')}: <span className="text-gray-400">{i18n.t('vip.free')}</span></h2>
              <p className="text-gray-400">Upgrade now to access all premium features.</p>
            </div>
            <button className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all transform hover:scale-105 active:scale-95">
              {i18n.t('vip.upgrade')} - $9.99/mo
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="bg-black/40 border border-white/5 hover:border-yellow-500/30 rounded-xl p-6 transition-all hover:-translate-y-1 group">
              <div className="mb-4 p-3 bg-white/5 rounded-lg w-fit group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Footer Trust */}
        <div className="mt-16 text-center border-t border-white/5 pt-8">
          <p className="text-sm text-gray-500">
            Trusted by 10,000+ developers worldwide. Secure payment via Stripe. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
};

// Import Brain specifically for the icon array to avoid TS error if not imported
import { Brain } from 'lucide-react';

export default VIP;
