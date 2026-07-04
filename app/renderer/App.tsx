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
  const [settings, setSettings] = useState<AppSettings>({ density: "comfortable", glowIntensity: "medium", privacyMode: false, autoAnalyze: true, maxHistorySize: 100, syncToCloud: false });
  const [items, setItems] = useState<ClipboardItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("knoux_clips");
    if (saved) {
      try { setItems(JSON.parse(saved)); }
      catch { setItems(SEED_ITEMS); localStorage.setItem("knoux_clips", JSON.stringify(SEED_ITEMS)); }
    } else {
      setItems(SEED_ITEMS);
      localStorage.setItem("knoux_clips", JSON.stringify(SEED_ITEMS));
    }
  }, []);

  const triggerToast = (msg: string) => { setToastMessage(msg); setTimeout(() => setToastMessage(null), 2500); };
  const saveClips = (newClips: ClipboardItem[]) => { setItems(newClips); localStorage.setItem("knoux_clips", JSON.stringify(newClips)); };

  const parseAITags = (text: string): string[] => {
    const hashes = text.match(/#\w+/g);
    if (hashes?.length) return hashes.map((h) => h.substring(1).trim());
    const words = text.split(/[\s,.;\n]+/).map((w) => w.replace(/[^a-zA-Z0-9]/g, "").trim()).filter((w) => w.length > 2 && w.length < 15);
    const blocked = ["tags", "recommended", "the", "and", "openrouter", "knoux", "result", "clipboard"];
    return words.filter((w) => !blocked.includes(w.toLowerCase())).slice(0, 4);
  };

  const handleAddNewItem = async (content: string, type: ClipboardType, source: string = "System Note") => {
    const clean = content.trim();
    if (!clean) return;
    const isLink = clean.startsWith("http://") || clean.startsWith("https://");
    const shouldSecure = privacyMode || /secure|vault/i.test(source + " " + clean);
    const newItemId = `clip-${Date.now()}`;
    const newItem: ClipboardItem = { id: newItemId, content: clean, type: isLink ? "link" : type, timestamp: new Date().toISOString(), pinned: false, favorite: false, tags: isLink ? ["link"] : shouldSecure ? ["secure", "vault"] : ["snippet"], source, isSecure: shouldSecure, folder: shouldSecure ? "Secure" : "General" };
    const updated = [newItem, ...items].slice(0, settings.maxHistorySize);
    saveClips(updated);
    triggerToast(shouldSecure ? "Secure item committed to local workspace." : "Snippet committed to local workspace.");
    if (settings.autoAnalyze) {
      try {
        const data = await runKnouxAIAction({ action: "classify", text: clean });
        const extraTags = parseAITags(data.result);
        if (extraTags.length > 0) {
          setItems((prevItems) => {
            const updatedList = prevItems.map((item) => item.id === newItemId ? { ...item, tags: Array.from(new Set([...item.tags, ...extraTags])), aiTags: extraTags } : item);
            localStorage.setItem("knoux_clips", JSON.stringify(updatedList));
            return updatedList;
          });
          triggerToast(`AI tags assigned: ${extraTags.join(", ")}`);
        }
      } catch (err) {
        console.error("AI auto-tagging failed:", err);
        triggerToast("Item saved. AI tagging is waiting for provider readiness.");
      }
    }
  };

  const handleCopyItem = async (item: ClipboardItem) => {
    const copied = await writeSystemClipboard(item.content);
    triggerToast(copied ? `Copied: "${item.content.substring(0, 30)}..."` : "Browser clipboard permission is required to copy.");
  };
  const handleTogglePin = (item: ClipboardItem) => { const updated = items.map((i) => (i.id === item.id ? { ...i, pinned: !i.pinned } : i)); saveClips(updated); triggerToast(item.pinned ? "Snippet unpinned." : "Snippet pinned."); };
  const handleToggleFavorite = (item: ClipboardItem) => { const updated = items.map((i) => (i.id === item.id ? { ...i, favorite: !i.favorite } : i)); saveClips(updated); triggerToast(item.favorite ? "Removed from Favorites." : "Saved as Favorite asset."); };
  const handleDeleteItem = (item: ClipboardItem) => { const updated = items.filter((i) => i.id !== item.id); saveClips(updated); triggerToast("Snippet removed from local workspace."); };
  const handleClearHistory = () => { if (window.confirm("Purge the active KNOUX workspace history? This cannot be undone.")) { saveClips([]); triggerToast("Local workspace history cleared."); } };
  const handleRunMaintenance = () => { const health = compactLocalStore(items); triggerToast(`Local store compacted: ${health.kb} KB / ${health.records} records.`); };
  const handleRefreshClipboard = async () => { setIsRefreshing(true); try { const text = await readSystemClipboard(); if (text && text.trim()) { const exists = items.some((i) => i.content === text.trim()); if (!exists) { await handleAddNewItem(text, "text", "Browser Clipboard"); triggerToast("Imported current system clipboard text."); } else triggerToast("Clipboard already exists in local workspace."); } else triggerToast("Clipboard text is empty or permission is not granted."); } finally { setTimeout(() => setIsRefreshing(false), 600); } };

  useEffect(() => { const handleKeyDown = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); setActiveTab("search"); } }; window.addEventListener("keydown", handleKeyDown); return () => window.removeEventListener("keydown", handleKeyDown); }, []);
  if (!splashComplete) return <SplashScreen onComplete={() => setSplashComplete(true)} />;

  const renderActiveTab = () => {
    switch (activeTab) {
      case "overview": return <OverviewDashboard items={items} onCopyItem={handleCopyItem} onTogglePin={handleTogglePin} onDeleteItem={handleDeleteItem} setActiveTab={setActiveTab} setAiInputText={setAiInputText} onAddNewItem={handleAddNewItem} />;
      case "clipboard": return <ClipboardWorkspace items={items} onAddNewItem={handleAddNewItem} onCopyItem={handleCopyItem} onTogglePin={handleTogglePin} onToggleFavorite={handleToggleFavorite} onDeleteItem={handleDeleteItem} onClearHistory={handleClearHistory} setActiveTab={setActiveTab} setAiInputText={setAiInputText} searchQuery={searchQuery} onUpdateItems={saveClips} />;
      case "search": return <SearchPage items={items} onCopyItem={handleCopyItem} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />;
      case "ai": return <AIToolsPage inputText={aiInputText} setInputText={setAiInputText} onAddNewItem={handleAddNewItem} />;
      case "security": return <SecurityPage privacyMode={privacyMode} setPrivacyMode={setPrivacyMode} itemsCount={items.length} />;
      case "settings": return <SettingsPage settings={settings} setSettings={setSettings} onClearHistory={handleClearHistory} setActiveTab={setActiveTab} items={items} onUpdateItems={saveClips} />;
      case "labs": return <LabsPage />;
      case "about": return <AboutPage />;
      default: return null;
    }
  };

  return (
    <AppShell activeTab={activeTab} setActiveTab={setActiveTab} collapsed={collapsed} setCollapsed={setCollapsed} privacyMode={privacyMode} setPrivacyMode={setPrivacyMode} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onRefresh={handleRefreshClipboard} isRefreshing={isRefreshing} itemsCount={items.length} onRunMaintenance={handleRunMaintenance} toastMessage={toastMessage} isInspectorOpen={isInspectorOpen} setIsInspectorOpen={setIsInspectorOpen}>
      {renderActiveTab()}
      <AnimatePresence>{toastMessage && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-4 py-3 rounded-2xl bg-white border border-knoux-purple/10 shadow-knoux-glow flex items-center gap-2 text-xs font-bold text-knoux-dark-text"><Check className="w-4 h-4 text-emerald-500" /><span>{toastMessage}</span></div>}</AnimatePresence>
    </AppShell>
  );
}
