import React, { useMemo, useState } from "react";
import { AppSettings, ClipboardItem, NavTab } from "../types";
import { AlertTriangle, Check, Database, Download, Eye, EyeOff, Gauge, Languages, Layout, Lock, RotateCcw, Settings, ShieldCheck, Sparkles, Upload, Zap } from "lucide-react";
import { PRODUCTION_SERVICES, getServiceReadinessPercent } from "../services/productionCatalog";
import { clearLocalOpenRouterConfig, getLocalOpenRouterSummary, saveLocalOpenRouterConfig, testLocalOpenRouterKey } from "../services/aiClient";

interface SettingsPageProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  onClearHistory: () => void;
  setActiveTab: (tab: NavTab) => void;
  items: ClipboardItem[];
  onUpdateItems: (items: ClipboardItem[]) => void;
}

const defaults: AppSettings = { themeMode: "system", density: "comfortable", glowIntensity: "medium", privacyMode: false, autoAnalyze: true, maxHistorySize: 100, syncToCloud: false, language: "en" };
const DEFAULT_OPENROUTER_MODEL = "cohere/north-mini-code:free";

export default function SettingsPage({ settings, setSettings, onClearHistory, setActiveTab, items, onUpdateItems }: SettingsPageProps) {
  const [msg, setMsg] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [localKeyDraft, setLocalKeyDraft] = useState("");
  const [localModelDraft, setLocalModelDraft] = useState(DEFAULT_OPENROUTER_MODEL);
  const [localProvider, setLocalProvider] = useState(getLocalOpenRouterSummary());
  const [providerTest, setProviderTest] = useState<string | null>(null);
  const [testingProvider, setTestingProvider] = useState(false);
  const ready = getServiceReadinessPercent();
  const secure = useMemo(() => items.filter((i) => i.isSecure).length, [items]);
  const ai = useMemo(() => items.filter((i) => i.aiSummarized || i.aiTags?.length).length, [items]);
  const ar = settings.language === "ar";
  const toast = (text: string) => { setMsg(text); setTimeout(() => setMsg(null), 2500); };
  const update = (patch: Partial<AppSettings>) => { setSettings((prev) => ({ ...prev, ...patch })); toast(ar ? "تم تحديث الإعدادات." : "Settings updated."); };

  const refreshProvider = () => setLocalProvider(getLocalOpenRouterSummary());

  const saveProvider = () => {
    try {
      saveLocalOpenRouterConfig(localKeyDraft, localModelDraft || DEFAULT_OPENROUTER_MODEL);
      setLocalKeyDraft("");
      refreshProvider();
      setProviderTest(ar ? "تم حفظ المفتاح محليًا لهذا الجهاز فقط." : "Local OpenRouter key saved for this device only.");
      toast(ar ? "تم حفظ مزود OpenRouter المحلي." : "Local OpenRouter provider saved.");
    } catch {
      setProviderTest("provider_not_configured");
    }
  };

  const clearProvider = () => {
    clearLocalOpenRouterConfig();
    setLocalKeyDraft("");
    refreshProvider();
    setProviderTest(ar ? "تم مسح المفتاح المحلي." : "Local OpenRouter key cleared.");
  };

  const testProvider = async () => {
    const key = localKeyDraft.trim();
    if (!key) { setProviderTest(ar ? "ضع المفتاح أولًا لاختبار الاتصال." : "Enter the key first to test the connection."); return; }
    setTestingProvider(true);
    setProviderTest(null);
    try {
      const result = await testLocalOpenRouterKey(key, localModelDraft || DEFAULT_OPENROUTER_MODEL);
      setProviderTest(`ready — ${result.model || DEFAULT_OPENROUTER_MODEL}`);
    } catch (error: any) {
      setProviderTest(error?.message || "provider_unavailable");
    } finally {
      setTestingProvider(false);
    }
  };

  const exportJson = () => {
    const payload = { product: "Knoux AI Clipboard Pro", exportedAt: new Date().toISOString(), settings, items, note: "OpenRouter local keys are never included in exports." };
    const a = document.createElement("a");
    a.href = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
    a.download = `knoux-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    toast(ar ? "تم تصدير النسخة الاحتياطية بدون مفاتيح سرية." : "Backup exported without secret keys.");
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

  const nav = [
    { label: ar ? "الرئيسية" : "Overview", icon: Layout, tab: "overview" as NavTab },
    { label: ar ? "مزود الذكاء" : "AI Provider", icon: Sparkles, tab: "ai" as NavTab },
    { label: ar ? "الحافظة" : "Clipboard", icon: Database, tab: "clipboard" as NavTab },
    { label: ar ? "الباركود" : "Barcode", icon: Languages, tab: "barcode" as NavTab },
    { label: ar ? "الأمان" : "Security", icon: Lock, tab: "security" as NavTab },
    { label: ar ? "المختبرات" : "Labs", icon: Zap, tab: "labs" as NavTab },
  ];

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto select-none">
      {msg && <div className="fixed bottom-6 right-6 z-50 p-3 rounded-xl border border-emerald-200 bg-white text-xs text-emerald-700 font-bold flex items-center gap-2 shadow-lg"><Check className="w-4 h-4" />{msg}</div>}

      <section className="glass-elevated p-6 space-y-5">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-knoux-purple/10 bg-knoux-purple/5 text-[11px] font-black text-knoux-purple uppercase tracking-widest"><Settings className="w-4 h-4" /> KNOUX Production Settings</div>
        <h2 className="text-2xl font-black text-knoux-dark-text">{ar ? "تحكم تشغيلي كامل للذكاء والحافظة والأمان والتغليف." : "Operational controls for AI, storage, security, and deployment readiness."}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[{ label: ar ? "الجاهزية" : "Readiness", value: `${ready}%`, icon: Gauge }, { label: ar ? "العناصر" : "Clips", value: items.length, icon: Database }, { label: ar ? "ذكاء" : "AI Items", value: ai, icon: Sparkles }, { label: ar ? "آمن" : "Secure", value: secure, icon: ShieldCheck }].map((m) => { const Icon = m.icon; return <div key={m.label} className="rounded-2xl border border-knoux-purple/10 bg-white/70 p-3 shadow-knoux-glow"><div className="flex justify-between text-[10px] text-knoux-muted-text font-black uppercase"><span>{m.label}</span><Icon className="w-4 h-4 text-knoux-purple" /></div><div className="text-xl font-black font-mono mt-2 text-knoux-dark-text">{m.value}</div></div>; })}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        <aside className="space-y-2">{nav.map((x) => { const Icon = x.icon; return <button key={x.label} onClick={() => setActiveTab(x.tab)} className="w-full p-3 rounded-2xl border border-knoux-purple/10 bg-white/75 text-left text-xs font-bold flex items-center gap-2 text-knoux-dark-text hover:bg-knoux-lavender-white transition"><Icon className="w-4 h-4 text-knoux-purple" />{x.label}</button>; })}</aside>
        <main className="space-y-5">
          <div className="glass-panel p-5 space-y-4"><h3 className="text-xs font-black uppercase flex items-center gap-2 text-knoux-dark-text"><Languages className="w-4 h-4 text-knoux-purple" /> Language / اللغة</h3><div className="flex gap-2"><button onClick={() => update({ language: "en" })} className={`px-4 py-2 rounded-xl text-xs font-bold ${settings.language !== "ar" ? "bg-knoux-purple text-white" : "bg-white text-knoux-purple border border-knoux-purple/10"}`}>English</button><button onClick={() => update({ language: "ar" })} className={`px-4 py-2 rounded-xl text-xs font-bold ${settings.language === "ar" ? "bg-knoux-purple text-white" : "bg-white text-knoux-purple border border-knoux-purple/10"}`}>العربية</button></div></div>
          <div className="glass-panel p-5 space-y-4"><h3 className="text-xs font-black uppercase flex items-center gap-2 text-knoux-dark-text"><Layout className="w-4 h-4 text-knoux-purple" /> Appearance</h3><div className="flex flex-wrap gap-2">{(["day", "night", "system"] as const).map((themeMode) => <button key={themeMode} onClick={() => update({ themeMode })} className={`px-4 py-2 rounded-xl text-xs font-bold capitalize ${settings.themeMode === themeMode ? "bg-knoux-purple text-white" : "bg-white text-knoux-purple border border-knoux-purple/10"}`}>{themeMode}</button>)}</div><div className="flex gap-2">{(["compact", "comfortable"] as const).map((d) => <button key={d} onClick={() => update({ density: d })} className={`px-4 py-2 rounded-xl text-xs font-bold ${settings.density === d ? "bg-knoux-purple text-white" : "bg-white text-knoux-purple border border-knoux-purple/10"}`}>{d}</button>)}</div><div className="flex gap-2">{(["low", "medium", "high"] as const).map((g) => <button key={g} onClick={() => update({ glowIntensity: g })} className={`px-4 py-2 rounded-xl text-xs font-bold ${settings.glowIntensity === g ? "bg-knoux-purple text-white" : "bg-white text-knoux-purple border border-knoux-purple/10"}`}>{g}</button>)}</div></div>

          <div className="glass-panel p-5 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-xs font-black uppercase flex items-center gap-2 text-knoux-dark-text"><Sparkles className="w-4 h-4 text-knoux-purple" /> OpenRouter AI Provider</h3>
                <p className="text-[11px] text-knoux-muted-text mt-1 max-w-2xl">{ar ? "الإنتاج على Vercel يستخدم OPENROUTER_API_KEY من Environment Variables. مفتاح الجهاز المحلي مخصص لتطبيق EXE فقط، ولا يتم تصديره في النسخ الاحتياطية." : "Production on Vercel uses OPENROUTER_API_KEY from Environment Variables. The local device key is for the EXE app only and is never included in backups."}</p>
              </div>
              <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase ${localProvider.configured ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>{localProvider.configured ? "local key saved" : "provider_not_configured"}</span>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-900 flex gap-2 leading-relaxed">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{ar ? "التخزين المحلي هنا Guarded وليس خزنة مشفرة كاملة. لا تلصق المفتاح في GitHub أو Vercel preview comments أو كود الواجهة." : "Local storage here is Guarded, not a full encrypted vault. Never paste the key into GitHub, preview comments, or frontend source code."}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-3">
              <label className="space-y-1">
                <span className="text-[10px] uppercase font-black text-knoux-muted-text">Local OpenRouter API Key</span>
                <div className="flex gap-2">
                  <input type={showKey ? "text" : "password"} value={localKeyDraft} onChange={(e) => setLocalKeyDraft(e.target.value)} placeholder="sk-or-v1-REPLACE_ME" className="flex-1 h-10 rounded-xl border border-knoux-purple/10 bg-white px-3 text-xs font-mono text-knoux-dark-text outline-none focus:border-knoux-purple" />
                  <button type="button" onClick={() => setShowKey((v) => !v)} className="w-10 h-10 rounded-xl border border-knoux-purple/10 bg-white text-knoux-purple flex items-center justify-center">{showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                </div>
              </label>
              <label className="space-y-1">
                <span className="text-[10px] uppercase font-black text-knoux-muted-text">Active model</span>
                <input value={localModelDraft} onChange={(e) => setLocalModelDraft(e.target.value)} className="w-full h-10 rounded-xl border border-knoux-purple/10 bg-white px-3 text-xs font-mono text-knoux-dark-text outline-none focus:border-knoux-purple" />
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              <button onClick={saveProvider} className="px-4 py-2 rounded-xl bg-knoux-purple text-white text-xs font-bold">Save Local Key</button>
              <button onClick={testProvider} disabled={testingProvider} className="px-4 py-2 rounded-xl border border-knoux-purple/10 bg-white text-knoux-purple text-xs font-bold disabled:opacity-60">{testingProvider ? "Testing..." : "Test Connection"}</button>
              <button onClick={clearProvider} className="px-4 py-2 rounded-xl border border-red-200 bg-white text-red-600 text-xs font-bold">Clear Local Key</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px]">
              <div className="rounded-2xl border border-knoux-purple/10 bg-white/70 p-3"><b>Status</b><br /><span className="text-knoux-muted-text">{localProvider.configured ? "ready-local-guarded" : "provider_not_configured"}</span></div>
              <div className="rounded-2xl border border-knoux-purple/10 bg-white/70 p-3"><b>Saved key</b><br /><span className="text-knoux-muted-text font-mono">{localProvider.keyPreview || "none"}</span></div>
              <div className="rounded-2xl border border-knoux-purple/10 bg-white/70 p-3"><b>Last test</b><br /><span className="text-knoux-muted-text">{providerTest || "not tested"}</span></div>
            </div>
          </div>

          <div className="glass-panel p-5 space-y-4"><h3 className="text-xs font-black uppercase flex items-center gap-2 text-knoux-dark-text"><Sparkles className="w-4 h-4 text-knoux-purple" /> AI & Storage</h3><button onClick={() => update({ autoAnalyze: !settings.autoAnalyze })} className="px-4 py-2 rounded-xl bg-knoux-purple/10 text-knoux-purple text-xs font-bold">Auto Analyze: {settings.autoAnalyze ? "ON" : "OFF"}</button><button disabled title="Cloud sync is disabled until a real sync backend exists." className="px-4 py-2 rounded-xl bg-slate-100 text-slate-500 text-xs font-bold cursor-not-allowed">Cloud Sync: Disabled</button><div className="space-y-2"><span className="text-xs font-bold text-knoux-dark-text">History limit: {settings.maxHistorySize}</span><input type="range" min="20" max="250" step="10" value={settings.maxHistorySize} onChange={(e) => update({ maxHistorySize: Number(e.target.value) })} className="w-full accent-knoux-purple" /></div><div className="grid grid-cols-1 md:grid-cols-2 gap-2">{PRODUCTION_SERVICES.slice(0, 4).map((s) => <div key={s.id} className="rounded-2xl border border-knoux-purple/10 bg-white/70 p-3 text-[11px] text-knoux-dark-text"><b>{s.displayName}</b><br /><span className="text-knoux-muted-text">{s.status}</span></div>)}</div></div>
          <div className="glass-panel p-5 space-y-3"><h3 className="text-xs font-black uppercase flex items-center gap-2 text-knoux-dark-text"><Database className="w-4 h-4 text-knoux-purple" /> Backup</h3><div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><button onClick={exportJson} className="h-10 rounded-xl border border-knoux-purple/10 text-knoux-purple text-xs font-bold flex items-center justify-center gap-2 bg-white"><Download className="w-4 h-4" /> Export JSON</button><label className="h-10 rounded-xl border border-knoux-purple/10 text-knoux-purple text-xs font-bold flex items-center justify-center gap-2 cursor-pointer bg-white"><Upload className="w-4 h-4" /> Import JSON<input type="file" accept=".json" onChange={importJson} className="hidden" /></label></div><p className="text-[10px] text-knoux-muted-text">OpenRouter local keys are excluded from backup exports.</p></div>
          <div className="p-5 rounded-3xl border border-red-200 bg-red-50 space-y-3"><h3 className="text-xs font-black uppercase text-red-600">Danger Zone</h3><div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><button onClick={() => { setSettings(defaults); toast(ar ? "تمت استعادة الافتراضي." : "Defaults restored."); }} className="h-10 rounded-xl bg-white border border-red-200 text-red-600 text-xs font-bold flex items-center justify-center gap-2"><RotateCcw className="w-4 h-4" /> Reset Preferences</button><button onClick={clear} className="h-10 rounded-xl bg-red-600 text-white text-xs font-bold flex items-center justify-center gap-2"><AlertTriangle className="w-4 h-4" /> {confirm ? "Confirm Clear" : "Clear History"}</button></div></div>
        </main>
      </div>
    </div>
  );
}
