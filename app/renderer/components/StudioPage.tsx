import { useMemo, useState } from "react";
import { AppSettings, ClipboardItem } from "../types";
import {
  Activity,
  Braces,
  Bug,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Code2,
  Copy,
  Cpu,
  Database,
  Download,
  FileJson,
  FileText,
  Gauge,
  GitBranch,
  KeyRound,
  Layers3,
  Link2,
  Network,
  PackageCheck,
  Play,
  RefreshCw,
  Rocket,
  SearchCheck,
  ServerCog,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  Wand2,
  Wrench,
  Zap,
} from "lucide-react";
import { PRODUCTION_SERVICES, getServiceReadinessPercent } from "../services/productionCatalog";
import {
  DEVELOPER_TOOLS,
  DeveloperToolId,
  getDeveloperToolSample,
  type DeveloperTool,
} from "../services/developerTools";
import { isWorkerSupportedTool } from "../services/developerToolWorkers";
import ServiceControlPanel from "./ServiceControlPanel";
import { WorkspaceHero, StatusSummaryCard, SectionHeader, ToolCard } from "./studio/StudioKit";
import { LivePreviewPanel, type PreviewRun } from "./studio/LivePreviewPanel";
import i18n from "../utils/i18n";
import { copyToClipboard } from "../../shared/clipboard-utils";
import { downloadText, downloadJson } from "../../shared/download-utils";
import { useStudioExecutor } from "../hooks/useStudioExecutor";

interface Props {
  items?: ClipboardItem[];
  settings: AppSettings;
}
type ApiCheck = {
  ok: boolean;
  status?: string;
  provider?: string;
  model?: string;
  error?: string;
} | null;

const commands = [
  { title: "Install dependencies", cmd: "npm install --legacy-peer-deps --include=dev" },
  { title: "Build renderer", cmd: "npm run build:renderer" },
  { title: "Build Electron main", cmd: "npm run build:main" },
  { title: "Package Windows EXE", cmd: "npm run dist:installer" },
  { title: "Run tests", cmd: "npm test" },
  { title: "Production doctor", cmd: "npm run doctor" },
];

const toolIcon = (id: DeveloperToolId) => {
  const icons: Record<DeveloperToolId, typeof Wrench> = {
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

export default function StudioPage({ items = [], settings }: Props) {
  const t = (key: string, fallback: string) => i18n.t(key, fallback);
  const [status, setStatus] = useState(t("studio.statusReady", "Ready"));
  const [api, setApi] = useState<ApiCheck>(null);
  const [busy, setBusy] = useState(false);
  const [toolId, setToolId] = useState<DeveloperToolId>("json-format");
  const [toolInput, setToolInput] = useState(getDeveloperToolSample("json-format"));
  const [toolOutputs, setToolOutputs] = useState<Record<string, string>>({});

  const secure = items.filter((item) => item.isSecure).length;
  const pinned = items.filter((item) => item.pinned).length;
  const activeServices = PRODUCTION_SERVICES.filter((s) => s.status === "Active").length;
  const readyServices = PRODUCTION_SERVICES.filter((s) => s.status === "Ready").length;
  const guardedServices = PRODUCTION_SERVICES.filter((s) => s.status === "Guarded").length;
  const currentTool = DEVELOPER_TOOLS.find((tool) => tool.id === toolId) || DEVELOPER_TOOLS[0];
  const readiness = getServiceReadinessPercent();
  const workerToolCount = DEVELOPER_TOOLS.filter((tool) => isWorkerSupportedTool(tool.id)).length;

  const {
    toolBusy,
    currentRun,
    history,
    setCurrentRun,
    setHistory,
    executeTool,
    executeService,
    copyTool,
    loadToolSample,
  } = useStudioExecutor({
    items,
    settings,
    setStatus,
    setToolId,
    setToolInput,
    toolOutputs,
    setToolOutputs,
    toolInput,
    currentTool,
    t,
  });

  const groupedServices = useMemo(
    () =>
      PRODUCTION_SERVICES.reduce<Record<string, typeof PRODUCTION_SERVICES>>((acc, service) => {
        acc[service.category] = acc[service.category] || [];
        acc[service.category].push(service);
        return acc;
      }, {}),
    []
  );

  const report = useMemo(
    () => ({
      product: "Knoux AI Clipboard Pro",
      version: "1.1.0",
      build: "Vite + React + Electron Builder",
      performance:
        "Developer Studio uses runDeveloperToolFast for worker-backed heavy tools where supported.",
      aiRoute: "/api/ai/[action].js",
      barcode: "ZXing Browser Scanner",
      storage: "localStorage + Electron local bridge",
      developerTools: DEVELOPER_TOOLS.map((tool) => ({
        id: tool.id,
        title: tool.title,
        status: tool.status,
        workerBacked: isWorkerSupportedTool(tool.id),
      })),
      services: {
        total: PRODUCTION_SERVICES.length,
        active: activeServices,
        ready: readyServices,
        guarded: guardedServices,
        readiness,
      },
      records: items.length,
      secureRecords: secure,
      pinnedRecords: pinned,
      generatedAt: new Date().toISOString(),
    }),
    [items.length, secure, pinned, activeServices, readyServices, guardedServices, readiness]
  );

  const copy = async (text: string) => {
    await copyToClipboard(text || "");
    setStatus(t("studio.copied", "Copied to clipboard"));
  };

  const checkApi = async () => {
    setBusy(true);
    setStatus(t("studio.checkingAi", "Checking AI route..."));
    try {
      const res = await fetch("/api/ai/chat", { method: "GET", cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      const next = {
        ok: res.ok && (data.status === "ready" || data.status === "configured"),
        status: data.status,
        provider: data.provider,
        model: data.model,
        error: data.error,
      };
      setApi(next);
      setStatus(
        next.ok
          ? t("studio.aiReady", "AI route is ready")
          : `AI route issue: ${data.error || data.status || res.status}`
      );
    } catch (e: any) {
      setApi({ ok: false, error: e?.message || "AI route check failed" });
      setStatus(e?.message || "AI route check failed");
    } finally {
      setBusy(false);
    }
  };

  const exportPreview = () => {
    if (!currentRun?.output) return;
    downloadText(
      `knoux-${currentRun.tool.toLowerCase().replace(/\s+/g, "-")}-output.txt`,
      currentRun.output
    );
    setStatus(t("studio.exported", "Result exported"));
  };

  const download = () => {
    downloadJson("knoux-developer-handoff.json", report);
    setStatus(t("studio.reportTitle", "Developer handoff exported"));
  };

  const aiRouteLabel = api
    ? api.ok
      ? t("studio.aiReady", "AI route is ready")
      : t("studio.aiGuarded", "AI route guarded")
    : t("studio.aiNotChecked", "AI route not checked");

  return (
    <div id="developer-studio-container" className="p-6 space-y-6 w-full max-w-none mx-auto">
      <WorkspaceHero
        badgeLabel={t("studio.heroBadge", "KNOUX Developer Control Deck")}
        title={t("studio.heroTitle", "Developer Studio")}
        subtitle={t("studio.heroSubtitle", "Premium local-first developer workspace")}
        description={t(
          "studio.heroDesc",
          "Run real developer utilities, inspect AI route health, and export a truthful handoff report. Every tool executes locally and streams results into the live preview — no fake states."
        )}
        badges={[
          {
            label: `${t("studio.readiness", "Readiness")} ${readiness}%`,
            icon: Gauge,
            tone: "emerald",
          },
          {
            label: `${DEVELOPER_TOOLS.length} ${t("studio.tools", "tools")}`,
            icon: Wrench,
            tone: "purple",
          },
          {
            label: `${workerToolCount} ${t("studio.workerBacked", "worker-backed")}`,
            icon: Zap,
            tone: "blue",
          },
          { label: aiRouteLabel, icon: ServerCog, tone: api?.ok ? "emerald" : "amber" },
        ]}
      >
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 pt-2">
          <StatusSummaryCard
            label={t("studio.workspaceHealth", "Workspace Health")}
            value={`${readiness}%`}
            icon={Gauge}
            tone="emerald"
            hint={t("studio.guardedUntil", "Guarded until verified")}
          />
          <StatusSummaryCard
            label={t("studio.availableTools", "Available Tools")}
            value={DEVELOPER_TOOLS.length}
            icon={Wrench}
            tone="purple"
            hint={t("studio.localFirst", "Local-first")}
          />
          <StatusSummaryCard
            label={t("studio.workerBacked", "Worker-Backed")}
            value={workerToolCount}
            icon={Cpu}
            tone="blue"
            hint={t("studio.nonBlocking", "Non-blocking")}
          />
          <StatusSummaryCard
            label={t("studio.activeServices", "Active Services")}
            value={activeServices}
            icon={Rocket}
            tone="emerald"
          />
          <StatusSummaryCard
            label={t("studio.readyServices", "Ready Services")}
            value={readyServices}
            icon={ServerCog}
            tone="blue"
          />
          <StatusSummaryCard
            label={t("studio.records", "Clipboard Records")}
            value={items.length}
            icon={Database}
            tone="amber"
            hint={`${secure} ${t("studio.secure", "secure")} · ${pinned} ${t("studio.pinned", "pinned")}`}
          />
        </div>
      </WorkspaceHero>

      <ServiceControlPanel items={items} onStatus={setStatus} onRunService={executeService} />

      <section className="glass-elevated p-5 md:p-6 space-y-5">
        <SectionHeader
          icon={Wand2}
          title={t("studio.utilitiesTitle", "Developer Utilities")}
          description={t(
            "studio.utilitiesDesc",
            "Run any card, load its sample, or copy the last output. Results stream into the live preview with logs, JSON, and history."
          )}
          actions={
            <span className="knoux-badge">
              {DEVELOPER_TOOLS.length} {t("studio.utilities", "utilities")}
            </span>
          }
        />

        <div className="knoux-premium-card p-4 space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h3 className="font-black text-knoux-dark-text flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-knoux-purple" />{" "}
              {t("studio.activeBench", "Active Tool Bench")} — {currentTool.title}
            </h3>
            <span className={`knoux-badge ${badgeClass(currentTool.status)}`}>
              {currentTool.status}
            </span>
          </div>
          <label className="block text-[10px] font-black uppercase text-knoux-muted-text">
            {currentTool.inputLabel}
          </label>
          <textarea
            value={toolInput}
            onChange={(e) => setToolInput(e.target.value)}
            placeholder={currentTool.placeholder}
            className="w-full min-h-[120px] rounded-2xl border border-knoux-purple/10 bg-white/80 dark:bg-white/5 p-4 text-xs font-mono text-knoux-dark-text outline-none focus:border-knoux-purple"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              disabled={toolBusy === currentTool.id}
              onClick={() => executeTool(currentTool.id)}
              className="btn-knoux-primary text-xs"
            >
              <Play className="w-4 h-4" />{" "}
              {toolBusy === currentTool.id
                ? t("studio.running", "Running")
                : t("studio.run", "Run")}
            </button>
            <button
              onClick={() => loadToolSample(currentTool.id)}
              className="btn-knoux-secondary text-xs"
            >
              <FileText className="w-4 h-4" /> {t("studio.sample", "Sample")}
            </button>
            <button
              onClick={() => copyTool(currentTool.id)}
              className="btn-knoux-secondary text-xs"
            >
              <Copy className="w-4 h-4" /> {t("studio.copy", "Copy")}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 2xl:grid-cols-[minmax(0,1fr)_520px] gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
            {DEVELOPER_TOOLS.map((tool) => {
              const Icon = toolIcon(tool.id);
              const worker = isWorkerSupportedTool(tool.id);
              return (
                <ToolCard
                  key={tool.id}
                  icon={Icon}
                  title={tool.title}
                  description={tool.description}
                  status={tool.status}
                  active={tool.id === toolId}
                  onSelect={() => {
                    setToolId(tool.id);
                    setToolInput(tool.sample);
                  }}
                  mode={
                    worker ? t("studio.worker", "Worker") : t("studio.mainThread", "Main thread")
                  }
                  lastRun={toolOutputs[tool.id] ? t("studio.hasResult", "Has result") : undefined}
                  primary={{
                    label: tool.actionLabel,
                    icon: Play,
                    onClick: () => executeTool(tool.id),
                    busy: toolBusy === tool.id,
                  }}
                  secondary={{
                    label: tool.sampleLabel,
                    icon: FileText,
                    onClick: () => loadToolSample(tool.id),
                  }}
                  tertiary={{ label: tool.copyLabel, icon: Copy, onClick: () => copyTool(tool.id) }}
                />
              );
            })}
          </div>

          <div className="2xl:sticky 2xl:top-4 h-fit">
            <LivePreviewPanel
              title={t("studio.livePreview", "Live Preview")}
              subtitle={t("studio.previewWaiting", "Run any tool to stream output here")}
              current={currentRun}
              history={history}
              onCopy={() => currentRun && copy(currentRun.output)}
              onExport={exportPreview}
              onClear={() => {
                setCurrentRun(null);
                setHistory([]);
              }}
              onSelectHistory={(run) => setCurrentRun(run)}
              emptyHint={t(
                "studio.previewEmpty",
                "Run any developer tool to see live output, logs, JSON, and run history."
              )}
            />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">
        <main className="space-y-5">
          <section className="glass-panel p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-black text-knoux-dark-text flex items-center gap-2">
                <ServerCog className="w-5 h-5 text-knoux-purple" />{" "}
                {t("studio.aiDiagnostics", "AI Route Diagnostics")}
              </h2>
              <button onClick={checkApi} className="btn-knoux-primary text-xs">
                <RefreshCw className={`w-4 h-4 ${busy ? "animate-spin" : ""}`} />{" "}
                {t("studio.checkNow", "Check Now")}
              </button>
            </div>
            <div
              className={`rounded-2xl p-4 text-sm font-semibold ${api?.ok ? "bg-emerald-50 text-emerald-800 border border-emerald-100" : api ? "bg-red-50 text-red-700 border border-red-100" : "bg-white dark:bg-white/5 border border-knoux-purple/10 text-knoux-muted-text"}`}
            >
              {status}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="knoux-premium-card p-3">
                <b>{t("studio.provider", "Provider")}</b>
                <div className="text-knoux-muted-text mt-1">{api?.provider || "openrouter"}</div>
              </div>
              <div className="knoux-premium-card p-3">
                <b>{t("studio.model", "Model")}</b>
                <div className="text-knoux-muted-text mt-1">
                  {api?.model || t("studio.notChecked", "not checked")}
                </div>
              </div>
              <div className="knoux-premium-card p-3">
                <b>{t("studio.status", "Status")}</b>
                <div className="text-knoux-muted-text mt-1">{api?.status || "idle"}</div>
              </div>
            </div>
          </section>

          <section className="glass-panel p-5 space-y-4">
            <h2 className="font-black text-knoux-dark-text flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-knoux-purple" />{" "}
              {t("studio.realityMatrix", "Service Reality Matrix")}
            </h2>
            <div className="space-y-5">
              {Object.entries(groupedServices).map(([category, services]) => (
                <div key={category} className="space-y-3">
                  <div className="flex items-center justify-between border-b border-knoux-purple/10 pb-2">
                    <h3 className="text-xs font-black uppercase tracking-widest text-knoux-dark-text">
                      {category}
                    </h3>
                    <span className="knoux-badge">
                      {services.length} {t("studio.services", "services")}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3">
                    {services.map((service) => (
                      <div key={service.id} className="knoux-premium-card p-3 text-xs space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <b className="text-knoux-dark-text">{service.displayName}</b>
                          <span className={`knoux-badge ${badgeClass(service.status)}`}>
                            {service.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-knoux-muted-text leading-relaxed">
                          {service.description}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-[10px] text-knoux-muted-text">
                          <span>Runtime: {service.runtimeType}</span>
                          <span>Config: {service.requiresConfig ? "Required" : "No"}</span>
                          <span>Implemented: {service.implemented ? "Yes" : "No"}</span>
                          <span>Handler: {service.actionHandler || "None"}</span>
                        </div>
                        <p className="text-[10px] text-knoux-muted-text">
                          Fallback: {service.fallback}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="glass-panel p-5 space-y-4">
            <h2 className="font-black text-knoux-dark-text flex items-center gap-2">
              <TerminalSquare className="w-5 h-5 text-knoux-purple" />{" "}
              {t("studio.buildCommands", "Build & Packaging Commands")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3">
              {commands.map((item) => (
                <button
                  key={item.cmd}
                  onClick={() => copy(item.cmd)}
                  className="knoux-premium-card p-4 text-left hover:border-knoux-purple/25 transition"
                >
                  <div className="text-[10px] font-black text-knoux-purple uppercase">
                    {item.title}
                  </div>
                  <code className="block text-xs text-knoux-dark-text mt-2 break-all">
                    {item.cmd}
                  </code>
                </button>
              ))}
            </div>
          </section>
        </main>

        <aside className="space-y-5">
          <section className="glass-panel p-5 space-y-3">
            <h2 className="font-black text-knoux-dark-text flex items-center gap-2">
              <FileJson className="w-5 h-5 text-knoux-purple" />{" "}
              {t("studio.handoff.title", "Handoff Report")}
            </h2>
            <button onClick={download} className="w-full btn-knoux-primary text-xs">
              <Download className="w-4 h-4" /> {t("studio.downloadJson", "Download JSON")}
            </button>
            <button
              onClick={() => copy(JSON.stringify(report, null, 2))}
              className="w-full btn-knoux-secondary text-xs"
            >
              <Copy className="w-4 h-4" /> {t("studio.copyJson", "Copy JSON")}
            </button>
          </section>
          <section className="rounded-3xl bg-[#140b25] text-[#f7f2ff] p-5 shadow-sm">
            <div className="text-xs font-black text-[#cfb4ea] mb-3 uppercase flex items-center gap-2">
              <PackageCheck className="w-4 h-4" /> {t("studio.liveReport", "Live Report")}
            </div>
            <pre className="text-[11px] overflow-auto max-h-[520px]">
              {JSON.stringify(report, null, 2)}
            </pre>
          </section>
          <section className="glass-panel p-5 grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-2xl font-black text-emerald-600">{activeServices}</div>
              <div className="text-[10px] text-knoux-muted-text uppercase font-black">
                {t("studio.active", "Active")}
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-blue-600">{readyServices}</div>
              <div className="text-[10px] text-knoux-muted-text uppercase font-black">
                {t("studio.ready", "Ready")}
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-amber-600">{guardedServices}</div>
              <div className="text-[10px] text-knoux-muted-text uppercase font-black">
                {t("studio.guarded", "Guarded")}
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
