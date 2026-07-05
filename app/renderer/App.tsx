import { useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import { ClipboardItem, NavTab, AppSettings, ClipboardType } from "./types";
import SplashScreen from "./components/SplashScreen";
import AppShellPro from "./components/shell/AppShellPro";
import OverviewDashboard from "./components/OverviewDashboard";
import ClipboardWorkspace from "./components/ClipboardWorkspace";
import AIToolsPage from "./components/AIToolsPage";
import SearchPage from "./components/SearchPage";
import SecurityPage from "./components/SecurityPage";
import SettingsPage from "./components/SettingsPageServerOnly";
import LabsPage from "./components/LabsPage";
import AboutPage from "./components/AboutPage";
import StudioPage from "./components/StudioPage";
import BarcodeScannerPage from "./components/BarcodeScannerPage";
import { Check } from "lucide-react";
import { runKnouxAIAction } from "./services/aiClient";
import { compactLocalStore, detectSensitiveTypes, writeSystemClipboard } from "./services/runtimeServices";
import { autoTags, detectClipboardType, hashContent, importCurrentClipboardFromRuntime } from "./services/clientClipboardServices";

const DEFAULT_SETTINGS: AppSettings = {
  themeMode: "system",
  density: "comfortable",
  glowIntensity: "medium",
  privacyMode: false,
  autoAnalyze: true,
  maxHistorySize: 100,
  syncToCloud: false,
  language: "en",
};

const SEED_ITEMS: ClipboardItem[] = [
  { id: "clip-1", content: "Your clipboard. Upgraded by AI.", type: "text", timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(), pinned: true, favorite: true, tags: ["tagline", "knoux"], source: "System", isSecure: false, aiSummarized: "Defines the core branding tagline and executive mission of Knoux AI Clipboard Pro." },
  { id: "clip-2", content: "const runKnouxAction = async (text: string) => console.log('KNOUX action ready', text);", type: "code", timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), pinned: false, favorite: false, tags: ["script", "knoux"], source: "VS Code", isSecure: false, language: "typescript" },
  { id: "clip-3", content: "https://knoux.store", type: "link", timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), pinned: false, favorite: true, tags: ["store", "knoux"], source: "Chrome", isSecure: false },
  { id: "clip-4", content: "KNOUX secure workspace note: production UI, AI bridge, barcode scanner, and local-first clipboard workflow are active.", type: "note", timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), pinned: true, favorite: false, tags: ["secure", "workspace"], source: "System", isSecure: true },
];

const normalizeSettings = (value: any): AppSettings => {
  const themeMode = value?.themeMode === "day" ? "light" : value?.themeMode === "night" ? "dark" : value?.themeMode;
  const density = value?.density === "compact" || value?.density === "comfortable" || value?.density === "spacious" ? value.density : DEFAULT_SETTINGS.density;
  return { ...DEFAULT_SETTINGS, ...(value || {}), themeMode: themeMode === "light" || themeMode === "dark" || themeMode === "system" ? themeMode : DEFAULT_SETTINGS.themeMode, density };
};

const loadSettings = (): AppSettings => {
  try {
    const saved = localStorage.getItem("knoux_settings");
    if (!saved) return DEFAULT_SETTINGS;
    return normalizeSettings(JSON.parse(saved));
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export default function App() {
  const [splashComplete, setSplashComplete] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTab>("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [aiInputText, setAiInputText] = useState("");
  const [privacyMode, setPrivacyMode] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [items, setItems] = useState<ClipboardItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("knoux_clips");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setItems(Array.isArray(parsed) ? parsed : SEED_ITEMS);
      } catch {
        setItems(SEED_ITEMS);
        localStorage.setItem("knoux_clips", JSON.stringify(SEED_ITEMS));
      }
    } else {
      setItems(SEED_ITEMS);
      localStorage.setItem("knoux_clips", JSON.stringify(SEED_ITEMS));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("knoux_settings", JSON.stringify(settings));
    document.documentElement.lang = settings.language || "en";
    document.documentElement.dir = settings.language === "ar" ? "rtl" : "ltr";
    localStorage.setItem("knoux_theme_mode", settings.themeMode);
    document.documentElement.dataset.density = settings.density;
  }, [settings]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => {
      const resolved = settings.themeMode === "system" ? (media.matches ? "dark" : "light") : settings.themeMode;
      const cssTheme = resolved === "dark" ? "night" : "day";
      document.documentElement.dataset.theme = cssTheme;
      document.documentElement.dataset.themeMode = settings.themeMode;
      document.documentElement.classList.toggle("dark", resolved === "dark");
    };
    applyTheme();
    media.addEventListener("change", applyTheme);
    return () => media.removeEventListener("change", applyTheme);
  }, [settings.themeMode]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const saveClips = (newClips: ClipboardItem[]) => {
    setItems(newClips);
    localStorage.setItem("knoux_clips", JSON.stringify(newClips));
  };

  const parseAITags = (text: string): string[] => {
    const hashes = text.match(/#\w+/g);
    if (hashes?.length) return hashes.map((h) => h.substring(1).trim());
    return text.split(/[\s,.;\n]+/).map((w) => w.replace(/[^a-zA-Z0-9]/g, "").trim()).filter((w) => w.length > 2 && w.length < 15).slice(0, 4);
  };

  const handleAddNewItem = async (content: string, type: ClipboardType, source = "System Note") => {
    const clean = content.trim();
    if (!clean) return;
    const inferredType = detectClipboardType(clean);
    const hash = hashContent(clean);
    const existing = items.find((item) => hashContent(item.content) === hash);
    if (existing && !existing.pinned) {
      triggerToast(settings.language === "ar" ? "تم تجاهل نسخة مكررة." : "Duplicate clip avoided.");
      return;
    }
    const detectedTags = autoTags(clean);
    const shouldSecure = privacyMode || detectSensitiveTypes(`${source}\n${clean}`).length > 0;
    const id = `clip-${Date.now()}`;
    const folder = detectedTags.includes("code")
      ? "Code"
      : detectedTags.includes("link")
        ? "Links"
        : shouldSecure
          ? "Important"
          : "General";
    const item: ClipboardItem = {
      id,
      content: clean,
      type: inferredType === "text" ? type : inferredType,
      timestamp: new Date().toISOString(),
      pinned: false,
      favorite: false,
      tags: Array.from(new Set([...(detectedTags.length ? detectedTags : ["snippet"]), ...(shouldSecure ? ["secret"] : [])])),
      source,
      isSecure: shouldSecure,
      folder,
    };
    const nextItems = [item, ...items].slice(0, settings.maxHistorySize);
    saveClips(nextItems);
    triggerToast(settings.language === "ar" ? "تم حفظ العنصر في مساحة KNOUX." : "Snippet committed to KNOUX workspace.");

    if (settings.autoAnalyze) {
      try {
        const data = await runKnouxAIAction({ action: "classify", text: clean });
        const extraTags = parseAITags(data.result);
        if (extraTags.length) {
          setItems((prev) => {
            const next = prev.map((x) => x.id === id ? { ...x, tags: Array.from(new Set([...x.tags, ...extraTags])), aiTags: extraTags } : x);
            localStorage.setItem("knoux_clips", JSON.stringify(next));
            return next;
          });
        }
      } catch {
        triggerToast(settings.language === "ar" ? "تم الحفظ. مزود الذكاء يحتاج إعدادًا." : "Saved. AI provider pending.");
      }
    }
  };

  const handleCopyItem = async (item: ClipboardItem) => {
    const copied = await writeSystemClipboard(item.content);
    triggerToast(copied ? (settings.language === "ar" ? "تم النسخ." : "Copied.") : "Clipboard permission required.");
  };

  const handleTogglePin = (item: ClipboardItem) => saveClips(items.map((x) => x.id === item.id ? { ...x, pinned: !x.pinned } : x));
  const handleToggleFavorite = (item: ClipboardItem) => saveClips(items.map((x) => x.id === item.id ? { ...x, favorite: !x.favorite } : x));
  const handleDeleteItem = (item: ClipboardItem) => saveClips(items.filter((x) => x.id !== item.id));
  const handleClearHistory = () => { if (window.confirm("Clear local history?")) saveClips([]); };
  const handleRunMaintenance = () => { const health = compactLocalStore(items); triggerToast(`Local store compacted: ${health.kb} KB.`); };

  const handleRefreshClipboard = async () => {
    setIsRefreshing(true);
    try {
      const text = await importCurrentClipboardFromRuntime();
      if (text?.trim()) await handleAddNewItem(text, "text", "Current Clipboard Import");
      else triggerToast("Clipboard is empty or permission is denied.");
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setActiveTab("search");
      }
    };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, []);

  if (!splashComplete) return <SplashScreen onComplete={() => setSplashComplete(true)} />;

  const renderActiveTab = () => {
    switch (activeTab) {
      case "overview": return <OverviewDashboard items={items} onCopyItem={handleCopyItem} onTogglePin={handleTogglePin} onDeleteItem={handleDeleteItem} setActiveTab={setActiveTab} setAiInputText={setAiInputText} onAddNewItem={handleAddNewItem} />;
      case "clipboard": return <ClipboardWorkspace items={items} onAddNewItem={handleAddNewItem} onCopyItem={handleCopyItem} onTogglePin={handleTogglePin} onToggleFavorite={handleToggleFavorite} onDeleteItem={handleDeleteItem} onClearHistory={handleClearHistory} setActiveTab={setActiveTab} setAiInputText={setAiInputText} searchQuery={searchQuery} onUpdateItems={saveClips} />;
      case "search": return <SearchPage items={items} onCopyItem={handleCopyItem} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />;
      case "ai": return <AIToolsPage inputText={aiInputText} setInputText={setAiInputText} onAddNewItem={handleAddNewItem} />;
      case "barcode": return <BarcodeScannerPage onAddNewItem={handleAddNewItem} />;
      case "security": return <SecurityPage privacyMode={privacyMode} setPrivacyMode={setPrivacyMode} itemsCount={items.length} />;
      case "settings": return <SettingsPage settings={settings} setSettings={setSettings} onClearHistory={handleClearHistory} setActiveTab={setActiveTab} items={items} onUpdateItems={saveClips} />;
      case "labs": return <LabsPage />;
      case "developer": return <StudioPage items={items} />;
      case "about": return <AboutPage />;
      default: return <OverviewDashboard items={items} onCopyItem={handleCopyItem} onTogglePin={handleTogglePin} onDeleteItem={handleDeleteItem} setActiveTab={setActiveTab} setAiInputText={setAiInputText} onAddNewItem={handleAddNewItem} />;
    }
  };

  return (
    <AppShellPro activeTab={activeTab} setActiveTab={setActiveTab} collapsed={collapsed} setCollapsed={setCollapsed} privacyMode={privacyMode} setPrivacyMode={setPrivacyMode} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onRefresh={handleRefreshClipboard} isRefreshing={isRefreshing} itemsCount={items.length} onRunMaintenance={handleRunMaintenance} toastMessage={toastMessage} isInspectorOpen={isInspectorOpen} setIsInspectorOpen={setIsInspectorOpen} language={settings.language} themeMode={settings.themeMode} setThemeMode={(themeMode: AppSettings["themeMode"]) => setSettings((prev) => ({ ...prev, themeMode }))}>
      {renderActiveTab()}
      <AnimatePresence>{toastMessage && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-4 py-3 rounded-2xl bg-[#160A26]/90 border border-white/15 shadow-knoux-glow flex items-center gap-2 text-xs font-bold text-white"><Check className="w-4 h-4 text-emerald-300" /><span>{toastMessage}</span></div>}</AnimatePresence>
    </AppShellPro>
  );
}
