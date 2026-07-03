/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppSettings, NavTab, ClipboardItem } from "../types";
import {
  Settings,
  Layout,
  Sparkles,
  Database,
  Lock,
  RotateCcw,
  Bell,
  Sliders,
  Check,
  Download,
  Upload,
} from "lucide-react";
import React, { useState } from "react";

interface SettingsPageProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  onClearHistory: () => void;
  setActiveTab: (tab: NavTab) => void;
  items: ClipboardItem[];
  onUpdateItems: (items: ClipboardItem[]) => void;
}

export default function SettingsPage({
  settings,
  setSettings,
  onClearHistory,
  setActiveTab,
  items,
  onUpdateItems,
}: SettingsPageProps) {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const toggleSetting = (key: keyof AppSettings) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      triggerSuccess("Preferences updated successfully in local store!");
      return updated;
    });
  };

  const handleDensityChange = (density: "compact" | "comfortable") => {
    setSettings((prev) => ({ ...prev, density }));
    triggerSuccess(`Workspace layout updated to ${density} density.`);
  };

  const handleGlowIntensity = (glowIntensity: "low" | "medium" | "high") => {
    setSettings((prev) => ({ ...prev, glowIntensity }));
    triggerSuccess(`Glow visuals set to ${glowIntensity} intensity.`);
  };

  const handleHistorySize = (size: number) => {
    setSettings((prev) => ({ ...prev, maxHistorySize: size }));
    triggerSuccess(`Clipboard log depth restricted to ${size} clips.`);
  };

  const handleExportDatabase = () => {
    try {
      const dataStr = JSON.stringify(items, null, 2);
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
      const exportFileDefaultName = `knoux-clipboard-backup-${new Date().toISOString().slice(0, 10)}.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();
      triggerSuccess("On-device clipboard database exported as JSON backup file.");
    } catch (err) {
      console.error("Failed to export backup:", err);
    }
  };

  const handleImportDatabase = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = e.target.files?.[0];
    if (!file) return;

    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          const isValid = parsed.every(
            (item) => item && typeof item === "object" && "id" in item && "content" in item
          );
          if (!isValid) {
            alert("The uploaded backup file does not appear to be a valid Knoux Clipboard backup JSON file.");
            return;
          }
          onUpdateItems(parsed);
          triggerSuccess(`Successfully imported ${parsed.length} items from backup!`);
        } else {
          alert("Invalid backup file format. Must be a JSON array of clipboard items.");
        }
      } catch (err) {
        console.error("Failed to parse imported backup JSON:", err);
        alert("Failed to parse JSON file. Please ensure it is a valid exported Knoux JSON file.");
      }
    };
    fileReader.readAsText(file);
    // Reset file input value to allow re-import of same file if needed
    e.target.value = "";
  };

  const handleResetSettings = () => {
    setSettings({
      density: "comfortable",
      glowIntensity: "medium",
      privacyMode: false,
      autoAnalyze: true,
      maxHistorySize: 100,
      syncToCloud: false,
    });
    triggerSuccess("All configurations reset to initial Knoux master defaults.");
  };

  return (
    <div id="settings-workspace-container" className="p-6 space-y-6 max-w-4xl mx-auto select-none">
      {/* Toast Alert Indicator */}
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-3.5 rounded-xl border border-emerald-100 bg-emerald-50 text-xs text-emerald-800 font-bold flex items-center gap-2 shadow-lg animate-bounce">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Grid structure dividing groups */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Side menu titles */}
        <div className="md:col-span-1 space-y-1">
          {[
            { label: "Interface Layout", icon: Layout },
            { label: "AI Co-Pilot config", icon: Sparkles },
            { label: "Local Storage DB", icon: Database },
            { label: "Security & Guard", icon: Lock },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-2.5 rounded-xl text-xs font-bold text-knoux-dark-text bg-white/40 border border-transparent hover:border-knoux-purple/5 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Icon className="w-3.5 h-3.5 text-knoux-purple" />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>

        {/* Right Side detailed settings fields */}
        <div className="md:col-span-3 space-y-6">
          {/* Section: Interface & Layout */}
          <div className="p-5 rounded-3xl border border-knoux-purple/10 bg-white shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-knoux-dark-text uppercase tracking-wider flex items-center gap-1.5 border-b border-knoux-purple/5 pb-2">
              <Layout className="w-4 h-4 text-knoux-purple" /> Interface Aesthetics
            </h3>

            {/* Density switch */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-knoux-dark-text block">Workspace Density</span>
                <span className="text-[11px] text-knoux-muted-text block">Define text heights and listing spacing.</span>
              </div>

              <div className="flex bg-[#FCFAFF] border border-knoux-purple/5 p-1 rounded-xl">
                <button
                  onClick={() => handleDensityChange("compact")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    settings.density === "compact" ? "bg-knoux-purple text-white shadow" : "text-knoux-muted-text hover:text-knoux-dark-text"
                  }`}
                >
                  Compact
                </button>
                <button
                  onClick={() => handleDensityChange("comfortable")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    settings.density === "comfortable" ? "bg-knoux-purple text-white shadow" : "text-knoux-muted-text hover:text-knoux-dark-text"
                  }`}
                >
                  Comfortable
                </button>
              </div>
            </div>

            {/* Glow Intensity select */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-knoux-dark-text block">Glow Visual Strength</span>
                <span className="text-[11px] text-knoux-muted-text block">Control outer glows on headers and overlays.</span>
              </div>

              <div className="flex bg-[#FCFAFF] border border-knoux-purple/5 p-1 rounded-xl">
                {["low", "medium", "high"].map((level) => (
                  <button
                    key={level}
                    onClick={() => handleGlowIntensity(level as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize cursor-pointer transition-colors ${
                      settings.glowIntensity === level ? "bg-knoux-purple text-white shadow" : "text-knoux-muted-text hover:text-knoux-dark-text"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section: AI Preferences */}
          <div className="p-5 rounded-3xl border border-knoux-purple/10 bg-white shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-knoux-dark-text uppercase tracking-wider flex items-center gap-1.5 border-b border-knoux-purple/5 pb-2">
              <Sparkles className="w-4 h-4 text-knoux-purple" /> AI Co-Pilot Settings
            </h3>

            {/* Auto analyze */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-knoux-dark-text block">Auto-Categorization</span>
                <span className="text-[11px] text-knoux-muted-text block">Knoux AI Engine classifies, summarizes, and enhances clipboard content through OpenRouter.</span>
              </div>

              <button
                onClick={() => toggleSetting("autoAnalyze")}
                className={`w-12 h-6 rounded-full transition-all flex items-center cursor-pointer p-0.5 ${
                  settings.autoAnalyze ? "bg-knoux-purple justify-end" : "bg-knoux-purple/20 justify-start"
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
              </button>
            </div>

            {/* OpenRouter AI Provider Status */}
            <div className="pt-3 border-t border-knoux-purple/5 space-y-2">
              <span className="text-[10px] font-bold text-knoux-muted-text/60 uppercase tracking-widest block">AI Provider Status</span>
              <div className="p-3.5 rounded-2xl border border-knoux-purple/5 bg-[#FCFAFF] space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-knoux-muted-text">Provider:</span>
                  <span className="text-knoux-dark-text font-bold">OpenRouter</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-knoux-muted-text">Model:</span>
                  <span className="text-knoux-purple font-bold">cohere/north-mini-code:free</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-knoux-muted-text font-normal">Status:</span>
                  <span className="text-emerald-600 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                    AI Node Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Local Storage DB */}
          <div className="p-5 rounded-3xl border border-knoux-purple/10 bg-white shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-knoux-dark-text uppercase tracking-wider flex items-center gap-1.5 border-b border-knoux-purple/5 pb-2">
              <Database className="w-4 h-4 text-knoux-purple" /> Local Storage Configurations
            </h3>

            {/* Slider control of clipboard depth */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-knoux-dark-text block">Clipboard Cache Limit</span>
                  <span className="text-[11px] text-knoux-muted-text block">Restrict number of retained records to conserve disk space.</span>
                </div>
                <span className="text-xs font-mono font-bold text-knoux-purple">
                  {settings.maxHistorySize} Clips
                </span>
              </div>

              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="20"
                  max="250"
                  step="10"
                  value={settings.maxHistorySize}
                  onChange={(e) => handleHistorySize(parseInt(e.target.value))}
                  className="flex-1 accent-knoux-purple h-1.5 bg-knoux-purple/15 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Sync configuration toggle */}
            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-knoux-dark-text block">Knoux Cloud Synchronization</span>
                <span className="text-[11px] text-knoux-muted-text block">Securely synchronize clips across other devices.</span>
              </div>

              <button
                onClick={() => toggleSetting("syncToCloud")}
                className={`w-12 h-6 rounded-full transition-all flex items-center cursor-pointer p-0.5 ${
                  settings.syncToCloud ? "bg-knoux-purple justify-end" : "bg-knoux-purple/20 justify-start"
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
              </button>
            </div>
          </div>

          {/* Section: Security & Backup */}
          <div className="p-5 rounded-3xl border border-knoux-purple/10 bg-white shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-knoux-dark-text uppercase tracking-wider flex items-center gap-1.5 border-b border-knoux-purple/5 pb-2">
              <Lock className="w-4 h-4 text-knoux-purple" /> Security & Backup
            </h3>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-knoux-dark-text block">Export Database Backup</span>
                <span className="text-[11px] text-knoux-muted-text block">Download your current on-device clipboard items as a JSON backup file.</span>
              </div>
              <button
                type="button"
                onClick={handleExportDatabase}
                className="h-9 px-4 rounded-xl border border-knoux-purple/15 hover:bg-knoux-purple/5 text-knoux-purple text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap self-start sm:self-auto"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-knoux-purple/5">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-knoux-dark-text block">Import Database Backup</span>
                <span className="text-[11px] text-knoux-muted-text block">Restore clipboard items from a previously exported JSON backup.</span>
              </div>
              <label className="h-9 px-4 rounded-xl border border-knoux-purple/15 hover:bg-knoux-purple/5 text-knoux-purple text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap self-start sm:self-auto">
                <Upload className="w-3.5 h-3.5" />
                <span>Import JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportDatabase}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Master resets and database cleanings */}
          <div className="p-5 rounded-3xl border border-red-100 bg-red-50/40 space-y-4">
            <h3 className="text-xs font-extrabold text-red-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-red-100 pb-2">
              <Sliders className="w-4 h-4 text-red-600" /> Danger Zone Actions
            </h3>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-red-950 block">Reset Configuration Preferences</span>
                <span className="text-[11px] text-red-700/80 block">Restore initial layout densities and cloud options.</span>
              </div>

              <button
                onClick={handleResetSettings}
                className="h-9 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                Reset Preferences
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
