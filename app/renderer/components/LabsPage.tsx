import { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Activity,
  BarChart,
  Blocks,
  Brain,
  CheckCircle2,
  Cpu,
  Database,
  Eye,
  Fingerprint,
  FlaskConical,
  Gauge,
  Globe2,
  Lock,
  Mic,
  ServerCog,
  ShieldCheck,
  Sparkles,
  Zap,
  PackageCheck,
  Clipboard,
} from "lucide-react";
import {
  PRODUCTION_SERVICES,
  PRODUCTION_SCORE,
  getServiceReadinessPercent,
  type ProductionService,
} from "../services/productionCatalog";

const categoryIcon: Record<ProductionService["category"], JSX.Element> = {
  AI: <Sparkles className="w-5 h-5 text-purple-500" />,
  Clipboard: <Clipboard className="w-5 h-5 text-blue-500" />,
  "Client Tools": <Blocks className="w-5 h-5 text-indigo-500" />,
  Security: <Fingerprint className="w-5 h-5 text-emerald-500" />,
  Barcode: <Eye className="w-5 h-5 text-rose-500" />,
  Developer: <ServerCog className="w-5 h-5 text-sky-500" />,
  Packaging: <PackageCheck className="w-5 h-5 text-amber-500" />,
};

const tierStyle: Record<ProductionService["tier"], string> = {
  live: "border-emerald-200 bg-emerald-50 text-emerald-700",
  electron: "border-blue-200 bg-blue-50 text-blue-700",
  web: "border-purple-200 bg-purple-50 text-purple-700",
  guarded: "border-amber-200 bg-amber-50 text-amber-700",
  planned: "border-slate-200 bg-slate-50 text-slate-600",
};

const statusStyle: Record<ProductionService["status"], string> = {
  Active: "bg-emerald-500",
  Ready: "bg-blue-500",
  Guarded: "bg-amber-500",
  Planned: "bg-slate-400",
  Missing: "bg-red-500",
  Disabled: "bg-slate-500",
};

export default function LabsPage() {
  const [enabledServices, setEnabledServices] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(PRODUCTION_SERVICES.map((service) => [service.id, service.implemented && service.status !== "Disabled"]))
  );

  const readiness = getServiceReadinessPercent();
  const activeCount = useMemo(
    () => PRODUCTION_SERVICES.filter((service) => enabledServices[service.id]).length,
    [enabledServices]
  );

  const toggleService = (id: string) => {
    const service = PRODUCTION_SERVICES.find((item) => item.id === id);
    if (!service?.implemented || service.status !== "Active") return;
    setEnabledServices((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div id="labs-workspace-container" className="p-6 space-y-6 max-w-6xl mx-auto select-none">
      <div className="relative overflow-hidden p-6 rounded-3xl border border-knoux-purple/15 bg-gradient-to-r from-white via-knoux-lavender-white to-white shadow-knoux-glow">
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-knoux-purple/10 blur-3xl" />
        <div className="absolute -left-16 -bottom-16 w-56 h-56 rounded-full bg-knoux-neon/10 blur-3xl" />

        <div className="relative grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr] gap-6 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-knoux-purple/10 bg-knoux-purple/5 text-[11px] font-black text-knoux-purple uppercase tracking-widest">
              <FlaskConical className="w-4 h-4" /> KNOUX Production Control Deck
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-knoux-dark-text tracking-tight">
                Service Labs converted into a controlled production registry.
              </h2>
              <p className="text-xs text-knoux-muted-text leading-relaxed max-w-2xl">
                This page only shows registry state for active, guarded, and planned services. Planned capabilities stay disabled until real handlers and packaging are verified.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              {[
                { label: "Readiness", value: `${readiness}%`, icon: Gauge },
                { label: "Active Services", value: activeCount, icon: CheckCircle2 },
                { label: "OpenRouter", value: `${PRODUCTION_SCORE.openRouterBridge}%`, icon: Sparkles },
                { label: "Security", value: `${PRODUCTION_SCORE.securityVault}%`, icon: ShieldCheck },
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

          <div className="rounded-3xl border border-knoux-purple/10 bg-white/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-knoux-dark-text flex items-center gap-2">
                <Activity className="w-4 h-4 text-knoux-purple" /> Deployment Signal
              </span>
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full uppercase">
                Web Build Ready
              </span>
            </div>
            <div className="space-y-2 text-[11px] text-knoux-muted-text leading-relaxed">
              <p><strong className="text-knoux-dark-text">Vercel:</strong> uses web-only renderer build and /api/ai/[action].</p>
              <p><strong className="text-knoux-dark-text">Electron:</strong> uses preload-safe IPC channels and OpenRouter helper.</p>
              <p><strong className="text-knoux-dark-text">Fallback:</strong> explicit local deterministic result, never fake live success.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5">
        {PRODUCTION_SERVICES.filter((service) => ["Guarded", "Planned", "Missing", "Disabled"].includes(service.status)).map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.35 }}
            className="p-5 rounded-3xl border border-knoux-purple/5 bg-white shadow-sm flex flex-col justify-between hover:border-knoux-purple/20 hover:shadow-md transition-all group min-h-[220px]"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FCFAFF] border border-knoux-purple/10 flex items-center justify-center">
                  {categoryIcon[service.category]}
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <span className={`text-[9px] font-black border px-2 py-0.5 rounded-full uppercase tracking-wider ${tierStyle[service.tier]}`}>
                    {service.tier}
                  </span>
                  <button
                    onClick={() => toggleService(service.id)}
                    disabled={!service.implemented || service.status !== "Active"}
                    className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${service.status === "Active" && service.implemented ? "bg-knoux-purple text-white" : "bg-slate-100 text-slate-500"} disabled:cursor-not-allowed disabled:opacity-60`}
                    aria-label={`Toggle ${service.displayName}`}
                  >
                    {service.status === "Active" ? (enabledServices[service.id] ? "On" : "Standby") : service.status}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${statusStyle[service.status]}`} />
                  <span className="text-[10px] font-black text-knoux-muted-text uppercase tracking-wider">{service.status}</span>
                </div>
                <h3 className="text-sm font-black text-knoux-dark-text group-hover:text-knoux-purple transition-colors">
                  {service.displayName}
                </h3>
                <p className="text-[11px] text-knoux-muted-text leading-relaxed">{service.description}</p>
                {service.disabledReason && <p className="text-[10px] text-amber-700 leading-relaxed">{service.disabledReason}</p>}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-knoux-purple/5 flex items-center justify-between gap-3">
              <span className="text-[10px] text-knoux-muted-text font-mono truncate">{service.channel || "internal"}</span>
              <span className={`text-[10px] font-black ${service.status === "Active" ? "text-emerald-700" : service.status === "Guarded" ? "text-amber-700" : service.status === "Ready" ? "text-blue-700" : "text-slate-500"}`}>
                {service.status === "Active" ? "Action available" : service.status === "Ready" ? "Ready" : service.status === "Guarded" ? "Guarded" : service.status}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {[
          { title: "AI Core", value: `${PRODUCTION_SCORE.openRouterBridge}%`, icon: Brain, note: "Live API + Electron helper + fallback" },
          { title: "Storage Path", value: `${PRODUCTION_SCORE.sqlitePersistence}%`, icon: Database, note: "Memory adapter ready; SQLite hard persistence next" },
          { title: "Experience Layer", value: `${PRODUCTION_SCORE.serviceTransparency}%`, icon: Globe2, note: "Clear status instead of placeholder success" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="rounded-3xl border border-knoux-purple/10 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-knoux-dark-text">{item.title}</span>
                <Icon className="w-5 h-5 text-knoux-purple" />
              </div>
              <div className="text-3xl font-black font-mono text-knoux-purple">{item.value}</div>
              <p className="text-[11px] text-knoux-muted-text leading-relaxed">{item.note}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
