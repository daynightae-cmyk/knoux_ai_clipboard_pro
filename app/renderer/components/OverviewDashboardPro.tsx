import { ClipboardItem, ClipboardType, NavTab } from "../types";
import { getStorageHealth } from "../services/runtimeServices";
import { Activity, Clipboard, Database, Lock, Pin, ShieldAlert, Sparkles, TrendingUp, Zap } from "lucide-react";
import { useState } from "react";

interface Props {
  items: ClipboardItem[];
  onCopyItem: (item: ClipboardItem) => void;
  onTogglePin: (item: ClipboardItem) => void;
  onDeleteItem: (item: ClipboardItem) => void;
  setActiveTab: (tab: NavTab) => void;
  setAiInputText: (text: string) => void;
  onAddNewItem?: (content: string, type: ClipboardType, source?: string) => void;
}

export default function OverviewDashboardPro({ items, onCopyItem, setActiveTab, setAiInputText, onAddNewItem }: Props) {
  const [notice, setNotice] = useState<string | null>(null);
  const health = getStorageHealth(items);
  const latest = items[0]?.content || "Knoux AI Clipboard Pro is ready.";
  const recent = items.slice(0, 4);
  const aiCount = items.filter((x) => x.aiSummarized || x.aiTags?.length).length;
  const protectedCount = items.filter((x) => x.isSecure).length;
  const pinnedCount = items.filter((x) => x.pinned).length;

  const goAI = () => {
    setAiInputText(latest);
    setActiveTab("ai");
  };

  const protect = () => {
    if (!onAddNewItem) return;
    onAddNewItem(`Protected local note\n\n${latest}`, "note", "Secure Vault");
    setNotice("Protected note saved locally.");
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <section className="rounded-3xl border border-knoux-purple/10 bg-gradient-to-tr from-white via-knoux-lavender-white to-white p-6 sm:p-8 shadow-knoux-glow space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-knoux-purple/10 bg-knoux-purple/5 text-[11px] font-bold text-knoux-purple uppercase tracking-wider"><Zap className="w-3.5 h-3.5" /> Production Workspace Active</div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-knoux-dark-text tracking-tight">Elevate Your Flow with <span className="text-knoux-purple">Knoux AI</span></h1>
        <p className="text-sm text-knoux-muted-text leading-relaxed">Clipboard content is saved locally and routed to the AI workspace only when you request an operation.</p>
        <div className="flex flex-wrap gap-3"><button onClick={() => setActiveTab("clipboard")} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-knoux-purple to-knoux-neon text-white text-xs font-semibold shadow-knoux-glow flex items-center gap-1.5"><Clipboard className="w-3.5 h-3.5" /> Launch Clipboard Hub</button><button onClick={goAI} className="px-5 py-2.5 rounded-xl border border-knoux-purple/20 bg-white hover:bg-knoux-purple/5 text-knoux-purple text-xs font-semibold flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Deploy AI Assistant</button></div>
      </section>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">{[{ label: "Active History", value: items.length, icon: Clipboard }, { label: "Pinned", value: pinnedCount, icon: Pin }, { label: "AI Items", value: aiCount, icon: Sparkles }, { label: "Protected", value: protectedCount, icon: Lock }, { label: "Boost", value: `${Math.round(items.length * 1.5 + aiCount * 5)}m`, icon: TrendingUp }].map((stat) => { const Icon = stat.icon; return <div key={stat.label} className="p-4 rounded-2xl bg-white border border-knoux-purple/5 shadow-sm"><div className="flex items-center justify-between"><span className="text-[11px] text-knoux-muted-text">{stat.label}</span><Icon className="w-4 h-4 text-knoux-purple" /></div><div className="text-2xl font-black text-knoux-dark-text mt-3 font-mono">{stat.value}</div></div>; })}</div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5"><button onClick={goAI} className="p-5 rounded-3xl border border-knoux-purple/5 bg-white shadow-sm text-left"><Sparkles className="w-5 h-5 text-knoux-purple mb-3" /><h3 className="text-sm font-black text-knoux-dark-text">Run AI Action</h3><p className="text-[11px] text-knoux-muted-text mt-1">Open the latest clip inside the AI Co-Pilot.</p></button><button onClick={() => setActiveTab("clipboard")} className="p-5 rounded-3xl border border-knoux-purple/5 bg-white shadow-sm text-left"><Activity className="w-5 h-5 text-knoux-purple mb-3" /><h3 className="text-sm font-black text-knoux-dark-text">Manage Clips</h3><p className="text-[11px] text-knoux-muted-text mt-1">Open the full clipboard workspace.</p></button><button onClick={protect} className="p-5 rounded-3xl border border-knoux-purple/5 bg-white shadow-sm text-left"><ShieldAlert className="w-5 h-5 text-knoux-purple mb-3" /><h3 className="text-sm font-black text-knoux-dark-text">Protected Note</h3><p className="text-[11px] text-knoux-muted-text mt-1">Commit the latest clip as protected content.</p></button></div>
      {notice && <div className="rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-800 p-3 text-xs font-bold">{notice}</div>}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6"><div className="space-y-4"><h3 className="text-sm font-black text-knoux-dark-text flex items-center gap-1.5"><Activity className="w-4 h-4 text-knoux-purple" /> Recent Clipboard Clips</h3>{recent.map((item) => <div key={item.id} className="rounded-2xl border border-knoux-purple/5 bg-white p-4 shadow-sm flex items-center justify-between gap-3"><div className="min-w-0"><div className="text-[10px] font-black uppercase text-knoux-purple">{item.type} • {item.source}</div><p className="text-xs font-mono text-knoux-dark-text truncate mt-1">{item.content}</p></div><button onClick={() => onCopyItem(item)} className="px-3 py-1.5 rounded-lg bg-knoux-purple/5 text-knoux-purple text-[11px] font-black">Copy</button></div>)}</div><div className="p-5 rounded-3xl border border-knoux-purple/5 bg-white shadow-sm space-y-3"><h3 className="text-sm font-black text-knoux-dark-text flex items-center gap-1.5"><Database className="w-4 h-4 text-knoux-purple" /> Storage Health</h3><div className="text-xs font-mono text-knoux-dark-text">{health.mb} MB / {health.records} records</div></div></div>
    </div>
  );
}
