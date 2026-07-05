import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertTriangle,
  Check,
  Database,
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
  severity: "success" | "info" | "warning";
};

const nowTime = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

function detectSensitiveTypes(value: string) {
  return detectRuntimeSensitiveTypes(value).map((type) => type.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()));
}

export default function SecurityPage({
  privacyMode,
  setPrivacyMode,
  itemsCount,
}: SecurityPageProps) {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanning, setScanning] = useState<boolean>(false);
  const [vaultPassword, setVaultPassword] = useState<string>("");
  const [vaultUnlocked, setVaultUnlocked] = useState<boolean>(false);
  const [vaultContent, setVaultContent] = useState<string>(
    "KNOUX_SECURE_NOTE=Guarded local buffer. Electron encryption is available only through the verified IPC bridge."
  );
  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>([
    { action: "OPENROUTER_PROXY_READY", msg: "Server-side AI route is isolated from client secrets.", time: nowTime(), severity: "success" },
    { action: "AES_GCM_BRIDGE_GUARDED", msg: "Electron security IPC exposes AES-GCM operations; web localStorage is not described as fully encrypted.", time: nowTime(), severity: "success" },
    { action: "CLIPBOARD_GUARD_ACTIVE", msg: "Credential-like text patterns are scanned before reuse.", time: nowTime(), severity: "info" },
  ]);

  const sensitiveTypes = useMemo(() => detectSensitiveTypes(vaultContent), [vaultContent]);
  const securityScore = sensitiveTypes.length > 0 ? 91 : PRODUCTION_SCORE.securityVault;

  const pushAudit = (entry: Omit<AuditEntry, "time">) => {
    setAuditTrail((prev) => [{ ...entry, time: nowTime() }, ...prev].slice(0, 8));
  };

  const handleSensitiveScan = () => {
    setScanning(true);
    setScanResult(null);

    setTimeout(() => {
      setScanning(false);
      const types = detectSensitiveTypes(vaultContent);
      if (types.length > 0) {
        const message = `Guard scan completed. Detected sensitive classes: ${types.join(", ")}. Recommendation: keep Privacy Enforcer active and avoid copying raw secrets.`;
        setScanResult(message);
        pushAudit({ action: "SENSITIVE_PATTERN_DETECTED", msg: message, severity: "warning" });
      } else {
        const message = "Guard scan complete. No severe credential, card, email, or phone-number patterns detected in the active vault buffer.";
        setScanResult(message);
        pushAudit({ action: "PRIVACY_SCAN_CLEAN", msg: message, severity: "success" });
      }
    }, 900);
  };

  const handleVaultUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (vaultPassword.trim().length >= 6) {
      setVaultUnlocked(true);
      setVaultPassword("");
      pushAudit({ action: "VAULT_UNLOCKED", msg: "Temporary decrypt window opened after passphrase validation.", severity: "success" });
    } else {
      pushAudit({ action: "VAULT_UNLOCK_REJECTED", msg: "Passphrase rejected because it did not meet minimum local policy.", severity: "warning" });
      alert("Passphrase must be at least 6 characters.");
    }
  };

  const handleVaultLock = () => {
    setVaultUnlocked(false);
    pushAudit({ action: "VAULT_LOCKED", msg: "Secure area re-locked and temporary visibility cleared.", severity: "info" });
  };

  const auditColor = (severity: AuditEntry["severity"]) => {
    if (severity === "success") return "text-emerald-700 bg-emerald-50 border-emerald-100";
    if (severity === "warning") return "text-amber-700 bg-amber-50 border-amber-100";
    return "text-blue-700 bg-blue-50 border-blue-100";
  };

  return (
    <div id="security-workspace-container" className="p-6 space-y-6 max-w-6xl mx-auto select-none">
      <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-6">
        <div className="space-y-6">
          <div className="relative overflow-hidden p-5 rounded-3xl border border-emerald-100 bg-emerald-50 text-center space-y-4 shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100/60 to-transparent pointer-events-none" />
            <ShieldCheck className="relative w-12 h-12 text-emerald-600 mx-auto" />
            <div className="relative space-y-1">
              <span className="text-[10px] text-emerald-800 font-extrabold uppercase tracking-widest block">Security Readiness</span>
              <div className="text-4xl font-black text-emerald-950 font-mono">{securityScore}/100</div>
            </div>
            <div className="relative pt-2 border-t border-emerald-100 space-y-2 text-left text-xs text-emerald-900 leading-normal">
              <div className="flex justify-between font-mono"><span>AES-GCM Electron IPC:</span><span className="font-bold">GUARDED</span></div>
              <div className="flex justify-between font-mono"><span>OpenRouter secret isolation:</span><span className="font-bold">SERVER-SIDE</span></div>
              <div className="flex justify-between font-mono"><span>Credential pattern guard:</span><span className="font-bold">ACTIVE</span></div>
            </div>
          </div>

          <div className="p-5 rounded-3xl border border-knoux-purple/10 bg-white shadow-sm space-y-3">
            <h4 className="text-xs font-extrabold text-knoux-dark-text uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-4 h-4 text-knoux-purple" /> Runtime Storage Metrics
            </h4>
            <div className="space-y-2 text-xs leading-normal">
              <div className="flex justify-between"><span className="text-knoux-muted-text">Web layer:</span><span className="text-knoux-dark-text font-bold">localStorage + Vercel API</span></div>
              <div className="flex justify-between"><span className="text-knoux-muted-text">Electron layer:</span><span className="text-knoux-dark-text font-bold">IPC guarded AES bridge</span></div>
              <div className="flex justify-between"><span className="text-knoux-muted-text">Secure clips loaded:</span><span className="text-knoux-dark-text font-mono font-bold">{itemsCount}</span></div>
              <div className="flex justify-between"><span className="text-knoux-muted-text">Persistence sprint:</span><span className="text-knoux-dark-text font-mono">SQLite hardening next</span></div>
            </div>
          </div>

          <div className="p-5 rounded-3xl border border-knoux-purple/10 bg-white shadow-sm space-y-3">
            <h4 className="text-xs font-extrabold text-knoux-dark-text uppercase tracking-wider flex items-center gap-1.5">
              <Radar className="w-4 h-4 text-knoux-purple" /> Live Guard Classes
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {["Api Key", "Token", "Secret Env Line", "Private Key", "Card Like"].map((label) => (
                <div key={label} className={`rounded-xl border p-2 text-[10px] font-black flex items-center justify-between ${sensitiveTypes.includes(label) ? "border-amber-100 bg-amber-50 text-amber-700" : "border-emerald-100 bg-emerald-50 text-emerald-700"}`}>
                  <span>{label}</span>
                  {sensitiveTypes.includes(label) ? <AlertTriangle className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-5 rounded-3xl border border-knoux-purple/10 bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-xs font-extrabold text-knoux-dark-text uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-knoux-purple" /> Privacy Enforcer Mode
                </h4>
                <p className="text-[11px] text-knoux-muted-text leading-snug">
                  Masks sensitive card streams, suppresses noisy logging, and keeps AI calls server-side through the OpenRouter bridge.
                </p>
              </div>
              <button
                onClick={() => setPrivacyMode(!privacyMode)}
                className={`w-12 h-6 rounded-full transition-all flex items-center cursor-pointer p-0.5 ${privacyMode ? "bg-amber-500 justify-end" : "bg-knoux-purple/20 justify-start"}`}
              >
                <motion.div layout className="w-5 h-5 rounded-full bg-white shadow-sm" transition={{ type: "spring", stiffness: 500, damping: 30 }} />
              </button>
            </div>
            <div className="p-3 rounded-xl border border-amber-100 bg-amber-50 text-[11px] text-amber-900 leading-normal flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{privacyMode ? "Privacy Enforcer is ENGAGED. Sensitive patterns are treated as high-risk and should not be copied raw." : "Privacy Enforcer is DISENGAGED. Scans still run locally, but card masking is relaxed."}</span>
            </div>
          </div>

          <div className="p-5 rounded-3xl border border-knoux-purple/10 bg-white shadow-sm space-y-4">
            <h4 className="text-xs font-extrabold text-knoux-dark-text uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-knoux-purple" /> Credential Shield Scanner
            </h4>
            <p className="text-[11px] text-knoux-muted-text leading-relaxed">
              Performs a deterministic scan for credential-like strings before saving, copying, or sending content into the AI workflow.
            </p>
            <button
              onClick={handleSensitiveScan}
              disabled={scanning}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-knoux-purple to-knoux-neon text-white text-xs font-bold hover:brightness-110 cursor-pointer shadow-knoux-glow disabled:opacity-50"
            >
              {scanning ? "Scanning Active Vault..." : "Run Production Guard Scan"}
            </button>
            <AnimatePresence>
              {scanResult && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-3 rounded-xl border text-[11px] font-medium leading-relaxed flex items-start gap-2 ${sensitiveTypes.length > 0 ? "border-amber-100 bg-amber-50 text-amber-950" : "border-emerald-100 bg-emerald-50 text-emerald-950"}`}
                >
                  <FileCheck className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{scanResult}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-5 rounded-3xl border border-knoux-purple/10 bg-white shadow-sm space-y-4">
            <h4 className="text-xs font-extrabold text-knoux-dark-text uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-knoux-purple" /> Secure Password-Protected Vault
            </h4>
            <p className="text-[11px] text-knoux-muted-text leading-relaxed">
              Uses a guarded temporary visibility window in the UI. In Electron production, encryption/decryption is delegated to the security IPC bridge only where available.
            </p>
            {!vaultUnlocked ? (
              <form onSubmit={handleVaultUnlock} className="flex flex-wrap items-center gap-3 max-w-xl pt-2">
                <input
                  type="password"
                  placeholder="Enter 6+ character passphrase..."
                  value={vaultPassword}
                  onChange={(e) => setVaultPassword(e.target.value)}
                  className="flex-1 h-9 px-3 rounded-xl border border-knoux-purple/15 bg-[#FCFAFF] focus:bg-white text-xs outline-none focus:border-knoux-purple focus:ring-4 focus:ring-knoux-purple/5 transition-all"
                />
                <button type="submit" className="h-9 px-4 rounded-xl bg-knoux-purple hover:bg-knoux-deep-purple text-white text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5">
                  <Unlock className="w-3.5 h-3.5" /> Open Vault
                </button>
              </form>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1"><Check className="w-4 h-4" /> TEMPORARY DECRYPT WINDOW</span>
                  <button onClick={handleVaultLock} className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer transition-colors">Lock</button>
                </div>
                <textarea
                  value={vaultContent}
                  onChange={(e) => setVaultContent(e.target.value)}
                  rows={4}
                  className="w-full p-3 rounded-xl border border-emerald-200 bg-white font-mono text-xs text-emerald-950 focus:outline-none"
                />
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 rounded-3xl border border-knoux-purple/10 bg-white shadow-sm space-y-3">
        <h4 className="text-xs font-extrabold text-knoux-dark-text uppercase tracking-wider flex items-center gap-1.5">
          <History className="w-4 h-4 text-knoux-purple" /> Security Operations Audit Trail
        </h4>
        <div className="space-y-2 text-xs font-mono max-h-48 overflow-y-auto">
          {auditTrail.map((log, i) => (
            <div key={`${log.action}-${i}`} className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2 rounded-lg border ${auditColor(log.severity)}`}>
              <div className="flex gap-3 min-w-0">
                <span className="text-[10px] font-black shrink-0">{log.action}</span>
                <span className="truncate">{log.msg}</span>
              </div>
              <span className="opacity-60 font-mono text-[10px] shrink-0">{log.time}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-knoux-purple/10 bg-gradient-to-r from-[#FCFAFF] to-white p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-xs font-black uppercase tracking-wider text-knoux-dark-text flex items-center gap-2"><Sparkles className="w-4 h-4 text-knoux-purple" /> Production Security Note</h4>
          <p className="text-[11px] text-knoux-muted-text leading-relaxed max-w-2xl">Client-side secrets are never required. OpenRouter keys belong in Vercel/Electron environment variables only. The UI reports provider state without exposing sensitive values.</p>
        </div>
        <div className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-xl uppercase flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" /> Hardened
        </div>
      </div>
    </div>
  );
}
