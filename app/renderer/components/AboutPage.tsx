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
    { label: "Website", url: "https://knoux.store", icon: Globe, value: "knoux.store", color: "text-knoux-purple hover:bg-knoux-purple/5" },
    { label: "GitHub", url: "https://github.com/KnouxOPS", icon: Github, value: "github.com/KnouxOPS", color: "text-gray-900 hover:bg-gray-100" },
    { label: "Instagram", url: "https://instagram.com/knoux7", icon: Instagram, value: "@knoux7", color: "text-pink-600 hover:bg-pink-50" },
    { label: "WhatsApp", url: "https://wa.me/971503281920", icon: Phone, value: "+971 50 328 1920", color: "text-emerald-600 hover:bg-emerald-50" },
    { label: "Email Support", url: "mailto:knuux7@gmail.com", icon: Mail, value: "knuux7@gmail.com", color: "text-blue-600 hover:bg-blue-50" },
  ];

  const features = [
    { title: "Circular UI Design Language", desc: "Crafted strictly following the circular medallion design system to match Sadek's approved visual guides.", icon: ShieldCheck },
    { title: "Privacy local-first sandboxing", desc: "Clipboard records stay local in the renderer unless you explicitly use a guarded AI action. Electron vault encryption is scoped to its IPC bridge.", icon: Zap },
    { title: "Server-side OpenRouter proxying", desc: "Harnesses server-side OpenRouter models to format, analyze, translate, and explain clipboard logs safely.", icon: Sparkles },
  ];

  return (
    <div id="about-workspace-container" className="p-6 space-y-8 max-w-4xl mx-auto select-none">
      <div className="text-center space-y-5">
        <div className="relative inline-flex items-center justify-center">
          <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.1, 0.2] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-0 -m-8 bg-knoux-purple/15 rounded-full blur-2xl" />
          <div className="w-40 h-40 rounded-full border-2 border-knoux-purple/10 bg-white p-1 shadow-knoux-glow-lg overflow-hidden knoux-float">
            <img src={KNOUX_BRAND.logoUrl} alt="Knoux AI Clipboard Pro Master Seal" referrerPolicy="no-referrer" className="w-full h-full object-cover rounded-full" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-knoux-dark-text tracking-tight">Knoux <span className="text-knoux-purple">{t("about.heroTitle", "AI Clipboard Pro")}</span></h1>
          <p className="text-sm font-semibold text-knoux-muted-text uppercase tracking-widest font-mono">{t("about.heroTagline", "Your clipboard. Upgraded by AI.")}</p>
          <span className="inline-block text-[10px] text-knoux-purple bg-knoux-purple/5 border border-knoux-purple/10 px-3 py-1 rounded-full font-bold uppercase tracking-wider">Stable Release v1.0.0</span>
        </div>
      </div>

      <hr className="border-knoux-purple/5 max-w-xl mx-auto" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <div className="relative overflow-hidden p-6 rounded-3xl border border-[#c17ceb]/30 bg-[radial-gradient(circle_at_12%_0%,rgba(255,255,255,.24),transparent_30%),linear-gradient(135deg,#1c0b4e_0%,#381584_42%,#8226ee_100%)] shadow-knoux-glow-lg space-y-4 text-white">
          <div className="absolute -right-16 -top-16 w-40 h-40 rounded-full bg-white/20 blur-2xl" />
          <div className="absolute -left-10 bottom-0 w-32 h-32 rounded-full bg-[#c17ceb]/25 blur-2xl" />
          <div className="relative space-y-1">
            <span className="text-[10px] text-[#d8b8ec] font-extrabold uppercase tracking-wider block font-mono">{t("about.creativeDirector", "Creative Director")}</span>
            <h3 className="text-lg font-black tracking-tight text-white">Eng. Sadek Elgazar (Knoux)</h3>
          </div>
          <p className="relative text-sm text-[#f3e6fb] leading-relaxed">Leading the Knoux visual system and developing premium productivity solutions that align clean aesthetics with honest local-first security boundaries.</p>
          <div className="relative pt-3 border-t border-white/20 flex items-center justify-between text-xs">
            <span className="text-[#cfb4ea]">Official Knoux Store:</span>
            <a href="https://knoux.store" target="_blank" rel="noopener noreferrer" className="font-black text-white hover:text-[#d8b8ec] hover:underline">https://knoux.store</a>
          </div>
        </div>

        <div className="p-6 rounded-3xl border border-knoux-purple/10 bg-[color:var(--knoux-card-elevated)] shadow-knoux-glow space-y-4">
          <h3 className="text-xs font-extrabold text-knoux-dark-text uppercase tracking-wider">{t("about.developerConnections", "Direct Developer Connections")}</h3>
          <div className="space-y-2">
            {contactLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className={`flex items-center justify-between p-2 rounded-xl border border-knoux-purple/5 bg-[#FCFAFF] transition-all text-xs ${link.color}`}>
                  <div className="flex items-center gap-2"><Icon className="w-3.5 h-3.5" /><span className="font-semibold text-knoux-dark-text">{link.label}</span></div>
                  <span className="font-mono text-knoux-muted-text text-[11px]">{link.value}</span>
                </a>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-4">
        <h3 className="text-xs font-extrabold text-knoux-dark-text uppercase tracking-wider text-center">{t("about.philosophy", "Platform Engineering Philosophy")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div key={i} className="knoux-premium-card p-4 text-center space-y-2">
                <div className="w-8 h-8 rounded-xl bg-knoux-purple/5 text-knoux-purple flex items-center justify-center mx-auto"><Icon className="w-4 h-4" /></div>
                <span className="text-xs font-bold text-knoux-dark-text block">{feat.title}</span>
                <p className="text-[11px] text-knoux-muted-text leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center text-[10px] text-knoux-muted-text/50 font-mono py-4">{t("about.footer", "© 2026 Knoux. All rights reserved. Crafted with Electron, React, & Tailwind CSS.")}</div>
    </div>
  );
}
