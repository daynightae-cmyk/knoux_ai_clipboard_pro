/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import {
  Globe,
  Github,
  Instagram,
  Mail,
  Phone,
  Sparkles,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { KNOUX_BRAND } from "../constants/brand";
import i18n from "../utils/i18n";

export default function AboutPage() {
  const t = (key: string, fallback: string) => i18n.t(key, fallback);

  const contactLinks = [
    { key: "website", url: "https://knoux.store", icon: Globe, value: "knoux.store", color: "text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10" },
    { key: "github", url: "https://github.com/KnouxOPS", icon: Github, value: "github.com/KnouxOPS", color: "text-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800" },
    { key: "instagram", url: "https://instagram.com/knoux7", icon: Instagram, value: "@knoux7", color: "text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-500/10" },
    { key: "whatsapp", url: "https://wa.me/971503281920", icon: Phone, value: "+971 50 328 1920", color: "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10" },
    { key: "email", url: "mailto:knuux7@gmail.com", icon: Mail, value: "knuux7@gmail.com", color: "text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10" },
  ];

  const features = [
    { key: "circularUI", icon: ShieldCheck },
    { key: "privacyLocal", icon: Zap },
    { key: "serverProxy", icon: Sparkles },
  ];

  return (
    <div id="about-workspace-container" className="p-4 sm:p-6 md:p-8 space-y-12 max-w-5xl mx-auto select-none">
      <div className="text-center space-y-6">
        <div className="relative inline-flex items-center justify-center">
          <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.1, 0.2] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-0 -m-8 bg-violet-500/20 dark:bg-violet-400/20 rounded-full blur-3xl" />
          <div className="w-40 h-40 rounded-full border-2 border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/50 p-1 shadow-2xl shadow-violet-500/10 overflow-hidden knoux-float">
            <img src={KNOUX_BRAND.logoUrl} alt="Knoux AI Clipboard Pro Master Seal" referrerPolicy="no-referrer" className="w-full h-full object-cover rounded-full" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">Knoux <span className="text-violet-600 dark:text-violet-400">{t("about.heroTitle", "AI Clipboard Pro")}</span></h1>
          <p className="text-base font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono">{t("about.heroTagline", "Your clipboard. Upgraded by AI.")}</p>
          <span className="inline-block text-xs text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-500/20 border border-violet-200 dark:border-violet-500/30 px-4 py-1.5 rounded-full font-bold uppercase tracking-wider">{t("about.stableRelease", "Stable Release v1.0.0")}</span>
        </div>
      </div>

      <hr className="border-slate-200 dark:border-slate-700/80 max-w-xl mx-auto" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        <div className="relative overflow-hidden p-8 rounded-3xl border border-violet-900/50 bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 shadow-2xl shadow-violet-500/10 space-y-5 text-white">
          <div className="absolute -right-16 -top-16 w-40 h-40 rounded-full bg-white/20 blur-2xl" />
          <div className="absolute -left-10 bottom-0 w-32 h-32 rounded-full bg-[#c17ceb]/25 blur-2xl" />
          <div className="relative space-y-1">
            <span className="text-xs text-violet-300 font-bold uppercase tracking-wider block font-mono">{t("about.creativeDirector", "Creative Director")}</span>
            <h3 className="text-xl font-bold tracking-tight text-white">{t("about.creatorTitle", "Eng. Sadek Elgazar (Knoux)")}</h3>
          </div>
          <p className="relative text-base text-slate-300 leading-relaxed">{t("about.creatorDescription", "Leading the Knoux visual system and developing premium productivity solutions that align clean aesthetics with honest local-first security boundaries.")}</p>
          <div className="relative pt-3 border-t border-white/20 flex items-center justify-between text-xs">
            <span className="text-slate-400">{t("about.officialStore", "Official Knoux Store:")}</span>
            <a href="https://knoux.store" target="_blank" rel="noopener noreferrer" className="font-bold text-violet-300 hover:text-white hover:underline">https://knoux.store</a>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">{t("about.developerConnections", "Direct Developer Connections")}</h3>
          <div className="space-y-2">
            {contactLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a key={link.key} href={link.url} target="_blank" rel="noopener noreferrer" className={`flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 transition-all text-sm ${link.color}`}>
                  <div className="flex items-center gap-3"><Icon className="w-4 h-4" /><span className="font-semibold text-slate-700 dark:text-slate-200">{t(`about.contact.${link.key}`, link.key)}</span></div>
                  <span className="font-mono text-slate-500 dark:text-slate-400 text-xs">{link.value}</span>
                </a>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-6 pt-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-center">{t("about.philosophy", "Platform Engineering Philosophy")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div key={i} className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 text-center space-y-3 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-300 flex items-center justify-center mx-auto"><Icon className="w-6 h-6" /></div>
                <span className="text-base font-bold text-slate-800 dark:text-slate-200 block">{t(`about.features.${feat.key}.title`, feat.key)}</span>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{t(`about.features.${feat.key}.desc`, feat.key)}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center text-xs text-slate-400 dark:text-slate-500 font-mono pt-8 pb-4">{t("about.footer", "© 2026 Knoux. All rights reserved. Crafted with Electron, React, & Tailwind CSS.")}</div>
    </div>
  );
}
