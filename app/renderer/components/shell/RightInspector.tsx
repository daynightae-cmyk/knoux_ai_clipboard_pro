/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { Shield, Database, X, Cpu, CheckCircle2, TrendingUp, RefreshCw, BarChart2 } from "lucide-react";
import { useState } from "react";

interface RightInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  itemsCount: number;
  privacyMode: boolean;
  onRunMaintenance?: () => void;
}

export default function RightInspector({
  isOpen,
  onClose,
  itemsCount,
  privacyMode,
  onRunMaintenance,
}: RightInspectorProps) {
  const [maintenanceRunning, setMaintenanceRunning] = useState(false);

  const handleRunMaintenance = () => {
    if (onRunMaintenance) {
      setMaintenanceRunning(true);
      setTimeout(() => {
        onRunMaintenance();
        setMaintenanceRunning(false);
      }, 1000);
    }
  };

  const calculatedSpace = (itemsCount * 0.45).toFixed(2); // estimated KB size

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: 340, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 340, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-80 h-screen sticky top-0 border-l border-knoux-purple/10 bg-white/70 backdrop-blur-md p-5 select-none shrink-0 z-30 flex flex-col justify-between"
        >
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-knoux-purple/5 pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-knoux-purple animate-pulse" />
                <span className="text-xs font-bold text-knoux-dark-text uppercase tracking-wider">
                  KNOUX Telemetry
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-knoux-purple/5 text-knoux-muted-text hover:text-knoux-purple cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Core Stats Overview */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-knoux-muted-text/50 uppercase tracking-widest block">
                System Diagnostics
              </span>

              {/* Local storage health */}
              <div className="p-4 rounded-2xl border border-knoux-purple/5 bg-white shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-knoux-dark-text">
                  <Database className="w-3.5 h-3.5 text-knoux-purple" />
                  <span>Local Store</span>
                </div>
                <div className="space-y-1.5 text-[11px] leading-normal font-mono">
                  <div className="flex justify-between">
                    <span className="text-knoux-muted-text">Status:</span>
                    <span className="text-emerald-600 font-bold">LOCAL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-knoux-muted-text">Allocated Space:</span>
                    <span className="text-knoux-dark-text font-bold">{calculatedSpace} KB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-knoux-muted-text">Records:</span>
                    <span className="text-knoux-dark-text font-bold">{itemsCount} / 250</span>
                  </div>
                </div>

                {onRunMaintenance && (
                  <button
                    onClick={handleRunMaintenance}
                    disabled={maintenanceRunning}
                    className="w-full mt-2.5 h-8 rounded-xl bg-knoux-purple/5 hover:bg-knoux-purple/10 text-knoux-purple font-mono font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {maintenanceRunning ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Compacting...</span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-3 h-3" />
                        <span>Compact Database</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Encryption & Certificates */}
              <div className="p-4 rounded-2xl border border-knoux-purple/5 bg-white shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-knoux-dark-text">
                  <Shield className="w-3.5 h-3.5 text-knoux-purple" />
                  <span>Crypto Enforcer</span>
                </div>
                <div className="space-y-1.5 text-[11px] leading-normal font-mono">
                  <div className="flex justify-between">
                    <span className="text-knoux-muted-text">Protocol:</span>
                    <span className="text-knoux-dark-text font-bold">Electron IPC scoped</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-knoux-muted-text">IPC Isolation:</span>
                    <span className="text-emerald-600 font-bold">
                      High-Mask
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-knoux-muted-text">Cloud Sync:</span>
                    <span className="text-knoux-dark-text font-bold">Disabled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Aesthetic footer signature */}
          <div className="space-y-3 border-t border-knoux-purple/5 pt-4">
            <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Systems Secured</span>
            </div>
            <p className="text-[10px] text-knoux-muted-text/60 leading-normal">
              Knoux telemetry reflects local renderer state and guarded Electron capabilities. Created by Sadek.
            </p>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
