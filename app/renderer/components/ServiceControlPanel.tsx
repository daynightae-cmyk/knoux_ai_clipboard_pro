import { useMemo, useState } from "react";
import {
  Activity,
  Copy,
  Database,
  FileText,
  Play,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Wand2,
} from "lucide-react";
import { ClipboardItem } from "../types";
import { copyToClipboard } from "../../shared/clipboard-utils";
import {
  PRODUCTION_SERVICES,
  type ProductionService,
  type ServiceCategory,
} from "../services/productionCatalog";
import { buildServiceSample, serviceActionLabels } from "../services/serviceOperations";

interface Props {
  items: ClipboardItem[];
  onStatus?: (value: string) => void;
  onRunService: (service: ProductionService, input: string) => Promise<void>;
}

const categoryOrder: Array<ServiceCategory | "All"> = [
  "All",
  "Clipboard",
  "Client Tools",
  "Security",
  "AI",
  "Barcode",
  "Developer",
  "Packaging",
  "Storage",
];

const statusTone = (service: ProductionService) => {
  if (service.status === "Active") return "knoux-badge-active";
  if (service.status === "Ready") return "knoux-badge-ready";
  if (service.status === "Guarded") return "knoux-badge-guarded";
  return "knoux-badge";
};

const categoryIcon = (category: ServiceCategory) => {
  if (category === "Security") return ShieldCheck;
  if (category === "AI") return Sparkles;
  if (category === "Developer") return Wand2;
  if (category === "Packaging") return Database;
  if (category === "Storage") return Database;
  return Activity;
};

export default function ServiceControlPanel({ items, onStatus, onRunService }: Props) {
  const [input, setInput] = useState(
    "Paste customer text, code, PDF notes, URL, tracking number, or any clipboard content here."
  );
  const [busyId, setBusyId] = useState<string | null>(null);
  const [category, setCategory] = useState<ServiceCategory | "All">("All");

  const runnable = useMemo(
    () =>
      PRODUCTION_SERVICES.filter(
        (service) =>
          service.status === "Active" || service.status === "Ready" || service.status === "Guarded"
      ),
    []
  );
  const visibleServices =
    category === "All" ? runnable : runnable.filter((service) => service.category === category);
  const activeCount = runnable.filter((service) => service.status === "Active").length;
  const readyCount = runnable.filter((service) => service.status === "Ready").length;
  const guardedCount = runnable.filter((service) => service.status === "Guarded").length;

  const run = async (service: ProductionService) => {
    setBusyId(service.id);
    onStatus?.(`Running ${service.displayName}...`);
    await onRunService(service, input);
    setBusyId(null);
  };

  const applySample = (service: ProductionService) => {
    setInput(buildServiceSample(service));
    onStatus?.(`${service.displayName} sample loaded`);
  };

  return (
    <section className="glass-elevated p-5 md:p-6 space-y-5 overflow-hidden relative">
      <div className="absolute -left-24 -top-24 w-72 h-72 rounded-full bg-knoux-purple/10 blur-3xl" />
      <div className="absolute right-0 bottom-0 w-96 h-96 rounded-full bg-[#c17ceb]/10 blur-3xl" />
      <div className="relative flex flex-col gap-5">
        <div className="flex flex-col 2xl:flex-row 2xl:items-end 2xl:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-knoux-purple/10 border border-knoux-purple/15 text-[11px] font-black text-knoux-purple uppercase tracking-widest">
              <SlidersHorizontal className="w-4 h-4" /> Service Command Center
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-knoux-dark-text">
              Production service cards with real actions.
            </h2>
            <p className="text-sm text-knoux-muted-text max-w-5xl">
              Every card exposes three tailored controls: execute the real handler or truthful
              guarded check, load a valid service-specific sample, and copy the last output or
              operating report.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 min-w-[320px]">
            <div className="knoux-premium-card p-3 text-center">
              <div className="text-[10px] uppercase font-black text-knoux-muted-text">Active</div>
              <div className="text-xl font-black text-emerald-600">{activeCount}</div>
            </div>
            <div className="knoux-premium-card p-3 text-center">
              <div className="text-[10px] uppercase font-black text-knoux-muted-text">Ready</div>
              <div className="text-xl font-black text-blue-600">{readyCount}</div>
            </div>
            <div className="knoux-premium-card p-3 text-center">
              <div className="text-[10px] uppercase font-black text-knoux-muted-text">Guarded</div>
              <div className="text-xl font-black text-amber-600">{guardedCount}</div>
            </div>
          </div>
        </div>

        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          className="w-full min-h-[150px] rounded-3xl border border-knoux-purple/15 bg-[color:var(--knoux-card-elevated)] p-5 text-sm text-knoux-dark-text outline-none focus:border-knoux-purple leading-relaxed shadow-sm"
        />

        <div className="flex flex-wrap gap-2">
          {categoryOrder.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`px-4 py-2 rounded-2xl border text-xs font-black transition ${category === item ? "bg-knoux-purple text-white border-knoux-purple shadow-knoux-glow" : "bg-[color:var(--knoux-card)] text-knoux-dark-text border-knoux-purple/10 hover:border-knoux-purple/30"}`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1">
          <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
            {visibleServices.map((service) => {
              const labels = serviceActionLabels(service);
              const Icon = categoryIcon(service.category);
              return (
                <article
                  key={service.id}
                  className="relative overflow-hidden rounded-3xl border border-knoux-purple/12 bg-[linear-gradient(180deg,rgba(255,255,255,.82),rgba(252,250,255,.68))] p-4 min-h-[254px] flex flex-col justify-between gap-4 shadow-knoux-glow hover:shadow-knoux-glow-lg hover:-translate-y-1 transition"
                >
                  <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-knoux-purple/10 blur-2xl" />
                  <div className="relative space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="knoux-icon-shell shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-black text-knoux-dark-text leading-tight">
                              {service.displayName}
                            </h3>
                            <span className="text-[9px] font-black uppercase text-knoux-purple bg-knoux-purple/8 border border-knoux-purple/10 rounded-full px-2 py-0.5">
                              {service.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-knoux-muted-text leading-relaxed">
                            {service.description}
                          </p>
                        </div>
                      </div>
                      <span className={`knoux-badge ${statusTone(service)} shrink-0`}>
                        {service.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-knoux-muted-text">
                      <div className="rounded-2xl border border-knoux-purple/10 bg-knoux-purple/5 p-2">
                        <b className="block text-knoux-dark-text">Runtime</b>
                        {service.runtimeType}
                      </div>
                      <div className="rounded-2xl border border-knoux-purple/10 bg-knoux-purple/5 p-2">
                        <b className="block text-knoux-dark-text">Handler</b>
                        <span className="break-all">{service.actionHandler || "local"}</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-knoux-muted-text leading-relaxed border-t border-knoux-purple/10 pt-2">
                      Fallback: {service.fallback}
                    </p>
                  </div>
                  <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      disabled={busyId === service.id}
                      onClick={() => run(service)}
                      className="btn-knoux-primary text-[11px]"
                    >
                      <Play className="w-3.5 h-3.5" />{" "}
                      {busyId === service.id ? "Running" : labels[0]}
                    </button>
                    <button
                      onClick={() => applySample(service)}
                      className="btn-knoux-secondary text-[11px]"
                    >
                      <FileText className="w-3.5 h-3.5" /> {labels[1]}
                    </button>
                    <button
                      onClick={() => {
                        copyToClipboard(service.description);
                        onStatus?.("Copied description");
                      }}
                      className="btn-knoux-secondary text-[11px]"
                    >
                      <Copy className="w-3.5 h-3.5" /> {labels[2]}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
