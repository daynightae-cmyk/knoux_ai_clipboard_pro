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
    <div className={`relative flex h-screen overflow-hidden bg-[#07030E] text-white ${props.language === "ar" ? "lang-ar" : ""}`}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 -left-24 h-96 w-96 rounded-full bg-[#8A2BE2]/25 blur-3xl" />
        <div className="absolute top-24 right-0 h-96 w-96 rounded-full bg-[#D946EF]/15 blur-3xl" />
      </div>
      <Sidebar activeTab={props.activeTab} setActiveTab={props.setActiveTab} collapsed={props.collapsed} setCollapsed={props.setCollapsed} privacyMode={props.privacyMode} language={props.language} />
      <div className="relative z-10 flex-1 flex flex-col min-w-0 overflow-hidden bg-gradient-to-br from-[#12081F]/80 via-transparent to-[#1B0E2D]/80">
        <TopCommandBar activeTab={props.activeTab} setActiveTab={props.setActiveTab} privacyMode={props.privacyMode} setPrivacyMode={props.setPrivacyMode} searchQuery={props.searchQuery} setSearchQuery={props.setSearchQuery} onRefresh={props.onRefresh} isRefreshing={props.isRefreshing} />
        <main className="flex-1 overflow-y-auto bg-transparent">{props.children}</main>
      </div>
      {props.toastMessage && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 p-3.5 rounded-2xl border border-white/15 bg-[#160A26]/90 text-xs text-white font-bold shadow-knoux-glow-lg">{props.toastMessage}</div>}
    </div>
  );
}
