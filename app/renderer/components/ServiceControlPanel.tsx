import { useState } from "react";
import { Copy, Play, SlidersHorizontal } from "lucide-react";
import { ClipboardItem } from "../types";
import { PRODUCTION_SERVICES, ProductionService } from "../services/productionCatalog";
import { buildServiceSample, runServiceOperation, serviceActionLabels, ServiceOperationResult } from "../services/serviceOperations";

interface Props {
  items: ClipboardItem[];
  onStatus?: (value: string) => void;
}

export default function ServiceControlPanel({ items, onStatus }: Props) {
  const [input, setInput] = useState("Paste customer text, code, PDF notes, URL, tracking number, or any clipboard content here.");
  const [result, setResult] = useState<ServiceOperationResult | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

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

  const runnable = PRODUCTION_SERVICES.filter((service) => service.status === "Active" || service.status === "Ready" || service.status === "Guarded");

  return (
    <section className="glass-panel p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-black text-knoux-dark-text flex items-center gap-2"><SlidersHorizontal className="w-5 h-5 text-knoux-purple" /> Customer Writing & Service Control Panel</h2>
        <span className="knoux-badge knoux-badge-active">{runnable.length} executable controls</span>
      </div>
      <textarea value={input} onChange={(event) => setInput(event.target.value)} className="w-full min-h-[150px] rounded-3xl border border-knoux-purple/10 bg-white/80 p-4 text-sm text-knoux-dark-text outline-none focus:border-knoux-purple leading-relaxed" />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {runnable.map((service) => (
            <div key={service.id} className="knoux-premium-card p-3 text-xs space-y-2">
              <div className="flex items-start justify-between gap-2">
                <b className="text-knoux-dark-text leading-tight">{service.displayName}</b>
                <span className={`knoux-badge knoux-badge-${service.status.toLowerCase()}`}>{service.status}</span>
              </div>
              <p className="text-[11px] text-knoux-muted-text leading-relaxed line-clamp-2">{service.description}</p>
              <div className="flex flex-wrap gap-2">
                <button disabled={busyId === service.id} onClick={() => run(service)} className="btn-knoux-primary text-[10px]"><Play className="w-3.5 h-3.5" /> {busyId === service.id ? "Running" : serviceActionLabels(service)[0]}</button>
                <button onClick={() => setInput(buildServiceSample(service))} className="btn-knoux-secondary text-[10px]">Use Sample</button>
                <button onClick={() => copy(`${service.displayName}\nStatus: ${service.status}\nHandler: ${service.actionHandler || "None"}\nFallback: ${service.fallback}`)} className="btn-knoux-secondary text-[10px]"><Copy className="w-3.5 h-3.5" /> Copy</button>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-3xl bg-[#140b25] text-[#f7f2ff] p-4 shadow-sm min-h-[220px]">
          <div className="flex items-center justify-between mb-3"><b className="text-xs text-[#cfb4ea] uppercase">Service Output</b><button onClick={() => copy(result?.output || "")} className="text-[10px] px-3 py-2 rounded-xl bg-white/10">Copy</button></div>
          <pre className="text-[11px] whitespace-pre-wrap overflow-auto max-h-[420px]">{result ? result.output : "Run any service card. Output, safe errors, fallback, and guarded statuses appear here."}</pre>
        </div>
      </div>
    </section>
  );
}
