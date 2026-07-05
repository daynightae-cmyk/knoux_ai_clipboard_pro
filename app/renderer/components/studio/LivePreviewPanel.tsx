import { useState } from "react";
import { Activity, Copy, Download, Eraser, FileJson, ListChecks, ScrollText, Loader2, CheckCircle2, AlertTriangle, XCircle, History } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type RunState = "idle" | "running" | "success" | "warning" | "error";

export interface PreviewRun {
  id: string;
  tool: string;
  state: RunState;
  output: string;
  logs: string[];
  json?: string;
  startedAt: number;
  durationMs?: number;
}

type TabId = "preview" | "output" | "logs" | "json" | "history";

const stateMeta: Record<RunState, { label: string; icon: LucideIcon; className: string }> = {
  idle: { label: "Idle", icon: Activity, className: "text-knoux-muted-text" },
  running: { label: "Running", icon: Loader2, className: "text-blue-500" },
  success: { label: "Success", icon: CheckCircle2, className: "text-emerald-500" },
  warning: { label: "Warning", icon: AlertTriangle, className: "text-amber-500" },
  error: { label: "Error", icon: XCircle, className: "text-rose-500" },
};

export function LivePreviewPanel({ title, subtitle, current, history, onCopy, onExport, onClear, onSelectHistory, tabs = ["preview", "output", "logs", "json", "history"], emptyHint }: {
  title: string;
  subtitle?: string;
  current: PreviewRun | null;
  history: PreviewRun[];
  onCopy?: () => void;
  onExport?: () => void;
  onClear?: () => void;
  onSelectHistory?: (run: PreviewRun) => void;
  tabs?: TabId[];
  emptyHint?: string;
}) {
  const [tab, setTab] = useState<TabId>(tabs[0] || "preview");

  const tabConfig: Record<TabId, { label: string; icon: LucideIcon }> = {
    preview: { label: "Live Preview", icon: Activity },
    output: { label: "Output", icon: ScrollText },
    logs: { label: "Logs", icon: ListChecks },
    json: { label: "JSON", icon: FileJson },
    history: { label: "History", icon: History },
  };

  const state = current?.state || "idle";
  const meta = stateMeta[state];
  const StateIcon = meta.icon;
  const hasOutput = Boolean(current?.output);

  const renderBody = () => {
    if (tab === "history") {
      if (!history.length) return <PanelEmpty text="No runs recorded yet." />;
      return (
        <div className="space-y-2">
          {history.map((run) => {
            const rm = stateMeta[run.state];
            const RIcon = rm.icon;
            return (
              <button
                key={run.id}
                onClick={() => onSelectHistory?.(run)}
                className="w-full text-left rounded-2xl border border-knoux-purple/12 bg-knoux-purple/[0.04] hover:border-knoux-purple/30 px-3 py-2 transition flex items-center justify-between gap-3"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <RIcon className={`w-4 h-4 shrink-0 ${rm.className}`} />
                  <span className="text-xs font-bold text-knoux-dark-text truncate">{run.tool}</span>
                </span>
                <span className="text-[10px] text-knoux-muted-text shrink-0">
                  {new Date(run.startedAt).toLocaleTimeString()}{typeof run.durationMs === "number" ? ` · ${run.durationMs}ms` : ""}
                </span>
              </button>
            );
          })}
        </div>
      );
    }

    if (!current) return <PanelEmpty text={emptyHint || "Run any tool to see live output here."} />;

    if (tab === "json") {
      const json = current.json || safeJson(current.output);
      return <PreArea text={json} />;
    }

    if (tab === "logs") {
      if (!current.logs.length) return <PanelEmpty text="No logs for this run." />;
      return (
        <div className="font-mono text-[11px] space-y-1">
          {current.logs.map((line, i) => (
            <div key={i} className="text-knoux-muted-text"><span className="text-knoux-purple">{String(i + 1).padStart(2, "0")}</span>  {line}</div>
          ))}
        </div>
      );
    }

    if (state === "running") {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-knoux-muted-text">
          <Loader2 className="w-8 h-8 animate-spin text-knoux-purple" />
          <p className="text-xs font-bold">Executing {current.tool}…</p>
        </div>
      );
    }

    return <PreArea text={hasOutput ? current.output : (emptyHint || "No output.")} />;
  };

  return (
    <div className="glass-elevated rounded-3xl p-5 flex flex-col gap-4 h-full min-h-[520px]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black uppercase tracking-wide text-knoux-muted-text">{title}</h3>
            <span className={`inline-flex items-center gap-1 text-[11px] font-black ${meta.className}`}>
              <StateIcon className={`w-3.5 h-3.5 ${state === "running" ? "animate-spin" : ""}`} /> {meta.label}
            </span>
          </div>
          <p className="text-[11px] text-knoux-muted-text mt-1 truncate">{current ? current.tool : (subtitle || "Waiting for execution")}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <IconBtn icon={Copy} title="Copy result" onClick={onCopy} disabled={!hasOutput} />
          <IconBtn icon={Download} title="Export result" onClick={onExport} disabled={!hasOutput} />
          <IconBtn icon={Eraser} title="Clear" onClick={onClear} disabled={!current && history.length === 0} />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {tabs.map((id) => {
          const cfg = tabConfig[id];
          const TIcon = cfg.icon;
          const activeTab = tab === id;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-black transition border ${activeTab ? "bg-knoux-purple text-white border-knoux-purple shadow-knoux-glow" : "border-knoux-purple/12 text-knoux-muted-text hover:border-knoux-purple/30"}`}
            >
              <TIcon className="w-3.5 h-3.5" /> {cfg.label}
              {id === "history" && history.length > 0 && <span className="ml-0.5 rounded-full bg-white/25 px-1.5 text-[9px]">{history.length}</span>}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-auto rounded-2xl border border-knoux-purple/10 bg-[color:var(--knoux-surface-raised)]/60 p-4">
        {renderBody()}
      </div>
    </div>
  );
}

function IconBtn({ icon: Icon, title, onClick, disabled }: { icon: LucideIcon; title: string; onClick?: () => void; disabled?: boolean }) {
  return (
    <button title={title} onClick={onClick} disabled={disabled} className="btn-knoux-secondary p-2 rounded-lg">
      <Icon className="w-4 h-4" />
    </button>
  );
}

function PreArea({ text }: { text: string }) {
  return <pre className="whitespace-pre-wrap break-words font-mono text-[12px] leading-relaxed text-knoux-dark-text">{text}</pre>;
}

function PanelEmpty({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-knoux-muted-text">
      <Activity className="w-7 h-7 opacity-60" />
      <p className="text-xs font-bold max-w-xs">{text}</p>
    </div>
  );
}

function safeJson(text: string): string {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return JSON.stringify({ output: text }, null, 2);
  }
}
