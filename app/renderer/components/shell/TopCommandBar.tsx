/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NavTab } from "../../types";
import { useState, useEffect } from "react";
import { Search, RefreshCw, Lock, Unlock, Sparkles, Settings, Activity, Clock, Sun, Moon, Monitor } from "lucide-react";
import { AppSettings } from "../../types";

interface TopCommandBarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  privacyMode: boolean;
  setPrivacyMode: (privacyMode: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onToggleInspector?: () => void;
  isInspectorOpen?: boolean;
  themeMode?: AppSettings["themeMode"];
  setThemeMode?: (themeMode: AppSettings["themeMode"]) => void;
}

export default function TopCommandBar({
  activeTab,
  setActiveTab,
  privacyMode,
  setPrivacyMode,
  searchQuery,
  setSearchQuery,
  onRefresh,
  isRefreshing,
  onToggleInspector,
  isInspectorOpen = false,
  themeMode = "system",
  setThemeMode,
}: TopCommandBarProps) {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getPageTitle = () => {
    switch (activeTab) {
      case "overview":
        return "Workspace Overview";
      case "clipboard":
        return "Clipboard Hub";
      case "search":
        return "Universal Search";
      case "ai":
        return "Knoux AI Co-Pilot";
      case "security":
        return "Security & Local Vault";
      case "settings":
        return "Preferences";
      case "labs":
        return "Experimental Labs";
      case "about":
        return "About KNOUX";
      default:
        return "Knoux AI Clipboard";
    }
  };

  const handleSearchFocus = () => {
    if (activeTab !== "search" && activeTab !== "clipboard") {
      setActiveTab("search");
    }
  };

  const cycleTheme = () => {
    if (!setThemeMode) return;
    setThemeMode(themeMode === "day" ? "night" : themeMode === "night" ? "system" : "day");
  };

  const ThemeIcon = themeMode === "day" ? Sun : themeMode === "night" ? Moon : Monitor;

  return (
    <header className="h-16 border-b border-knoux-purple/10 bg-white/70 backdrop-blur-md px-6 flex items-center justify-between gap-4 select-none sticky top-0 z-40">
      {/* Page Title & Breadcrumb */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex flex-col">
          <h2 className="text-base font-bold text-knoux-dark-text tracking-tight leading-none">
            {getPageTitle()}
          </h2>
          <span className="text-[10px] text-knoux-muted-text mt-1 font-mono uppercase tracking-widest">
            KNOUX_SYSTEM_CORE // active
          </span>
        </div>
      </div>

      {/* Global Search Bar Input */}
      <div className="flex-1 max-w-md relative hidden md:block">
        <Search className="w-4 h-4 text-knoux-muted-text/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={handleSearchFocus}
          placeholder="Search clip history, code snippets, secure vaults (Ctrl+K)..."
          className="w-full h-9 pl-10 pr-4 rounded-xl border border-knoux-purple/10 bg-white/60 hover:bg-white focus:bg-white text-xs text-knoux-dark-text placeholder-knoux-muted-text/50 outline-none focus:border-knoux-purple focus:ring-4 focus:ring-knoux-purple/10 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-knoux-purple/10 hover:bg-knoux-purple/20 text-knoux-purple px-1.5 py-0.5 rounded font-mono transition-colors"
          >
            CLEAR
          </button>
        )}
      </div>

      {/* Header Right Command Buttons */}
      <div className="flex items-center gap-2">
        {/* UTC Clock */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-knoux-purple/5 bg-white/40 text-xs font-mono text-knoux-muted-text">
          <Clock className="w-3.5 h-3.5 text-knoux-purple" />
          <span>{currentTime || "08:09:18"}</span>
        </div>

        {/* Server Health Status Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-knoux-purple/5 bg-white/40 text-[11px] font-medium text-emerald-600">
          <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          <span className="hidden sm:inline">AI Node Guarded</span>
        </div>

        <button
          onClick={cycleTheme}
          title={`Theme: ${themeMode}`}
          className="w-9 h-9 rounded-xl flex items-center justify-center border border-knoux-purple/5 bg-white/50 hover:bg-white text-knoux-muted-text hover:text-knoux-purple transition-all shadow-sm cursor-pointer"
        >
          <ThemeIcon className="w-4 h-4" />
        </button>

        {/* Refresh Action Trigger */}
        <button
          onClick={onRefresh}
          title="Refresh clipboard stream"
          className={`w-9 h-9 rounded-xl flex items-center justify-center border border-knoux-purple/5 bg-white/50 hover:bg-white text-knoux-muted-text hover:text-knoux-purple transition-all shadow-sm cursor-pointer ${
            isRefreshing ? "bg-knoux-purple/5" : ""
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-knoux-purple" : ""}`} />
        </button>

        {/* Privacy Lock Toggle */}
        <button
          onClick={() => setPrivacyMode(!privacyMode)}
          title={privacyMode ? "Disable Privacy Lock" : "Enable Privacy Lock"}
          className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all shadow-sm cursor-pointer ${
            privacyMode
              ? "border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-600"
              : "border-knoux-purple/5 bg-white/50 hover:bg-white text-knoux-muted-text hover:text-knoux-purple"
          }`}
        >
          {privacyMode ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
        </button>

        {/* Toggle Right Inspector Sidebar */}
        {onToggleInspector && (
          <button
            onClick={onToggleInspector}
            title="Toggle system metrics side panel"
            className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all shadow-sm cursor-pointer ${
              isInspectorOpen
                ? "border-knoux-purple bg-knoux-purple/5 text-knoux-purple"
                : "border-knoux-purple/5 bg-white/50 hover:bg-white text-knoux-muted-text hover:text-knoux-purple"
            }`}
          >
            <Activity className="w-4 h-4" />
          </button>
        )}

        {/* Quick Spark AI Trigger */}
        <button
          onClick={() => setActiveTab("ai")}
          title="Open AI Smart Assistant"
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-tr from-knoux-purple to-knoux-neon text-white shadow-knoux-glow hover:brightness-110 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
        </button>

        {/* Preferences Quick link */}
        <button
          onClick={() => setActiveTab("settings")}
          title="Open Preferences"
          className="w-9 h-9 rounded-xl flex items-center justify-center border border-knoux-purple/5 bg-white/50 hover:bg-white text-knoux-muted-text hover:text-knoux-purple transition-all shadow-sm cursor-pointer"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
