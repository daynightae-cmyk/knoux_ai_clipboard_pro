import { useState } from "react";
import { ClipboardItem } from "../types";

interface Props { items?: ClipboardItem[]; }

export default function StudioPage({ items = [] }: Props) {
  const [status, setStatus] = useState("Ready");
  const report = { product: "Knoux AI Clipboard Pro", records: items.length, renderer: "ready", storage: "local", api: "/api/ai/chat", generatedAt: new Date().toISOString() };
  const copy = async (text: string) => { await navigator.clipboard.writeText(text); setStatus("Copied"); };
  const checkApi = async () => {
    setStatus("Checking AI route...");
    try {
      const res = await fetch("/api/ai/chat", { method: "GET", cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      setStatus(res.ok ? `AI route: ${data.status || "available"}` : `AI route error: ${data.error || res.status}`);
    } catch (e: any) { setStatus(e?.message || "AI route check failed"); }
  };
  const download = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "knoux-report.json";
    a.click();
    URL.revokeObjectURL(url);
    setStatus("Report exported");
  };
  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <section className="rounded-3xl border border-knoux-purple/10 bg-gradient-to-r from-white via-knoux-lavender-white to-white p-6 shadow-knoux-glow">
        <h1 className="text-3xl font-black text-knoux-dark-text">KNOUX Developer Studio</h1>
        <p className="text-sm text-knoux-muted-text mt-2">Real local tools: API check, JSON export, command copy, and workspace inspection.</p>
      </section>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button onClick={checkApi} className="rounded-2xl bg-white border border-knoux-purple/5 p-4 text-left"><b>Check AI Route</b><div className="text-sm text-knoux-muted-text mt-2">Calls /api/ai/chat</div></button>
        <button onClick={download} className="rounded-2xl bg-white border border-knoux-purple/5 p-4 text-left"><b>Export JSON Report</b><div className="text-sm text-knoux-muted-text mt-2">Download project handoff</div></button>
        <button onClick={() => copy("npm run build:renderer")} className="rounded-2xl bg-white border border-knoux-purple/5 p-4 text-left"><b>Copy Build Command</b><div className="text-sm font-mono mt-2">npm run build:renderer</div></button>
        <button onClick={() => copy("npm run dist:installer")} className="rounded-2xl bg-white border border-knoux-purple/5 p-4 text-left"><b>Copy EXE Command</b><div className="text-sm font-mono mt-2">npm run dist:installer</div></button>
      </div>
      <div className="rounded-2xl bg-white border border-knoux-purple/5 p-4"><b>Status</b><div className="text-sm text-knoux-muted-text mt-2">{status}</div></div>
      <pre className="rounded-3xl bg-[#140b25] text-[#f7f2ff] p-5 text-xs overflow-auto">{JSON.stringify(report, null, 2)}</pre>
    </div>
  );
}
