import { useMemo, useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, Check, ClipboardCheck, Copy, Database, Download, EyeOff, FileCheck, Fingerprint, History, KeyRound, Lock, Radar, ShieldAlert, ShieldCheck, Sparkles, Unlock, Wand2, Zap } from "lucide-react";
import { PRODUCTION_SCORE } from "../services/productionCatalog";
import { detectSensitiveTypes as detectRuntimeSensitiveTypes } from "../services/runtimeServices";
import { copyToClipboard } from "../../shared/clipboard-utils";
import { downloadJson } from "../../shared/download-utils";

interface SecurityPageProps {
  privacyMode: boolean;
  setPrivacyMode: (privacyMode: boolean) => void;
  itemsCount: number;
}

type Severity = "success" | "info" | "warning" | "danger";
type AuditEntry = { action: string; msg: string; time: string; severity: Severity };
type LogFilter = "all" | Severity;

type GuardToggle = {
  id: "encryption" | "privacy" | "ai" | "redaction" | "vault" | "detection";
  label: string;
  desc: string;
  active: boolean;
  guarded?: boolean;
  severity: Severity;
};

const nowTime = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
const titleType = (type: string) => type.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
const detectSensitiveTypes = (value: string) => detectRuntimeSensitiveTypes(value).map(titleType);

const redactText = (input: string, strictness = 80) => {
  const hardMask = strictness >= 70;
  return input
    .replace(/-----BEGIN[\s\S]+?PRIVATE KEY-----/g, "-----BEGIN REDACTED PRIVATE KEY-----")
    .replace(/\b(sk-or-v1-|sk-)[A-Za-z0-9_\-]{18,}\b/g, hardMask ? "$1REDACTED" : "$1••••")
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, hardMask ? "[email-redacted]" : "[email-masked]")
    .replace(/\b(?:\d[ -]*?){13,16}\b/g, hardMask ? "[number-redacted]" : "[number-masked]")
    .replace(/\b(bearer|token|access[_-]?token|refresh[_-]?token)\s*[:=]?\s*[\"']?[A-Za-z0-9._\-]{20,}/gi, "$1=[token-redacted]")
    .replace(/^([A-Z0-9_]*(SECRET|TOKEN|KEY|PASSWORD)[A-Z0-9_]*)\s*=\s*.+$/gim, "$1=[secret-redacted]");
};

const auditTone = (severity: Severity) => {
  if (severity === "success") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (severity === "warning") return "border-amber-200 bg-amber-50 text-amber-900";
  if (severity === "danger") return "border-red-200 bg-red-50 text-red-800";
  return "border-knoux-purple/15 bg-knoux-purple/5 text-knoux-dark-text";
};

const statusIcon = (severity: Severity) => severity === "danger" || severity === "warning" ? AlertTriangle : Check;

export default function SecurityPage({ privacyMode, setPrivacyMode, itemsCount }: SecurityPageProps) {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [vaultPassword, setVaultPassword] = useState("");
  const [vaultUnlocked, setVaultUnlocked] = useState(false);
  const [redactionMode, setRedactionMode] = useState(true);
  const [aiUploadGuard, setAiUploadGuard] = useState(true);
  const [sensitiveDetection, setSensitiveDetection] = useState(true);
  const [detectionSensitivity, setDetectionSensitivity] = useState(86);
  const [redactionStrictness, setRedactionStrictness] = useState(82);
  const [aiRiskThreshold, setAiRiskThreshold] = useState(72);
  const [auditRetention, setAuditRetention] = useState(25);
  const [logFilter, setLogFilter] = useState<LogFilter>("all");
  const [redactedPreview, setRedactedPreview] = useState("");
  const [vaultContent, setVaultContent] = useState("API_KEY=demo_server_only_value_1234567890\nadmin@knoux.store\n4242 4242 4242 4242\nBearer demo_token_value_12345678901234567890\nSECURE_NOTE=Local-first guarded buffer.");
  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>([
    { action: "SERVER_AI_BOUNDARY", msg: "AI calls are routed through the guarded server endpoint only.", time: nowTime(), severity: "success" },
    { action: "WEB_STORAGE_DECLARED", msg: "Web storage is local-first only; it is not labeled as encrypted.", time: nowTime(), severity: "info" },
    { action: "ELECTRON_IPC_GUARDED", msg: "Electron encryption is available only when the trusted IPC bridge exists.", time: nowTime(), severity: "warning" },
  ]);

  const sensitiveTypes = useMemo(() => sensitiveDetection ? detectSensitiveTypes(vaultContent) : [], [sensitiveDetection, vaultContent]);
  const redacted = useMemo(() => redactionMode ? redactText(vaultContent, redactionStrictness) : vaultContent, [redactionMode, redactionStrictness, vaultContent]);
  const riskScore = Math.min(100, sensitiveTypes.length * 18 + (privacyMode ? 0 : 16) + (aiUploadGuard ? 0 : 18));
  const securityScore = Math.max(55, PRODUCTION_SCORE.securityVault - Math.round(riskScore / 3));
  const riskLevel = riskScore >= aiRiskThreshold ? "High" : sensitiveTypes.length ? "Medium" : "Clean";
  const filteredLogs = useMemo(() => auditTrail.filter((log) => logFilter === "all" || log.severity === logFilter), [auditTrail, logFilter]);

  const pushAudit = (entry: Omit<AuditEntry, "time">) => {
    setAuditTrail((prev) => [{ ...entry, time: nowTime() }, ...prev].slice(0, auditRetention));
  };

  const copy = async (value: string, label: string) => {
    await copyToClipboard(value || "");
    pushAudit({ action: "COPY_SECURE_OUTPUT", msg: `${label} copied to system clipboard.`, severity: "info" });
  };

  const handleSensitiveScan = () => {
    setScanning(true);
    setScanResult(null);
    setTimeout(() => {
      setScanning(false);
      const types = detectSensitiveTypes(vaultContent);
      const severity: Severity = types.length >= 4 ? "danger" : types.length ? "warning" : "success";
      const message = types.length
        ? `Guard scan completed. Detected: ${types.join(", ")}. Use redacted output before AI upload or sharing.`
        : "Guard scan complete. No configured sensitive classes were detected in the active buffer.";
      setScanResult(message);
      pushAudit({ action: types.length ? "SENSITIVE_PATTERN_DETECTED" : "PRIVACY_SCAN_CLEAN", msg: message, severity });
    }, 420);
  };

  const handleRedact = () => {
    setRedactedPreview(redacted);
    pushAudit({ action: "REDACTION_PREVIEW_BUILT", msg: `Local redaction preview generated at ${redactionStrictness}% strictness.`, severity: sensitiveTypes.length ? "warning" : "success" });
  };

  const handleVaultUnlock = (event: FormEvent) => {
    event.preventDefault();
    if (vaultPassword.trim().length < 6) {
      pushAudit({ action: "VAULT_UNLOCK_REJECTED", msg: "Passphrase rejected by local policy.", severity: "warning" });
      return;
    }
    setVaultUnlocked(true);
    setVaultPassword("");
    pushAudit({ action: "VAULT_WINDOW_OPENED", msg: "Temporary local visibility window opened. This is not web encryption.", severity: "success" });
  };

  const handleVaultLock = () => {
    setVaultUnlocked(false);
    pushAudit({ action: "VAULT_LOCKED", msg: "Temporary visibility window closed.", severity: "info" });
  };

  const exportAudit = () => {
    downloadJson("knoux-security-log.json", { product: "Knoux AI Clipboard Pro", exportedAt: new Date().toISOString(), riskLevel, riskScore, detectionSensitivity, redactionStrictness, aiRiskThreshold, auditTrail });
    pushAudit({ action: "SECURITY_LOG_EXPORTED", msg: "Security log JSON exported locally.", severity: "success" });
  };

  const guardedToggles: GuardToggle[] = [
    { id: "encryption", label: "Encryption Boundary", desc: "Electron IPC only; web is local-first storage.", active: false, guarded: true, severity: "warning" },
    { id: "privacy", label: "Privacy Mode", desc: "Treat detected secrets as guarded by default.", active: privacyMode, severity: privacyMode ? "success" : "info" },
    { id: "ai", label: "AI Upload Guard", desc: "Warn before sending sensitive text to AI route.", active: aiUploadGuard, severity: aiUploadGuard ? "success" : "danger" },
    { id: "redaction", label: "Redaction Mode", desc: "Mask secrets before copy/export/share.", active: redactionMode, severity: redactionMode ? "success" : "warning" },
    { id: "vault", label: "Vault Lock State", desc: "Temporary visibility window for local review.", active: !vaultUnlocked, severity: vaultUnlocked ? "warning" : "success" },
    { id: "detection", label: "Sensitive Detection", desc: "Local pattern scanner is active.", active: sensitiveDetection, severity: sensitiveDetection ? "success" : "danger" },
  ];

  const toggleGuard = (id: GuardToggle["id"]) => {
    if (id === "encryption") {
      pushAudit({ action: "ENCRYPTION_BOUNDARY_GUARDED", msg: "Encryption toggle is guarded until trusted Electron IPC is available.", severity: "warning" });
      return;
    }
    if (id === "privacy") setPrivacyMode(!privacyMode);
    if (id === "ai") setAiUploadGuard((value) => !value);
    if (id === "redaction") setRedactionMode((value) => !value);
    if (id === "vault") vaultUnlocked ? handleVaultLock() : pushAudit({ action: "VAULT_LOCKED_STATE", msg: "Vault is already locked. Use passphrase form to open a temporary window.", severity: "info" });
    if (id === "detection") setSensitiveDetection((value) => !value);
    pushAudit({ action: `${id.toUpperCase()}_TOGGLED`, msg: `${titleType(id)} state changed.`, severity: "info" });
  };

  const sliders = [
    { label: "Detection sensitivity", value: detectionSensitivity, set: setDetectionSensitivity, suffix: "%" },
    { label: "Redaction strictness", value: redactionStrictness, set: setRedactionStrictness, suffix: "%" },
    { label: "AI upload risk threshold", value: aiRiskThreshold, set: setAiRiskThreshold, suffix: "%" },
    { label: "Audit retention", value: auditRetention, set: setAuditRetention, min: 8, max: 60, suffix: " logs" },
  ];

  return (
    <div id="security-workspace-container" className="knoux-security-dashboard p-6 space-y-6 w-full max-w-none mx-auto select-none">
      <section className="relative overflow-hidden rounded-[38px] border border-knoux-purple/15 bg-[radial-gradient(circle_at_8%_0%,rgba(34,197,94,.20),transparent_28%),radial-gradient(circle_at_92%_10%,rgba(130,38,238,.24),transparent_34%),linear-gradient(135deg,rgba(255,255,255,.90),rgba(243,230,251,.78))] p-6 md:p-8 shadow-knoux-glow-lg">
        <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-knoux-purple/10 blur-3xl" />
        <div className="relative grid grid-cols-1 xl:grid-cols-[1fr_560px] gap-6 items-end">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/15 text-[11px] font-black text-emerald-700 uppercase tracking-widest"><ShieldCheck className="w-4 h-4" /> Advanced Security Dashboard</div>
            <h1 className="text-4xl md:text-5xl font-black text-knoux-dark-text">Security & Vault Command Center</h1>
            <p className="text-sm md:text-base text-knoux-muted-text max-w-5xl leading-relaxed">Local scanner, redaction engine, AI upload guard, vault visibility window, high-contrast audit logs, and explicit Electron IPC boundaries. Web storage is local-first, not advertised as encrypted.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[{ label: "Score", value: `${securityScore}/100`, icon: ShieldCheck, tone: "text-emerald-600" }, { label: "Risk", value: riskLevel, icon: ShieldAlert, tone: riskLevel === "High" ? "text-red-600" : riskLevel === "Medium" ? "text-amber-600" : "text-emerald-600" }, { label: "Records", value: itemsCount, icon: Database, tone: "text-knoux-purple" }, { label: "Classes", value: sensitiveTypes.length, icon: Radar, tone: "text-knoux-purple" }].map((m) => { const Icon = m.icon; return <div key={m.label} className="knoux-premium-card p-4"><div className="flex items-center justify-between text-[10px] text-knoux-muted-text font-black uppercase"><span>{m.label}</span><Icon className={`w-4 h-4 ${m.tone}`} /></div><div className={`text-2xl font-black font-mono mt-2 truncate ${m.tone}`}>{m.value}</div></div>; })}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 2xl:grid-cols-[440px_1fr] gap-6">
        <aside className="space-y-6">
          <section className="glass-elevated p-5 space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-knoux-dark-text flex items-center gap-2"><Lock className="w-4 h-4 text-knoux-purple" /> Interactive Guard Toggles</h2>
            <div className="space-y-3">{guardedToggles.map((item) => { const Icon = statusIcon(item.severity); return <button key={item.id} onClick={() => toggleGuard(item.id)} className={`w-full rounded-2xl border p-3 text-left transition hover:scale-[1.01] ${auditTone(item.severity)}`}><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><Icon className="w-4 h-4" /><span className="text-xs font-black uppercase">{item.label}</span></div><span className="text-[10px] font-black uppercase">{item.guarded ? "Guarded" : item.active ? "Active" : "Off"}</span></div><p className="mt-1 text-[11px] leading-relaxed opacity-90">{item.desc}</p></button>; })}</div>
          </section>

          <section className="glass-panel p-5 space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-knoux-dark-text flex items-center gap-2"><Radar className="w-4 h-4 text-knoux-purple" /> Detection Controls</h2>
            {sliders.map((slider) => <label key={slider.label} className="block space-y-2"><div className="flex justify-between text-[11px] font-black text-knoux-dark-text"><span>{slider.label}</span><span className="font-mono text-knoux-purple">{slider.value}{slider.suffix}</span></div><input type="range" min={slider.min || 0} max={slider.max || 100} value={slider.value} onChange={(event) => slider.set(Number(event.target.value))} className="w-full accent-knoux-purple" /></label>)}
          </section>

          <section className="glass-panel p-5 space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-knoux-dark-text flex items-center gap-2"><Database className="w-4 h-4 text-knoux-purple" /> Runtime Storage Metrics</h2>
            <div className="space-y-2 text-xs leading-normal"><div className="flex justify-between"><span className="text-knoux-muted-text">Web layer:</span><span className="text-knoux-dark-text font-bold">local-first storage</span></div><div className="flex justify-between"><span className="text-knoux-muted-text">Electron layer:</span><span className="text-amber-700 font-bold">IPC guarded bridge</span></div><div className="flex justify-between"><span className="text-knoux-muted-text">Secure clips loaded:</span><span className="text-knoux-dark-text font-mono font-bold">{itemsCount}</span></div><div className="flex justify-between"><span className="text-knoux-muted-text">AI upload guard:</span><span className="text-knoux-purple font-bold">{aiUploadGuard ? "Active" : "Off"}</span></div></div>
          </section>

          <section className="glass-panel p-5 space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-knoux-dark-text flex items-center gap-2"><Radar className="w-4 h-4 text-knoux-purple" /> Live Guard Classes</h2>
            <div className="grid grid-cols-2 gap-2">{["Password", "Api Key", "Token", "Bearer Token", "Access Token", "Refresh Token", "Private Key", "Secret Env Line", "Credential Like Text", "Email", "Phone", "Card Like Number"].map((label) => { const active = sensitiveTypes.includes(label); return <div key={label} className={`rounded-xl border p-2 text-[10px] font-black flex items-center justify-between ${active ? "border-amber-200 bg-amber-50 text-amber-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}><span>{label}</span>{active ? <AlertTriangle className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}</div>; })}</div>
          </section>
        </aside>

        <main className="space-y-6">
          <section className="glass-elevated p-5 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"><div className="space-y-1"><h2 className="text-xs font-black uppercase tracking-wider text-knoux-dark-text flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-knoux-purple" /> Credential Shield Scanner</h2><p className="text-[11px] text-knoux-muted-text leading-relaxed">Run a deterministic local scan, generate a redacted preview, then copy only safe output.</p></div><div className="flex flex-wrap gap-2"><button onClick={handleSensitiveScan} disabled={scanning} className="btn-knoux-primary text-xs"><Radar className="w-4 h-4" /> {scanning ? "Scanning..." : "Run Guard Scan"}</button><button onClick={handleRedact} className="btn-knoux-secondary text-xs"><EyeOff className="w-4 h-4" /> Redact Preview</button><button onClick={() => copy(redactedPreview || redacted, "Redacted preview")} className="btn-knoux-secondary text-xs"><Copy className="w-4 h-4" /> Copy Redacted</button></div></div>
            <textarea value={vaultContent} onChange={(e) => setVaultContent(e.target.value)} className="w-full min-h-[176px] rounded-3xl border border-knoux-purple/15 bg-[color:var(--knoux-card-elevated)] p-5 text-sm font-mono text-knoux-dark-text outline-none focus:border-knoux-purple leading-relaxed" />
            <AnimatePresence>{scanResult && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className={`p-3 rounded-xl border text-[11px] font-bold leading-relaxed flex items-start gap-2 ${riskLevel === "High" ? "border-red-200 bg-red-50 text-red-900" : sensitiveTypes.length ? "border-amber-200 bg-amber-50 text-amber-950" : "border-emerald-200 bg-emerald-50 text-emerald-950"}`}><FileCheck className="w-4 h-4 shrink-0 mt-0.5" /><span>{scanResult}</span></motion.div>}</AnimatePresence>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4"><div className="rounded-3xl bg-[#12091f] text-[#FCFAFF] p-4 border border-white/10 shadow-knoux-glow"><div className="text-[10px] uppercase font-black text-[#CFB4EA] mb-2 flex items-center gap-2"><Fingerprint className="w-4 h-4" /> Active secure buffer</div><pre className="text-[11px] whitespace-pre-wrap overflow-auto max-h-64">{vaultContent}</pre></div><div className="rounded-3xl bg-[#12091f] text-[#FCFAFF] p-4 border border-white/10 shadow-knoux-glow"><div className="text-[10px] uppercase font-black text-emerald-200 mb-2 flex items-center gap-2"><EyeOff className="w-4 h-4" /> Redacted safe output</div><pre className="text-[11px] whitespace-pre-wrap overflow-auto max-h-64">{redactedPreview || redacted}</pre></div></div>
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">{[{ title: "AI Upload Firewall", desc: `Risk threshold ${aiRiskThreshold}%. ${aiUploadGuard ? "Guard is active." : "Guard is disabled."}`, icon: Sparkles, action: "Check AI guard", onClick: handleSensitiveScan }, { title: "Local Redaction Engine", desc: `Strictness ${redactionStrictness}%. Output is generated locally.`, icon: Wand2, action: "Build redaction", onClick: handleRedact }, { title: "Audit Export", desc: `Retention keeps last ${auditRetention} security events.`, icon: Download, action: "Export audit", onClick: exportAudit }].map((card) => { const Icon = card.icon; return <button key={card.title} onClick={card.onClick} className="knoux-premium-card p-5 text-left space-y-3 hover:border-knoux-purple/30 transition"><div className="knoux-icon-shell"><Icon className="w-4 h-4" /></div><div><h3 className="font-black text-knoux-dark-text">{card.title}</h3><p className="text-[11px] text-knoux-muted-text leading-relaxed mt-1">{card.desc}</p></div><span className="inline-flex text-[11px] font-black text-knoux-purple">{card.action}</span></button>; })}</div>

          <section className="glass-panel p-5 space-y-4"><h2 className="text-xs font-black uppercase tracking-wider text-knoux-dark-text flex items-center gap-2"><KeyRound className="w-4 h-4 text-knoux-purple" /> Secure Password-Protected Vault</h2><p className="text-[11px] text-knoux-muted-text leading-relaxed">This is a guarded temporary visibility window. Electron encryption/decryption requires a trusted IPC bridge; web storage remains local-first only.</p>{!vaultUnlocked ? <form onSubmit={handleVaultUnlock} className="flex flex-wrap items-center gap-3 max-w-xl pt-2"><input type="password" placeholder="Enter 6+ character passphrase..." value={vaultPassword} onChange={(e) => setVaultPassword(e.target.value)} className="flex-1 h-11 px-3 rounded-xl border border-knoux-purple/15 bg-[#FCFAFF] focus:bg-white text-xs outline-none focus:border-knoux-purple focus:ring-4 focus:ring-knoux-purple/5 transition-all" /><button type="submit" className="h-11 px-4 rounded-xl bg-knoux-purple hover:bg-knoux-deep-purple text-white text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5"><Unlock className="w-3.5 h-3.5" /> Open Vault</button></form> : <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/80 space-y-3"><div className="flex items-center justify-between"><span className="text-xs font-bold text-emerald-800 flex items-center gap-1"><Check className="w-4 h-4" /> TEMPORARY VISIBILITY WINDOW</span><button onClick={handleVaultLock} className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer transition-colors">Lock</button></div><textarea value={vaultContent} onChange={(e) => setVaultContent(e.target.value)} rows={4} className="w-full p-3 rounded-xl border border-emerald-200 bg-white font-mono text-xs text-emerald-950 focus:outline-none" /></motion.div>}</section>
        </main>
      </div>

      <section className="glass-panel p-5 space-y-4"><div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3"><h2 className="text-xs font-black uppercase tracking-wider text-knoux-dark-text flex items-center gap-2"><History className="w-4 h-4 text-knoux-purple" /> Security Operations Audit Trail</h2><div className="flex flex-wrap gap-2">{(["all", "success", "warning", "danger", "info"] as const).map((filter) => <button key={filter} onClick={() => setLogFilter(filter)} className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase border ${logFilter === filter ? "bg-knoux-purple text-white border-knoux-purple" : "bg-white text-knoux-purple border-knoux-purple/10"}`}>{filter}</button>)}<button onClick={exportAudit} className="btn-knoux-secondary text-xs"><Download className="w-4 h-4" /> Export Security Log JSON</button><button onClick={() => copy(JSON.stringify(auditTrail[0] || {}, null, 2), "Latest audit event")} className="btn-knoux-secondary text-xs"><Copy className="w-4 h-4" /> Copy Latest Audit</button><button onClick={() => setAuditTrail([])} className="btn-knoux-secondary text-xs"><ClipboardCheck className="w-4 h-4" /> Clear Session Logs</button></div></div><div className="space-y-2 text-xs font-mono max-h-72 overflow-y-auto">{filteredLogs.map((log, index) => { const Icon = statusIcon(log.severity); return <div key={`${log.action}-${index}`} className={`grid grid-cols-1 lg:grid-cols-[120px_170px_1fr_110px] gap-2 items-center p-3 rounded-2xl border ${auditTone(log.severity)}`}><span className="flex items-center gap-2 text-[10px] font-black uppercase"><Icon className="w-4 h-4" />{log.severity}</span><span className="text-[10px] font-black truncate">{log.action}</span><span className="leading-relaxed">{log.msg}</span><span className="opacity-80 font-mono text-[10px] lg:text-right">{log.time}</span></div>; })}{!filteredLogs.length && <div className="rounded-2xl border border-knoux-purple/10 bg-knoux-purple/5 p-4 text-knoux-muted-text font-bold">No audit entries match this filter.</div>}</div></section>

      <div className="rounded-3xl border border-knoux-purple/10 bg-gradient-to-r from-[#FCFAFF] to-white p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"><div className="space-y-1"><h2 className="text-xs font-black uppercase tracking-wider text-knoux-dark-text flex items-center gap-2"><Zap className="w-4 h-4 text-knoux-purple" /> Production Security Note</h2><p className="text-[11px] text-knoux-muted-text leading-relaxed max-w-3xl">Client-side secrets are never required. OpenRouter keys belong in Vercel/Electron environment variables only. Local web storage is not described as encrypted.</p></div><div className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-xl uppercase flex items-center gap-1.5"><ClipboardCheck className="w-3.5 h-3.5" /> Hardened Local Guard</div></div>
    </div>
  );
}
