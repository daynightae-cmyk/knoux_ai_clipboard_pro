import { useMemo, useState } from "react";
import { ClipboardItem } from "../types";
import { CheckCircle2, Copy, Database, Download, FileJson, PackageCheck, RefreshCw, ServerCog, ShieldCheck, Sparkles, TerminalSquare, Wrench } from "lucide-react";
import { PRODUCTION_SERVICES } from "../services/productionCatalog";

interface Props { items?: ClipboardItem[]; }

type ApiCheck = { ok: boolean; status?: string; provider?: string; model?: string; error?: string } | null;

const commands = [
  { title: "Install dependencies", cmd: "npm install --legacy-peer-deps --include=dev" },
  { title: "Build renderer", cmd: "npm run build:renderer" },
  { title: "Build Electron main", cmd: "npm run build:main" },
  { title: "Package Windows EXE", cmd: "npm run dist:installer" },
  { title: "Run tests", cmd: "npm test" }
];

export default function StudioPage({ items = [] }: Props) {
  const [status, setStatus] = useState("Ready");
  const [api, setApi] = useState<ApiCheck>(null);
  const [busy, setBusy] = useState(false);
  const secure = items.filter((item) => item.isSecure).length;
  const pinned = items.filter((item) => item.pinned).length;
  const groupedServices = useMemo(() => {
    return PRODUCTION_SERVICES.reduce<Record<string, typeof PRODUCTION_SERVICES>>((acc, service) => {
      acc[service.category] = acc[service.category] || [];
      acc[service.category].push(service);
      return acc;
    }, {});
  }, []);

  const report = useMemo(() => ({
    product: "Knoux AI Clipboard Pro",
    build: "Vite + React + Electron Builder",
    aiRoute: "/api/ai/[action].js",
    barcode: "ZXing Browser Scanner",
    storage: "localStorage + Electron local bridge",
    records: items.length,
    secureRecords: secure,
    pinnedRecords: pinned,
    generatedAt: new Date().toISOString()
  }), [items.length, secure, pinned]);

  const copy = async (text: string) => { await navigator.clipboard.writeText(text); setStatus("Copied to clipboard"); };

  const checkApi = async () => {
    setBusy(true);
    setStatus("Checking AI route...");
    try {
      const res = await fetch("/api/ai/chat", { method: "GET", cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      const next = { ok: res.ok && data.status === "configured", status: data.status, provider: data.provider, model: data.model, error: data.error };
      setApi(next);
      setStatus(next.ok ? "OpenRouter is configured" : `AI route issue: ${data.error || data.status || res.status}`);
    } catch (e: any) {
      setApi({ ok: false, error: e?.message || "AI route check failed" });
      setStatus(e?.message || "AI route check failed");
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "knoux-developer-handoff.json";
    a.click();
    URL.revokeObjectURL(url);
    setStatus("Developer handoff exported");
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <section className="glass-elevated p-6 overflow-hidden relative">
        <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-knoux-purple/10 blur-3xl" />
        <div className="relative space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-knoux-purple/10 bg-knoux-purple/5 text-[11px] font-black text-knoux-purple uppercase tracking-widest"><Wrench className="w-4 h-4" /> Developer Control Deck</div>
          <h1 className="text-3xl font-black text-knoux-dark-text">KNOUX Developer Studio</h1>
          <p className="text-sm text-knoux-muted-text max-w-3xl">Live service diagnostics, API verification, build command handoff, packaging commands, and exportable project report. Failed checks are shown explicitly.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[{ label: "Records", value: items.length, icon: Database }, { label: "Secure", value: secure, icon: ShieldCheck }, { label: "Pinned", value: pinned, icon: CheckCircle2 }, { label: "AI Route", value: api?.status || "check", icon: Sparkles }].map((m) => { const Icon = m.icon; return <div key={m.label} className="rounded-2xl border border-knoux-purple/10 bg-white/75 p-3 shadow-knoux-glow"><div className="flex items-center justify-between text-[10px] text-knoux-muted-text font-black uppercase"><span>{m.label}</span><Icon className="w-4 h-4 text-knoux-purple" /></div><div className="text-xl font-black text-knoux-dark-text font-mono mt-2 truncate">{m.value}</div></div>; })}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <main className="space-y-5">
          <section className="glass-panel p-5 space-y-4">
            <div className="flex items-center justify-between gap-3"><h2 className="font-black text-knoux-dark-text flex items-center gap-2"><ServerCog className="w-5 h-5 text-knoux-purple" /> AI Route Diagnostics</h2><button onClick={checkApi} className="btn-knoux-primary text-xs"><RefreshCw className={`w-4 h-4 ${busy ? "animate-spin" : ""}`} /> Check Now</button></div>
            <div className={`rounded-2xl p-4 text-sm font-semibold ${api?.ok ? "bg-emerald-50 text-emerald-800 border border-emerald-100" : api ? "bg-red-50 text-red-700 border border-red-100" : "bg-white border border-knoux-purple/10 text-knoux-muted-text"}`}>{status}</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="rounded-2xl bg-white border border-knoux-purple/10 p-3"><b>Provider</b><div className="text-knoux-muted-text mt-1">{api?.provider || "openrouter"}</div></div>
              <div className="rounded-2xl bg-white border border-knoux-purple/10 p-3"><b>Model</b><div className="text-knoux-muted-text mt-1">{api?.model || "not checked"}</div></div>
              <div className="rounded-2xl bg-white border border-knoux-purple/10 p-3"><b>Status</b><div className="text-knoux-muted-text mt-1">{api?.status || "idle"}</div></div>
            </div>
          </section>

          <section className="glass-panel p-5 space-y-4">
            <h2 className="font-black text-knoux-dark-text flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-knoux-purple" /> Service Reality Matrix</h2>
            <div className="space-y-5">
              {Object.entries(groupedServices).map(([category, services]) => (
                <div key={category} className="space-y-3">
                  <div className="flex items-center justify-between border-b border-knoux-purple/10 pb-2">
                    <h3 className="text-xs font-black uppercase tracking-widest text-knoux-dark-text">{category}</h3>
                    <span className="knoux-badge">{services.length} services</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {services.map((service) => (
                      <div key={service.id} className="knoux-premium-card p-3 text-xs space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <b className="text-knoux-dark-text">{service.displayName}</b>
                          <span className={`knoux-badge knoux-badge-${service.status.toLowerCase()}`}>{service.status}</span>
                        </div>
                        <p className="text-[11px] text-knoux-muted-text leading-relaxed">{service.description}</p>
                        <div className="grid grid-cols-2 gap-2 text-[10px] text-knoux-muted-text">
                          <span>Runtime: {service.runtimeType}</span>
                          <span>Config: {service.requiresConfig ? "Required" : "No"}</span>
                          <span>Implemented: {service.implemented ? "Yes" : "No"}</span>
                          <span>Handler: {service.actionHandler || "None"}</span>
                        </div>
                        {service.disabledReason && <p className="text-[10px] text-amber-700">{service.disabledReason}</p>}
                        <p className="text-[10px] text-knoux-muted-text">Fallback: {service.fallback}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="glass-panel p-5 space-y-4">
            <h2 className="font-black text-knoux-dark-text flex items-center gap-2"><TerminalSquare className="w-5 h-5 text-knoux-purple" /> Build & Packaging Commands</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{commands.map((item) => <button key={item.cmd} onClick={() => copy(item.cmd)} className="rounded-2xl border border-knoux-purple/10 bg-white/75 p-4 text-left hover:border-knoux-purple/25 transition"><div className="text-[10px] font-black text-knoux-purple uppercase">{item.title}</div><code className="block text-xs text-knoux-dark-text mt-2 break-all">{item.cmd}</code></button>)}</div>
          </section>
        </main>

        <aside className="space-y-5">
          <section className="glass-panel p-5 space-y-3"><h2 className="font-black text-knoux-dark-text flex items-center gap-2"><FileJson className="w-5 h-5 text-knoux-purple" /> Handoff Report</h2><button onClick={download} className="w-full h-11 rounded-xl bg-gradient-to-r from-knoux-purple to-knoux-neon text-white text-xs font-black flex items-center justify-center gap-2"><Download className="w-4 h-4" /> Download JSON</button><button onClick={() => copy(JSON.stringify(report, null, 2))} className="w-full h-11 rounded-xl border border-knoux-purple/15 text-knoux-purple text-xs font-black flex items-center justify-center gap-2 bg-white"><Copy className="w-4 h-4" /> Copy JSON</button></section>
          <section className="rounded-3xl bg-[#140b25] text-[#f7f2ff] p-5 shadow-sm"><div className="text-xs font-black text-[#cfb4ea] mb-3 uppercase flex items-center gap-2"><PackageCheck className="w-4 h-4" /> Live Report</div><pre className="text-[11px] overflow-auto max-h-[420px]">{JSON.stringify(report, null, 2)}</pre></section>
        </aside>
      </div>
    </div>
  );
}
