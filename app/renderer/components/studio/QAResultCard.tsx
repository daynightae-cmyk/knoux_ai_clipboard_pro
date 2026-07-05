import { CheckCircle2, AlertTriangle, XCircle, Copy, ScanSearch, FileText } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { QACheckResult, QAStatus } from "../../services/qaChecks";

const statusMeta: Record<QAStatus, { label: string; icon: LucideIcon; ring: string; text: string; badge: string }> = {
  pass: { label: "Pass", icon: CheckCircle2, ring: "border-emerald-400/40", text: "text-emerald-600 dark:text-emerald-300", badge: "knoux-badge knoux-badge-active" },
  warning: { label: "Warning", icon: AlertTriangle, ring: "border-amber-400/40", text: "text-amber-600 dark:text-amber-300", badge: "knoux-badge knoux-badge-guarded" },
  fail: { label: "Fail", icon: XCircle, ring: "border-rose-400/50", text: "text-rose-600 dark:text-rose-300", badge: "knoux-badge knoux-badge-guarded !text-rose-600 dark:!text-rose-300" },
};

export function QAResultCard({ result, icon: Icon, active, statusLabel, onInspect, onCopy, onReport, inspectLabel, copyLabel, reportLabel }: {
  result: QACheckResult;
  icon: LucideIcon;
  active?: boolean;
  statusLabel?: string;
  onInspect: () => void;
  onCopy: () => void;
  onReport: () => void;
  inspectLabel: string;
  copyLabel: string;
  reportLabel: string;
}) {
  const meta = statusMeta[result.status];
  const SIcon = meta.icon;
  return (
    <article className={`knoux-premium-card relative overflow-hidden p-4 flex flex-col justify-between gap-3 min-h-[210px] border ${meta.ring} ${active ? "!border-knoux-purple/60 shadow-knoux-glow-lg" : ""}`}>
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="knoux-icon-shell shrink-0"><Icon className="w-4 h-4" /></div>
            <div className="min-w-0">
              <h3 className="text-sm font-black text-knoux-dark-text leading-tight">{result.title}</h3>
              <span className="text-[10px] uppercase tracking-wide text-knoux-muted-text font-bold">{result.category}</span>
            </div>
          </div>
          <span className={`${meta.badge} shrink-0`}><SIcon className="w-3 h-3" /> {statusLabel || meta.label}</span>
        </div>
        <p className={`text-[11px] leading-relaxed font-semibold ${meta.text}`}>{result.summary}</p>
        {result.details[0] && <p className="text-[10px] text-knoux-muted-text leading-relaxed line-clamp-2">{result.details[0]}</p>}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <button onClick={onInspect} className="btn-knoux-primary text-[11px]"><ScanSearch className="w-3.5 h-3.5" /> {inspectLabel}</button>
        <button onClick={onCopy} className="btn-knoux-secondary text-[11px]"><Copy className="w-3.5 h-3.5" /> {copyLabel}</button>
        <button onClick={onReport} className="btn-knoux-secondary text-[11px]"><FileText className="w-3.5 h-3.5" /> {reportLabel}</button>
      </div>
    </article>
  );
}
