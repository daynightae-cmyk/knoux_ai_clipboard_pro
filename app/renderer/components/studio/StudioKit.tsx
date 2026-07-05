import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/** Shared premium building blocks used by Developer Studio and the QA Lab. */

export type Tone = "purple" | "emerald" | "blue" | "amber" | "rose" | "slate";

const toneText: Record<Tone, string> = {
  purple: "text-knoux-purple",
  emerald: "text-emerald-600 dark:text-emerald-300",
  blue: "text-blue-600 dark:text-blue-300",
  amber: "text-amber-600 dark:text-amber-300",
  rose: "text-rose-600 dark:text-rose-300",
  slate: "text-knoux-muted-text",
};

export type BadgeStatus =
  | "Active" | "Ready" | "Guarded" | "Planned" | "Missing" | "Disabled"
  | "pass" | "warning" | "fail" | "running" | "idle" | "success" | "error";

const badgeClassFor = (status: BadgeStatus): string => {
  switch (status) {
    case "Active":
    case "pass":
    case "success":
      return "knoux-badge knoux-badge-active";
    case "Ready":
    case "running":
      return "knoux-badge knoux-badge-ready";
    case "Guarded":
    case "warning":
      return "knoux-badge knoux-badge-guarded";
    case "fail":
    case "error":
      return "knoux-badge knoux-badge-guarded !text-rose-600 dark:!text-rose-300";
    default:
      return "knoux-badge knoux-badge-planned";
  }
};

export function StatusBadge({ status, label, icon: Icon }: { status: BadgeStatus; label?: string; icon?: LucideIcon }) {
  return (
    <span className={badgeClassFor(status)}>
      {Icon && <Icon className="w-3 h-3" />}
      {label || status}
    </span>
  );
}

export function SectionHeader({ icon: Icon, title, description, actions }: {
  icon: LucideIcon;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3 min-w-0">
        <div className="knoux-icon-shell shrink-0"><Icon className="w-5 h-5" /></div>
        <div className="min-w-0">
          <h2 className="text-lg font-black text-knoux-dark-text leading-tight">{title}</h2>
          {description && <p className="text-xs text-knoux-muted-text leading-relaxed mt-0.5">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

export function StatusSummaryCard({ label, value, icon: Icon, tone = "purple", hint }: {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  tone?: Tone;
  hint?: string;
}) {
  return (
    <div className="knoux-premium-card p-4 flex flex-col gap-2 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-black uppercase tracking-wide text-knoux-muted-text truncate">{label}</span>
        <Icon className={`w-4 h-4 shrink-0 ${toneText[tone]}`} />
      </div>
      <div className={`text-2xl font-black leading-none ${toneText[tone]}`}>{value}</div>
      {hint && <p className="text-[10px] text-knoux-muted-text leading-snug">{hint}</p>}
    </div>
  );
}

export interface ToolAction {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
  busy?: boolean;
}

export function ActionButtonRow({ primary, secondary, tertiary }: {
  primary: ToolAction;
  secondary?: ToolAction;
  tertiary?: ToolAction;
}) {
  const Primary = primary.icon;
  const Secondary = secondary?.icon;
  const Tertiary = tertiary?.icon;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      <button disabled={primary.disabled || primary.busy} onClick={primary.onClick} className="btn-knoux-primary text-[11px]">
        {Primary && <Primary className="w-3.5 h-3.5" />} {primary.busy ? "Running…" : primary.label}
      </button>
      {secondary && (
        <button disabled={secondary.disabled} onClick={secondary.onClick} className="btn-knoux-secondary text-[11px]">
          {Secondary && <Secondary className="w-3.5 h-3.5" />} {secondary.label}
        </button>
      )}
      {tertiary && (
        <button disabled={tertiary.disabled} onClick={tertiary.onClick} className="btn-knoux-secondary text-[11px]">
          {Tertiary && <Tertiary className="w-3.5 h-3.5" />} {tertiary.label}
        </button>
      )}
    </div>
  );
}

export function ToolCard({ icon: Icon, title, description, status, statusLabel, mode, lastRun, active, onSelect, primary, secondary, tertiary, badge }: {
  icon: LucideIcon;
  title: string;
  description: string;
  status: BadgeStatus;
  statusLabel?: string;
  mode?: string;
  lastRun?: string;
  active?: boolean;
  onSelect?: () => void;
  primary: ToolAction;
  secondary?: ToolAction;
  tertiary?: ToolAction;
  badge?: ReactNode;
}) {
  return (
    <article
      onClick={onSelect}
      className={`knoux-premium-card relative overflow-hidden p-4 min-h-[236px] flex flex-col justify-between gap-4 transition ${active ? "!border-knoux-purple/50 shadow-knoux-glow-lg" : ""} ${onSelect ? "cursor-pointer" : ""}`}
    >
      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-knoux-purple/10 blur-2xl" />
      <div className="relative space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="knoux-icon-shell shrink-0"><Icon className="w-4 h-4" /></div>
            <div className="min-w-0">
              <h3 className="text-sm font-black text-knoux-dark-text leading-tight">{title}</h3>
              <p className="text-[11px] text-knoux-muted-text leading-relaxed mt-1">{description}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <StatusBadge status={status} label={statusLabel} />
            {badge}
          </div>
        </div>
        {(mode || lastRun) && (
          <div className="flex flex-wrap items-center gap-2 text-[10px] text-knoux-muted-text">
            {mode && <span className="rounded-full border border-knoux-purple/15 bg-knoux-purple/5 px-2 py-0.5 font-bold">{mode}</span>}
            {lastRun && <span className="rounded-full border border-knoux-purple/10 px-2 py-0.5">{lastRun}</span>}
          </div>
        )}
      </div>
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <ActionButtonRow primary={primary} secondary={secondary} tertiary={tertiary} />
      </div>
    </article>
  );
}

export function WorkspaceHero({ badgeLabel, title, subtitle, description, badges, children }: {
  badgeLabel: string;
  title: string;
  subtitle?: string;
  description: string;
  badges?: Array<{ label: string; icon?: LucideIcon; tone?: Tone }>;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-knoux-purple/15 bg-[radial-gradient(circle_at_8%_0%,rgba(193,124,235,.32),transparent_34%),linear-gradient(135deg,rgba(255,255,255,.86),rgba(243,230,251,.78))] p-6 md:p-8 shadow-knoux-glow-lg">
      <div className="absolute right-8 top-8 h-28 w-28 rounded-full bg-knoux-purple/10 blur-3xl" />
      <div className="relative space-y-4">
        <span className="inline-flex items-center gap-2 rounded-full border border-knoux-purple/20 bg-knoux-purple/10 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-knoux-purple">
          {badgeLabel}
        </span>
        <div className="space-y-2 max-w-3xl">
          <h1 className="text-2xl md:text-3xl font-black text-knoux-dark-text leading-tight">{title}</h1>
          {subtitle && <p className="text-sm font-bold text-knoux-purple">{subtitle}</p>}
          <p className="text-sm text-knoux-muted-text leading-relaxed">{description}</p>
        </div>
        {badges && badges.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {badges.map((b) => {
              const BIcon = b.icon;
              return (
                <span key={b.label} className={`inline-flex items-center gap-1.5 rounded-full border border-knoux-purple/15 bg-white/60 dark:bg-white/5 px-3 py-1 text-[11px] font-bold ${toneText[b.tone || "purple"]}`}>
                  {BIcon && <BIcon className="w-3.5 h-3.5" />} {b.label}
                </span>
              );
            })}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
