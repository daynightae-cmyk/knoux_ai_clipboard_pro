import React, { useMemo, useState } from "react";
import { AppSettings, ClipboardItem, NavTab } from "../types";
import { AlertTriangle, Check, Database, Download, Gauge, Languages, Layout, Lock, RotateCcw, Settings, ShieldCheck, Sparkles, Upload, Zap } from "lucide-react";
import { PRODUCTION_SERVICES, getServiceReadinessPercent } from "../services/productionCatalog";

interface SettingsPageProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  onClearHistory: () => void;
  setActiveTab: (tab: NavTab) => void;
  items: ClipboardItem[];
  onUpdateItems: (items: ClipboardItem[]) => void;
}

const defaults: AppSettings = { density: "comfortable", glowIntensity: "medium", privacyMode: false, autoAnalyze: true, maxHistorySize: 100, syncToCloud: false, language: "en" };

export default function SettingsPage({ settings, setSettings, onClearHistory, setActiveTab, items, onUpdateItems }: SettingsPageProps) {
  const [msg, setMsg] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const ready = getServiceReadinessPercent();
  const secure = useMemo(() => items.filter((i) => i.isSecure).length, [items]);
  const ai = useMemo(() => items.filter((i) => i.aiSummarized || i.aiTags?.length).length, [items]);
  const ar = settings.language === "ar";
  const toast = (text: string) => { setMsg(text); setTimeout(() => setMsg(null), 2500); };
  const update = (patch: Partial<AppSettings>) => { setSettings((prev) => ({ ...prev, ...patch })); toast(ar ? "تم تحديث الإعدادات." : "Settings updated."); };

  const exportJson = () => {
    const payload = { product: "Knoux AI Clipboard Pro", exportedAt: new Date().toISOString(), settings, items };
    const a = document.createElement("a");
    a.href = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
    a.download = `knoux-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    toast(ar ? "تم تصدير النسخة الاحتياطية." : "Backup exported.");
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
        toast(ar ? `تم استيراد ${list.length} عنصر.` : `Imported ${list.length} records.`);
      } catch {
        alert(ar ? "ملف KNOUX غير صحيح." : "Invalid KNOUX backup file.");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const clear = () => {
    if (!confirm) { setConfirm(true); toast(ar ? "اضغط مسح مرة أخرى للتأكيد." : "Press Clear History again to confirm."); return; }
    onClearHistory();
    setConfirm(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto select-none">
      {msg && <div className="fixed bottom-6 right-6 z-50 p-3 rounded-xl border border-emerald-300/20 bg-emerald-400/10 text-xs text-emerald-200 font-bold flex items-center gap-2 shadow-lg"><Check className="w-4 h-4" />{msg}</div>}
      <section className="rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur-2xl p-6 shadow-knoux-glow space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#D8B8EC]/20 bg-[#8A2BE2]/15 text-[11px] font-black text-[#D8B8EC] uppercase tracking-widest"><Settings className="w-4 h-4" /> KNOUX Production Settings</div>
        <h2 className="text-2xl font-black text-white">{ar ? "تحكم تشغيلي كامل للذكاء والحافظة والأمان والتغليف." : "Operational controls for AI, storage, security, and deployment readiness."}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[{ label: ar ? "الجاهزية" : "Readiness", value: `${ready}%`, icon: Gauge }, { label: ar ? "العناصر" : "Clips", value: items.length, icon: Database }, { label: ar ? "ذكاء" : "AI Items", value: ai, icon: Sparkles }, { label: ar ? "آمن" : "Secure", value: secure, icon: ShieldCheck }].map((m) => { const Icon = m.icon; return <div key={m.label} className="rounded-2xl border border-white/10 bg-black/20 p-3"><div className="flex justify-between text-[10px] text-[#BFA7DB] font-bold"><span>{m.label}</span><Icon className="w-4 h-4 text-[#D8B8EC]" /></div><div className="text-xl font-black font-mono mt-2 text-white">{m.value}</div></div>; })}</div>
      </section>
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        <aside className="space-y-2">{[{ label: ar ? "الرئيسية" : "Overview", icon: Layout, tab: "overview" as NavTab }, { label: ar ? "مزود الذكاء" : "AI Provider", icon: Sparkles, tab: "ai" as NavTab }, { label: ar ? "الحافظة" : "Clipboard", icon: Database, tab: "clipboard" as NavTab }, { label: ar ? "الباركود" : "Barcode", icon: Languages, tab: "barcode" as NavTab }, { label: ar ? "الأمان" : "Security", icon: Lock, tab: "security" as NavTab }, { label: ar ? "المختبرات" : "Labs", icon: Zap, tab: "labs" as NavTab }].map((x) => { const Icon = x.icon; return <button key={x.label} onClick={() => setActiveTab(x.tab)} className="w-full p-3 rounded-2xl border border-white/10 bg-white/[0.06] text-left text-xs font-bold flex items-center gap-2 text-white hover:bg-white/[0.09]"><Icon className="w-4 h-4 text-[#D8B8EC]" />{x.label}</button>; })}</aside>
        <main className="space-y-5">
          <div className="p-5 rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur-xl shadow-sm space-y-4"><h3 className="text-xs font-black uppercase flex items-center gap-2 text-white"><Languages className="w-4 h-4 text-[#D8B8EC]" /> Language / اللغة</h3><div className="flex gap-2"><button onClick={() => update({ language: "en" })} className={`px-4 py-2 rounded-xl text-xs font-bold ${settings.language !== "ar" ? "bg-[#8A2BE2] text-white" : "bg-white/[0.07] text-[#D8B8EC]"}`}>English</button><button onClick={() => update({ language: "ar" })} className={`px-4 py-2 rounded-xl text-xs font-bold ${settings.language === "ar" ? "bg-[#8A2BE2] text-white" : "bg-white/[0.07] text-[#D8B8EC]"}`}>العربية</button></div></div>
          <div className="p-5 rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur-xl shadow-sm space-y-4"><h3 className="text-xs font-black uppercase flex items-center gap-2 text-white"><Layout className="w-4 h-4 text-[#D8B8EC]" /> Interface</h3><div className="flex gap-2">{(["compact", "comfortable"] as const).map((d) => <button key={d} onClick={() => update({ density: d })} className={`px-4 py-2 rounded-xl text-xs font-bold ${settings.density === d ? "bg-[#8A2BE2] text-white" : "bg-white/[0.07] text-[#D8B8EC]"}`}>{d}</button>)}</div><div className="flex gap-2">{(["low", "medium", "high"] as const).map((g) => <button key={g} onClick={() => update({ glowIntensity: g })} className={`px-4 py-2 rounded-xl text-xs font-bold ${settings.glowIntensity === g ? "bg-[#8A2BE2] text-white" : "bg-white/[0.07] text-[#D8B8EC]"}`}>{g}</button>)}</div></div>
          <div className="p-5 rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur-xl shadow-sm space-y-4"><h3 className="text-xs font-black uppercase flex items-center gap-2 text-white"><Sparkles className="w-4 h-4 text-[#D8B8EC]" /> AI & Storage</h3><button onClick={() => update({ autoAnalyze: !settings.autoAnalyze })} className="px-4 py-2 rounded-xl bg-[#8A2BE2]/20 text-[#D8B8EC] text-xs font-bold">Auto Analyze: {settings.autoAnalyze ? "ON" : "OFF"}</button><div className="space-y-2"><span className="text-xs font-bold text-white">History limit: {settings.maxHistorySize}</span><input type="range" min="20" max="250" step="10" value={settings.maxHistorySize} onChange={(e) => update({ maxHistorySize: Number(e.target.value) })} className="w-full accent-[#8A2BE2]" /></div><div className="grid grid-cols-1 md:grid-cols-2 gap-2">{PRODUCTION_SERVICES.slice(0, 4).map((s) => <div key={s.id} className="rounded-2xl border border-white/10 bg-black/20 p-3 text-[11px] text-white"><b>{s.title}</b><br /><span className="text-[#BFA7DB]">{s.status}</span></div>)}</div></div>
          <div className="p-5 rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur-xl shadow-sm space-y-3"><h3 className="text-xs font-black uppercase flex items-center gap-2 text-white"><Database className="w-4 h-4 text-[#D8B8EC]" /> Backup</h3><div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><button onClick={exportJson} className="h-10 rounded-xl border border-white/10 text-[#D8B8EC] text-xs font-bold flex items-center justify-center gap-2"><Download className="w-4 h-4" /> Export JSON</button><label className="h-10 rounded-xl border border-white/10 text-[#D8B8EC] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"><Upload className="w-4 h-4" /> Import JSON<input type="file" accept=".json" onChange={importJson} className="hidden" /></label></div></div>
          <div className="p-5 rounded-3xl border border-red-400/20 bg-red-500/10 space-y-3"><h3 className="text-xs font-black uppercase text-red-200">Danger Zone</h3><div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><button onClick={() => { setSettings(defaults); toast(ar ? "تمت استعادة الافتراضي." : "Defaults restored."); }} className="h-10 rounded-xl bg-white/[0.07] border border-red-400/20 text-red-100 text-xs font-bold flex items-center justify-center gap-2"><RotateCcw className="w-4 h-4" /> Reset Preferences</button><button onClick={clear} className="h-10 rounded-xl bg-red-600 text-white text-xs font-bold flex items-center justify-center gap-2"><AlertTriangle className="w-4 h-4" /> {confirm ? "Confirm Clear" : "Clear History"}</button></div></div>
        </main>
      </div>
    </div>
  );
}
