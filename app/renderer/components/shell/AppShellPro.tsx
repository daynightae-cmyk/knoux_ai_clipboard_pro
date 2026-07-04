import React from "react";
import Sidebar from "./Sidebar";
import TopCommandBar from "./TopCommandBar";
import { NavTab } from "../../types";

interface AppShellProProps {
  children: React.ReactNode;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  privacyMode: boolean;
  setPrivacyMode: (privacyMode: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  itemsCount: number;
  onRunMaintenance?: () => void;
  toastMessage?: string | null;
  isInspectorOpen: boolean;
  setIsInspectorOpen: (open: boolean) => void;
  language?: "en" | "ar";
}

export default function AppShellPro(props: AppShellProProps) {
  return (
    <div className={`knoux-app-shell circuit-bg relative flex h-screen overflow-hidden text-[#241B39] ${props.language === "ar" ? "lang-ar" : ""}`}>
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-28 left-1/4 h-96 w-96 rounded-full bg-[#8226EE]/10 blur-3xl" />
        <div className="absolute bottom-0 right-12 h-96 w-96 rounded-full bg-[#A74CE7]/10 blur-3xl" />
      </div>
      <Sidebar activeTab={props.activeTab} setActiveTab={props.setActiveTab} collapsed={props.collapsed} setCollapsed={props.setCollapsed} privacyMode={props.privacyMode} language={props.language} />
      <div className="relative z-10 flex-1 flex flex-col min-w-0 overflow-hidden bg-white/35 backdrop-blur-2xl">
        <TopCommandBar activeTab={props.activeTab} setActiveTab={props.setActiveTab} privacyMode={props.privacyMode} setPrivacyMode={props.setPrivacyMode} searchQuery={props.searchQuery} setSearchQuery={props.setSearchQuery} onRefresh={props.onRefresh} isRefreshing={props.isRefreshing} />
        <main className="relative z-10 flex-1 overflow-y-auto bg-gradient-to-tr from-transparent via-white/30 to-transparent">{props.children}</main>
      </div>
      {props.toastMessage && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 p-3.5 rounded-2xl border border-[#8226EE]/15 bg-white/95 text-xs text-[#241B39] font-bold shadow-knoux-glow-lg">{props.toastMessage}</div>}
    </div>
  );
}
