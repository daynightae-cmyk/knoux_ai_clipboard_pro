import { useMemo, useState } from "react";
import { ClipboardItem } from "../types";
import { Activity, Braces, Bug, CheckCircle2, ClipboardCheck, ClipboardList, Code2, Copy, Database, Download, FileJson, FileText, GitBranch, Hammer, KeyRound, Layers3, Link2, Network, PackageCheck, Play, RefreshCw, SearchCheck, ServerCog, ShieldCheck, Sparkles, TerminalSquare, Wand2, Wrench, Zap } from "lucide-react";
import { PRODUCTION_SERVICES, getServiceReadinessPercent } from "../services/productionCatalog";
import { DEVELOPER_TOOLS, DeveloperToolId, getDeveloperToolSample } from "../services/developerTools";
import { isWorkerSupportedTool, runDeveloperToolFast } from "../services/developerToolWorkers";
import ServiceControlPanel from "./ServiceControlPanel";

interface Props { items?: ClipboardItem[]; }
type ApiCheck = { ok: boolean; status?: string; provider?: string; model?: string; error?: string } | null;

const commands = [
  { title: "Install dependencies", cmd: "npm install --legacy-peer-deps --include=dev" },
  { title: "Build renderer", cmd: "npm run build:renderer" },
  { title: "Build Electron main", cmd: "npm run build:main" },
  { title: "Package Windows EXE", cmd: "npm run dist:installer" },
  { title: "Run tests", cmd: "npm test" },
  { title: "Production doctor", cmd: "npm run doctor" }
];

const toolIcon = (id: DeveloperToolId) => {
  const icons: Record<DeveloperToolId, any> = {
    "json-format": Braces,
    "regex-test": SearchCheck,
    "markdown-preview": FileText,
    "markdown-table": ClipboardList,
    "hash-generator": ShieldCheck,
    "base64-encode": Code2,
    "base64-decode": Code2,
    "code-formatter": Code2,
    "env-checklist": ClipboardCheck,
    "api-action": Network,
    "commit-message": GitBranch,
    "readme-block": FileText,
    "pdf-brief": FileJson,
    "jwt-inspector": KeyRound,
    "secret-scanner": ShieldCheck,
    "large-text-analyzer": Activity,
    "url-parser": Link2,
    "diff-summary": Layers3,
    "typescript-interface": Code2,
    "zod-schema": ShieldCheck,
    "sql-checklist": Database,
    "release-notes": Sparkles,
    "bug-report": Bug,
    "test-plan": CheckCircle2,
    "i18n-audit": Activity,
    "redaction-map": ShieldCheck,
  };
  return icons[id] || Wrench;
};

const badgeClass = (status: string) => {
  if (status === "Active") return "knoux-badge-active";
  if (status === "Ready") return "knoux-badge-ready";
  if (status === "Guarded") return "knoux-badge-guarded";
  return "";
};

export default function StudioPage({ items = [] }: Props) {
  const [status, setStatus] = useState("Ready");
  const [api, setApi] = useState<ApiCheck>(null);
  const [busy, setBusy] = useState(false);
  const [toolBusy, setToolBusy] = useState<DeveloperToolId | null>(null);
  const [toolId, setToolId] = useState<DeveloperToolId>("json-format");
  const [toolInput, setToolInput] = useState(getDeveloperToolSample("json-format"));
  const [toolOutput, setToolOutput] = useState("Developer utility output appears here after running a tool card.");
  const [toolOutputs, setToolOutputs] = useState<Record<string, string>>({});

  const secure = items.filter((item) => item.isSecure).length;
  const pinned = items.filter((item) => item.pinned).length;
  const activeServices = PRODUCTION_SERVICES.filter((s) => s.status === "Active").length;
  const readyServices = PRODUCTION_SERVICES.filter((s) => s.status === "Ready").length;
  const guardedServices = PRODUCTION_SERVICES.filter((s) => s.status === "Guarded").length;
  const currentTool = DEVELOPER_TOOLS.find((tool) => tool.id === toolId) || DEVELOPER_TOOLS[0];
  const readiness = getServiceReadinessPercent();
  const workerToolCount = DEVELOPER_TOOLS.filter((tool) => isWorkerSupportedTool(tool.id)).length;

  const groupedServices = useMemo(() => PRODUCTION_SERVICES.reduce<Record<string, typeof PRODUCTION_SERVICES>>((acc, service) => {
    acc[service.category] = acc[service.category] || [];
    acc[service.category].push(service);
    return acc;
  }, {}), []);

  const report = useMemo(() => ({
    product: "Knoux AI Clipboard Pro",
    version: "1.1.0",
    build: "Vite + React + Electron Builder",
    performance: "Developer Studio uses runDeveloperToolFast for worker-backed heavy tools where supported.",
    aiRoute: "/api/ai/[action].js",
    barcode: "ZXing Browser Scanner",
    storage: "localStorage + Electron local bridge",
    developerTools: DEVELOPER_TOOLS.map((tool) => ({ id: tool.id, title: tool.title, status: tool.status, workerBacked: isWorkerSupportedTool(tool.id) })),
    services: { total: PRODUCTION_SERVICES.length, active: activeServices, ready: readyServices, guarded: guardedServices, readiness },
    records: items.length,
    secureRecords: secure,
    pinnedRecords: pinned,
    generatedAt: new Date().toISOString()
  }), [items.length, secure, pinned, activeServices, readyServices, guardedServices, readiness]);

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text || "");
    setStatus("Copied to clipboard");
  };

  const checkApi = async () => {
    setBusy(true);
    setStatus("Checking AI route...");
    try {
      const res = await fetch("/api/ai/chat", { method: "GET", cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      const next = { ok: res.ok && (data.status === "ready" || data.status === "configured"), status: data.status, provider: data.provider, model: data.model, error: data.error };
      setApi(next);
      setStatus(next.ok ? "AI route is ready" : `AI route issue: ${data.error || data.status || res.status}`);
    } catch (e: any) {
      setApi({ ok: false, error: e?.message || "AI route check failed" });
      setStatus(e?.message || "AI route check failed");
    } finally {
      setBusy(false);
    }
  };

  const loadToolSample = (id: DeveloperToolId) => {
    const tool = DEVELOPER_TOOLS.find((entry) => entry.id === id) || currentTool;
    setToolId(id);
    setToolInput(tool.sample);
    setStatus(`${tool.title} sample loaded`);
  };

  const runTool = async (id: DeveloperToolId = toolId, useCardSample = false) => {
    const tool = DEVELOPER_TOOLS.find((entry) => entry.id === id) || currentTool;
    const input = useCardSample || id !== toolId ? (toolInput.trim() ? toolInput : tool.sample) : toolInput;
    setToolBusy(id);
    setStatus(`${tool.title} running${isWorkerSupportedTool(id) ? " in a background worker" : ""}...`);
    try {
      const output = await runDeveloperToolFast(id, input || tool.sample);
      setToolId(id);
      if (id !== toolId && !toolInput.trim()) setToolInput(tool.sample);
      setToolOutput(output);
      setToolOutputs((prev) => ({ ...prev, [id]: output }));
      setStatus(`${tool.title} completed${isWorkerSupportedTool(id) ? " without blocking the UI" : ""}`);
    } catch (error: any) {
      const message = error?.message || `${tool.title} failed`;
      setToolOutput(message);
      setStatus(message);
    } finally {
      setToolBusy(null);
    }
  };

  const copyTool = async (id: DeveloperToolId) => {
    const tool = DEVELOPER_TOOLS.find((entry) => entry.id === id) || currentTool;
    const output = toolOutputs[id] || await runDeveloperToolFast(id, tool.sample);
    setToolOutputs((prev) => ({ ...prev, [id]: output }));
    await copy(output);
    setStatus(`${tool.title} output copied`);
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
    <div id="developer-studio-container" className="p-6 space-y-6 w-full max-w-none mx-auto">
      <section className="relative overflow-hidden rounded-[36px] border border-knoux-purple/15 bg-[radial-gradient(circle_at_8%_0%,rgba(193,124,235,.35),transparent_32%),linear-gradient(135deg,rgba(255,255,255,.86),rgba(243,230,251,.78))] p-6 md:p-8 shadow-knoux-glow-lg">
        <div className="absolute right-8 top-8 h-28 w-28 rounded-full bg-knoux-purple/10 blur-3xl" />
        <div className="relative grid grid-cols-1 2xl:grid-cols-[1fr_520px] gap-6 items-end">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-knoux-purple/15 bg-white/60 text-[11px] font-black text-knoux-purple uppercase tracking-widest"><Wrench className="w-4 h-4" /> Developer Control Deck</div>
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-black text-knoux-dark-text tracking-tight">KNOUX Developer Studio</h1>
              <p className="text-sm md:text-base text-knoux-muted-text max-w-5xl leading-relaxed">Full-width production workspace for diagnostics, 19 executable developer utilities, real service actions, guarded API testing, build commands, and exportable handoff reports. Heavy utilities use background workers where supported.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Readiness", value: `${readiness}%`, icon: Activity },
              { label: "Tools", value: DEVELOPER_TOOLS.length, icon: Hammer },
              { label: "Workers", value: workerToolCount, icon: Zap },
              { label: "AI Route", value: api?.status || "check", icon: Sparkles },
            ].map((m) => { const Icon = m.icon; return <div key={m.label} className="knoux-premium-card p-4"><div className="flex items-center justify-between text-[10px] text-knoux-muted-text font-black uppercase"><span>{m.label}</span><Icon className="w-4 h-4 text-knoux-purple" /></div><div className="text-2xl font-black text-knoux-dark-text font-mono mt-2 truncate">{m.value}</div></div>; })}
          </div>
        </div>
      </section>

      <ServiceControlPanel items={items} onStatus={setStatus} />

      <section className="glass-elevated p-5 md:p-6 space-y-5">
        <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-knoux-purple/10 border border-knoux-purple/15 text-[11px] font-black text-knoux-purple uppercase tracking-widest"><TerminalSquare className="w-4 h-4" /> 19 Developer Utilities</div>
            <h2 className="text-2xl font-black text-knoux-dark-text">Every developer card has three specific actions.</h2>
            <p className="text-sm text-knoux-muted-text max-w-4xl">Run the local utility, load a valid service-specific sample, or copy the last output. Worker-backed tools reduce main-thread blocking for large inputs.</p>
          </div>
          <div className="rounded-2xl border border-knoux-purple/10 bg-white/65 px-4 py-3 text-xs font-bold text-knoux-muted-text">Last status: <span className="text-knoux-purple">{status}</span></div>
        </div>

        <div className="grid grid-cols-1 2xl:grid-cols-[minmax(0,1fr)_480px] gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4 gap-4">
            {DEVELOPER_TOOLS.map((tool) => {
              const Icon = toolIcon(tool.id);
              const selected = toolId === tool.id;
              const workerBacked = isWorkerSupportedTool(tool.id);
              return (
                <article key={tool.id} className={`relative overflow-hidden rounded-3xl border p-4 min-h-[238px] flex flex-col justify-between gap-4 transition ${selected ? "border-knoux-purple/40 bg-white/88 shadow-knoux-glow-lg" : "border-knoux-purple/12 bg-white/68 shadow-knoux-glow hover:border-knoux-purple/30"}`}>
                  <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-knoux-purple/10 blur-2xl" />
                  <div className="relative space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="knoux-icon-shell shrink-0"><Icon className="w-4 h-4" /></div>
                        <div className="space-y-1 min-w-0">
                          <h3 className="text-sm font-black text-knoux-dark-text leading-tight">{tool.title}</h3>
                          <p className="text-[11px] text-knoux-muted-text leading-relaxed">{tool.description}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0"><span className={`knoux-badge ${badgeClass(tool.status)}`}>{tool.status}</span>{workerBacked && <span className="knoux-badge knoux-badge-ready"><Zap className="w-3 h-3" /> Worker</span>}</div>
                    </div>
                    <div className="rounded-2xl border border-knoux-purple/10 bg-knoux-purple/5 p-2 text-[10px] text-knoux-muted-text"><b className="block text-knoux-dark-text">Output</b>{tool.outputLabel}</div>
                  </div>
                  <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button disabled={toolBusy === tool.id} onClick={() => runTool(tool.id)} className="btn-knoux-primary text-[11px]"><Play className="w-3.5 h-3.5" /> {toolBusy === tool.id ? "Running" : tool.actionLabel}</button>
                    <button onClick={() => loadToolSample(tool.id)} className="btn-knoux-secondary text-[11px]"><FileText className="w-3.5 h-3.5" /> {tool.sampleLabel}</button>
                    <button onClick={() => copyTool(tool.id)} className="btn-knoux-secondary text-[11px]"><Copy className="w-3.5 h-3.5" /> {tool.copyLabel}</button>
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="space-y-4 2xl:sticky 2xl:top-4 h-fit">
            <div className="rounded-3xl border border-knoux-purple/15 bg-white/75 p-5 shadow-knoux-glow space-y-4">
              <div className="flex items-center justify-between gap-3"><h3 className="font-black text-knoux-dark-text flex items-center gap-2"><Wand2 className="w-5 h-5 text-knoux-purple" /> Active Tool Bench</h3><span className={`knoux-badge ${badgeClass(currentTool.status)}`}>{currentTool.status}</span></div>
              <label className="block text-[10px] font-black uppercase text-knoux-muted-text">{currentTool.inputLabel}</label>
              <textarea value={toolInput} onChange={(e) => setToolInput(e.target.value)} placeholder={currentTool.placeholder} className="w-full min-h-[210px] rounded-2xl border border-knoux-purple/10 bg-white/80 p-4 text-xs font-mono text-knoux-dark-text outline-none focus:border-knoux-purple" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button disabled={toolBusy === currentTool.id} onClick={() => runTool(currentTool.id)} className="btn-knoux-primary text-xs"><Play className="w-4 h-4" /> {toolBusy === currentTool.id ? "Running" : "Run"}</button>
                <button onClick={() => loadToolSample(currentTool.id)} className="btn-knoux-secondary text-xs"><FileText className="w-4 h-4" /> Sample</button>
                <button onClick={() => copy(toolOutput)} className="btn-knoux-secondary text-xs"><Copy className="w-4 h-4" /> Copy</button>
              </div>
              <pre className="rounded-3xl bg-[#140b25] text-[#f7f2ff] p-4 text-[11px] overflow-auto max-h-[360px] whitespace-pre-wrap border border-white/10">{toolOutput}</pre>
            </div>

            <section className="glass-panel p-5 space-y-3"><h2 className="font-black text-knoux-dark-text flex items-center gap-2"><FileJson className="w-5 h-5 text-knoux-purple" /> Handoff Report</h2><button onClick={download} className="w-full btn-knoux-primary text-xs"><Download className="w-4 h-4" /> Download JSON</button><button onClick={() => copy(JSON.stringify(report, null, 2))} className="w-full btn-knoux-secondary text-xs"><Copy className="w-4 h-4" /> Copy JSON</button></section>
          </aside>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">
        <main className="space-y-5">
          <section className="glass-panel p-5 space-y-4">
            <div className="flex items-center justify-between gap-3"><h2 className="font-black text-knoux-dark-text flex items-center gap-2"><ServerCog className="w-5 h-5 text-knoux-purple" /> AI Route Diagnostics</h2><button onClick={checkApi} className="btn-knoux-primary text-xs"><RefreshCw className={`w-4 h-4 ${busy ? "animate-spin" : ""}`} /> Check Now</button></div>
            <div className={`rounded-2xl p-4 text-sm font-semibold ${api?.ok ? "bg-emerald-50 text-emerald-800 border border-emerald-100" : api ? "bg-red-50 text-red-700 border border-red-100" : "bg-white border border-knoux-purple/10 text-knoux-muted-text"}`}>{status}</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="knoux-premium-card p-3"><b>Provider</b><div className="text-knoux-muted-text mt-1">{api?.provider || "openrouter"}</div></div>
              <div className="knoux-premium-card p-3"><b>Model</b><div className="text-knoux-muted-text mt-1">{api?.model || "not checked"}</div></div>
              <div className="knoux-premium-card p-3"><b>Status</b><div className="text-knoux-muted-text mt-1">{api?.status || "idle"}</div></div>
            </div>
          </section>

          <section className="glass-panel p-5 space-y-4">
            <h2 className="font-black text-knoux-dark-text flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-knoux-purple" /> Service Reality Matrix</h2>
            <div className="space-y-5">{Object.entries(groupedServices).map(([category, services]) => <div key={category} className="space-y-3"><div className="flex items-center justify-between border-b border-knoux-purple/10 pb-2"><h3 className="text-xs font-black uppercase tracking-widest text-knoux-dark-text">{category}</h3><span className="knoux-badge">{services.length} services</span></div><div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-3">{services.map((service) => <div key={service.id} className="knoux-premium-card p-3 text-xs space-y-2"><div className="flex items-center justify-between gap-2"><b className="text-knoux-dark-text">{service.displayName}</b><span className={`knoux-badge ${badgeClass(service.status)}`}>{service.status}</span></div><p className="text-[11px] text-knoux-muted-text leading-relaxed">{service.description}</p><div className="grid grid-cols-2 gap-2 text-[10px] text-knoux-muted-text"><span>Runtime: {service.runtimeType}</span><span>Config: {service.requiresConfig ? "Required" : "No"}</span><span>Implemented: {service.implemented ? "Yes" : "No"}</span><span>Handler: {service.actionHandler || "None"}</span></div><p className="text-[10px] text-knoux-muted-text">Fallback: {service.fallback}</p></div>)}</div></div>)}</div>
          </section>

          <section className="glass-panel p-5 space-y-4"><h2 className="font-black text-knoux-dark-text flex items-center gap-2"><TerminalSquare className="w-5 h-5 text-knoux-purple" /> Build & Packaging Commands</h2><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">{commands.map((item) => <button key={item.cmd} onClick={() => copy(item.cmd)} className="knoux-premium-card p-4 text-left hover:border-knoux-purple/25 transition"><div className="text-[10px] font-black text-knoux-purple uppercase">{item.title}</div><code className="block text-xs text-knoux-dark-text mt-2 break-all">{item.cmd}</code></button>)}</div></section>
        </main>

        <aside className="space-y-5">
          <section className="rounded-3xl bg-[#140b25] text-[#f7f2ff] p-5 shadow-sm"><div className="text-xs font-black text-[#cfb4ea] mb-3 uppercase flex items-center gap-2"><PackageCheck className="w-4 h-4" /> Live Report</div><pre className="text-[11px] overflow-auto max-h-[520px]">{JSON.stringify(report, null, 2)}</pre></section>
          <section className="glass-panel p-5 grid grid-cols-3 gap-3 text-center"><div><div className="text-2xl font-black text-emerald-600">{activeServices}</div><div className="text-[10px] text-knoux-muted-text uppercase font-black">Active</div></div><div><div className="text-2xl font-black text-blue-600">{readyServices}</div><div className="text-[10px] text-knoux-muted-text uppercase font-black">Ready</div></div><div><div className="text-2xl font-black text-amber-600">{guardedServices}</div><div className="text-[10px] text-knoux-muted-text uppercase font-black">Guarded</div></div></section>
        </aside>
      </div>
    </div>
  );
}
