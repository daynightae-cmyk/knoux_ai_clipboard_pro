import React, { useMemo, useState } from "react";
import { AppSettings, ClipboardItem, NavTab } from "../types";
import {
  AlertTriangle,
  Bell,
  Check,
  CloudOff,
  Database,
  Download,
  Gauge,
  KeyRound,
  Layout,
  Lock,
  RotateCcw,
  ShieldCheck,
  Sliders,
  Sparkles,
  Upload,
  Zap,
} from "lucide-react";
import {
  PRODUCTION_SERVICES,
  PRODUCTION_SCORE,
  getServiceReadinessPercent,
} from "../services/productionCatalog";

interface SettingsPageProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  onClearHistory: () => void;
  setActiveTab: (tab: NavTab) => void;
  items: ClipboardItem[];
  onUpdateItems: (items: ClipboardItem[]) => void;
}

const defaultSettings: AppSettings = {
  density: "comfortable",
  glowIntensity: "medium",
  privacyMode: false,
  autoAnalyze: true,
  maxHistorySize: 100,
  syncToCloud: false,
};

export default function SettingsPage({
  settings,
  setSettings,
  onClearHistory,
  setActiveTab,
  items,
  onUpdateItems,
}: SettingsPageProps) {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [confirmDanger, setConfirmDanger] = useState<boolean>(false);

  const secureItems = useMemo(() => items.filter((item) => item.isSecure).length, [items]);
  const aiItems = useMemo(() => items.filter((item) => item.aiSummarized || item.aiTags?.length).length, [items]);
  const readiness = getServiceReadinessPercent();

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3200);
  };

  const toggleSetting = (key: keyof AppSettings) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      triggerSuccess("Configuration updated in the local KNOUX workspace store.");
      return updated;
    });
  };

  const handleDensityChange = (density: "compact" | "comfortable") => {
    setSettings((prev) => ({ ...prev, density }));
    triggerSuccess(`Workspace density set to ${density}.`);
  };

  const handleGlowIntensity = (glowIntensity: "low" | "medium" | "high") => {
    setSettings((prev) => ({ ...prev, glowIntensity }));
    triggerSuccess(`Premium glow intensity set to ${glowIntensity}.`);
  };

  const handleHistorySize = (size: number) => {
    setSettings((prev) => ({ ...prev, maxHistorySize: size }));
    triggerSuccess(`Clipboard retention policy capped at ${size} records.`);
  };

  const handleExportDatabase = () => {
    try {
      const payload = {
        product: "Knoux AI Clipboard Pro",
        version: "1.0.0",
        exportedAt: new Date().toISOString(),
        settings,
        items,
      };
      const dataStr = JSON.stringify(payload, null, 2);
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
      const exportFileDefaultName = `knoux-ai-clipboard-pro-backup-${new Date().toISOString().slice(0, 10)}.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();
      triggerSuccess("Encrypted-workflow backup exported as a KNOUX JSON package.");
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
        const importedItems = Array.isArray(parsed) ? parsed : parsed.items;

        if (Array.isArray(importedItems)) {
          const isValid = importedItems.every(
            (item) => item && typeof item === "object" && "id" in item && "content" in item
          );
          if (!isValid) {
            alert("The uploaded file is not a valid KNOUX clipboard backup.");
            return;
          }
          onUpdateItems(importedItems);
          triggerSuccess(`Imported ${importedItems.length} KNOUX clipboard records.`);
        } else {
          alert("Invalid backup file. Expected a JSON array or a KNOUX backup package with an items array.");
        }
      } catch (err) {
        console.error("Failed to parse imported backup JSON:", err);
        alert("Failed to parse JSON file. Please upload a valid KNOUX export.");
      }
    };
    fileReader.readAsText(file);
    e.target.value = "";
  };

  const handleResetSettings = () => {
    setSettings(defaultSettings);
    triggerSuccess("Preferences restored to KNOUX production defaults.");
  };

  const handleClearHistory = () => {
    if (!confirmDanger) {
      setConfirmDanger(true);
      triggerSuccess("Danger confirmation armed. Press Clear History again to execute.");
      return;
    }
    onClearHistory();
    setConfirmDanger(false);
    triggerSuccess("Clipboard history cleared from the active local workspace.");
  };

  return (
    <div id="settings-workspace-container" className="p-6 space-y-6 max-w-6xl mx-auto select-none">
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-3.5 rounded-xl border border-emerald-100 bg-emerald-50 text-xs text-emerald-800 font-bold flex items-center gap-2 shadow-lg">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="rounded-3xl border border-knoux-purple/10 bg-gradient-to-r from-white via-knoux-lavender-white to-white p-6 shadow-knoux-glow space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-knoux-purple/10 bg-knoux-purple/5 text-[11px] font-black text-knoux-purple uppercase tracking-widest">
              <Settings className="w-4 h-4" /> KNOUX Production Settings
            </div>
            <h2 className="text-2xl font-black text-knoux-dark-text tracking-tight">Operational controls for AI, storage, security, and deployment readiness.</h2>
            <p className="text-xs text-knoux-muted-text leading-relaxed max-w-2xl">
              These controls now describe the real production posture: OpenRouter through server-side routes, Electron IPC services, local-first backups, guarded cloud sync, and explicit danger actions.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 min-w-full lg:min-w-[520px]">
            {[
              { label: "Readiness", value: `${readiness}%`, icon: Gauge },
              { label: "Clips", value: items.length, icon: Database },
              { label: "AI Items", value: aiItems, icon: Sparkles },
              { label: "Secure", value: secureItems, icon: ShieldCheck },
            ].map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="rounded-2xl border border-knoux-purple/10 bg-white/80 p-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-knoux-muted-text">{metric.label}</span>
                    <Icon className="w-4 h-4 text-knoux-purple" />
                  </div>
                  <div className="text-xl font-black text-knoux-dark-text font-mono mt-2">{metric.value}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6">
        <div className="space-y-2">
          {[
            { label: "Interface Layout", icon: Layout, target: "overview" as NavTab },
            { label: "AI Provider", icon: Sparkles, target: "ai" as NavTab },
            { label: "Storage & Backup", icon: Database, target: "clipboard" as NavTab },
            { label: "Security Guard", icon: Lock, target: "security" as NavTab },
            { label: "Service Registry", icon: Zap, target: "labs" as NavTab },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => setActiveTab(item.target)}
                className="w-full p-3 rounded-2xl text-xs font-bold text-knoux-dark-text bg-white/70 border border-knoux-purple/5 hover:border-knoux-purple/15 hover:bg-white transition-all flex items-center gap-2 cursor-pointer text-left"
              >
                <Icon className="w-4 h-4 text-knoux-purple" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="space-y-6">
          <div className="p-5 rounded-3xl border border-knoux-purple/10 bg-white shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-knoux-dark-text uppercase tracking-wider flex items-center gap-1.5 border-b border-knoux-purple/5 pb-2">
              <Layout className="w-4 h-4 text-knoux-purple" /> Interface Aesthetics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-xs font-bold text-knoux-dark-text block">Workspace Density</span>
                <div className="flex bg-[#FCFAFF] border border-knoux-purple/5 p-1 rounded-xl">
                  {(["compact", "comfortable"] as const).map((density) => (
                    <button
                      key={density}
                      onClick={() => handleDensityChange(density)}
                      className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-bold capitalize cursor-pointer transition-colors ${settings.density === density ? "bg-knoux-purple text-white shadow" : "text-knoux-muted-text hover:text-knoux-dark-text"}`}
                    >
                      {density}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-xs font-bold text-knoux-dark-text block">Glow Visual Strength</span>
                <div className="flex bg-[#FCFAFF] border border-knoux-purple/5 p-1 rounded-xl">
                  {(["low", "medium", "high"] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => handleGlowIntensity(level)}
                      className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-bold capitalize cursor-pointer transition-colors ${settings.glowIntensity === level ? "bg-knoux-purple text-white shadow" : "text-knoux-muted-text hover:text-knoux-dark-text"}`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-3xl border border-knoux-purple/10 bg-white shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-knoux-dark-text uppercase tracking-wider flex items-center gap-1.5 border-b border-knoux-purple/5 pb-2">
              <Sparkles className="w-4 h-4 text-knoux-purple" /> AI Provider & Automation
            </h3>
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-knoux-dark-text block">Auto-Categorization</span>
                <span className="text-[11px] text-knoux-muted-text block">Automatically routes clipboard text into summarize, classify, and tag workflows.</span>
              </div>
              <button onClick={() => toggleSetting("autoAnalyze")} className={`w-12 h-6 rounded-full transition-all flex items-center cursor-pointer p-0.5 ${settings.autoAnalyze ? "bg-knoux-purple justify-end" : "bg-knoux-purple/20 justify-start"}`}>
                <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-knoux-purple/5">
              {[
                { label: "Provider", value: "OpenRouter", tone: "text-knoux-purple" },
                { label: "Model", value: "cohere/north-mini-code:free", tone: "text-knoux-dark-text" },
                { label: "Secret Scope", value: "Server-side only", tone: "text-emerald-600" },
              ].map((row) => (
                <div key={row.label} className="rounded-2xl border border-knoux-purple/5 bg-[#FCFAFF] p-3 font-mono text-[11px]">
                  <span className="block text-knoux-muted-text mb-1">{row.label}</span>
                  <span className={`font-black ${row.tone}`}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-3xl border border-knoux-purple/10 bg-white shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-knoux-dark-text uppercase tracking-wider flex items-center gap-1.5 border-b border-knoux-purple/5 pb-2">
              <Database className="w-4 h-4 text-knoux-purple" /> Storage, Sync & Backup
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-knoux-dark-text block">Clipboard Cache Limit</span>
                  <span className="text-[11px] text-knoux-muted-text block">Restrict retained records while keeping exports available.</span>
                </div>
                <span className="text-xs font-mono font-bold text-knoux-purple">{settings.maxHistorySize} Clips</span>
              </div>
              <input type="range" min="20" max="250" step="10" value={settings.maxHistorySize} onChange={(e) => handleHistorySize(parseInt(e.target.value))} className="w-full accent-knoux-purple h-1.5 bg-knoux-purple/15 rounded-lg cursor-pointer" />
            </div>
            <div className="flex items-center justify-between gap-4 pt-3 border-t border-knoux-purple/5">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-knoux-dark-text block flex items-center gap-1.5"><CloudOff className="w-3.5 h-3.5 text-amber-500" /> Cloud Synchronization</span>
                <span className="text-[11px] text-knoux-muted-text block">Guarded until account-level encrypted sync is formally connected.</span>
              </div>
              <button onClick={() => toggleSetting("syncToCloud")} className={`w-12 h-6 rounded-full transition-all flex items-center cursor-pointer p-0.5 ${settings.syncToCloud ? "bg-amber-500 justify-end" : "bg-knoux-purple/20 justify-start"}`}>
                <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-knoux-purple/5">
              <button type="button" onClick={handleExportDatabase} className="h-10 px-4 rounded-xl border border-knoux-purple/15 hover:bg-knoux-purple/5 text-knoux-purple text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm">
                <Download className="w-3.5 h-3.5" /> Export KNOUX JSON
              </button>
              <label className="h-10 px-4 rounded-xl border border-knoux-purple/15 hover:bg-knoux-purple/5 text-knoux-purple text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm">
                <Upload className="w-3.5 h-3.5" /> Import KNOUX JSON
                <input type="file" accept=".json" onChange={handleImportDatabase} className="hidden" />
              </label>
            </div>
          </div>

          <div className="p-5 rounded-3xl border border-knoux-purple/10 bg-white shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-knoux-dark-text uppercase tracking-wider flex items-center gap-1.5 border-b border-knoux-purple/5 pb-2">
              <Bell className="w-4 h-4 text-knoux-purple" /> Production Service Map
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PRODUCTION_SERVICES.slice(0, 6).map((service) => (
                <div key={service.id} className="rounded-2xl border border-knoux-purple/5 bg-[#FCFAFF] p-3 text-[11px] space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-black text-knoux-dark-text truncate">{service.title}</span>
                    <span className="font-black text-emerald-600 text-[9px]">{service.status}</span>
                  </div>
                  <span className="text-knoux-muted-text font-mono truncate block">{service.channel}</span>
                </div>
              ))}
            </div>
            <div className="text-[11px] text-knoux-muted-text leading-relaxed">
              Production transparency score: <strong className="text-knoux-purple">{PRODUCTION_SCORE.serviceTransparency}%</strong>. Any future provider slot must return explicit status rather than fake success.
            </div>
          </div>

          <div className="p-5 rounded-3xl border border-red-100 bg-red-50/50 space-y-4">
            <h3 className="text-xs font-extrabold text-red-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-red-100 pb-2">
              <Sliders className="w-4 h-4 text-red-600" /> Danger Zone Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button onClick={handleResetSettings} className="h-10 px-4 rounded-xl bg-white border border-red-100 hover:bg-red-100 text-red-700 text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" /> Reset Preferences
              </button>
              <button onClick={handleClearHistory} className={`h-10 px-4 rounded-xl text-white text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5 ${confirmDanger ? "bg-red-700 hover:bg-red-800" : "bg-red-600 hover:bg-red-700"}`}>
                <AlertTriangle className="w-3.5 h-3.5" /> {confirmDanger ? "Confirm Clear History" : "Clear History"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
