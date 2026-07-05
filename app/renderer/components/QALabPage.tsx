import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, CheckCircle2, Clock, Download, FlaskConical, Gauge, Languages, LayoutGrid, ListChecks, MousePointerClick, Play, Rocket, ShieldCheck, Sparkles, Wrench, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { runQaChecks, summarizeQa, buildQaReport, type QACheckResult, type QACategory } from "../services/qaChecks";
import { WorkspaceHero, StatusSummaryCard, SectionHeader } from "./studio/StudioKit";
import { QAResultCard } from "./studio/QAResultCard";
import { LivePreviewPanel, type PreviewRun } from "./studio/LivePreviewPanel";
import i18n from "../utils/i18n";

const categoryIcon: Record<QACategory, LucideIcon> = {
  i18n: Languages,
  runtime: Activity,
  cards: LayoutGrid,
  actions: MousePointerClick,
  tools: Wrench,
  security: ShieldCheck,
  brand: Sparkles,
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function QALabPage() {
  const t = (key: string, fallback: string) => i18n.t(key, fallback);
  const [results, setResults] = useState<QACheckResult[]>(() => runQaChecks());
  const [running, setRunning] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [currentRun, setCurrentRun] = useState<PreviewRun | null>(null);
  const [history, setHistory] = useState<PreviewRun[]>([]);

  const summary = useMemo(() => summarizeQa(results), [results]);
  const pushRun = (run: PreviewRun) => setHistory((prev) => [run, ...prev.filter((r) => r.id !== run.id)].slice(0, 12));

  const runAll = async () => {
    const startedAt = Date.now();
    setRunning(true);
    const running: PreviewRun = {
      id: `qa-${startedAt}`,
      tool: t("qa.suite", "QA Suite"),
      state: "running",
      output: "",
      logs: [
        t("qa.logI18n", "Auditing i18n dictionaries…"),
        t("qa.logRuntime", "Verifying runtime honesty & status badges…"),
        t("qa.logTools", "Executing tool self-checks…"),
        t("qa.logSecurity", "Probing security scanners…"),
      ],
      startedAt,
    };
    setCurrentRun(running);
    await wait(320);
    const res = runQaChecks();
    const sum = summarizeQa(res);
    const report = buildQaReport(res);
    const done: PreviewRun = {
      ...running,
      state: sum.failed > 0 ? "error" : sum.warnings > 0 ? "warning" : "success",
      output: report,
      json: JSON.stringify(res, null, 2),
      logs: [...running.logs, `${res.length} ${t("qa.checksComplete", "checks complete")}`, `${t("qa.passed", "Passed")} ${sum.passed} · ${t("qa.warnings", "Warnings")} ${sum.warnings} · ${t("qa.failed", "Failed")} ${sum.failed}`, `${t("qa.readiness", "Readiness")} ${sum.readiness}%`],
      durationMs: Date.now() - startedAt,
    };
    setResults(res);
    setLastRun(new Date());
    setCurrentRun(done);
    pushRun(done);
    setRunning(false);
  };

  useEffect(() => {
    setLastRun(new Date());
  }, []);

  const inspect = (check: QACheckResult) => {
    setActiveId(check.id);
    const output = [check.title, check.summary, "", ...check.details.map((d) => `• ${d}`)].join("\n");
    const run: PreviewRun = {
      id: `inspect-${check.id}-${Date.now()}`,
      tool: check.title,
      state: check.status === "pass" ? "success" : check.status === "warning" ? "warning" : "error",
      output,
      json: JSON.stringify(check, null, 2),
      logs: [`${t("qa.category", "Category")}: ${check.category}`, `${t("qa.status", "Status")}: ${check.status}`],
      startedAt: Date.now(),
      durationMs: 0,
    };
    setCurrentRun(run);
    pushRun(run);
  };

  const copyCheck = async (check: QACheckResult) => {
    const text = [check.title, check.summary, "", ...check.details].join("\n");
    await navigator.clipboard.writeText(text);
  };

  const showReport = () => {
    const report = buildQaReport(results);
    const run: PreviewRun = {
      id: `report-${Date.now()}`,
      tool: t("qa.sessionReport", "Session Report"),
      state: summary.failed > 0 ? "error" : summary.warnings > 0 ? "warning" : "success",
      output: report,
      json: JSON.stringify(results, null, 2),
      logs: [`${results.length} ${t("qa.checksComplete", "checks complete")}`, `${t("qa.readiness", "Readiness")} ${summary.readiness}%`],
      startedAt: Date.now(),
      durationMs: 0,
    };
    setCurrentRun(run);
    pushRun(run);
  };

  const exportReport = () => {
    const blob = new Blob([buildQaReport(results)], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "knoux-qa-session-report.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const runtimeMode = window.electron?.ipcRenderer ? t("qa.desktop", "Desktop") : t("qa.web", "Web");
  const lastRunLabel = lastRun ? lastRun.toLocaleTimeString() : t("qa.never", "Never");

  return (
    <div id="qa-lab-container" className="p-6 space-y-6 w-full max-w-none mx-auto">
      <WorkspaceHero
        badgeLabel={t("qa.heroBadge", "KNOUX Testing & QA Lab")}
        title={t("qa.heroTitle", "Testing / QA Lab")}
        subtitle={t("qa.heroSubtitle", "Honest, code-aware quality checks")}
        description={t("qa.heroDesc", "Run real quality checkers against the live app: i18n parity, runtime honesty, status-badge consistency, tool self-checks, and security scanners. Every result reflects the actual codebase — no mock results.")}
        badges={[
          { label: `${t("qa.readiness", "Readiness")} ${summary.readiness}%`, icon: Gauge, tone: summary.failed > 0 ? "rose" : summary.warnings > 0 ? "amber" : "emerald" },
          { label: `${summary.total} ${t("qa.checks", "checks")}`, icon: ListChecks, tone: "purple" },
          { label: `${summary.passed} ${t("qa.passed", "passed")}`, icon: CheckCircle2, tone: "emerald" },
          { label: `${runtimeMode} ${t("qa.runtime", "runtime")}`, icon: Rocket, tone: "blue" },
        ]}
      >
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 pt-2">
          <StatusSummaryCard label={t("qa.totalChecks", "Total Checks")} value={summary.total} icon={ListChecks} tone="purple" />
          <StatusSummaryCard label={t("qa.passed", "Passed")} value={summary.passed} icon={CheckCircle2} tone="emerald" />
          <StatusSummaryCard label={t("qa.warnings", "Warnings")} value={summary.warnings} icon={AlertTriangle} tone="amber" />
          <StatusSummaryCard label={t("qa.failed", "Failed")} value={summary.failed} icon={XCircle} tone="rose" />
          <StatusSummaryCard label={t("qa.lastRun", "Last Run")} value={<span className="text-base">{lastRunLabel}</span>} icon={Clock} tone="blue" />
          <StatusSummaryCard label={t("qa.runtimeMode", "Runtime Mode")} value={<span className="text-base">{runtimeMode}</span>} icon={Rocket} tone="purple" hint={t("qa.honest", "Honest runtime")} />
        </div>
        <div className="flex flex-wrap gap-2 pt-3">
          <button disabled={running} onClick={runAll} className="btn-knoux-primary text-xs"><Play className={`w-4 h-4 ${running ? "animate-spin" : ""}`} /> {running ? t("qa.running", "Running…") : t("qa.runAll", "Run All Checks")}</button>
          <button onClick={showReport} className="btn-knoux-secondary text-xs"><ListChecks className="w-4 h-4" /> {t("qa.viewReport", "View Report")}</button>
          <button onClick={exportReport} className="btn-knoux-secondary text-xs"><Download className="w-4 h-4" /> {t("qa.exportReport", "Export Report")}</button>
        </div>
      </WorkspaceHero>

      <section className="glass-elevated p-5 md:p-6 space-y-4">
        <SectionHeader
          icon={Gauge}
          title={t("qa.readinessTitle", "Release Readiness by Area")}
          description={t("qa.readinessDesc", "Category rollup of passes, warnings, and failures across the checked surfaces.")}
        />
        <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
          {summary.byCategory.map((c) => {
            const CIcon = categoryIcon[c.category];
            const tone = c.failed > 0 ? "text-rose-500" : c.warnings > 0 ? "text-amber-500" : "text-emerald-500";
            return (
              <div key={c.category} className="knoux-premium-card p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wide text-knoux-muted-text">{c.category}</span>
                  <CIcon className={`w-4 h-4 ${tone}`} />
                </div>
                <div className="flex items-center gap-3 text-xs font-black">
                  <span className="text-emerald-600 dark:text-emerald-300">{c.passed}✓</span>
                  <span className="text-amber-600 dark:text-amber-300">{c.warnings}!</span>
                  <span className="text-rose-600 dark:text-rose-300">{c.failed}✕</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="glass-elevated p-5 md:p-6 space-y-5">
        <SectionHeader
          icon={FlaskConical}
          title={t("qa.checkersTitle", "Quality Checkers")}
          description={t("qa.checkersDesc", "Inspect any checker to stream its findings into the live monitor, or copy its report.")}
          actions={<span className="knoux-badge">{results.length} {t("qa.checkers", "checkers")}</span>}
        />
        <div className="grid grid-cols-1 2xl:grid-cols-[minmax(0,1fr)_520px] gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
            {results.map((check) => (
              <QAResultCard
                key={check.id}
                result={check}
                icon={categoryIcon[check.category]}
                active={activeId === check.id}
                statusLabel={check.status === "pass" ? t("qa.pass", "Pass") : check.status === "warning" ? t("qa.warn", "Warn") : t("qa.fail", "Fail")}
                inspectLabel={t("qa.inspect", "Inspect")}
                copyLabel={t("studio.copy", "Copy")}
                reportLabel={t("qa.report", "Report")}
                onInspect={() => inspect(check)}
                onCopy={() => copyCheck(check)}
                onReport={showReport}
              />
            ))}
          </div>

          <div className="2xl:sticky 2xl:top-4 h-fit">
            <LivePreviewPanel
              title={t("qa.monitor", "Test Monitor")}
              subtitle={t("qa.monitorWaiting", "Run checks to stream live results")}
              current={currentRun}
              history={history}
              onCopy={() => currentRun && navigator.clipboard.writeText(currentRun.output)}
              onExport={exportReport}
              onClear={() => { setCurrentRun(null); setHistory([]); setActiveId(null); }}
              onSelectHistory={(run) => setCurrentRun(run)}
              emptyHint={t("qa.monitorEmpty", "Run the suite or inspect a checker to see live results, logs, JSON, and history.")}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
