/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NavTab } from "../../types";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  Clipboard,
  Search,
  Sparkles,
  ShieldCheck,
  Settings,
  FlaskConical,
  Info,
  Menu,
  ChevronLeft,
  QrCode,
  Code2,
} from "lucide-react";

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  privacyMode: boolean;
  language?: "en" | "ar";
}

const LOGO_URL = "https://i.postimg.cc/XJv5b0ZR/cropped-circle-image-(1).png";

export default function Sidebar({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  privacyMode,
  language = "en",
}: SidebarProps) {
  const ar = language === "ar";

  const menuItems = [
    { id: "overview" as NavTab, label: ar ? "لوحة التحكم" : "Overview", icon: LayoutDashboard },
    { id: "clipboard" as NavTab, label: ar ? "مركز الحافظة" : "Clipboard Hub", icon: Clipboard },
    { id: "search" as NavTab, label: ar ? "بحث عميق" : "Deep Search", icon: Search },
    { id: "ai" as NavTab, label: ar ? "مساعد الذكاء" : "AI Co-Pilot", icon: Sparkles },
    { id: "barcode" as NavTab, label: ar ? "ماسح الباركود" : "Barcode Scanner", icon: QrCode },
    { id: "security" as NavTab, label: ar ? "الأمان والخزنة" : "Security & Trust", icon: ShieldCheck },
    { id: "settings" as NavTab, label: ar ? "الإعدادات" : "Preferences", icon: Settings },
  ];

  const experimentalItems = [
    { id: "developer" as NavTab, label: ar ? "استوديو المطورين" : "Developer Studio", icon: Code2 },
    { id: "labs" as NavTab, label: ar ? "مختبرات متقدمة" : "Experimental Labs", icon: FlaskConical },
    { id: "about" as NavTab, label: ar ? "عن كنوكس" : "About Knoux", icon: Info },
  ];

  return (
    <motion.aside
      id="shell-sidebar-container"
      animate={{ width: collapsed ? 78 : 280 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="h-screen sticky top-0 flex flex-col justify-between border-r border-white/10 bg-[#12081F]/75 backdrop-blur-2xl select-none shrink-0 z-20 shadow-[18px_0_70px_rgba(0,0,0,0.34)]"
    >
      <div>
        <div className="h-20 flex items-center justify-between px-4 border-b border-white/10 bg-white/[0.03]">
          <div className="flex items-center gap-3 overflow-hidden">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.05 }}
              transition={{ duration: 0.8 }}
              className="w-11 h-11 rounded-full border border-[#D8B8EC]/30 shadow-[0_0_35px_rgba(138,43,226,0.45)] overflow-hidden flex items-center justify-center bg-black/30"
            >
              <img src={LOGO_URL} alt="Official KNOUX Logo" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            </motion.div>
            {!collapsed && (
              <motion.div initial={{ opacity: 0, x: ar ? 10 : -10 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
                <span className="text-base font-black tracking-tight text-white leading-none">KNOUX</span>
                <span className="text-[10px] text-[#D8B8EC] font-bold uppercase tracking-[0.26em] mt-1 font-mono">AI Clipboard Pro</span>
              </motion.div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[#BFA7DB] hover:text-white hover:bg-white/10 transition-colors cursor-pointer border border-white/10"
          >
            {collapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        <nav className="p-3 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full relative flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer group border ${
                  isActive
                    ? "text-white bg-gradient-to-r from-[#8A2BE2]/35 to-[#D946EF]/18 border-[#D8B8EC]/25 shadow-[0_0_34px_rgba(138,43,226,0.22)]"
                    : "text-[#BFA7DB] border-transparent hover:text-white hover:bg-white/[0.06] hover:border-white/10"
                }`}
              >
                {isActive && <motion.div layoutId="active-nav-bar-shell" className="absolute left-0 top-3 bottom-3 w-[4px] rounded-r-full bg-[#D8B8EC]" />}
                <Icon className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-[#D8B8EC]" : "text-[#BFA7DB]"}`} />
                {!collapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="truncate">{item.label}</motion.span>}
                {item.id === "ai" && !collapsed && <span className="ml-auto text-[9px] bg-gradient-to-r from-[#8A2BE2] to-[#D946EF] text-white px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider">Live</span>}
              </button>
            );
          })}
        </nav>

        <div className="px-6 py-2">
          <div className="h-[1px] bg-white/10" />
          {!collapsed && <div className="text-[10px] font-black text-[#BFA7DB]/55 tracking-wider uppercase mt-3">{ar ? "الأدوات المتقدمة" : "Advanced Workspace"}</div>}
        </div>

        <nav className="p-3 space-y-1.5">
          {experimentalItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full relative flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer group border ${
                  isActive
                    ? "text-white bg-white/[0.08] border-[#D8B8EC]/25"
                    : "text-[#BFA7DB] border-transparent hover:text-white hover:bg-white/[0.06] hover:border-white/10"
                }`}
              >
                {isActive && <motion.div layoutId="active-nav-bar-shell" className="absolute left-0 top-3 bottom-3 w-[4px] rounded-r-full bg-[#A678DD]" />}
                <Icon className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-[#D8B8EC]" : "text-[#BFA7DB]"}`} />
                {!collapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="truncate">{item.label}</motion.span>}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-3 border-t border-white/10 bg-gradient-to-b from-transparent to-[#8A2BE2]/10">
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : "px-3 py-3"} rounded-2xl bg-white/[0.05] border border-white/10`}>
          <div className="relative flex items-center justify-center shrink-0">
            <span className={`absolute inline-flex h-2.5 w-2.5 rounded-full ${privacyMode ? "bg-amber-400" : "bg-emerald-400"} animate-ping opacity-60`} />
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${privacyMode ? "bg-amber-400" : "bg-emerald-400"}`} />
          </div>
          {!collapsed && (
            <div className="flex flex-col text-[10px] overflow-hidden leading-snug">
              <span className="font-black text-white truncate">{privacyMode ? (ar ? "وضع الخصوصية" : "Privacy Locked") : (ar ? "بيئة آمنة" : "Secure Environment")}</span>
              <span className="text-[#BFA7DB] truncate">{ar ? "الخزنة المحلية نشطة" : "Local Vault Active"}</span>
            </div>
          )}
        </div>
        {!collapsed && <div className="text-[9px] text-center text-[#BFA7DB]/55 mt-3 font-mono">A Knoux Product · v1.0.0</div>}
      </div>
    </motion.aside>
  );
}
