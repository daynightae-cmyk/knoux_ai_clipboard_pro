/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import Sidebar from "./Sidebar";
import TopCommandBar from "./TopCommandBar";
import RightInspector from "./RightInspector";
import { NavTab } from "../../types";
import { AnimatePresence, motion } from "motion/react";
import { Clipboard } from "lucide-react";

interface AppShellProps {
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
}

export default function AppShell({
  children,
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  privacyMode,
  setPrivacyMode,
  searchQuery,
  setSearchQuery,
  onRefresh,
  isRefreshing,
  itemsCount,
  onRunMaintenance,
  toastMessage,
  isInspectorOpen,
  setIsInspectorOpen,
}: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-tr from-[#FCFAFF] via-[#F7F2FF] to-[#FCFAFF]">
      {/* 1. Left Sidebar menu */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        privacyMode={privacyMode}
      />

      {/* 2. Main Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Command bar */}
        <TopCommandBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          privacyMode={privacyMode}
          setPrivacyMode={setPrivacyMode}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
          onToggleInspector={() => setIsInspectorOpen(!isInspectorOpen)}
          isInspectorOpen={isInspectorOpen}
        />

        {/* Workspace Display page */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-tr from-transparent via-[#F7F2FF]/40 to-transparent">
          {children}
        </main>
      </div>

      {/* 3. Right Telemetry Inspector */}
      <RightInspector
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        itemsCount={itemsCount}
        privacyMode={privacyMode}
        onRunMaintenance={onRunMaintenance}
      />

      {/* Persistent Visual Toast Alerts */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            id="global-toast-container"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 p-3.5 rounded-2xl border border-knoux-purple/15 bg-white text-xs text-knoux-dark-text font-bold flex items-center gap-2.5 shadow-knoux-glow-lg"
          >
            <div className="w-6 h-6 rounded-lg bg-knoux-purple/10 flex items-center justify-center">
              <Clipboard className="w-3.5 h-3.5 text-knoux-purple" />
            </div>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
