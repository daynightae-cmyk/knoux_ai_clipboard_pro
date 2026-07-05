import React, { useMemo, useState } from "react";
import { AlertTriangle, Check, Database, Download, Gauge, Languages, Layout, Lock, RefreshCw, RotateCcw, ServerCog, Settings, ShieldCheck, Sparkles, Upload, Zap, Loader, Play, Copy } from "lucide-react";
import { AppSettings, ClipboardItem, NavTab } from "../types";
import { PRODUCTION_SERVICES, getServiceReadinessPercent } from "../services/productionCatalog";
import { checkProviderRoute, deriveAIStatus } from "../services/aiClient";
import i18n from "../utils/i18n";
import { ServiceCard } from "./ServiceCard";

interface SettingsPageProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  onClearHistory: () => void;
  setActiveTab: (tab: NavTab) => void;
  items: ClipboardItem[];
  onUpdateItems: (items: ClipboardItem[]) => void;
}

const defaults: AppSettings = { themeMode: "system", density: "comfortable", glowIntensity: "medium", privacyMode: false, autoAnalyze: true, maxHistorySize: 100, syncToCloud: false, language: "en" };

export default function SettingsPageServerOnly({ settings, setSettings, onClearHistory, setActiveTab, items, onUpdateItems }: SettingsPageProps) {
  const [msg, setMsg] = useState<string | null>(null);
  const t = (key: string, fallback: string, params?: Record<string, string | number>) => {
    let value = i18n.t(key, fallback);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        value = value.replace(`{${k}}`, String(v));
      });
    }
    return value;
  };
  const [confirm, setConfirm] = useState(false);
  const [providerStatus, setProviderStatus] = useState<{ status: string; configured?: boolean; model?: string; error?: string } | null>(null);
  const [checkingProvider, setCheckingProvider] = useState(false);
  const ready = getServiceReadinessPercent();
  const secure = useMemo(() => items.filter((i) => i.isSecure).length, [items]);
  const ai = useMemo(() => items.filter((i) => i.aiSummarized || i.aiTags?.length).length, [items]);
  const ar = settings.language === "ar";
  const toast = (text: string) => { setMsg(text); setTimeout(() => setMsg(null), 2500); };
  const update = (patch: Partial<AppSettings>) => { setSettings((prev) => ({ ...prev, ...patch })); toast(t("settings.settingsUpdated", ar ? "تم تحديث الإعدادات." : "Settings updated.")); };

  const checkProvider = async () => {
    setCheckingProvider(true);
    setProviderStatus(null);
    try {
      const result = await checkProviderRoute("chat");
      const mapped = deriveAIStatus(result, { hasSensitiveContent: false, isRuntimeGuarded: false });
      setProviderStatus({ status: mapped.label, configured: result.configured, model: result.model, error: result.error, detail: mapped.detail, tone: mapped.tone });
      toast(mapped.detail);
    } catch (error: any) {
      const mapped = deriveAIStatus({ ok: false, configured: false, status: error?.message || "network_error" }, { hasSensitiveContent: false, isRuntimeGuarded: false });
      setProviderStatus({ status: mapped.label, configured: false, detail: mapped.detail, tone: mapped.tone });
    } finally {
      setCheckingProvider(false);
    }
  };

  const exportJson = () => {
    const payload = { product: "Knoux AI Clipboard Pro", exportedAt: new Date().toISOString(), settings, items, note: "Renderer settings export contains no provider credentials." };
    const a = document.createElement("a");
    a.href = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
    a.download = `knoux-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    toast(t("settings.backupExported", ar ? "تم تصدير النسخة الاحتياطية." : "Backup exported."));
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
        toast(t("settings.backupImported", ar ? `تم استيراد ${list.length} عنصر.` : `Imported ${list.length} records.`, { count: list.length }));
      } catch {
        alert(t("settings.invalidBackup", ar ? "ملف KNOUX غير صحيح." : "Invalid KNOUX backup file."));
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const clear = () => {
    if (!confirm) { setConfirm(true); toast(t("settings.confirmClearHint", ar ? "اضغط مسح مرة أخرى للتأكيد." : "Press Clear History again to confirm.")); return; }
    onClearHistory();
    setConfirm(false);
  };

  const handleServiceAction = async (serviceId: string, action: string): Promise<{ success: boolean; message: string }> => {
    console.log(`Action '${action}' triggered for service '${serviceId}'`);
    // In a real implementation, this would call an IPC handler
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate async work
    if (serviceId === 'ai-summarize') {
        return { success: true, message: `Action '${action}' for '${serviceId}' completed successfully. Output: This is a dummy summary.` };
    }
    return { success: false, message: `Action '${action}' for '${serviceId}' is not implemented yet.` };
  };

  const nav = [
    { label: t("settings.nav.overview", "Overview"), icon: Layout, tab: "overview" as NavTab },
    { label: t("settings.nav.aiProvider", "AI Provider"), icon: Sparkles, tab: "ai" as NavTab },
    { label: t("settings.nav.clipboard", "Clipboard"), icon: Database, tab: "clipboard" as NavTab },
    { label: t("settings.nav.barcode", "Barcode"), icon: Languages, tab: "barcode" as NavTab },
    { label: t("settings.nav.security", "Security"), icon: Lock, tab: "security" as NavTab },
    { label: t("settings.nav.labs", "Labs"), icon: Zap, tab: "labs" as NavTab },
  ];

  const providerTone = providerStatus?.tone === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : providerStatus?.tone === "danger" ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200";

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-7xl mx-auto select-none">
      {msg && <div className="fixed bottom-6 right-6 z-50 p-3 rounded-xl border border-emerald-200 bg-white text-xs text-emerald-700 font-bold flex items-center gap-2 shadow-lg"><Check className="w-4 h-4" />{msg}</div>}

      <section className="glass-elevated p-6 space-y-5">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-knoux-purple/10 bg-knoux-purple/5 text-[11px] font-black text-knoux-purple uppercase tracking-widest"><Settings className="w-4 h-4" /> {t("settings.productionBadge", "KNOUX Production Settings")}</div>
        <h2 className="text-2xl font-black text-knoux-dark-text">{t("settings.heroTitle", "Operational controls for AI, storage, security, and deployment readiness.")}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[{ label: t("settings.metrics.readiness", "Readiness"), value: `${ready}%`, icon: Gauge }, { label: t("settings.metrics.clips", "Clips"), value: items.length, icon: Database }, { label: t("settings.metrics.aiItems", "AI Items"), value: ai, icon: Sparkles }, { label: t("settings.metrics.secure", "Secure"), value: secure, icon: ShieldCheck }].map((m) => { const Icon = m.icon; return <div key={m.label} className="rounded-2xl border border-knoux-purple/10 bg-white/70 p-3 shadow-knoux-glow"><div className="flex justify-between text-[10px] text-knoux-muted-text font-black uppercase"><span>{m.label}</span><Icon className="w-4 h-4 text-knoux-purple" /></div><div className="text-xl font-black font-mono mt-2 text-knoux-dark-text">{m.value}</div></div>; })}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        <aside className="space-y-2">{nav.map((x) => { const Icon = x.icon; return <button key={x.label} onClick={() => setActiveTab(x.tab)} className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl text-left text-sm font-bold flex items-center gap-3 text-slate-700 dark:text-slate-200 hover:bg-violet-50 dark:hover:bg-slate-700/70 transition-all duration-200 shadow-sm hover:shadow-md hover:border-violet-200 dark:hover:border-violet-500/50"><Icon className="w-5 h-5 text-violet-500" />{x.label}</button>; })}</aside>
        <main className="space-y-6">
          <div className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 space-y-4 shadow-sm"><h3 className="text-sm font-black uppercase flex items-center gap-3 text-slate-800 dark:text-slate-200"><Languages className="w-5 h-5 text-violet-500" /> {t("settings.heroSubtitle", "Language / اللغة")}</h3><div className="flex gap-3"><button onClick={() => update({ language: "en" })} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${settings.language !== "ar" ? "bg-violet-600 text-white shadow-lg" : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"}`}>English</button><button onClick={() => update({ language: "ar" })} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${settings.language === "ar" ? "bg-violet-600 text-white shadow-lg" : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"}`}>العربية</button></div></div>

          <div className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 space-y-6 shadow-sm"><h3 className="text-sm font-black uppercase flex items-center gap-3 text-slate-800 dark:text-slate-200"><Layout className="w-5 h-5 text-violet-500" /> {t("settings.appearance", "Appearance")}</h3><div className="space-y-4"><div className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">{t("settings.themeMode", "Theme Mode")}</div><div className="flex flex-wrap gap-3">{(["light", "dark", "system"] as const).map((themeMode) => <button key={themeMode} onClick={() => update({ themeMode })} className={`px-6 py-3 rounded-xl text-sm font-bold capitalize transition-all ${settings.themeMode === themeMode ? "bg-violet-600 text-white shadow-lg" : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"}`}>{t(`settings.themes.${themeMode}`, themeMode)}</button>)}</div></div><div className="space-y-4"><div className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">{t("settings.uiDensity", "UI Density")}</div><div className="flex flex-wrap gap-3">{(["compact", "comfortable", "spacious"] as const).map((density) => <button key={density} onClick={() => update({ density })} className={`px-6 py-3 rounded-xl text-sm font-bold capitalize transition-all ${settings.density === density ? "bg-violet-600 text-white shadow-lg" : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"}`}>{t(`settings.densities.${density}`, density)}</button>)}</div></div><div className="space-y-4"><div className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">{t("settings.glowAccent", "Glow / Transparency Accent")}</div><div className="flex flex-wrap gap-3">{(["low", "medium", "high"] as const).map((g) => <button key={g} onClick={() => update({ glowIntensity: g })} className={`px-6 py-3 rounded-xl text-sm font-bold capitalize transition-all ${settings.glowIntensity === g ? "bg-violet-600 text-white shadow-lg" : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"}`}>{t(`settings.glows.${g}`, g)}</button>)}</div></div></div>

          <div className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 space-y-6 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div><h3 className="text-sm font-black uppercase flex items-center gap-3 text-slate-800 dark:text-slate-200"><ServerCog className="w-5 h-5 text-violet-500" /> {t("settings.providerDiagnostics", "AI Provider Diagnostics")}</h3><p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-2xl">{t("settings.providerDescription", "AI execution is routed through the server endpoint only.")}</p></div><span className={`px-4 py-2 rounded-full text-xs font-bold uppercase border ${providerTone}`}>{providerStatus?.status || t("settings.providerNotChecked", "provider_not_checked")}</span></div><div className="rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4 text-sm text-amber-800 dark:text-amber-300 flex gap-3 leading-relaxed"><AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" /><span>{ar ? "إذا كان مزود السيرفر غير مضبوط سيظهر provider_not_configured بوضوح." : "If the server provider is missing, the app reports provider_not_configured honestly."}</span></div><div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm"><div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4"><b className="text-slate-800 dark:text-slate-200">{t("settings.providerStatus", "Status")}</b><br /><span className="text-slate-500 dark:text-slate-400">{providerStatus?.status || t("settings.providerNotChecked", "provider_not_checked")}</span></div><div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4"><b className="text-slate-800 dark:text-slate-200">{t("settings.providerModel", "Model")}</b><br /><span className="text-slate-500 dark:text-slate-400 font-mono">{providerStatus?.model || "server default"}</span></div><div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4"><b className="text-slate-800 dark:text-slate-200">{t("settings.providerRuntime", "Runtime")}</b><br /><span className="text-slate-500 dark:text-slate-400">{t("settings.providerServerOnly", "server-route-only")}</span></div></div><button onClick={checkProvider} disabled={checkingProvider} className="px-6 py-3 rounded-xl bg-violet-600 text-white text-sm font-bold disabled:opacity-60 flex items-center gap-3 hover:bg-violet-700 transition-all shadow-lg hover:shadow-xl disabled:shadow-none disabled:bg-violet-400"><RefreshCw className={`w-5 h-5 ${checkingProvider ? "animate-spin" : ""}`} />{checkingProvider ? t("settings.providerChecking", "Checking...") : t("settings.providerCheck", "Check Server Provider")}</button></div>

          <div className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 space-y-6 shadow-sm"><h3 className="text-sm font-black uppercase flex items-center gap-3 text-slate-800 dark:text-slate-200"><Sparkles className="w-5 h-5 text-violet-500" /> {t("settings.aiStorage", "AI & Storage")}</h3><div className="flex flex-wrap gap-3"><button onClick={() => update({ autoAnalyze: !settings.autoAnalyze })} className="px-6 py-3 rounded-xl bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 text-sm font-bold">{t("settings.autoAnalyze", "Auto Analyze")}: {settings.autoAnalyze ? "ON" : "OFF"}</button><button disabled title={t("settings.guardedNotice", "Cloud sync is disabled until a real sync backend exists.")} className="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-sm font-bold cursor-not-allowed">{t("settings.cloudSync", "Cloud Sync")}: {t("settings.cloudGuarded", "Guarded")}</button></div><div className="space-y-3"><span className="text-sm font-bold text-slate-700 dark:text-slate-200">{t("settings.historyLimit", "History limit")}: {settings.maxHistorySize}</span><input type="range" min="20" max="250" step="10" value={settings.maxHistorySize} onChange={(e) => update({ maxHistorySize: Number(e.target.value) })} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-600" /></div><div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">{PRODUCTION_SERVICES.slice(0, 2).map((s) => <ServiceCard key={s.id} service={s} onAction={handleServiceAction} />)}</div></div>
          <div className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 space-y-4 shadow-sm"><h3 className="text-sm font-black uppercase flex items-center gap-3 text-slate-800 dark:text-slate-200"><Database className="w-5 h-5 text-violet-500" /> {t("settings.backup", "Backup")}</h3><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><button onClick={exportJson} className="h-14 rounded-xl border border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-300 text-sm font-bold flex items-center justify-center gap-3 bg-violet-50 dark:bg-violet-500/10 hover:bg-violet-100 dark:hover:bg-violet-500/20 transition-all"><Download className="w-5 h-5" /> {t("settings.exportJson", "Export JSON")}</button><label className="h-14 rounded-xl border border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-300 text-sm font-bold flex items-center justify-center gap-3 cursor-pointer bg-violet-50 dark:bg-violet-500/10 hover:bg-violet-100 dark:hover:bg-violet-500/20 transition-all"><Upload className="w-5 h-5" /> {t("settings.importJson", "Import JSON")}<input type="file" accept=".json" onChange={importJson} className="hidden" /></label></div><p className="text-xs text-slate-500 dark:text-slate-400 pt-2">{t("settings.backupNotice", "Provider runtime configuration is excluded from backup exports.")}</p></div>
          <div className="p-6 rounded-3xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20 space-y-4"><h3 className="text-sm font-black uppercase text-red-600 dark:text-red-400">{t("settings.dangerZone", "Danger Zone")}</h3><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><button onClick={() => { setSettings(defaults); toast(t("settings.defaultsRestored", ar ? "تمت استعادة الافتراضي." : "Defaults restored.")); }} className="h-14 rounded-xl bg-white dark:bg-slate-800 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 text-sm font-bold flex items-center justify-center gap-3 hover:bg-red-100/50 dark:hover:bg-red-900/30 transition-all"><RotateCcw className="w-5 h-5" /> {t("settings.resetPreferences", "Reset Preferences")}</button><button onClick={clear} className="h-14 rounded-xl bg-red-600 text-white text-sm font-bold flex items-center justify-center gap-3 hover:bg-red-700 transition-all shadow-lg hover:shadow-xl"><AlertTriangle className="w-5 h-5" /> {confirm ? t("settings.confirmClear", "Confirm Clear") : t("settings.clearHistory", "Clear History")}</button></div></div>
        </main>
      </div>
    </div>
  );
}
