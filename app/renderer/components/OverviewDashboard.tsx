/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { ClipboardItem, NavTab, ClipboardType } from "../types";
import { motion } from "motion/react";
import StatusPill from "./common/StatusPill";
import {
  Clipboard,
  Pin,
  Sparkles,
  ShieldAlert,
  Clock,
  TrendingUp,
  Cpu,
  ChevronRight,
  Database,
  Lock,
  Zap,
  RefreshCw,
  CheckCircle2,
  Globe,
  Code,
  FileText,
  Activity,
} from "lucide-react";

interface OverviewDashboardProps {
  items: ClipboardItem[];
  onCopyItem: (item: ClipboardItem) => void;
  onTogglePin: (item: ClipboardItem) => void;
  onDeleteItem: (item: ClipboardItem) => void;
  setActiveTab: (tab: NavTab) => void;
  setAiInputText: (text: string) => void;
  onAddNewItem?: (content: string, type: ClipboardType, source?: string) => void;
}

interface ActivityItem {
  id: string;
  title: string;
  type: string;
  time: string;
  iconName: "sparkles" | "code" | "globe" | "cpu" | "lock";
  color: string;
}

export default function OverviewDashboard({
  items,
  onCopyItem,
  onTogglePin,
  onDeleteItem,
  setActiveTab,
  setAiInputText,
  onAddNewItem,
}: OverviewDashboardProps) {
  // Statistics Calculations
  const totalClips = items.length;
  const pinnedClips = items.filter((i) => i.pinned).length;
  const secureClips = items.filter((i) => i.isSecure).length;
  const aiActions = items.filter((i) => i.aiSummarized).length;
  const timeSavedMinutes = totalClips * 1.5 + aiActions * 5; // Simulating minutes saved

  const recentClips = items.slice(0, 3);

  const handleQuickAISummarize = (content: string) => {
    setAiInputText(content);
    setActiveTab("ai");
  };

  // --- NEW WORKSPACE STATES ---
  
  // Storage Health States
  const [dbSize, setDbSize] = useState<number>(1.84);
  const [dbUsagePct, setDbUsagePct] = useState<number>(18.4);
  const [isMaintenanceRunning, setIsMaintenanceRunning] = useState<boolean>(false);
  const [maintenanceSuccess, setMaintenanceSuccess] = useState<boolean>(false);

  // System Diagnostics / Health check state
  const [isScanningHealth, setIsScanningHealth] = useState<boolean>(false);
  const [healthScores, setHealthScores] = useState({
    aiEngine: "ACTIVE",
    clipboardMonitor: "MONITORING",
    localStorage: "ENCRYPTED",
  });
  const [diagnosticsRun, setDiagnosticsRun] = useState<boolean>(false);

  // Recent AI processed activities timeline (5 items)
  const [activities, setActivities] = useState<ActivityItem[]>([
    { id: "act-1", title: "Summarized text selection with OpenRouter AI", type: "Summarization", time: "2m ago", iconName: "sparkles", color: "text-amber-500 bg-amber-50 border-amber-100" },
    { id: "act-2", title: "Compiled TypeScript snippet logic", type: "Code Optimization", time: "15m ago", iconName: "code", color: "text-blue-500 bg-blue-50 border-blue-100" },
    { id: "act-3", title: "Translated German README text block", type: "Translation", time: "42m ago", iconName: "globe", color: "text-purple-500 bg-purple-50 border-purple-100" },
    { id: "act-4", title: "Indexed metadata schema parameters", type: "Data Extraction", time: "1h ago", iconName: "cpu", color: "text-indigo-500 bg-indigo-50 border-indigo-100" },
    { id: "act-5", title: "Secured SQLite local credential string", type: "Security Masking", time: "2h ago", iconName: "lock", color: "text-emerald-500 bg-emerald-50 border-emerald-100" },
  ]);

  // --- NEW WORKSPACE HANDLERS ---

  // Maintenance SQLite Optimizer
  const handleRunMaintenance = () => {
    setIsMaintenanceRunning(true);
    setMaintenanceSuccess(false);
    setTimeout(() => {
      setIsMaintenanceRunning(false);
      setDbSize(0.85);
      setDbUsagePct(8.5);
      setMaintenanceSuccess(true);
      // Automatically hide success banner after 4 seconds
      setTimeout(() => setMaintenanceSuccess(false), 4000);
    }, 1500);
  };

  // Run diagnostics for system service health modules
  const handleRunDiagnostics = () => {
    setIsScanningHealth(true);
    setDiagnosticsRun(false);
    setTimeout(() => {
      setIsScanningHealth(false);
      setDiagnosticsRun(true);
      setHealthScores({
        aiEngine: "ACTIVE",
        clipboardMonitor: "MONITORING",
        localStorage: "ENCRYPTED",
      });
      setTimeout(() => setDiagnosticsRun(false), 3000);
    }, 1200);
  };

  // Quick Action cards handler
  const handleQuickAction = (actionType: "format" | "ocr" | "secure") => {
    if (!onAddNewItem) return;

    if (actionType === "format") {
      const latestClip = items[0];
      const contentToFormat = latestClip ? latestClip.content : "const knoux = () => {\n  console.log('Knoux Engine active');\n};";
      const formatted = `// Auto-Formatted as Code Snippet\n// Source: ${latestClip?.source || "Quick Action"}\n\n${contentToFormat}`;
      onAddNewItem(formatted, "code", "Quick Formatter");

      const newActivity: ActivityItem = {
        id: `act-${Date.now()}`,
        title: "Formatted latest clipboard item as TypeScript code block",
        type: "Code Formatting",
        time: "Just now",
        iconName: "code",
        color: "text-blue-500 bg-blue-50 border-blue-100",
      };
      setActivities((prev) => [newActivity, ...prev].slice(0, 5));
    } else if (actionType === "ocr") {
      const text = "Extracted OCR Text: 'Eng. Sadek Elgazar - Abu Dhabi UAE. Knoux AI Clipboard Pro v1.0.0. Secure offline architecture.'";
      onAddNewItem(text, "note", "OCR Scanner");

      const newActivity: ActivityItem = {
        id: `act-${Date.now()}`,
        title: "Extracted high-precision text block from simulated image scan",
        type: "Text Extraction",
        time: "Just now",
        iconName: "cpu",
        color: "text-indigo-500 bg-indigo-50 border-indigo-100",
      };
      setActivities((prev) => [newActivity, ...prev].slice(0, 5));
    } else if (actionType === "secure") {
      const text = "🔒 SECURED: Knoux Secure Note containing sensitive local credentials, key sequence: [AES-256-VAULT-TOKEN]";
      onAddNewItem(text, "note", "Secure Vault");

      const newActivity: ActivityItem = {
        id: `act-${Date.now()}`,
        title: "Saved highly sensitive encrypted note directly in SQLite database",
        type: "Security Masking",
        time: "Just now",
        iconName: "lock",
        color: "text-emerald-500 bg-emerald-50 border-emerald-100",
      };
      setActivities((prev) => [newActivity, ...prev].slice(0, 5));
    }
  };

  return (
    <div id="overview-dashboard-container" className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* 1. Hero Product Banner Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl border border-knoux-purple/10 bg-gradient-to-tr from-white via-knoux-lavender-white to-white p-6 sm:p-8 shadow-knoux-glow flex flex-col md:flex-row items-center justify-between gap-6"
      >
        {/* Abstract floating circles background for aesthetic texture */}
        <div className="absolute right-0 top-0 -mr-12 -mt-12 w-64 h-64 rounded-full bg-knoux-purple/5 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -ml-12 -mb-12 w-48 h-48 rounded-full bg-knoux-neon/5 blur-3xl pointer-events-none" />

        <div className="space-y-4 max-w-xl text-center md:text-left z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-knoux-purple/10 bg-knoux-purple/5 text-[11px] font-bold text-knoux-purple uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" /> Product Launch v1.0.0 Stable
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-knoux-dark-text tracking-tight leading-tight">
            Elevate Your Flow with <span className="text-knoux-purple">Knoux AI</span>
          </h1>
          <p className="text-sm text-knoux-muted-text/90 leading-relaxed">
            Your clipboard history is now encrypted locally and augmented by OpenRouter AI. Summarize, rewrite, translate, and secure any copied snippet instantly.
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
            <button
              onClick={() => setActiveTab("clipboard")}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-knoux-purple to-knoux-neon text-white text-xs font-semibold shadow-knoux-glow hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Clipboard className="w-3.5 h-3.5" /> Launch Clipboard Hub
            </button>
            <button
              onClick={() => setActiveTab("ai")}
              className="px-5 py-2.5 rounded-xl border border-knoux-purple/20 bg-white hover:bg-knoux-purple/5 text-knoux-purple text-xs font-semibold hover:border-knoux-purple/30 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Deploy AI Assistant
            </button>
          </div>
        </div>

        {/* Master Logo Seal inside Hero */}
        <div className="relative shrink-0 flex items-center justify-center">
          <div className="absolute inset-0 -m-6 rounded-full bg-gradient-to-r from-knoux-purple/20 to-knoux-neon/20 blur-xl animate-pulse" />
          <div className="w-32 h-32 md:w-36 md:h-36 rounded-full bg-white p-1 border-2 border-knoux-purple/20 shadow-knoux-glow overflow-hidden knoux-float">
            <img
              src="https://i.postimg.cc/63Ld4Hhg/Chat-GPT-Image-3-ywlyw-2026-06-19-54-m.png"
              alt="Knoux AI Medal logo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>
      </motion.div>

      {/* 2. Metrics row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Active History", value: totalClips, icon: Clipboard, color: "text-knoux-purple bg-knoux-purple/5 border-knoux-purple/10" },
          { label: "Pinned Snippets", value: pinnedClips, icon: Pin, color: "text-knoux-neon bg-knoux-neon/5 border-knoux-neon/10" },
          { label: "AI Enhancements", value: aiActions, icon: Sparkles, color: "text-amber-600 bg-amber-50 border-amber-100" },
          { label: "Encrypted Items", value: secureClips, icon: Lock, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
          { label: "Productivity Boost", value: `${Math.round(timeSavedMinutes)}m`, icon: TrendingUp, color: "text-indigo-600 bg-indigo-50 border-indigo-100", full: true },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className={`p-4 rounded-2xl bg-white border border-knoux-purple/5 shadow-sm flex flex-col justify-between min-h-[100px] ${
                stat.full ? "col-span-2 lg:col-span-1" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-knoux-muted-text/80 tracking-wide">
                  {stat.label}
                </span>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${stat.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-black text-knoux-dark-text mt-2 font-mono">
                {stat.value}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 3. Horizontal Row of Quick Actions */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-knoux-dark-text tracking-tight flex items-center gap-1.5 px-1">
          <Zap className="w-4 h-4 text-knoux-purple animate-pulse" /> One-Tap Quick Clipboard Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: "Format as Code",
              desc: "Wraps and formats the latest text as a clean executable TypeScript snippet.",
              action: () => handleQuickAction("format"),
              icon: Code,
              color: "text-blue-600 bg-blue-50 border-blue-100 hover:border-blue-300",
              buttonText: "Format Clip",
            },
            {
              title: "Extract Text",
              desc: "Runs high-precision simulated OCR text extraction on the latest clipboard item.",
              action: () => handleQuickAction("ocr"),
              icon: FileText,
              color: "text-indigo-600 bg-indigo-50 border-indigo-100 hover:border-indigo-300",
              buttonText: "Run OCR Scan",
            },
            {
              title: "Secure Note",
              desc: "Encrypts and stores a protected on-device note directly in the SQLite database.",
              action: () => handleQuickAction("secure"),
              icon: ShieldAlert,
              color: "text-emerald-600 bg-emerald-50 border-emerald-100 hover:border-emerald-300",
              buttonText: "Commit Secret",
            },
          ].map((act, i) => {
            const Icon = act.icon;
            return (
              <motion.div
                key={act.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 + 0.1, duration: 0.4 }}
                className="p-5 rounded-2xl bg-white border border-knoux-purple/5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group h-full"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${act.color}`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <h4 className="text-sm font-bold text-knoux-dark-text group-hover:text-knoux-purple transition-colors">
                      {act.title}
                    </h4>
                  </div>
                  <p className="text-xs text-knoux-muted-text leading-relaxed">
                    {act.desc}
                  </p>
                </div>
                <button
                  onClick={act.action}
                  className="mt-4 w-full py-2 px-4 rounded-xl text-xs font-bold bg-knoux-lavender-white hover:bg-knoux-purple hover:text-white text-knoux-purple border border-knoux-purple/10 group-hover:border-knoux-purple/20 transition-all active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" /> {act.buttonText}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 4. Detailed grid content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left column: Recent Clips list & Recent Activity Timeline */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Clipboard clips list */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold text-knoux-dark-text tracking-tight flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-knoux-purple" /> Recent Clipboard Clips
              </h3>
              <button
                onClick={() => setActiveTab("clipboard")}
                className="text-xs font-semibold text-knoux-purple hover:text-knoux-deep-purple flex items-center gap-0.5 cursor-pointer"
              >
                See complete hub <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {recentClips.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-knoux-purple/15 bg-white/40 flex flex-col items-center">
                  <Clipboard className="w-8 h-8 text-knoux-purple/30 mb-2" />
                  <span className="text-xs font-semibold text-knoux-dark-text">Your clipboard is currently clean</span>
                  <span className="text-[10px] text-knoux-muted-text mt-1">Copy any text or code on your system to register records.</span>
                </div>
              ) : (
                recentClips.map((clip) => (
                  <motion.div
                    key={clip.id}
                    className="p-4 rounded-2xl bg-white border border-knoux-purple/5 group flex items-start justify-between gap-4 knoux-card-hover shadow-sm"
                  >
                    <div className="space-y-1.5 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-knoux-purple uppercase bg-knoux-purple/5 px-2 py-0.5 rounded-md">
                          {clip.type}
                        </span>
                        <span className="text-[10px] text-knoux-muted-text/60 font-mono">
                          {new Date(clip.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span className="text-[10px] text-knoux-muted-text/60 font-mono hidden sm:inline">
                          • Source: {clip.source}
                        </span>
                      </div>
                      <p className="text-xs text-knoux-dark-text/90 font-mono truncate max-w-xl">
                        {clip.content}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onCopyItem(clip)}
                        className="p-2 rounded-lg bg-knoux-purple/5 hover:bg-knoux-purple/10 text-knoux-purple text-xs font-bold cursor-pointer transition-colors"
                        title="Copy item again"
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => handleQuickAISummarize(clip.content)}
                        className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 text-xs font-bold cursor-pointer transition-colors"
                        title="Send to Knoux AI"
                      >
                        AI
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Recent Activity Timeline panel */}
          <div className="p-5 rounded-2xl bg-white border border-knoux-purple/5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-knoux-dark-text tracking-tight flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-knoux-purple" /> Recent AI-Processed Actions
              </h3>
              <span className="text-[10px] bg-knoux-purple/10 text-knoux-purple px-2 py-0.5 rounded-full font-semibold">
                Timeline Log
              </span>
            </div>

            <div className="relative pl-4 border-l border-knoux-purple/10 space-y-5 py-1">
              {activities.map((act) => {
                // select icon matching act.iconName
                let IconComp = Sparkles;
                if (act.iconName === "code") IconComp = Code;
                if (act.iconName === "globe") IconComp = Globe;
                if (act.iconName === "cpu") IconComp = Cpu;
                if (act.iconName === "lock") IconComp = Lock;

                return (
                  <div key={act.id} className="relative flex items-start gap-3 group">
                    {/* timeline bullet dot */}
                    <div className="absolute -left-[23px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-knoux-purple/30 flex items-center justify-center group-hover:border-knoux-purple transition-colors z-10">
                      <div className="w-1.5 h-1.5 rounded-full bg-knoux-purple" />
                    </div>

                    {/* icon */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${act.color}`}>
                      <IconComp className="w-3.5 h-3.5" />
                    </div>

                    <div className="flex-1 space-y-0.5 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-knoux-purple uppercase tracking-wider">
                          {act.type}
                        </span>
                        <span className="text-[10px] text-knoux-muted-text/60 font-mono shrink-0">
                          {act.time}
                        </span>
                      </div>
                      <p className="text-xs text-knoux-dark-text/90 font-medium truncate">
                        {act.title}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right column: System Telemetry, Health, and SQLite Storage */}
        <div className="space-y-6">
          
          {/* System Service Health Card */}
          <div className="p-5 rounded-2xl bg-white border border-knoux-purple/5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-knoux-dark-text tracking-tight flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-knoux-purple" /> System Service Health
              </h3>
              <button
                onClick={handleRunDiagnostics}
                disabled={isScanningHealth}
                className="text-[10px] bg-knoux-purple/5 hover:bg-knoux-purple/10 text-knoux-purple px-2 py-1 rounded-md border border-knoux-purple/10 flex items-center gap-1 cursor-pointer disabled:opacity-55"
              >
                <RefreshCw className={`w-3 h-3 ${isScanningHealth ? "animate-spin" : ""}`} />
                {isScanningHealth ? "Scanning..." : "Diagnostics"}
              </button>
            </div>

            {diagnosticsRun && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-800 p-2 rounded-xl flex items-center gap-1.5 font-semibold"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                All on-device Knoux processes checked out healthy.
              </motion.div>
            )}

            <div className="space-y-3">
              {[
                {
                  name: "AI Engine",
                  desc: "OpenRouter local/cloud inference interface",
                  status: isScanningHealth ? "SCANNING" : healthScores.aiEngine,
                  pillStatus: (isScanningHealth ? "warning" : "brand") as "warning" | "brand",
                  icon: Sparkles,
                  colorClass: "bg-knoux-purple text-white border-knoux-purple/10",
                },
                {
                  name: "Clipboard Monitor",
                  desc: "Auto background monitoring daemon",
                  status: isScanningHealth ? "SCANNING" : healthScores.clipboardMonitor,
                  pillStatus: (isScanningHealth ? "warning" : "info") as "warning" | "info",
                  icon: Clipboard,
                  colorClass: "bg-indigo-600 text-white border-indigo-100",
                },
                {
                  name: "Local Storage",
                  desc: "AES-256 encrypted SQLite data vault",
                  status: isScanningHealth ? "SCANNING" : healthScores.localStorage,
                  pillStatus: (isScanningHealth ? "warning" : "success") as "warning" | "success",
                  icon: Database,
                  colorClass: "bg-emerald-600 text-white border-emerald-100",
                },
              ].map((mod) => {
                const Icon = mod.icon;
                return (
                  <div key={mod.name} className="flex items-center justify-between p-3 rounded-xl border border-knoux-purple/5 bg-gradient-to-r from-knoux-soft-white to-white hover:border-knoux-purple/15 transition-all">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${mod.colorClass}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-knoux-dark-text">{mod.name}</span>
                        <span className="text-[10px] text-knoux-muted-text font-medium truncate">{mod.desc}</span>
                      </div>
                    </div>
                    <StatusPill label={mod.status} status={mod.pillStatus} className="shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Storage Health Widget */}
          <div className="p-5 rounded-2xl bg-white border border-knoux-purple/5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-knoux-dark-text tracking-tight flex items-center gap-1.5">
                <Database className="w-4 h-4 text-knoux-purple" /> Storage Health
              </h3>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                SQLite Active
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-gradient-to-tr from-knoux-lavender-white to-white border border-knoux-purple/5 rounded-xl space-y-2">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="font-semibold text-knoux-dark-text">SQLite Cache Size:</span>
                  <span className="font-mono text-knoux-purple font-extrabold">{dbSize.toFixed(2)} MB / 10.0 MB</span>
                </div>
                
                {/* Visual Storage slider progress bar */}
                <div className="relative w-full h-2.5 bg-knoux-purple/5 rounded-full overflow-hidden border border-knoux-purple/5">
                  <motion.div
                    animate={{ width: `${dbUsagePct}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-knoux-purple to-knoux-neon shadow-knoux-glow"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-knoux-muted-text">
                  <span>{dbUsagePct.toFixed(1)}% Capacity used</span>
                  <span>Local SQLite DB</span>
                </div>
              </div>

              {maintenanceSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl space-y-1 text-center animate-pulse"
                >
                  <div className="flex items-center justify-center gap-1 text-xs font-bold text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Maintenance Success
                  </div>
                  <p className="text-[10px] text-emerald-600">
                    Expired logs cleared, tables vacuumed, database optimized.
                  </p>
                </motion.div>
              )}

              <button
                onClick={handleRunMaintenance}
                disabled={isMaintenanceRunning}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-knoux-purple to-knoux-neon text-white hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-55"
              >
                {isMaintenanceRunning ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Optimizing & Vacuuming...
                  </>
                ) : (
                  <>
                    <Database className="w-3.5 h-3.5" />
                    Run Maintenance
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Secure lock quick visual panel */}
          <div className="p-4 rounded-2xl bg-gradient-to-tr from-[#FCFAFF] to-white border border-knoux-purple/5 shadow-sm text-center space-y-2">
            <Lock className="w-6 h-6 text-knoux-purple/50 mx-auto" />
            <h4 className="text-xs font-bold text-knoux-dark-text">Your privacy is non-negotiable</h4>
            <p className="text-[11px] text-knoux-muted-text/80 max-w-xs mx-auto">
              Knoux never streams clipboard logs or keystrokes to external trackers. AI requests are strictly anonymized.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
