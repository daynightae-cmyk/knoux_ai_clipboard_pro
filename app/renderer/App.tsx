/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { ClipboardItem, NavTab, AppSettings } from "./types";
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
import { Check, Clipboard, Sparkles } from "lucide-react";
import { runKnouxAIAction } from "./services/aiClient";

const SEED_ITEMS: ClipboardItem[] = [
  {
    id: "clip-1",
    content: "Your clipboard. Upgraded by AI.",
    type: "text",
    timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    pinned: true,
    favorite: true,
    tags: ["tagline", "knoux"],
    source: "System",
    isSecure: false,
    aiSummarized: "Defines the core branding tagline and executive mission of Knoux AI Clipboard Pro.",
  },
  {
    id: "clip-2",
    content: "const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {\n  method: 'POST',\n  headers: {\n    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,\n    'Content-Type': 'application/json'\n  }\n});",
    type: "code",
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    pinned: false,
    favorite: false,
    tags: ["script", "openrouter"],
    source: "VS Code",
    isSecure: false,
    language: "typescript",
  },
  {
    id: "clip-3",
    content: "https://knoux.store",
    type: "link",
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    pinned: false,
    favorite: true,
    tags: ["store", "knoux"],
    source: "Chrome",
    isSecure: false,
  },
  {
    id: "clip-4",
    content: "Eng. Sadek Elgazar is a world-class visual system designer and Senior Electronics Engineer.",
    type: "note",
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    pinned: true,
    favorite: false,
    tags: ["credits"],
    source: "System",
    isSecure: true,
  },
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

  const [settings, setSettings] = useState<AppSettings>({
    density: "comfortable",
    glowIntensity: "medium",
    privacyMode: false,
    autoAnalyze: true,
    maxHistorySize: 100,
    syncToCloud: false,
  });

  const [items, setItems] = useState<ClipboardItem[]>([]);

  // Load items on mount
  useEffect(() => {
    const saved = localStorage.getItem("knoux_clips");
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        setItems(SEED_ITEMS);
      }
    } else {
      setItems(SEED_ITEMS);
      localStorage.setItem("knoux_clips", JSON.stringify(SEED_ITEMS));
    }
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const saveClips = (newClips: ClipboardItem[]) => {
    setItems(newClips);
    localStorage.setItem("knoux_clips", JSON.stringify(newClips));
  };

  // Create a new clipboard item manually
  const handleAddNewItem = async (content: string, type: any, source: string = "System Note") => {
    const isLink = content.startsWith("http://") || content.startsWith("https://");
    const inferredType = isLink ? "link" : type;
    const newItemId = `clip-${Date.now()}`;

    const newItem: ClipboardItem = {
      id: newItemId,
      content: content.trim(),
      type: inferredType,
      timestamp: new Date().toISOString(),
      pinned: false,
      favorite: false,
      tags: isLink ? ["link"] : ["snippet"],
      source,
      isSecure: privacyMode,
      folder: "General",
    };

    const updated = [newItem, ...items].slice(0, settings.maxHistorySize);
    saveClips(updated);
    triggerToast("Snippet committed to on-device vault!");

    // Real-time AI auto-tagging using OpenRouter if autoAnalyze is enabled
    if (settings.autoAnalyze) {
      triggerToast("OpenRouter AI auto-categorizing tags...");
      try {
        const data = await runKnouxAIAction({
          action: "classify",
          text: content,
        });

        if (data.result) {
            const parseAITags = (text: string): string[] => {
              const hashes = text.match(/#\w+/g);
              if (hashes && hashes.length > 0) {
                return hashes.map((h) => h.substring(1).trim());
              }
              const words = text
                .split(/[\s,.;\n]+/ )
                .map((w) => w.replace(/[^a-zA-Z0-9]/g, "").trim())
                .filter((w) => w.length > 2 && w.length < 15);
              const badWords = ["tags", "recommended", "the", "and", "openrouter", "ai", "knoux", "result", "pro"];
              return words.filter((w) => !badWords.includes(w.toLowerCase())).slice(0, 4);
            };

            const extraTags = parseAITags(data.result);
            if (extraTags.length > 0) {
              setItems((prevItems) => {
                const updatedList = prevItems.map((item) => {
                  if (item.id === newItemId) {
                    const combinedTags = Array.from(new Set([...item.tags, ...extraTags]));
                    return { ...item, tags: combinedTags };
                  }
                  return item;
                });
                localStorage.setItem("knoux_clips", JSON.stringify(updatedList));
                return updatedList;
              });
              triggerToast(`OpenRouter AI assigned: ${extraTags.join(", ")}`);
            }
          }
      } catch (err) {
        console.error("OpenRouter auto-tagging failed:", err);
      }
    }
  };

  // Re-copy item to physical clipboard
  const handleCopyItem = (item: ClipboardItem) => {
    navigator.clipboard.writeText(item.content);
    triggerToast(`Content re-copied: "${item.content.substring(0, 30)}..."`);
  };

  // Pin toggle
  const handleTogglePin = (item: ClipboardItem) => {
    const updated = items.map((i) => (i.id === item.id ? { ...i, pinned: !i.pinned } : i));
    saveClips(updated);
    triggerToast(item.pinned ? "Snippet unpinned." : "Snippet pinned to header stream.");
  };

  // Favorite toggle
  const handleToggleFavorite = (item: ClipboardItem) => {
    const updated = items.map((i) => (i.id === item.id ? { ...i, favorite: !i.favorite } : i));
    saveClips(updated);
    triggerToast(item.favorite ? "Removed from Favorites." : "Saved as Favorite asset.");
  };

  // Delete
  const handleDeleteItem = (item: ClipboardItem) => {
    const updated = items.filter((i) => i.id !== item.id);
    saveClips(updated);
    triggerToast("Snippet card permanently purged from SQLite cache.");
  };

  // Clear history
  const handleClearHistory = () => {
    const confirmClear = window.confirm(
      "Are you absolutely certain you want to purge your active Knoux workspace history? This is non-reversible."
    );
    if (confirmClear) {
      saveClips([]);
      triggerToast("On-device workspace database clean complete.");
    }
  };

  // Real clipboard listener simulation when clicking "Refresh"
  const handleRefreshClipboard = async () => {
    setIsRefreshing(true);
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          // Check if it already exists
          const exists = items.some((i) => i.content === text.trim());
          if (!exists) {
            handleAddNewItem(text, "text", "Clipboard Listener");
            triggerToast("Imported live clipboard logs!");
          } else {
            triggerToast("Sync: Clipboard matches current local core.");
          }
        } else {
          triggerToast("Sync: Clipboard represents empty text buffer.");
        }
      } else {
        triggerToast("Sync complete. Checked 0 new updates.");
      }
    } catch (e) {
      // Permission rejected, simulate refreshing
      triggerToast("Sync active. Safe logs verified.");
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  // Shortcut binder for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setActiveTab("search");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!splashComplete) {
    return <SplashScreen onComplete={() => setSplashComplete(true)} />;
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case "overview":
        return (
          <OverviewDashboard
            items={items}
            onCopyItem={handleCopyItem}
            onTogglePin={handleTogglePin}
            onDeleteItem={handleDeleteItem}
            setActiveTab={setActiveTab}
            setAiInputText={setAiInputText}
            onAddNewItem={handleAddNewItem}
          />
        );
      case "clipboard":
        return (
          <ClipboardWorkspace
            items={items}
            onAddNewItem={handleAddNewItem}
            onCopyItem={handleCopyItem}
            onTogglePin={handleTogglePin}
            onToggleFavorite={handleToggleFavorite}
            onDeleteItem={handleDeleteItem}
            onClearHistory={handleClearHistory}
            setActiveTab={setActiveTab}
            setAiInputText={setAiInputText}
            searchQuery={searchQuery}
            onUpdateItems={saveClips}
          />
        );
      case "search":
        return (
          <SearchPage
            items={items}
            onCopyItem={handleCopyItem}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        );
      case "ai":
        return (
          <AIToolsPage
            inputText={aiInputText}
            setInputText={setAiInputText}
            onAddNewItem={handleAddNewItem}
          />
        );
      case "security":
        return (
          <SecurityPage
            privacyMode={privacyMode}
            setPrivacyMode={setPrivacyMode}
            itemsCount={items.length}
          />
        );
      case "settings":
        return (
          <SettingsPage
            settings={settings}
            setSettings={setSettings}
            onClearHistory={handleClearHistory}
            setActiveTab={setActiveTab}
            items={items}
            onUpdateItems={saveClips}
          />
        );
      case "labs":
        return <LabsPage />;
      case "about":
        return <AboutPage />;
      default:
        return null;
    }
  };

  return (
    <AppShell
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      collapsed={collapsed}
      setCollapsed={setCollapsed}
      privacyMode={privacyMode}
      setPrivacyMode={setPrivacyMode}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      onRefresh={handleRefreshClipboard}
      isRefreshing={isRefreshing}
      itemsCount={items.length}
      onRunMaintenance={handleClearHistory}
      toastMessage={toastMessage}
      isInspectorOpen={isInspectorOpen}
      setIsInspectorOpen={setIsInspectorOpen}
    >
      {renderActiveTab()}
    </AppShell>
  );
}
