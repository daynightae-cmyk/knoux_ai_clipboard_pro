import { useState, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { ClipboardItem, NavTab, AppSettings, ClipboardType } from "./types";
import SplashScreen from "./components/SplashScreen";
import AppShell from "./components/shell/AppShell";
import OverviewDashboard from "./components/OverviewDashboard";
import ClipboardWorkspace from "./components/ClipboardWorkspace";
import AIToolsPage from "./components/AIToolsPage";
import SearchPage from "./components/SearchPage";
import SecurityPage from "./components/SecurityPage";
import SettingsPage from "./components/SettingsPage";
import LabsPage from "./components/LabsPage";
import AboutPage from "./components/AboutPage";
import StudioPage from "./components/StudioPage";
import { Check } from "lucide-react";
import { runKnouxAIAction } from "./services/aiClient";
import { compactLocalStore, readSystemClipboard, writeSystemClipboard } from "./services/runtimeServices";

const SEED_ITEMS: ClipboardItem[] = [
  { id: "clip-1", content: "Your clipboard. Upgraded by AI.", type: "text", timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(), pinned: true, favorite: true, tags: ["tagline", "knoux"], source: "System", isSecure: false, aiSummarized: "Defines the core branding tagline and executive mission of Knoux AI Clipboard Pro." },
  { id: "clip-2", content: "const runKnouxAction = async (text: string) => console.log('KNOUX action ready', text);", type: "code", timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), pinned: false, favorite: false, tags: ["script", "knoux"], source: "VS Code", isSecure: false, language: "typescript" },
  { id: "clip-3", content: "https://knoux.store", type: "link", timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), pinned: false, favorite: true, tags: ["store", "knoux"], source: "Chrome", isSecure: false },
  { id: "clip-4", content: "KNOUX secure workspace note: production UI, AI bridge, and local-first clipboard workflow are active.", type: "note", timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), pinned: true, favorite: false, tags: ["secure", "workspace"], source: "System", isSecure: true },
];

export default function App() {
  const [splashComplete, setSplashComplete] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<NavTab>("overview");
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [aiInputText, setAiInputText] = useState<string>("");
  const [privacyMode, setPrivacyMode] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);
  const [settings, setSettings] = useState<AppSettings>({ density: "comfortable", glowIntensity: "medium", privacyMode: false, autoAnalyze: true, maxHistorySize: 100, syncToCloud: false, language: "en" });
  const [items, setItems] = useState<ClipboardItem[]>([]);
  useEffect(() => { const saved = localStorage.getItem("knoux_clips"); if (saved) { try { const parsed = JSON.parse(saved); setItems(Array.isArray(parsed) ? parsed : SEED_ITEMS); } catch { setItems(SEED_ITEMS); localStorage.setItem("knoux_clips", JSON.stringify(SEED_ITEMS)); } } else { setItems(SEED_ITEMS); localStorage.setItem("knoux_clips", JSON.stringify(SEED_ITEMS)); } }, []);
  const triggerToast = (msg: string) => { setToastMessage(msg); setTimeout(() => setToastMessage(null), 2500); };
  const saveClips = (newClips: ClipboardItem[]) => { setItems(newClips); localStorage.setItem("knoux_clips", JSON.stringify(newClips)); };
  const parseAITags = (text: string): string[] => { const hashes = text.match(/#\w+/g); if (hashes?.length) return hashes.map((h) => h.substring(1).trim()); return text.split(/[\s,.;\n]+/).map((w) => w.replace(/[^a-zA-Z0-9]/g, "").trim()).filter((w) => w.length > 2 && w.length < 15).slice(0, 4); };
  const handleAddNewItem = async (content: string, type: ClipboardType, source: string = "System Note") => { const clean = content.trim(); if (!clean) return; const isLink = clean.startsWith("http://") || clean.startsWith("https://"); const shouldSecure = privacyMode || /secure|vault/i.test(source + " " + clean); const id = `clip-${Date.now()}`; const item: ClipboardItem = { id, content: clean, type: isLink ? "link" : type, timestamp: new Date().toISOString(), pinned: false, favorite: false, tags: isLink ? ["link"] : shouldSecure ? ["secure", "vault"] : ["snippet"], source, isSecure: shouldSecure, folder: shouldSecure ? "Secure" : "General" }; saveClips([item, ...items].slice(0, settings.maxHistorySize)); triggerToast("Snippet committed to local workspace."); if (settings.autoAnalyze) { try { const data = await runKnouxAIAction({ action: "classify", text: clean }); const extraTags = parseAITags(data.result); if (extraTags.length) setItems((prev) => { const next = prev.map((x) => x.id === id ? { ...x, tags: Array.from(new Set([...x.tags, ...extraTags])), aiTags: extraTags } : x); localStorage.setItem("knoux_clips", JSON.stringify(next)); return next; }); } catch { triggerToast("Saved. AI provider pending."); } } };
  const handleCopyItem = async (item: ClipboardItem) => { const copied = await writeSystemClipboard(item.content); triggerToast(copied ? "Copied." : "Clipboard permission required."); };
  const handleTogglePin = (item: ClipboardItem) => { saveClips(items.map((x) => x.id === item.id ? { ...x, pinned: !x.pinned } : x)); };
  const handleToggleFavorite = (item: ClipboardItem) => { saveClips(items.map((x) => x.id === item.id ? { ...x, favorite: !x.favorite } : x)); };
  const handleDeleteItem = (item: ClipboardItem) => { saveClips(items.filter((x) => x.id !== item.id)); };
  const handleClearHistory = () => { if (window.confirm("Clear local history?")) saveClips([]); };
  const handleRunMaintenance = () => { const health = compactLocalStore(items); triggerToast(`Local store compacted: ${health.kb} KB.`); };
  const handleRefreshClipboard = async () => { setIsRefreshing(true); try { const text = await readSystemClipboard(); if (text?.trim()) await handleAddNewItem(text, "text", "Browser Clipboard"); else triggerToast("Clipboard is empty or permission is denied."); } finally { setTimeout(() => setIsRefreshing(false), 600); } };
  useEffect(() => { const f = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); setActiveTab("search"); } }; window.addEventListener("keydown", f); return () => window.removeEventListener("keydown", f); }, []);
  if (!splashComplete) return <SplashScreen onComplete={() => setSplashComplete(true)} />;
  const renderActiveTab = () => { switch (activeTab) { case "overview": return <OverviewDashboard items={items} onCopyItem={handleCopyItem} onTogglePin={handleTogglePin} onDeleteItem={handleDeleteItem} setActiveTab={setActiveTab} setAiInputText={setAiInputText} onAddNewItem={handleAddNewItem} />; case "clipboard": return <ClipboardWorkspace items={items} onAddNewItem={handleAddNewItem} onCopyItem={handleCopyItem} onTogglePin={handleTogglePin} onToggleFavorite={handleToggleFavorite} onDeleteItem={handleDeleteItem} onClearHistory={handleClearHistory} setActiveTab={setActiveTab} setAiInputText={setAiInputText} searchQuery={searchQuery} onUpdateItems={saveClips} />; case "search": return <SearchPage items={items} onCopyItem={handleCopyItem} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />; case "ai": return <AIToolsPage inputText={aiInputText} setInputText={setAiInputText} onAddNewItem={handleAddNewItem} />; case "security": return <SecurityPage privacyMode={privacyMode} setPrivacyMode={setPrivacyMode} itemsCount={items.length} />; case "settings": return <SettingsPage settings={settings} setSettings={setSettings} onClearHistory={handleClearHistory} setActiveTab={setActiveTab} items={items} onUpdateItems={saveClips} />; case "labs": return <LabsPage />; case "developer": return <StudioPage items={items} />; case "about": return <AboutPage />; default: return <OverviewDashboard items={items} onCopyItem={handleCopyItem} onTogglePin={handleTogglePin} onDeleteItem={handleDeleteItem} setActiveTab={setActiveTab} setAiInputText={setAiInputText} onAddNewItem={handleAddNewItem} />; } };
  return <AppShell activeTab={activeTab} setActiveTab={setActiveTab} collapsed={collapsed} setCollapsed={setCollapsed} privacyMode={privacyMode} setPrivacyMode={setPrivacyMode} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onRefresh={handleRefreshClipboard} isRefreshing={isRefreshing} itemsCount={items.length} onRunMaintenance={handleRunMaintenance} toastMessage={toastMessage} isInspectorOpen={isInspectorOpen} setIsInspectorOpen={setIsInspectorOpen}>{renderActiveTab()}<AnimatePresence>{toastMessage && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-4 py-3 rounded-2xl bg-white border border-knoux-purple/10 shadow-knoux-glow flex items-center gap-2 text-xs font-bold text-knoux-dark-text"><Check className="w-4 h-4 text-emerald-500" /><span>{toastMessage}</span></div>}</AnimatePresence></AppShell>;
}
