import React from 'react';
import { Github, Twitter, Globe, Mail, Heart, Zap, Shield, Cpu, Smartphone, Star } from 'lucide-react';
import i18n from '../utils/i18n';

const AboutKnoux: React.FC = () => {
  const isRTL = i18n.isRTL();

  const features = [
    {
      icon: Zap,
      title: i18n.t('about.features.smartClipboard'),
      titleAr: 'حافظة ذكية',
      description: 'Advanced clipboard management with AI-powered insights',
      descriptionAr: 'إدارة متقدمة للحافظة مع رؤى مدعومة بالذكاء الاصطناعي'
    },
    {
      icon: Cpu,
      title: i18n.t('about.features.aiPowered'),
      titleAr: 'مدعوم بالذكاء الاصطناعي',
      description: 'Intelligent content analysis and enhancement',
      descriptionAr: 'تحليل وتحسين ذكي للمحتوى'
    },
    {
      icon: Shield,
      title: i18n.t('about.features.secure'),
      titleAr: 'آمن ومشفر',
      description: 'End-to-end encryption and privacy protection',
      descriptionAr: 'تشفير شامل وحماية للخصوصية'
    },
    {
      icon: Smartphone,
      title: i18n.t('about.features.crossPlatform'),
      titleAr: 'متعدد المنصات',
      description: 'Works seamlessly across all your devices',
      descriptionAr: 'يعمل بسلاسة عبر جميع أجهزتك'
    }
  ];

  const links = [
    {
      icon: Github,
      label: 'GitHub',
      url: 'https://github.com/knoux',
      color: 'hover:text-gray-300'
    },
    {
      icon: Twitter,
      label: 'Twitter',
      url: 'https://twitter.com/knoux',
      color: 'hover:text-blue-400'
    },
    {
      icon: Globe,
      label: i18n.t('about.links.website'),
      url: 'https://knoux.com',
      color: 'hover:text-green-400'
    },
    {
      icon: Mail,
      label: i18n.t('about.links.support'),
      url: 'mailto:support@knoux.com',
      color: 'hover:text-purple-400'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20 text-white">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-2xl mb-6">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
            {i18n.t('about.title')}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            {i18n.t('about.vision.description')}
          </p>
        </div>

        {/* Developer Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50">
            <div className={`flex items-center gap-6 mb-6 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-white">K</span>
              </div>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {i18n.t('about.name')}
                </h2>
                <p className="text-purple-400 font-medium">
                  {i18n.t('about.developer')}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  {i18n.t('about.vision.title')}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {isRTL 
                    ? 'إعادة تعريف تجربة الحافظة من خلال الذكاء الاصطناعي والتصميم الأنيق. نوكس يجمع بين القوة والبساطة لتوفير تجربة استثنائية في إدارة المحتوى.'
                    : 'Redefining clipboard experience through AI and elegant design. Knoux combines power with simplicity to deliver an exceptional content management experience.'
                  }
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  {isRTL ? 'الروابط' : 'Connect'}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {links.map((link, index) => {
                    const Icon = link.icon;
                    return (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700/50 text-gray-300 transition-all duration-200 ${link.color} hover:bg-gray-700 hover:scale-105`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{link.label}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            {i18n.t('about.features.title')}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 group"
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {isRTL ? feature.titleAr : feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {isRTL ? feature.descriptionAr : feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">1.0.0</div>
                <div className="text-gray-400 text-sm">{i18n.t('about.version')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">2024</div>
                <div className="text-gray-400 text-sm">{i18n.t('about.buildDate')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">MIT</div>
                <div className="text-gray-400 text-sm">{i18n.t('about.license')}</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <div className="text-gray-400 text-sm">{isRTL ? 'تقييم' : 'Rating'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-gray-400 text-sm">
            <span>{isRTL ? 'صُنع بـ' : 'Made with'}</span>
            <Heart className="w-4 h-4 text-red-400 fill-current animate-pulse" />
            <span>{isRTL ? 'في المملكة العربية السعودية' : 'in Saudi Arabia'}</span>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            © 2024 Knoux - Abu Retaj. {isRTL ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutKnoux;