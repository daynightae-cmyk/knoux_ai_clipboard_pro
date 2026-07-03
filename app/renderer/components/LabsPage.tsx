/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LabModule } from "../types";
import { FlaskConical, Sparkles, Mic, Brain, BarChart, Eye, Fingerprint, Cpu, Blocks, EyeOff } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";

const INITIAL_LABS: LabModule[] = [
  { id: "studio", title: "Creative Prompt Studio", description: "Inject complex system prompts directly into the local copy stream to mold clipboard content.", badge: "Beta", enabled: false },
  { id: "voice", title: "Voice Control Commands", description: "Trigger clipboard copies, clears, and AI rewrites via simple local voice trigger alerts.", badge: "Planned", enabled: false },
  { id: "offline", title: "On-Device Offline LLM", description: "Load a quantized local model on-device inside Electron thread for fully offline summaries.", badge: "Experimental", enabled: false },
  { id: "analytics", title: "Advanced Semantic Analytics", description: "Generate custom chart categories displaying typing trends, tags, and character histories.", badge: "Beta", enabled: true },
  { id: "quantum", title: "Quantum-Resistant Vaults", description: "Upgrade standard database keys with experimental lattice cryptography algorithms.", badge: "Experimental", enabled: false },
  { id: "morpher", title: "Retro UI Morphing", description: "Morph workspace windows into fully CRT terminal themes or nostalgic brutalist layouts.", badge: "Experimental", enabled: false },
  { id: "tester", title: "Network Core Benchmarker", description: "Benchmark response times of server endpoints and compute direct local memory footprints.", badge: "Experimental", enabled: true },
];

export default function LabsPage() {
  const [labs, setLabs] = useState<LabModule[]>(INITIAL_LABS);

  const toggleLab = (id: string) => {
    setLabs((prev) =>
      prev.map((lab) => {
        if (lab.id === id) {
          const updated = { ...lab, enabled: !lab.enabled };
          return updated;
        }
        return lab;
      })
    );
  };

  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case "Beta":
        return "border-blue-200 bg-blue-50 text-blue-600";
      case "Experimental":
        return "border-purple-200 bg-purple-50 text-purple-600";
      case "Planned":
        return "border-amber-200 bg-amber-50 text-amber-600";
      default:
        return "border-gray-200 bg-gray-50 text-gray-600";
    }
  };

  const getLabIcon = (id: string) => {
    switch (id) {
      case "studio":
        return <Sparkles className="w-5 h-5 text-purple-500" />;
      case "voice":
        return <Mic className="w-5 h-5 text-blue-500" />;
      case "offline":
        return <Brain className="w-5 h-5 text-amber-500" />;
      case "analytics":
        return <BarChart className="w-5 h-5 text-emerald-500" />;
      case "quantum":
        return <Fingerprint className="w-5 h-5 text-indigo-500" />;
      case "morpher":
        return <Cpu className="w-5 h-5 text-rose-500" />;
      default:
        return <Blocks className="w-5 h-5 text-teal-500" />;
    }
  };

  return (
    <div id="labs-workspace-container" className="p-6 space-y-6 max-w-5xl mx-auto select-none">
      {/* Intro descriptive card */}
      <div className="p-5 rounded-3xl border border-knoux-purple/15 bg-gradient-to-r from-knoux-pale-purple/20 to-white flex flex-col sm:flex-row items-center gap-4 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-knoux-purple/10 flex items-center justify-center shrink-0">
          <FlaskConical className="w-6 h-6 text-knoux-purple" />
        </div>
        <div className="space-y-1 text-center sm:text-left">
          <h2 className="text-sm font-bold text-knoux-dark-text uppercase tracking-wider">
            KNOUX EXPERIMENTAL LABS
          </h2>
          <p className="text-xs text-knoux-muted-text max-w-xl">
            Isolated features currently under active development. These modules are structurally decoupled from standard workflow modules and do not log production metrics.
          </p>
        </div>
      </div>

      {/* Grid of labs cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {labs.map((lab) => (
          <div
            key={lab.id}
            className="p-5 rounded-3xl border border-knoux-purple/5 bg-white shadow-sm flex flex-col justify-between hover:border-knoux-purple/15 transition-all group min-h-[180px]"
          >
            {/* Header row */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                  {getLabIcon(lab.id)}
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-extrabold border px-2 py-0.5 rounded-full uppercase tracking-wider ${getBadgeStyle(lab.badge)}`}>
                    {lab.badge}
                  </span>

                  {/* Disable toggle if Planned */}
                  {lab.badge !== "Planned" && (
                    <button
                      onClick={() => toggleLab(lab.id)}
                      className={`w-10 h-5 rounded-full transition-all flex items-center cursor-pointer p-0.5 ${
                        lab.enabled ? "bg-knoux-purple justify-end" : "bg-knoux-purple/15 justify-start"
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                    </button>
                  )}
                </div>
              </div>

              {/* Lab description */}
              <div className="space-y-1">
                <span className="text-xs font-extrabold text-knoux-dark-text group-hover:text-knoux-purple transition-colors block">
                  {lab.title}
                </span>
                <p className="text-[11px] text-knoux-muted-text leading-relaxed">
                  {lab.description}
                </p>
              </div>
            </div>

            {/* Bottom active block indicator */}
            {lab.enabled && lab.badge !== "Planned" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 pt-3 border-t border-knoux-purple/5 text-[10px] font-mono text-emerald-600 font-bold flex items-center gap-1"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>SANDBOX INITIALIZED</span>
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
