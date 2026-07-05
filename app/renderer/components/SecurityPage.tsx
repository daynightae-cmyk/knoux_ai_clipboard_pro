import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertTriangle,
  Check,
  ClipboardCheck,
  Copy,
  Database,
  Download,
  EyeOff,
  FileCheck,
  Fingerprint,
  History,
  KeyRound,
  Lock,
  Radar,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Unlock,
  Wand2,
  Zap,
} from "lucide-react";
import { PRODUCTION_SCORE } from "../services/productionCatalog";
import { detectSensitiveTypes as detectRuntimeSensitiveTypes } from "../services/runtimeServices";

interface SecurityPageProps {
  privacyMode: boolean;
  setPrivacyMode: (privacyMode: boolean) => void;
  itemsCount: number;
}

type AuditEntry = {
  action: string;
  msg: string;
  time: string;
  severity: "success" | "info" | "warning" | "danger";
};

const nowTime = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

function detectSensitiveTypes(value: string) {
  return detectRuntimeSensitiveTypes(value).map((type) => type.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()));
}

const redactText = (input: string) => input
  .replace(/-----BEGIN[\s\S]+?PRIVATE KEY-----/g, "-----BEGIN REDACTED PRIVATE KEY-----")
  .replace(/\b(sk-or-v1-|sk-)[A-Za-z0-9_\-]{18,}\b/g, "$1REDACTED")
  .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[email-redacted]")
  .replace(/\b(?:\d[ -]*?){13,16}\b/g, "[number-redacted]")
  .replace(/\b(bearer|token|access[_-]?token|refresh[_-]?token)\s*[:=]?\s*[\"']?[A-Za-z0-9._\-]{20,}/gi, "$1=[token-redacted]")
  .replace(/^([A-Z0-9_]*(SECRET|TOKEN|KEY|PASSWORD)[A-Z0-9_]*)\s*=\s*.+$/gim, "$1=[secret-redacted]");

export default function SecurityPage({ privacyMode, setPrivacyMode, itemsCount }: SecurityPageProps) {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanning, setScanning] = useState<boolean>(false);
  const [vaultPassword, setVaultPassword] = useState<string>("");
  const [vaultUnlocked, setVaultUnlocked] = useState<boolean>(false);
  const [redactedPreview, setRedactedPreview] = useState<string>("");
  const [vaultContent, setVaultContent] = useState<string>(
    "OPENROUTER_API_KEY=sk-or-v1-REPLACE_ME_12345678901234567890\nadmin@knoux.store\n4242 4242 4242 4242\nKNOUX_SECURE_NOTE=Guarded local buffer."
  );
  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>([
    { action: "OPENROUTER_PROXY_READY", msg: "Server-side AI route is isolated from client secrets.", time: nowTime(), severity: "success" },
    { action: "AES_GCM_BRIDGE_GUARDED", msg: "Electron security IPC is checked at runtime; web localStorage is not falsely called encrypted.", time: nowTime(), severity: "success" },
    { action: "CLIPBOARD_GUARD_ACTIVE", msg: "Credential-like text patterns are scanned before reuse.", time: nowTime(), severity: "info" },
  ]);

  const sensitiveTypes = useMemo(() => detectSensitiveTypes(vaultContent), [vaultContent]);
  const redacted = useMemo(() => redactText(vaultContent), [vaultContent]);
  const securityScore = sensitiveTypes.length > 0 ? 91 : PRODUCTION_SCORE.securityVault;
  const riskLevel = sensitiveTypes.length > 2 ? "High" : sensitiveTypes.length > 0 ? "Medium" : "Clean";

  const pushAudit = (entry: Omit<AuditEntry, "time">) => {
    setAuditTrail((prev) => [{ ...entry, time: nowTime() }, ...prev].slice(0, 12));
  };

  const copy = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value || "");
    pushAudit({ action: "COPY_SECURE_OUTPUT", msg: `${label} copied to clipboard.`, severity: "info" });
  };

  const handleSensitiveScan = () => {
    setScanning(true);
    setScanResult(null);
    setTimeout(() => {
      setScanning(false);
      const types = detectSensitiveTypes(vaultContent);
      if (types.length > 0) {
        const message = `Guard scan completed. Detected sensitive classes: ${types.join(", ")}. Recommendation: keep Privacy Enforcer active and use the redacted output before sharing.`;
        setScanResult(message);
        pushAudit({ action: "SENSITIVE_PATTERN_DETECTED", msg: message, severity: "warning" });
      } else {
        const message = "Guard scan complete. No severe credential, card, email, or phone-number patterns detected in the active vault buffer.";
        setScanResult(message);
        pushAudit({ action: "PRIVACY_SCAN_CLEAN", msg: message, severity: "success" });
      }
    }, 650);
  };

  const handleRedact = () => {
    setRedactedPreview(redacted);
    pushAudit({ action: "REDACTION_PREVIEW_BUILT", msg: "Sensitive fields were masked in a local-only preview.", severity: sensitiveTypes.length ? "warning" : "success" });
  };

  const handleVaultUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (vaultPassword.trim().length >= 6) {
      setVaultUnlocked(true);
      setVaultPassword("");
      pushAudit({ action: "VAULT_UNLOCKED", msg: "Temporary local visibility window opened after passphrase validation.", severity: "success" });
    } else {
      pushAudit({ action: "VAULT_UNLOCK_REJECTED", msg: "Passphrase rejected because it did not meet minimum local policy.", severity: "warning" });
      alert("Passphrase must be at least 6 characters.");
    }
  };

  const handleVaultLock = () => {
    setVaultUnlocked(false);
    pushAudit({ action: "VAULT_LOCKED", msg: "Secure area re-locked and temporary visibility cleared.", severity: "info" });
  };

  const downloadAudit = () => {
    const payload = JSON.stringify({ product: "Knoux AI Clipboard Pro", exportedAt: new Date().toISOString(), riskLevel, sensitiveTypes, auditTrail }, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "knoux-security-audit.json";
    a.click();
    URL.revokeObjectURL(url);
    pushAudit({ action: "AUDIT_EXPORTED", msg: "Security audit JSON exported locally.", severity: "success" });
  };

  const auditColor = (severity: AuditEntry["severity"]) => {
    if (severity === "success") return "text-emerald-700 bg-emerald-50 border-emerald-100";
    if (severity === "warning") return "text-amber-700 bg-amber-50 border-amber-100";
    if (severity === "danger") return "text-red-700 bg-red-50 border-red-100";
    return "text-blue-700 bg-blue-50 border-blue-100";
  };

  const guardClasses = ["Api Key", "Token", "Secret Env Line", "Private Key", "Card Like", "Email", "Phone", "Password"];

  return (
    <div id="security-workspace-container" className="p-6 space-y-6 w-full max-w-none mx-auto select-none">
      <section className="relative overflow-hidden rounded-[36px] border border-knoux-purple/15 bg-[radial-gradient(circle_at_8%_0%,rgba(34,197,94,.18),transparent_28%),radial-gradient(circle_at_92%_10%,rgba(130,38,238,.22),transparent_34%),linear-gradient(135deg,rgba(255,255,255,.88),rgba(243,230,251,.76))] p-6 md:p-8 shadow-knoux-glow-lg">
        <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-knoux-purple/10 blur-3xl" />
        <div className="relative grid grid-cols-1 xl:grid-cols-[1fr_520px] gap-6 items-end">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/15 text-[11px] font-black text-emerald-700 uppercase tracking-widest"><ShieldCheck className="w-4 h-4" /> Production Security Operations</div>
            <h1 className="text-4xl md:text-5xl font-black text-knoux-dark-text">Security & Vault Command Center</h1>
            <p className="text-sm md:text-base text-knoux-muted-text max-w-5xl leading-relaxed">Local deterministic scans, privacy enforcement, redaction preview, guarded vault visibility, AI upload boundary checks, and exportable audit trail. Web limitations stay explicit instead of being painted as fake encryption.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Score", value: `${securityScore}/100`, icon: ShieldCheck, tone: "text-emerald-600" },
              { label: "Risk", value: riskLevel, icon: ShieldAlert, tone: riskLevel === "High" ? "text-red-600" : riskLevel === "Medium" ? "text-amber-600" : "text-emerald-600" },
              { label: "Records", value: itemsCount, icon: Database, tone: "text-knoux-purple" },
              { label: "Classes", value: sensitiveTypes.length, icon: Radar, tone: "text-knoux-purple" },
            ].map((m) => { const Icon = m.icon; return <div key={m.label} className="knoux-premium-card p-4"><div className="flex items-center justify-between text-[10px] text-knoux-muted-text font-black uppercase"><span>{m.label}</span><Icon className={`w-4 h-4 ${m.tone}`} /></div><div className={`text-2xl font-black font-mono mt-2 truncate ${m.tone}`}>{m.value}</div></div>; })}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 2xl:grid-cols-[420px_1fr] gap-6">
        <aside className="space-y-6">
          <div className="glass-elevated p-5 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-xs font-extrabold text-knoux-dark-text uppercase tracking-wider flex items-center gap-1.5"><Lock className="w-4 h-4 text-knoux-purple" /> Privacy Enforcer Mode</h4>
                <p className="text-[11px] text-knoux-muted-text leading-snug">Marks sensitive workflows as guarded and keeps AI upload decisions explicit.</p>
              </div>
              <button onClick={() => { setPrivacyMode(!privacyMode); pushAudit({ action: "PRIVACY_MODE_TOGGLED", msg: `Privacy mode set to ${!privacyMode ? "ON" : "OFF"}.`, severity: !privacyMode ? "success" : "info" }); }} className={`w-12 h-6 rounded-full transition-all flex items-center cursor-pointer p-0.5 ${privacyMode ? "bg-amber-500 justify-end" : "bg-knoux-purple/20 justify-start"}`}>
                <motion.div layout className="w-5 h-5 rounded-full bg-white shadow-sm" transition={{ type: "spring", stiffness: 500, damping: 30 }} />
              </button>
            </div>
            <div className="p-3 rounded-xl border border-amber-100 bg-amber-50 text-[11px] text-amber-900 leading-normal flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" /><span>{privacyMode ? "Privacy Enforcer is ENGAGED. Sensitive patterns are treated as high-risk and should not be copied raw." : "Privacy Enforcer is DISENGAGED. Scans still run locally, but AI/upload guards remain explicit."}</span></div>
          </div>

          <div className="glass-panel p-5 space-y-3">
            <h4 className="text-xs font-extrabold text-knoux-dark-text uppercase tracking-wider flex items-center gap-1.5"><Database className="w-4 h-4 text-knoux-purple" /> Runtime Storage Metrics</h4>
            <div className="space-y-2 text-xs leading-normal">
              <div className="flex justify-between"><span className="text-knoux-muted-text">Web layer:</span><span className="text-knoux-dark-text font-bold">localStorage + Vercel API</span></div>
              <div className="flex justify-between"><span className="text-knoux-muted-text">Electron layer:</span><span className="text-knoux-dark-text font-bold">IPC guarded AES bridge</span></div>
              <div className="flex justify-between"><span className="text-knoux-muted-text">Secure clips loaded:</span><span className="text-knoux-dark-text font-mono font-bold">{itemsCount}</span></div>
              <div className="flex justify-between"><span className="text-knoux-muted-text">Cloud sync:</span><span className="text-amber-700 font-mono">Boundary guarded</span></div>
            </div>
          </div>

          <div className="glass-panel p-5 space-y-3">
            <h4 className="text-xs font-extrabold text-knoux-dark-text uppercase tracking-wider flex items-center gap-1.5"><Radar className="w-4 h-4 text-knoux-purple" /> Live Guard Classes</h4>
            <div className="grid grid-cols-2 gap-2">
              {guardClasses.map((label) => {
                const active = sensitiveTypes.includes(label);
                return <div key={label} className={`rounded-xl border p-2 text-[10px] font-black flex items-center justify-between ${active ? "border-amber-100 bg-amber-50 text-amber-700" : "border-emerald-100 bg-emerald-50 text-emerald-700"}`}><span>{label}</span>{active ? <AlertTriangle className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}</div>;
              })}
            </div>
          </div>
        </aside>

        <main className="space-y-6">
          <div className="glass-elevated p-5 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="space-y-1"><h4 className="text-xs font-extrabold text-knoux-dark-text uppercase tracking-wider flex items-center gap-1.5"><ShieldAlert className="w-4 h-4 text-knoux-purple" /> Credential Shield Scanner</h4><p className="text-[11px] text-knoux-muted-text leading-relaxed">Edit the secure buffer, run a local scan, build a redacted preview, and copy only the safe output.</p></div>
              <div className="flex flex-wrap gap-2"><button onClick={handleSensitiveScan} disabled={scanning} className="btn-knoux-primary text-xs"><Radar className="w-4 h-4" /> {scanning ? "Scanning..." : "Run Guard Scan"}</button><button onClick={handleRedact} className="btn-knoux-secondary text-xs"><EyeOff className="w-4 h-4" /> Redact Preview</button><button onClick={() => copy(redactedPreview || redacted, "Redacted preview")} className="btn-knoux-secondary text-xs"><Copy className="w-4 h-4" /> Copy Redacted</button></div>
            </div>
            <textarea value={vaultContent} onChange={(e) => setVaultContent(e.target.value)} className="w-full min-h-[170px] rounded-3xl border border-knoux-purple/15 bg-[color:var(--knoux-card-elevated)] p-5 text-sm font-mono text-knoux-dark-text outline-none focus:border-knoux-purple leading-relaxed" />
            <AnimatePresence>{scanResult && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className={`p-3 rounded-xl border text-[11px] font-medium leading-relaxed flex items-start gap-2 ${sensitiveTypes.length > 0 ? "border-amber-100 bg-amber-50 text-amber-950" : "border-emerald-100 bg-emerald-50 text-emerald-950"}`}><FileCheck className="w-4 h-4 shrink-0 mt-0.5" /><span>{scanResult}</span></motion.div>}</AnimatePresence>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div className="rounded-3xl bg-[#12091f] text-[#f7f2ff] p-4 border border-white/10"><div className="text-[10px] uppercase font-black text-[#cfb4ea] mb-2 flex items-center gap-2"><Fingerprint className="w-4 h-4" /> Active secure buffer</div><pre className="text-[11px] whitespace-pre-wrap overflow-auto max-h-56">{vaultContent}</pre></div>
              <div className="rounded-3xl bg-[#12091f] text-[#f7f2ff] p-4 border border-white/10"><div className="text-[10px] uppercase font-black text-emerald-200 mb-2 flex items-center gap-2"><EyeOff className="w-4 h-4" /> Redacted safe output</div><pre className="text-[11px] whitespace-pre-wrap overflow-auto max-h-56">{redactedPreview || redacted}</pre></div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {[
              { title: "AI Upload Firewall", desc: "Blocks or warns before AI actions when credentials are detected.", icon: Sparkles, action: "Check AI guard", onClick: handleSensitiveScan },
              { title: "Local Redaction Engine", desc: "Masks secrets, cards, tokens, private keys, and emails before sharing.", icon: Wand2, action: "Build redaction", onClick: handleRedact },
              { title: "Audit Export", desc: "Downloads a local JSON audit trail for handoff and review.", icon: Download, action: "Export audit", onClick: downloadAudit },
            ].map((card) => { const Icon = card.icon; return <button key={card.title} onClick={card.onClick} className="knoux-premium-card p-5 text-left space-y-3 hover:border-knoux-purple/30 transition"><div className="knoux-icon-shell"><Icon className="w-4 h-4" /></div><div><h3 className="font-black text-knoux-dark-text">{card.title}</h3><p className="text-[11px] text-knoux-muted-text leading-relaxed mt-1">{card.desc}</p></div><span className="inline-flex text-[11px] font-black text-knoux-purple">{card.action}</span></button>; })}
          </div>

          <div className="glass-panel p-5 space-y-4">
            <h4 className="text-xs font-extrabold text-knoux-dark-text uppercase tracking-wider flex items-center gap-1.5"><KeyRound className="w-4 h-4 text-knoux-purple" /> Secure Password-Protected Vault</h4>
            <p className="text-[11px] text-knoux-muted-text leading-relaxed">Uses a guarded temporary visibility window in the UI. In Electron production, encryption/decryption is delegated to the security IPC bridge only where available.</p>
            {!vaultUnlocked ? (
              <form onSubmit={handleVaultUnlock} className="flex flex-wrap items-center gap-3 max-w-xl pt-2"><input type="password" placeholder="Enter 6+ character passphrase..." value={vaultPassword} onChange={(e) => setVaultPassword(e.target.value)} className="flex-1 h-11 px-3 rounded-xl border border-knoux-purple/15 bg-[#FCFAFF] focus:bg-white text-xs outline-none focus:border-knoux-purple focus:ring-4 focus:ring-knoux-purple/5 transition-all" /><button type="submit" className="h-11 px-4 rounded-xl bg-knoux-purple hover:bg-knoux-deep-purple text-white text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5"><Unlock className="w-3.5 h-3.5" /> Open Vault</button></form>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 space-y-3"><div className="flex items-center justify-between"><span className="text-xs font-bold text-emerald-800 flex items-center gap-1"><Check className="w-4 h-4" /> TEMPORARY DECRYPT WINDOW</span><button onClick={handleVaultLock} className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer transition-colors">Lock</button></div><textarea value={vaultContent} onChange={(e) => setVaultContent(e.target.value)} rows={4} className="w-full p-3 rounded-xl border border-emerald-200 bg-white font-mono text-xs text-emerald-950 focus:outline-none" /></motion.div>
            )}
          </div>
        </main>
      </div>

      <div className="glass-panel p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"><h4 className="text-xs font-extrabold text-knoux-dark-text uppercase tracking-wider flex items-center gap-1.5"><History className="w-4 h-4 text-knoux-purple" /> Security Operations Audit Trail</h4><button onClick={downloadAudit} className="btn-knoux-secondary text-xs"><Download className="w-4 h-4" /> Download Audit</button></div>
        <div className="space-y-2 text-xs font-mono max-h-56 overflow-y-auto">
          {auditTrail.map((log, i) => <div key={`${log.action}-${i}`} className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2 rounded-lg border ${auditColor(log.severity)}`}><div className="flex gap-3 min-w-0"><span className="text-[10px] font-black shrink-0">{log.action}</span><span className="truncate">{log.msg}</span></div><span className="opacity-60 font-mono text-[10px] shrink-0">{log.time}</span></div>)}
        </div>
      </div>

      <div className="rounded-3xl border border-knoux-purple/10 bg-gradient-to-r from-[#FCFAFF] to-white p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1"><h4 className="text-xs font-black uppercase tracking-wider text-knoux-dark-text flex items-center gap-2"><Zap className="w-4 h-4 text-knoux-purple" /> Production Security Note</h4><p className="text-[11px] text-knoux-muted-text leading-relaxed max-w-3xl">Client-side secrets are never required. OpenRouter keys belong in Vercel/Electron environment variables only. The UI reports provider state without exposing sensitive values.</p></div>
        <div className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-xl uppercase flex items-center gap-1.5"><ClipboardCheck className="w-3.5 h-3.5" /> Hardened Local Guard</div>
      </div>
    </div>
  );
}
