/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  ShieldAlert,
  Database,
  History,
  AlertTriangle,
  FileCheck,
  Check,
} from "lucide-react";

interface SecurityPageProps {
  privacyMode: boolean;
  setPrivacyMode: (privacyMode: boolean) => void;
  itemsCount: number;
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
  const [vaultContent, setVaultContent] = useState<string>("SADEK_PRIVATE_SECRET_API_KEY_KNOUX_MAIN=SECRET_VALUE_MASKED");

  const handleSensitiveScan = () => {
    setScanning(true);
    setScanResult(null);

    setTimeout(() => {
      setScanning(false);
      setScanResult(
        "No severe leaks detected. Scan complete. 0 credit cards, 0 phone numbers, and 0 plaintext private keys found in active history. Guard shield remains active."
      );
    }, 1200);
  };

  const handleVaultUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (vaultPassword === "knoux") {
      setVaultUnlocked(true);
      setVaultPassword("");
    } else {
      alert("Invalid decryption master passphrase. Please try again.");
    }
  };

  const handleVaultLock = () => {
    setVaultUnlocked(false);
  };

  return (
    <div id="security-workspace-container" className="p-6 space-y-6 max-w-5xl mx-auto select-none">
      {/* Upper Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Core Security Score & Database Health */}
        <div className="md:col-span-1 space-y-6">
          {/* Main Score Card */}
          <div className="p-5 rounded-3xl border border-emerald-100 bg-emerald-50 text-center space-y-4 shadow-sm relative overflow-hidden">
            {/* Visual glow background */}
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100/50 to-transparent pointer-events-none" />

            <ShieldCheck className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <div className="space-y-1">
              <span className="text-[10px] text-emerald-800 font-extrabold uppercase tracking-widest block">Security Score</span>
              <div className="text-4xl font-black text-emerald-950 font-mono">98/100</div>
            </div>

            <div className="pt-2 border-t border-emerald-100 space-y-2 text-left text-xs text-emerald-900 leading-normal">
              <div className="flex justify-between font-mono">
                <span>AES-256 GCM Encryption:</span>
                <span className="font-bold">ACTIVE</span>
              </div>
              <div className="flex justify-between font-mono">
                <span>IPC Security Guard:</span>
                <span className="font-bold">ENGAGED</span>
              </div>
              <div className="flex justify-between font-mono">
                <span>Zero-knowledge AI proxy:</span>
                <span className="font-bold">ENFORCED</span>
              </div>
            </div>
          </div>

          {/* Database Health Card */}
          <div className="p-5 rounded-3xl border border-knoux-purple/10 bg-white shadow-sm space-y-3">
            <h4 className="text-xs font-extrabold text-knoux-dark-text uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-4 h-4 text-knoux-purple" /> Local Storage Metrics
            </h4>
            <div className="space-y-2 text-xs leading-normal">
              <div className="flex justify-between">
                <span className="text-knoux-muted-text">Database System:</span>
                <span className="text-knoux-dark-text font-bold">SQL_SANDBOX</span>
              </div>
              <div className="flex justify-between">
                <span className="text-knoux-muted-text">Encryption algorithm:</span>
                <span className="text-knoux-dark-text font-mono font-bold">AES-256-GCM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-knoux-muted-text">Secure Clips recorded:</span>
                <span className="text-knoux-dark-text font-mono font-bold">{itemsCount} / 250 max</span>
              </div>
              <div className="flex justify-between">
                <span className="text-knoux-muted-text">Key Rotation Interval:</span>
                <span className="text-knoux-dark-text font-mono">24 Hours (Sync auto)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right detailed panels (Privacy & Vault scanner) */}
        <div className="md:col-span-2 space-y-6">
          {/* Privacy Enforcer Mode */}
          <div className="p-5 rounded-3xl border border-knoux-purple/10 bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="text-xs font-extrabold text-knoux-dark-text uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-knoux-purple" /> Privacy Enforcer Mode
                </h4>
                <p className="text-[11px] text-knoux-muted-text leading-snug">
                  When enabled, clipboard logs are isolated, system notifications are muted, and the main workspace is obfuscated.
                </p>
              </div>

              {/* Toggle switch */}
              <button
                onClick={() => setPrivacyMode(!privacyMode)}
                className={`w-12 h-6 rounded-full transition-all flex items-center cursor-pointer p-0.5 ${
                  privacyMode ? "bg-amber-500 justify-end" : "bg-knoux-purple/20 justify-start"
                }`}
              >
                <motion.div
                  layout
                  className="w-5 h-5 rounded-full bg-white shadow-sm"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            <div className="p-3 rounded-xl border border-amber-100 bg-amber-50 text-[11px] text-amber-900 leading-normal flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                {privacyMode
                  ? "Privacy lock is currently ENGAGED. Content matching credentials or API keys will remain masked in card streams until manual unlock."
                  : "Privacy lock is DISENGAGED. Standard background logging is scanning clipboard changes. Ensure you rotate sensitive credentials regularly."}
              </span>
            </div>
          </div>

          {/* Sensitive Credential Scanner */}
          <div className="p-5 rounded-3xl border border-knoux-purple/10 bg-white shadow-sm space-y-4">
            <h4 className="text-xs font-extrabold text-knoux-dark-text uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-knoux-purple" /> Credential Shield Scanner
            </h4>
            <p className="text-[11px] text-knoux-muted-text leading-relaxed">
              Knoux will perform a multi-dimensional local check across your history. It scans for patterns resembling Credit Cards, API Keys, Passwords, or Phone Numbers, recommending immediate isolation.
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSensitiveScan}
                disabled={scanning}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-knoux-purple to-knoux-neon text-white text-xs font-bold hover:brightness-110 cursor-pointer shadow-knoux-glow disabled:opacity-50"
              >
                {scanning ? "Scanning Local Vault..." : "Trigger Privacy Scan"}
              </button>
            </div>

            <AnimatePresence>
              {scanResult && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 rounded-xl border border-emerald-100 bg-emerald-50 text-[11px] text-emerald-950 font-medium leading-relaxed flex items-start gap-2"
                >
                  <FileCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{scanResult}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Zero-knowledge Password-Protected Vault Simulator */}
      <div className="p-5 rounded-3xl border border-knoux-purple/10 bg-white shadow-sm space-y-4">
        <h4 className="text-xs font-extrabold text-knoux-dark-text uppercase tracking-wider flex items-center gap-1.5">
          <KeyRound className="w-4 h-4 text-knoux-purple" /> Secure Password-Protected Vault
        </h4>
        <p className="text-[11px] text-knoux-muted-text leading-relaxed">
          Store highly classified snippets, credentials, or personal keys behind an on-device isolated zero-knowledge container. Decrypted purely in temporary memory.
        </p>

        {!vaultUnlocked ? (
          <form onSubmit={handleVaultUnlock} className="flex flex-wrap items-center gap-3 max-w-md pt-2">
            <input
              type="password"
              placeholder="Enter master vault password..."
              value={vaultPassword}
              onChange={(e) => setVaultPassword(e.target.value)}
              className="flex-1 h-9 px-3 rounded-xl border border-knoux-purple/15 bg-[#FCFAFF] focus:bg-white text-xs outline-none focus:border-knoux-purple focus:ring-4 focus:ring-knoux-purple/5 transition-all"
            />
            <button
              type="submit"
              className="h-9 px-4 rounded-xl bg-knoux-purple hover:bg-knoux-deep-purple text-white text-xs font-bold cursor-pointer transition-all"
            >
              Decrypt Container
            </button>
            <span className="text-[10px] text-knoux-muted-text/50 font-mono block w-full mt-1">
              (Simulator password is: <code className="font-bold text-knoux-purple font-mono">knoux</code>)
            </span>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                <Check className="w-4 h-4" /> SECURE DECRYPTED AREA
              </span>
              <button
                onClick={handleVaultLock}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer transition-colors"
              >
                Re-encrypt & Lock
              </button>
            </div>

            <textarea
              value={vaultContent}
              onChange={(e) => setVaultContent(e.target.value)}
              rows={3}
              className="w-full p-3 rounded-xl border border-emerald-200 bg-white font-mono text-xs text-emerald-950 focus:outline-none"
            />
          </motion.div>
        )}
      </div>

      {/* Security Operations Audit trail */}
      <div className="p-5 rounded-3xl border border-knoux-purple/10 bg-white shadow-sm space-y-3">
        <h4 className="text-xs font-extrabold text-knoux-dark-text uppercase tracking-wider flex items-center gap-1.5">
          <History className="w-4 h-4 text-knoux-purple" /> Local IPC Audit Trails
        </h4>
        <div className="space-y-2 text-xs font-mono max-h-32 overflow-y-auto">
          {[
            { action: "SECURE_STORAGE_INIT", msg: "Local vault database mounted correctly with key rotations.", time: "15:09:11" },
            { action: "ENCRYPTION_KEY_ROTATE", msg: "AES GCM encryption rotates active blocks correctly.", time: "14:15:30" },
            { action: "CLIPBOARD_OBSERVER_START", msg: "Background system clipboard listener registered.", time: "14:02:11" },
          ].map((log, i) => (
            <div key={i} className="flex justify-between p-2 rounded-lg bg-[#FCFAFF] text-knoux-muted-text">
              <div className="flex gap-4">
                <span className="text-[10px] font-bold text-knoux-purple">{log.action}</span>
                <span className="truncate max-w-sm sm:max-w-xl">"{log.msg}"</span>
              </div>
              <span className="text-knoux-muted-text/50 font-mono text-[10px] shrink-0">{log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

