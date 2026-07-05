/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { checkProviderRoute, deriveAIStatus, runKnouxAIAction } from "../services/aiClient";
import i18n from "../utils/i18n";
import { copyToClipboard } from "../../shared/clipboard-utils";
import {
  Sparkles,
  FileText,
  RotateCcw,
  Copy,
  PlusCircle,
  HelpCircle,
  Globe,
  Code,
  Check,
  AlertTriangle,
  History,
  Languages,
} from "lucide-react";
import { detectSensitiveTypes } from "../services/runtimeServices";

interface AIToolsPageProps {
  inputText: string;
  setInputText: (text: string) => void;
  onAddNewItem: (content: string, type: "text" | "code" | "link" | "image" | "note", source?: string) => void;
}

interface AIHistoryItem {
  timestamp: string;
  action: string;
  originalText: string;
  processedResult: string;
}

export default function AIToolsPage({
  inputText,
  setInputText,
  onAddNewItem,
}: AIToolsPageProps) {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [targetLanguage, setTargetLanguage] = useState<string>("Spanish");
  const [history, setHistory] = useState<AIHistoryItem[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [providerStatus, setProviderStatus] = useState<any>(null);
  const sensitiveTypes = detectSensitiveTypes(inputText);
  const aiGuarded = sensitiveTypes.length > 0;
  const aiStatus = deriveAIStatus(providerStatus, { hasSensitiveContent: aiGuarded, isRuntimeGuarded: false });

  const aiOperations = [
    { id: "summarize", label: "Summarize", desc: "Extract key bullet summaries", color: "from-purple-500 to-indigo-500", icon: FileText },
    { id: "enhance", label: "Enhance Text", desc: "Elevate readability and grammar", color: "from-blue-500 to-indigo-500", icon: Sparkles },
    { id: "rewrite", label: "Rewrite Corp", desc: "Rephrase into corporate style", color: "from-pink-500 to-rose-500", icon: RotateCcw },
    { id: "translate", label: "Translate", desc: "Localize semantics accurately", color: "from-sky-500 to-blue-500", icon: Globe, extra: "language" },
    { id: "analyze", label: "Deep Analyze", desc: "Get structural & entity insights", color: "from-teal-500 to-emerald-500", icon: HelpCircle },
    { id: "classify", label: "Suggest Tags", desc: "Classify logical category tags", color: "from-amber-500 to-orange-500", icon: History },
    { id: "extract", label: "Extract Points", desc: "Pull lists, actions, & details", color: "from-purple-500 to-pink-500", icon: FileText },
    { id: "reply", label: "Smart Reply", desc: "Draft professional responder emails", color: "from-rose-500 to-orange-500", icon: Sparkles },
    { id: "explain-code", label: "Explain Code", desc: "Explain scripts and optimize code", color: "from-emerald-500 to-cyan-500", icon: Code },
    { id: "format-text", label: "Format Markdown", desc: "Beautify unstructured raw text", color: "from-indigo-500 to-purple-500", icon: FileText },
  ];

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("knoux_ai_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }

    let active = true;
    const probeRoute = async () => {
      try {
        const result = await checkProviderRoute("chat");
        if (active) setProviderStatus(result);
      } catch {
        if (active) setProviderStatus({ ok: false, configured: false, status: "network_error", provider: "openrouter" });
      }
    };

    probeRoute();
    return () => {
      active = false;
    };
  }, []);

  const handleAIAction = async (actionId: string) => {
    if (!inputText.trim()) return;
    if (aiGuarded) {
      setApiError(i18n.t("ai.status.guard", "Sensitive content detected. AI actions are guarded."));
      setProviderStatus({ ok: false, configured: true, status: "guarded", provider: "openrouter" });
      setResult("");
      return;
    }
    setLoading(true);
    setApiError(null);
    setResult("");

    try {
      const data = await runKnouxAIAction({
        action: actionId,
        text: inputText,
        targetLanguage: actionId === "translate" ? targetLanguage : undefined,
      });

      setResult(data.result);

      // Add to local state history
      const newHistoryItem: AIHistoryItem = {
        timestamp: new Date().toISOString(),
        action: actionId,
        originalText: inputText,
        processedResult: data.result,
      };

      const updatedHistory = [newHistoryItem, ...history].slice(0, 10);
      setHistory(updatedHistory);
      localStorage.setItem("knoux_ai_history", JSON.stringify(updatedHistory));
    } catch (error: any) {
      console.error(error);
      const message = error.message || i18n.t("ai.errors.unexpected", "An unexpected network anomaly has halted the AI request.");
      const mapped = deriveAIStatus({ ok: false, configured: false, status: /OpenRouter is not configured|missing|key/i.test(message) ? "provider_not_configured" : /route/i.test(message) ? "route_unavailable" : "network_error", provider: "openrouter" }, { hasSensitiveContent: false, isRuntimeGuarded: false });
      setProviderStatus(mapped);
      setApiError(mapped.detail);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResult = () => {
    if (!result) return;
    copyToClipboard(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveAsSnippet = () => {
    if (!result) return;
    onAddNewItem(result, "note", "Knoux AI Engine");
    alert("Snippet card successfully committed to secure local clipboard database!");
  };

  return (
    <div id="ai-workspace-container" className="p-6 space-y-6 max-w-5xl mx-auto select-none">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Input and configuration panels (2 spans wide on lg) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Input Textarea Card */}
          <div className="p-5 rounded-3xl border border-knoux-purple/10 bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-knoux-dark-text tracking-tight uppercase flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-knoux-purple" /> Target Clipboard Text Block
              </span>
              <button
                onClick={() => setInputText("")}
                className="text-[10px] bg-knoux-purple/5 hover:bg-knoux-purple/10 text-knoux-purple px-2 py-1 rounded-md font-bold uppercase transition-colors"
              >
                Clear Input
              </button>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste any system logs, emails, creative content, or code segments here..."
              rows={6}
              className="w-full p-4 rounded-2xl border border-knoux-purple/15 bg-[#FCFAFF] focus:bg-white text-xs text-knoux-dark-text outline-none focus:border-knoux-purple focus:ring-4 focus:ring-knoux-purple/5 transition-all font-mono leading-relaxed"
            />

            {aiGuarded && (
              <div className="p-3 rounded-2xl border border-amber-200 bg-amber-50 text-amber-900 text-xs font-semibold flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{i18n.t("ai.status.guard", "Sensitive content detected. AI actions are guarded.")} Detected: {sensitiveTypes.join(", ")}.</span>
              </div>
            )}

            <div className={`rounded-2xl border px-3 py-2 text-[11px] font-semibold flex items-center justify-between ${aiStatus.tone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : aiStatus.tone === "danger" ? "border-red-200 bg-red-50 text-red-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
              <span>{i18n.t("ai.status.label", "AI status")}: {aiStatus.label}</span>
              <span>{aiStatus.detail}</span>
            </div>

            {/* Translation details overlay if typing translation */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="text-[11px] text-knoux-muted-text font-mono">
                Character Volume: <span className="font-bold text-knoux-dark-text">{inputText.length}</span> | Words: <span className="font-bold text-knoux-dark-text">{inputText.split(/\s+/).filter(Boolean).length}</span>
              </div>

              {/* Language selection dropdown */}
              <div className="flex items-center gap-2">
                <Languages className="w-3.5 h-3.5 text-knoux-purple" />
                <span className="text-[11px] text-knoux-muted-text font-semibold">Target Language:</span>
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="rounded-lg border border-knoux-purple/10 bg-white px-2 py-1 text-xs text-knoux-dark-text focus:border-knoux-purple outline-none cursor-pointer font-bold"
                >
                  <option value="Spanish">Spanish</option>
                  <option value="German">German</option>
                  <option value="French">French</option>
                  <option value="Japanese">Japanese</option>
                  <option value="Arabic">Arabic</option>
                  <option value="Italian">Italian</option>
                </select>
              </div>
            </div>
          </div>

          {/* AI Actions Buttons Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-knoux-dark-text uppercase tracking-wider px-1">
              Select AI Operator
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {aiOperations.map((op) => {
                const Icon = op.icon;
                const isTranslate = op.id === "translate";
                return (
                  <button
                    key={op.id}
                    onClick={() => handleAIAction(op.id)}
                    disabled={loading || !inputText.trim() || aiGuarded}
                    className={`p-3 rounded-2xl border bg-white border-knoux-purple/5 hover:border-knoux-purple/20 hover:shadow-md transition-all text-left flex items-start gap-3 cursor-pointer group ${
                      !inputText.trim() || aiGuarded ? "opacity-40 cursor-not-allowed" : ""
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-knoux-purple to-knoux-neon text-white flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5 overflow-hidden">
                    <span className="text-xs font-bold text-knoux-dark-text group-hover:text-knoux-purple transition-colors block">
                        {op.label} {isTranslate && `(${targetLanguage})`}
                      </span>
                      <span className="text-[10px] text-knoux-muted-text truncate block">
                        {aiGuarded ? "Guarded until sensitive content is removed" : op.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Processing Results Panel */}
        <div className="space-y-6">
          <div className="p-5 rounded-3xl border border-knoux-purple/10 bg-white shadow-sm flex flex-col h-full min-h-[420px] justify-between">
            {/* Upper results area */}
            <div className="space-y-4">
              <span className="text-xs font-extrabold text-knoux-dark-text tracking-tight uppercase flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-knoux-purple animate-pulse" /> OpenRouter Processed Output
              </span>

              {/* Shimmer loading sequence */}
              <AnimatePresence>
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4 rounded-2xl border border-knoux-purple/10 bg-knoux-purple/5 space-y-4 knoux-shimmer h-64 flex flex-col items-center justify-center text-center"
                  >
                    {/* Pulsing AI ring */}
                    <div className="relative flex items-center justify-center mb-2">
                      <div className="absolute inset-0 -m-4 bg-knoux-purple/20 rounded-full animate-ping" />
                      <div className="w-10 h-10 rounded-full bg-knoux-purple text-white flex items-center justify-center relative">
                        <Sparkles className="w-5 h-5 animate-pulse" />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-knoux-dark-text">Knoux OpenRouter AI Working...</span>
                    <p className="text-[10px] text-knoux-muted-text max-w-xs leading-normal">
                      Connecting with server-side AI core, evaluating vocabulary context, and formatting output block...
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Real-time Result Rendering */}
              {!loading && result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl border border-knoux-purple/10 bg-[#FCFAFF] text-xs text-knoux-dark-text whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto select-text font-mono"
                >
                  {result}
                </motion.div>
              )}

              {/* Error indicator */}
              {!loading && apiError && (
                <div className="p-4 rounded-2xl border border-red-100 bg-red-50 text-red-900 text-xs flex items-start gap-2 leading-relaxed">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold">Execution Error</span>
                    <p className="text-[11px] opacity-90">{apiError}</p>
                  </div>
                </div>
              )}

              {/* Neutral Default empty state */}
              {!loading && !result && !apiError && (
                <div className="h-64 rounded-2xl border border-dashed border-knoux-purple/10 bg-[#FCFAFF] flex flex-col items-center justify-center text-center p-6 space-y-2">
                  <Sparkles className="w-6 h-6 text-knoux-purple/40" />
                  <span className="text-xs font-bold text-knoux-dark-text">Ready for Prompt</span>
                  <p className="text-[10px] text-knoux-muted-text max-w-xs leading-normal">
                    Select any of the AI operator actions on the left side to compile real OpenRouter outputs.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom action bar inside output panel */}
            {result && !loading && (
              <div className="pt-4 border-t border-knoux-purple/5 space-y-2">
                <button
                  onClick={handleCopyResult}
                  className="w-full h-9 rounded-xl bg-gradient-to-tr from-knoux-purple to-knoux-neon text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-knoux-glow cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? "Copied Successfully" : "Copy to System Clipboard"}</span>
                </button>

                <button
                  onClick={handleSaveAsSnippet}
                  className="w-full h-9 rounded-xl border border-knoux-purple/10 hover:bg-knoux-purple/5 text-knoux-purple text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer bg-white"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Commit as Snippet Card</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Visual representation of previous AI action runs */}
      {history.length > 0 && (
        <div className="p-5 rounded-3xl border border-knoux-purple/10 bg-white shadow-sm space-y-3">
          <h3 className="text-xs font-extrabold text-knoux-dark-text uppercase tracking-wider flex items-center gap-1.5">
            <History className="w-4 h-4 text-knoux-purple" /> Knoux AI Workspace Audit Trail
          </h3>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {history.map((h, i) => (
              <div
                key={i}
                onClick={() => {
                  setInputText(h.originalText);
                  setResult(h.processedResult);
                }}
                className="p-3 rounded-xl border border-knoux-purple/5 bg-[#FCFAFF] hover:border-knoux-purple/15 transition-all cursor-pointer flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-bold text-knoux-purple bg-knoux-purple/5 px-2 py-0.5 rounded-md uppercase">
                    {h.action}
                  </span>
                  <span className="text-knoux-dark-text truncate font-mono max-w-sm sm:max-w-xl">
                    "{h.originalText.substring(0, 70)}..."
                  </span>
                </div>
                <span className="text-[10px] text-knoux-muted-text/50 font-mono hidden sm:inline">
                  {new Date(h.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
