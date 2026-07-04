import React, { useMemo, useState } from "react";
import { AppSettings, ClipboardItem, NavTab } from "../types";
import { AlertTriangle, Check, Database, Download, Gauge, Layout, Lock, RotateCcw, Settings, ShieldCheck, Sparkles, Upload, Zap } from "lucide-react";
import { PRODUCTION_SERVICES, getServiceReadinessPercent } from "../services/productionCatalog";

interface SettingsPageProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  onClearHistory: () => void;
  setActiveTab: (tab: NavTab) => void;
  items: ClipboardItem[];
  onUpdateItems: (items: ClipboardItem[]) => void;
}

const defaults: AppSettings = { density: "comfortable", glowIntensity: "medium", privacyMode: false, autoAnalyze: true, maxHistorySize: 100, syncToCloud: false };

export default function SettingsPage({ settings, setSettings, onClearHistory, setActiveTab, items, onUpdateItems }: SettingsPageProps) {
  const [msg, setMsg] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const ready = getServiceReadinessPercent();
  const secure = useMemo(() => items.filter((i) => i.isSecure).length, [items]);
  const ai = useMemo(() => items.filter((i) => i.aiSummarized || i.aiTags?.length).length, [items]);
  const toast = (text: string) => { setMsg(text); setTimeout(() => setMsg(null), 2500); };
  const update = (patch: Partial<AppSettings>) => { setSettings((prev) => ({ ...prev, ...patch })); toast("Settings updated."); };

  const exportJson = () => {
    const payload = { product: "Knoux AI Clipboard Pro", exportedAt: new Date().toISOString(), settings, items };
    const a = document.createElement("a");
    a.href = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
    a.download = `knoux-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    toast("Backup exported.");
  };

  const importJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(String(e.target?.result || "{}"));
        const list = Array.isArray(parsed) ? parsed : parsed.items;
        if (!Array.isArray(list)) throw new Error("Invalid backup");
        onUpdateItems(list);
        toast(`Imported ${list.length} records.`);
      } catch {
        alert("Invalid KNOUX backup file.");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const clear = () => {
    if (!confirm) { setConfirm(true); toast("Press Clear History again to confirm."); return; }
    onClearHistory();
    setConfirm(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto select-none">
      {msg && <div className="fixed bottom-6 right-6 z-50 p-3 rounded-xl border border-emerald-100 bg-emerald-50 text-xs text-emerald-800 font-bold flex items-center gap-2 shadow-lg"><Check className="w-4 h-4" />{msg}</div>}
      <section className="rounded-3xl border border-knoux-purple/10 bg-gradient-to-r from-white via-knoux-lavender-white to-white p-6 shadow-knoux-glow space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-knoux-purple/10 bg-knoux-purple/5 text-[11px] font-black text-knoux-purple uppercase tracking-widest"><Settings className="w-4 h-4" /> KNOUX Production Settings</div>
        <h2 className="text-2xl font-black text-knoux-dark-text">Operational controls for AI, storage, security, and deployment readiness.</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[{ label: "Readiness", value: `${ready}%`, icon: Gauge }, { label: "Clips", value: items.length, icon: Database }, { label: "AI Items", value: ai, icon: Sparkles }, { label: "Secure", value: secure, icon: ShieldCheck }].map((m) => { const Icon = m.icon; return <div key={m.label} className="rounded-2xl border border-knoux-purple/10 bg-white p-3"><div className="flex justify-between text-[10px] text-knoux-muted-text font-bold"><span>{m.label}</span><Icon className="w-4 h-4 text-knoux-purple" /></div><div className="text-xl font-black font-mono mt-2">{m.value}</div></div>; })}</div>
      </section>
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        <aside className="space-y-2">{[{ label: "Overview", icon: Layout, tab: "overview" as NavTab }, { label: "AI Provider", icon: Sparkles, tab: "ai" as NavTab }, { label: "Clipboard", icon: Database, tab: "clipboard" as NavTab }, { label: "Security", icon: Lock, tab: "security" as NavTab }, { label: "Labs", icon: Zap, tab: "labs" as NavTab }].map((x) => { const Icon = x.icon; return <button key={x.label} onClick={() => setActiveTab(x.tab)} className="w-full p-3 rounded-2xl border border-knoux-purple/5 bg-white text-left text-xs font-bold flex items-center gap-2"><Icon className="w-4 h-4 text-knoux-purple" />{x.label}</button>; })}</aside>
        <main className="space-y-5">
          <div className="p-5 rounded-3xl border border-knoux-purple/10 bg-white shadow-sm space-y-4"><h3 className="text-xs font-black uppercase flex items-center gap-2"><Layout className="w-4 h-4 text-knoux-purple" /> Interface</h3><div className="flex gap-2">{(["compact", "comfortable"] as const).map((d) => <button key={d} onClick={() => update({ density: d })} className={`px-4 py-2 rounded-xl text-xs font-bold ${settings.density === d ? "bg-knoux-purple text-white" : "bg-knoux-purple/5 text-knoux-purple"}`}>{d}</button>)}</div><div className="flex gap-2">{(["low", "medium", "high"] as const).map((g) => <button key={g} onClick={() => update({ glowIntensity: g })} className={`px-4 py-2 rounded-xl text-xs font-bold ${settings.glowIntensity === g ? "bg-knoux-purple text-white" : "bg-knoux-purple/5 text-knoux-purple"}`}>{g}</button>)}</div></div>
          <div className="p-5 rounded-3xl border border-knoux-purple/10 bg-white shadow-sm space-y-4"><h3 className="text-xs font-black uppercase flex items-center gap-2"><Sparkles className="w-4 h-4 text-knoux-purple" /> AI & Storage</h3><button onClick={() => update({ autoAnalyze: !settings.autoAnalyze })} className="px-4 py-2 rounded-xl bg-knoux-purple/5 text-knoux-purple text-xs font-bold">Auto Analyze: {settings.autoAnalyze ? "ON" : "OFF"}</button><div className="space-y-2"><span className="text-xs font-bold">History limit: {settings.maxHistorySize}</span><input type="range" min="20" max="250" step="10" value={settings.maxHistorySize} onChange={(e) => update({ maxHistorySize: Number(e.target.value) })} className="w-full accent-knoux-purple" /></div><div className="grid grid-cols-1 md:grid-cols-2 gap-2">{PRODUCTION_SERVICES.slice(0, 4).map((s) => <div key={s.id} className="rounded-2xl border border-knoux-purple/5 bg-[#FCFAFF] p-3 text-[11px]"><b>{s.title}</b><br /><span className="text-knoux-muted-text">{s.status}</span></div>)}</div></div>
          <div className="p-5 rounded-3xl border border-knoux-purple/10 bg-white shadow-sm space-y-3"><h3 className="text-xs font-black uppercase flex items-center gap-2"><Database className="w-4 h-4 text-knoux-purple" /> Backup</h3><div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><button onClick={exportJson} className="h-10 rounded-xl border border-knoux-purple/15 text-knoux-purple text-xs font-bold flex items-center justify-center gap-2"><Download className="w-4 h-4" /> Export JSON</button><label className="h-10 rounded-xl border border-knoux-purple/15 text-knoux-purple text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"><Upload className="w-4 h-4" /> Import JSON<input type="file" accept=".json" onChange={importJson} className="hidden" /></label></div></div>
          <div className="p-5 rounded-3xl border border-red-100 bg-red-50/50 space-y-3"><h3 className="text-xs font-black uppercase text-red-800">Danger Zone</h3><div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><button onClick={() => { setSettings(defaults); toast("Defaults restored."); }} className="h-10 rounded-xl bg-white border border-red-100 text-red-700 text-xs font-bold flex items-center justify-center gap-2"><RotateCcw className="w-4 h-4" /> Reset Preferences</button><button onClick={clear} className="h-10 rounded-xl bg-red-600 text-white text-xs font-bold flex items-center justify-center gap-2"><AlertTriangle className="w-4 h-4" /> {confirm ? "Confirm Clear" : "Clear History"}</button></div></div>
        </main>
      </div>
    </div>
  );
}
