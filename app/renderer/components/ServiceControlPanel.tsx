import { useMemo, useState } from "react";
import { Copy, FileText, Play, SlidersHorizontal, Wand2 } from "lucide-react";
import { ClipboardItem } from "../types";
import { PRODUCTION_SERVICES, ProductionService, ServiceCategory } from "../services/productionCatalog";
import { buildServiceSample, runServiceOperation, serviceActionLabels, ServiceOperationResult } from "../services/serviceOperations";

interface Props {
  items: ClipboardItem[];
  onStatus?: (value: string) => void;
}

const categoryOrder: Array<ServiceCategory | "All"> = ["All", "Clipboard", "Client Tools", "Security", "AI", "Barcode", "Developer", "Packaging"];

const statusTone = (service: ProductionService) => {
  if (service.status === "Active") return "knoux-badge-active";
  if (service.status === "Ready") return "knoux-badge-ready";
  if (service.status === "Guarded") return "knoux-badge-guarded";
  return "knoux-badge";
};

export default function ServiceControlPanel({ items, onStatus }: Props) {
  const [input, setInput] = useState("Paste customer text, code, PDF notes, URL, tracking number, or any clipboard content here.");
  const [result, setResult] = useState<ServiceOperationResult | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [category, setCategory] = useState<ServiceCategory | "All">("All");

  const runnable = useMemo(() => PRODUCTION_SERVICES.filter((service) => service.status === "Active" || service.status === "Ready" || service.status === "Guarded"), []);
  const visibleServices = category === "All" ? runnable : runnable.filter((service) => service.category === category);
  const activeCount = runnable.filter((service) => service.status === "Active").length;
  const readyCount = runnable.filter((service) => service.status === "Ready").length;
  const guardedCount = runnable.filter((service) => service.status === "Guarded").length;

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text || "");
    onStatus?.("Copied service output");
  };

  const run = async (service: ProductionService) => {
    setBusyId(service.id);
    onStatus?.(`Running ${service.displayName}...`);
    const next = await runServiceOperation(service, input, items);
    setResult(next);
    onStatus?.(`${service.displayName}: ${next.status}`);
    setBusyId(null);
  };

  const useSample = (service: ProductionService) => {
    setInput(buildServiceSample(service));
    onStatus?.(`${service.displayName} sample loaded`);
  };

  return (
    <section className="glass-elevated p-5 md:p-6 space-y-5 overflow-hidden relative">
      <div className="absolute -left-24 -top-24 w-72 h-72 rounded-full bg-knoux-purple/10 blur-3xl" />
      <div className="relative flex flex-col gap-4">
        <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-knoux-purple/10 border border-knoux-purple/15 text-[11px] font-black text-knoux-purple uppercase tracking-widest"><SlidersHorizontal className="w-4 h-4" /> Service Command Center</div>
            <h2 className="text-2xl font-black text-knoux-dark-text">Customer Writing & Service Control Panel</h2>
            <p className="text-sm text-knoux-muted-text max-w-3xl">Every available service has three direct actions: run the real handler, load a valid service-specific sample, and copy the service output or operating notes.</p>
          </div>
          <div className="grid grid-cols-3 gap-2 min-w-[320px]">
            <div className="knoux-premium-card p-3 text-center"><div className="text-[10px] uppercase font-black text-knoux-muted-text">Active</div><div className="text-xl font-black text-emerald-600">{activeCount}</div></div>
            <div className="knoux-premium-card p-3 text-center"><div className="text-[10px] uppercase font-black text-knoux-muted-text">Ready</div><div className="text-xl font-black text-blue-600">{readyCount}</div></div>
            <div className="knoux-premium-card p-3 text-center"><div className="text-[10px] uppercase font-black text-knoux-muted-text">Guarded</div><div className="text-xl font-black text-amber-600">{guardedCount}</div></div>
          </div>
        </div>

        <textarea value={input} onChange={(event) => setInput(event.target.value)} className="w-full min-h-[150px] rounded-3xl border border-knoux-purple/15 bg-[color:var(--knoux-card-elevated)] p-5 text-sm text-knoux-dark-text outline-none focus:border-knoux-purple leading-relaxed shadow-sm" />

        <div className="flex flex-wrap gap-2">
          {categoryOrder.map((item) => <button key={item} onClick={() => setCategory(item)} className={`px-4 py-2 rounded-2xl border text-xs font-black transition ${category === item ? "bg-knoux-purple text-white border-knoux-purple shadow-knoux-glow" : "bg-[color:var(--knoux-card)] text-knoux-dark-text border-knoux-purple/10 hover:border-knoux-purple/30"}`}>{item}</button>)}
        </div>

        <div className="grid grid-cols-1 2xl:grid-cols-[1fr_430px] gap-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {visibleServices.map((service) => {
              const labels = serviceActionLabels(service);
              return (
                <article key={service.id} className="knoux-premium-card p-4 min-h-[220px] flex flex-col justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="knoux-icon-shell shrink-0"><Wand2 className="w-4 h-4" /></div>
                        <div className="space-y-1">
                          <h3 className="text-sm font-black text-knoux-dark-text leading-tight">{service.displayName}</h3>
                          <p className="text-[11px] text-knoux-muted-text leading-relaxed">{service.description}</p>
                        </div>
                      </div>
                      <span className={`knoux-badge ${statusTone(service)} shrink-0`}>{service.status}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-knoux-muted-text">
                      <div className="rounded-2xl border border-knoux-purple/10 bg-knoux-purple/5 p-2"><b className="block text-knoux-dark-text">Runtime</b>{service.runtimeType}</div>
                      <div className="rounded-2xl border border-knoux-purple/10 bg-knoux-purple/5 p-2"><b className="block text-knoux-dark-text">Handler</b>{service.actionHandler || "local"}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button disabled={busyId === service.id} onClick={() => run(service)} className="btn-knoux-primary text-[11px]"><Play className="w-3.5 h-3.5" /> {busyId === service.id ? "Running" : labels[0]}</button>
                    <button onClick={() => useSample(service)} className="btn-knoux-secondary text-[11px]"><FileText className="w-3.5 h-3.5" /> {labels[1]}</button>
                    <button onClick={() => copy(`${service.displayName}\nStatus: ${service.status}\nRuntime: ${service.runtimeType}\nHandler: ${service.actionHandler || "local"}\nFallback: ${service.fallback}\n\nLast output:\n${result?.title === service.displayName ? result.output : "Run this service to generate output."}`)} className="btn-knoux-secondary text-[11px]"><Copy className="w-3.5 h-3.5" /> {labels[2]}</button>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="rounded-3xl bg-[#12091f] text-[#f7f2ff] p-5 shadow-knoux-glow border border-white/10 sticky top-4 h-fit">
            <div className="flex items-center justify-between mb-4">
              <div><b className="text-xs text-[#cfb4ea] uppercase tracking-widest">Service Output</b><p className="text-[11px] text-[#b9aec8] mt-1">Live result, safe error, fallback, or provider status.</p></div>
              <button onClick={() => copy(result?.output || "")} className="text-[10px] px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15">Copy</button>
            </div>
            <div className={`mb-3 inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase ${result?.ok ? "bg-emerald-500/15 text-emerald-200" : result ? "bg-amber-500/15 text-amber-200" : "bg-white/10 text-[#cfb4ea]"}`}>{result?.status || "waiting"}</div>
            <pre className="text-[12px] leading-6 whitespace-pre-wrap overflow-auto max-h-[520px] font-mono">{result ? result.output : "Run any service card. Output, safe errors, fallback, and guarded statuses appear here."}</pre>
          </div>
        </div>
      </div>
    </section>
  );
}
