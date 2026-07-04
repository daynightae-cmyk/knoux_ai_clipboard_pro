import { ClipboardItem } from "../types";

interface Props { items?: ClipboardItem[]; }

export default function StudioPage({ items = [] }: Props) {
  const report = {
    product: "Knoux AI Clipboard Pro",
    records: items.length,
    renderer: "ready",
    storage: "local first",
    ai: "server route",
    generatedAt: new Date().toISOString(),
  };
  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <section className="rounded-3xl border border-knoux-purple/10 bg-gradient-to-r from-white via-knoux-lavender-white to-white p-6 shadow-knoux-glow">
        <h1 className="text-2xl font-black text-knoux-dark-text">KNOUX Developer Studio</h1>
        <p className="text-sm text-knoux-muted-text mt-2">Production diagnostics, JSON handoff, and packaging readiness.</p>
      </section>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white border border-knoux-purple/5 p-4"><b>Records</b><div className="text-2xl font-black font-mono mt-2">{items.length}</div></div>
        <div className="rounded-2xl bg-white border border-knoux-purple/5 p-4"><b>AI Route</b><div className="text-sm font-mono mt-2">/api/ai/action</div></div>
        <div className="rounded-2xl bg-white border border-knoux-purple/5 p-4"><b>Build</b><div className="text-sm font-mono mt-2">Vite + Electron</div></div>
      </div>
      <pre className="rounded-3xl bg-[#140b25] text-[#f7f2ff] p-5 text-xs overflow-auto">{JSON.stringify(report, null, 2)}</pre>
    </div>
  );
}
