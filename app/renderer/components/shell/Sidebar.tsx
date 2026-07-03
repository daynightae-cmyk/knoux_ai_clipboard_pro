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
} from "lucide-react";

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  privacyMode: boolean;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  privacyMode,
}: SidebarProps) {
  const menuItems = [
    { id: "overview" as NavTab, label: "Overview", icon: LayoutDashboard },
    { id: "clipboard" as NavTab, label: "Clipboard Hub", icon: Clipboard },
    { id: "search" as NavTab, label: "Deep Search", icon: Search },
    { id: "ai" as NavTab, label: "AI Co-Pilot", icon: Sparkles },
    { id: "security" as NavTab, label: "Security & Trust", icon: ShieldCheck },
    { id: "settings" as NavTab, label: "Preferences", icon: Settings },
  ];

  const experimentalItems = [
    { id: "labs" as NavTab, label: "Experimental Labs", icon: FlaskConical },
    { id: "about" as NavTab, label: "About Knoux", icon: Info },
  ];

  const handleTabClick = (tabId: NavTab) => {
    setActiveTab(tabId);
  };

  return (
    <motion.aside
      id="shell-sidebar-container"
      animate={{ width: collapsed ? 76 : 260 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="h-screen sticky top-0 flex flex-col justify-between border-r border-knoux-purple/10 bg-white/70 backdrop-blur-md select-none shrink-0 z-20"
    >
      {/* Top Header Logo Area */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-knoux-purple/5">
          <div className="flex items-center gap-3 overflow-hidden">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.8 }}
              className="w-9 h-9 rounded-full border border-knoux-purple/20 shadow-knoux-glow overflow-hidden flex items-center justify-center bg-white"
            >
              <img
                src="https://i.postimg.cc/63Ld4Hhg/Chat-GPT-Image-3-ywlyw-2026-06-19-54-m.png"
                alt="Knoux AI Logo"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </motion.div>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col"
              >
                <span className="text-sm font-bold tracking-tight text-knoux-dark-text leading-none">
                  KNOUX
                </span>
                <span className="text-[10px] text-knoux-purple font-semibold uppercase tracking-wider mt-0.5 font-mono">
                  Clipboard Pro
                </span>
              </motion.div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-knoux-muted-text hover:text-knoux-purple hover:bg-knoux-purple/5 transition-colors cursor-pointer"
          >
            {collapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Primary Navigation list */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer group ${
                  isActive
                    ? "text-knoux-purple bg-knoux-purple/5 font-semibold"
                    : "text-knoux-muted-text hover:text-knoux-dark-text hover:bg-knoux-purple/5"
                }`}
              >
                {/* Active left glowing bar indicator */}
                {isActive && (
                  <motion.div
                    layoutId="active-nav-bar-shell"
                    className="absolute left-0 top-2 bottom-2 w-[4px] rounded-r-full bg-knoux-purple"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                <Icon className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? "text-knoux-purple" : "text-knoux-muted-text"
                }`} />

                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="truncate"
                  >
                    {item.label}
                  </motion.span>
                )}

                {/* Badge for quick visual assistance */}
                {item.id === "ai" && !collapsed && (
                  <span className="ml-auto text-[9px] bg-gradient-to-r from-knoux-purple to-knoux-neon text-white px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider scale-90">
                    Live
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Experimental/Separated Divider */}
        <div className="px-6 py-2">
          <div className="h-[1px] bg-knoux-purple/10" />
          {!collapsed && (
            <div className="text-[10px] font-bold text-knoux-muted-text/40 tracking-wider uppercase mt-2 select-none">
              Experiments & Lab
            </div>
          )}
        </div>

        <nav className="p-3 space-y-1">
          {experimentalItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer group ${
                  isActive
                    ? "text-knoux-purple bg-knoux-purple/5 font-semibold"
                    : "text-knoux-muted-text hover:text-knoux-dark-text hover:bg-knoux-purple/5"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav-bar-shell"
                    className="absolute left-0 top-2 bottom-2 w-[4px] rounded-r-full bg-knoux-purple"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                <Icon className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? "text-knoux-purple" : "text-knoux-muted-text"
                }`} />

                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="truncate"
                  >
                    {item.label}
                  </motion.span>
                )}

                {item.id === "labs" && !collapsed && (
                  <span className="ml-auto text-[9px] border border-knoux-accent/30 text-knoux-accent px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wider scale-90">
                    Beta
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer workspace privacy metadata */}
      <div className="p-3 border-t border-knoux-purple/5 bg-gradient-to-b from-transparent to-knoux-purple/5">
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : "px-3 py-2"} rounded-xl bg-white/40 border border-knoux-purple/5`}>
          <div className="relative flex items-center justify-center shrink-0">
            {/* Green glowing status ping */}
            <span className={`absolute inline-flex h-2 w-2 rounded-full ${privacyMode ? "bg-amber-500 animate-pulse" : "bg-emerald-500 animate-pulse"} opacity-75`} />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${privacyMode ? "bg-amber-500" : "bg-emerald-500"}`} />
          </div>

          {!collapsed && (
            <div className="flex flex-col text-[10px] overflow-hidden leading-snug">
              <span className="font-bold text-knoux-dark-text truncate">
                {privacyMode ? "Privacy Locked" : "Secure Environment"}
              </span>
              <span className="text-knoux-muted-text truncate">
                Local Vault Active
              </span>
            </div>
          )}
        </div>

        {!collapsed && (
          <div className="text-[9px] text-center text-knoux-muted-text/50 mt-3 font-mono">
            Knoux v1.0.0
          </div>
        )}
      </div>
    </motion.aside>
  );
}
