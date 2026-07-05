import { useEffect, useMemo, useState } from "react";
import { ClipboardItem, NavTab } from "../types";
import { Beaker, Command, Copy, Lock, Search, Shield, Sparkles, TerminalSquare, X } from "lucide-react";
import { triggerPanicMode } from "../security/vault";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: ClipboardItem[];
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  setSearchQuery: (value: string) => void;
  setAiInputText: (value: string) => void;
  onCopyItem: (item: ClipboardItem) => void;
  onToast: (message: string) => void;
  privacyMode: boolean;
  setPrivacyMode: (value: boolean) => void;
}

type PaletteAction = {
  id: string;
  label: string;
  hint: string;
  icon: typeof Command;
  run: () => void;
};

export default function CommandPalette({ open, onOpenChange, items, activeTab, setActiveTab, setSearchQuery, setAiInputText, onCopyItem, onToast, privacyMode, setPrivacyMode }: CommandPaletteProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  const close = () => onOpenChange(false);
  const latest = items[0];

  const actions = useMemo<PaletteAction[]>(() => [
    { id: "open-clipboard", label: "Open Clipboard Hub", hint: "Go to Smart Clipboard Hub", icon: Copy, run: () => { setActiveTab("clipboard"); close(); } },
    { id: "open-search", label: "Open Universal Search", hint: "Search clips, tags, sources", icon: Search, run: () => { setActiveTab("search"); close(); } },
    { id: "open-ai", label: "Open AI Co-Pilot", hint: "Run guarded OpenRouter actions", icon: Sparkles, run: () => { setActiveTab("ai"); close(); } },
    { id: "open-dev", label: "Open Developer Studio", hint: "JSON, Regex, Markdown, PDF and handoff tools", icon: TerminalSquare, run: () => { setActiveTab("developer"); close(); } },
    { id: "open-qa", label: "Open Testing / QA Lab", hint: "Run code-aware QA checks and reports", icon: Beaker, run: () => { setActiveTab("qa"); close(); } },
    { id: "open-security", label: "Open Security Vault", hint: "Vault, redaction and audit log", icon: Shield, run: () => { setActiveTab("security"); close(); } },
    { id: "open-settings", label: "Open Settings", hint: "Runtime, language, theme and AI diagnostics", icon: Command, run: () => { setActiveTab("settings"); close(); } },
    { id: "copy-latest", label: "Copy Latest Clip", hint: latest ? latest.content.slice(0, 80) : "No clipboard item available", icon: Copy, run: () => { if (latest) onCopyItem(latest); else onToast("No clipboard item available."); close(); } },
    { id: "ai-latest", label: "Send Latest Clip to AI", hint: "Copies latest clip into AI input", icon: Sparkles, run: () => { if (latest) { setAiInputText(latest.content); setActiveTab("ai"); } else onToast("No clip to send."); close(); } },
    { id: "focus-search", label: "Search Selected Text", hint: "Use the palette query in Universal Search", icon: Search, run: () => { setSearchQuery(query); setActiveTab("search"); close(); } },
    { id: "privacy", label: privacyMode ? "Disable Privacy Mode" : "Enable Privacy Mode", hint: "Mask sensitive interface areas", icon: Lock, run: () => { setPrivacyMode(!privacyMode); onToast(!privacyMode ? "Privacy mode enabled." : "Privacy mode disabled."); close(); } },
    { id: "panic", label: "Panic Button", hint: "Lock vault session and enable stealth mode", icon: Lock, run: () => { triggerPanicMode(); setPrivacyMode(true); onToast("Panic mode triggered. Vault session memory cleared."); close(); } },
  ], [items, latest, onCopyItem, onToast, privacyMode, query, setActiveTab, setAiInputText, setPrivacyMode, setSearchQuery]);

  const filtered = actions.filter((action) => `${action.label} ${action.hint}`.toLowerCase().includes(query.toLowerCase().trim()));

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-start justify-center pt-24 px-4 bg-[#0d0527]/45 backdrop-blur-xl" role="dialog" aria-modal="true" aria-label="KNOUX command palette">
      <div className="w-full max-w-3xl rounded-[32px] border border-white/20 bg-[linear-gradient(135deg,rgba(255,255,255,.95),rgba(243,230,251,.90))] shadow-knoux-glow-lg overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-knoux-purple/10">
          <Command className="w-5 h-5 text-knoux-purple" />
          <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search commands, pages, tools, and clipboard actions..." className="flex-1 bg-transparent outline-none text-sm font-semibold text-knoux-dark-text placeholder:text-knoux-muted-text" />
          <button onClick={close} className="h-9 w-9 rounded-xl border border-knoux-purple/10 bg-white/70 text-knoux-purple flex items-center justify-center" aria-label="Close command palette"><X className="w-4 h-4" /></button>
        </div>
        <div className="max-h-[520px] overflow-auto p-3 space-y-2">
          {filtered.map((action) => { const Icon = action.icon; return <button key={action.id} onClick={action.run} className="w-full flex items-center gap-3 rounded-2xl border border-knoux-purple/10 bg-white/70 p-3 text-left hover:border-knoux-purple/30 hover:shadow-knoux-glow transition"><span className="knoux-icon-shell"><Icon className="w-4 h-4" /></span><span className="min-w-0"><span className="block text-sm font-black text-knoux-dark-text">{action.label}</span><span className="block text-xs text-knoux-muted-text truncate">{action.hint}</span></span></button>; })}
          {!filtered.length && <div className="rounded-2xl border border-dashed border-knoux-purple/20 p-8 text-center text-sm text-knoux-muted-text">No command found.</div>}
        </div>
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-knoux-purple/10 text-[11px] text-knoux-muted-text"><span>Shortcut: Ctrl+K / Cmd+K</span><span>Active: {activeTab}</span></div>
      </div>
    </div>
  );
}
