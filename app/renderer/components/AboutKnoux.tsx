import React from 'react';
import { Github, Globe, Mail, Heart, Zap, Shield, Cpu, Smartphone, Star, MessageCircle, Instagram } from 'lucide-react';
import i18n from '../utils/i18n';
import knouxLogo from '../../../assets/icons/icon.png';

const AboutKnoux: React.FC = () => {
  const isRTL = i18n.isRTL();

  const features = [
    {
      icon: Zap,
      title: 'Smart Clipboard Engine',
      titleAr: 'محرك حافظة ذكي',
      description: 'Fast clipboard capture, search, tagging, and productivity workflows.',
      descriptionAr: 'التقاط سريع للحافظة، بحث، وسوم، وسير عمل إنتاجي.'
    },
    {
      icon: Cpu,
      title: 'AI Productivity Layer',
      titleAr: 'طبقة إنتاجية بالذكاء الاصطناعي',
      description: 'Summarization, enhancement, translation, and content analysis through local/optional AI services.',
      descriptionAr: 'تلخيص، تحسين، ترجمة، وتحليل محتوى عبر خدمات ذكاء اصطناعي محلية أو اختيارية.'
    },
    {
      icon: Shield,
      title: 'Local-First Security',
      titleAr: 'أمان محلي أولاً',
      description: 'Designed around local storage, safer IPC boundaries, and controlled data flow.',
      descriptionAr: 'مصمم حول التخزين المحلي، حدود IPC أكثر أمانًا، وتحكم واضح في تدفق البيانات.'
    },
    {
      icon: Smartphone,
      title: 'Windows Desktop Product',
      titleAr: 'منتج سطح مكتب لويندوز',
      description: 'Prepared for Electron Builder packaging as NSIS and portable Windows EXE.',
      descriptionAr: 'مجهز للتغليف عبر Electron Builder كنسخة Windows EXE ونسخة محمولة.'
    }
  ];

  const links = [
    {
      icon: Github,
      label: 'GitHub',
      url: 'https://github.com/KnouxOPS',
      color: 'hover:text-white'
    },
    {
      icon: Globe,
      label: 'knoux.store',
      url: 'https://knoux.store',
      color: 'hover:text-[#D8B8EC]'
    },
    {
      icon: Instagram,
      label: '@knoux7',
      url: 'https://www.instagram.com/knoux7',
      color: 'hover:text-[#A678DD]'
    },
    {
      icon: MessageCircle,
      label: 'WhatsApp',
      url: 'https://wa.me/971503281920',
      color: 'hover:text-green-300'
    },
    {
      icon: Mail,
      label: 'Email',
      url: 'mailto:knuux7@gmail.com',
      color: 'hover:text-[#D8B8EC]'
    }
  ];

  return (
    <div className="min-h-screen bg-[#090014] text-white" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-14 text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[28px] border border-white/10 bg-gradient-to-br from-[#8A2BE2] via-[#6F2DBD] to-[#262626] shadow-[0_0_48px_rgba(138,43,226,.45)]">
            <img src={knouxLogo} alt="KNOUX" className="h-16 w-16 rounded-2xl object-contain" />
          </div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.32em] text-[#D8B8EC]">A KNOUX PRODUCT</p>
          <h1 className="mb-4 bg-gradient-to-r from-white via-[#D8B8EC] to-[#A678DD] bg-clip-text text-5xl font-black text-transparent">
            Knoux AI Clipboard Pro
          </h1>
          <p className="mx-auto max-w-3xl text-lg leading-8 text-white/70">
            {isRTL
              ? 'تطبيق سطح مكتب ذكي لإدارة الحافظة، مصمم ضمن منظومة KNOUX ليجمع بين الإنتاجية، الأمان المحلي، والذكاء الاصطناعي.'
              : 'An intelligent desktop clipboard manager from KNOUX, combining productivity, local-first security, and AI-assisted workflows.'}
          </p>
        </div>

        <div className="mb-12 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <section className="rounded-[28px] border border-white/10 bg-white/[0.055] p-8 shadow-2xl backdrop-blur-2xl">
            <h2 className="mb-5 text-2xl font-bold text-white">
              {isRTL ? 'هوية المنتج والمطور' : 'Product and Developer Identity'}
            </h2>
            <div className="space-y-4 text-white/75">
              <p><strong className="text-white">Company:</strong> KNOUX</p>
              <p><strong className="text-white">Developer:</strong> Eng. Sadek Elgazar (Knoux)</p>
              <p><strong className="text-white">Location:</strong> Abu Dhabi, United Arab Emirates</p>
              <p><strong className="text-white">Website:</strong> https://knoux.store</p>
              <p><strong className="text-white">Slogan:</strong> Safety is not a luxury, it's a life.</p>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-white/[0.055] p-8 shadow-2xl backdrop-blur-2xl">
            <h3 className="mb-5 text-xl font-bold text-white">{isRTL ? 'قنوات التواصل' : 'Connect'}</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/70 transition-all hover:scale-[1.02] hover:bg-white/[0.08] ${link.color}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </a>
                );
              })}
            </div>
          </section>
        </div>

        <div className="mb-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title} className="rounded-[24px] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-[#A678DD]/50 hover:bg-white/[0.07]">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8A2BE2]/20 text-[#D8B8EC] ring-1 ring-[#A678DD]/30">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">{isRTL ? feature.titleAr : feature.title}</h3>
                <p className="text-sm leading-6 text-white/60">{isRTL ? feature.descriptionAr : feature.description}</p>
              </article>
            );
          })}
        </div>

        <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-[#8A2BE2]/20 to-white/[0.04] p-8 text-center backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-center gap-1">
            {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-[#D8B8EC] text-[#D8B8EC]" />)}
          </div>
          <p className="text-sm uppercase tracking-[0.28em] text-[#D8B8EC]">Version 1.0.0 · Production Readiness Track</p>
          <div className="mt-5 flex items-center justify-center gap-2 text-sm text-white/55">
            <span>{isRTL ? 'صُنع بواسطة' : 'Made by'}</span>
            <Heart className="h-4 w-4 fill-red-400 text-red-400" />
            <span>Eng. Sadek Elgazar — KNOUX © 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutKnoux;
