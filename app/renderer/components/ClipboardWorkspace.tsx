/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from "react";
import { ClipboardItem, ClipboardType, NavTab } from "../types";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText,
  Code,
  Link2,
  StickyNote,
  Image,
  Pin,
  Trash2,
  Copy,
  Plus,
  Lock,
  Unlock,
  Sparkles,
  Search,
  Eye,
  EyeOff,
  Star,
  Download,
  Calendar,
  X,
  PlusCircle,
  Folder,
  FolderPlus,
  FolderMinus,
  CheckSquare,
  Briefcase,
  Wifi,
  WifiOff,
  Scissors,
} from "lucide-react";
import {
  buildDailySummary,
  CLIENT_SERVICE_CARDS,
  cleanText,
  DEFAULT_COLLECTIONS,
  duplicateSummary,
  exportCsvFile,
  exportJsonFile,
  extractEntities,
  groupClipsByDate,
  isElectronRuntime,
  removeDuplicates,
  STATIC_TEMPLATES,
} from "../services/clientClipboardServices";
import { detectSensitiveTypes } from "../services/runtimeServices";

interface ClipboardWorkspaceProps {
  items: ClipboardItem[];
  onAddNewItem: (content: string, type: ClipboardType, source?: string) => void;
  onCopyItem: (item: ClipboardItem) => void;
  onTogglePin: (item: ClipboardItem) => void;
  onToggleFavorite: (item: ClipboardItem) => void;
  onDeleteItem: (item: ClipboardItem) => void;
  onClearHistory: () => void;
  setActiveTab: (tab: NavTab) => void;
  setAiInputText: (text: string) => void;
  searchQuery: string;
  onUpdateItems: (items: ClipboardItem[]) => void;
}

export default function ClipboardWorkspace({
  items,
  onAddNewItem,
  onCopyItem,
  onTogglePin,
  onToggleFavorite,
  onDeleteItem,
  onClearHistory,
  setActiveTab,
  setAiInputText,
  searchQuery,
  onUpdateItems,
}: ClipboardWorkspaceProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<ClipboardItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newType, setNewType] = useState<ClipboardType>("text");
  const [revealedSecureId, setRevealedSecureId] = useState<string | null>(null);
  const [businessMode, setBusinessMode] = useState("All");
  const [serviceNotice, setServiceNotice] = useState("Local vault ready.");

  // Folders State
  const [folders, setFolders] = useState<string[]>(() => {
    const saved = localStorage.getItem("knoux_folders");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return ["General", "Work", "Personal", "Code Scripts"];
      }
    }
    return ["General", ...DEFAULT_COLLECTIONS, "Code Scripts"];
  });
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [newFolderName, setNewFolderName] = useState("");

  // Multi-Select State
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const grouped = useMemo(() => groupClipsByDate(items), [items]);
  const duplicates = useMemo(() => duplicateSummary(items), [items]);
  const daily = useMemo(() => buildDailySummary(items), [items]);
  const runtimeLabel = isElectronRuntime()
    ? "Electron Runtime"
    : navigator.onLine
      ? "Web Limited Runtime"
      : "Offline";
  const providerLabel = "AI Provider Missing until OpenRouter check passes";

  const saveFolders = (newFolders: string[]) => {
    setFolders(newFolders);
    localStorage.setItem("knoux_folders", JSON.stringify(newFolders));
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newFolderName.trim();
    if (!name) return;
    if (folders.includes(name)) {
      alert("This folder collection already exists!");
      return;
    }
    const updated = [...folders, name];
    saveFolders(updated);
    setNewFolderName("");
  };

  const handleDeleteFolder = (folderName: string) => {
    if (folderName === "General") return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the folder "${folderName}"? All contained snippets will be moved back to "General".`
    );
    if (confirmDelete) {
      const updatedFolders = folders.filter((f) => f !== folderName);
      saveFolders(updatedFolders);
      const updatedItems = items.map((item) => {
        if (item.folder === folderName) {
          return { ...item, folder: "General" };
        }
        return item;
      });
      onUpdateItems(updatedItems);
      if (selectedFolder === folderName) {
        setSelectedFolder("all");
      }
      if (selectedItem && selectedItem.folder === folderName) {
        setSelectedItem({ ...selectedItem, folder: "General" });
      }
    }
  };

  const handleMoveItemToFolder = (itemId: string, folderName: string) => {
    const updatedItems = items.map((item) => {
      if (item.id === itemId) {
        return { ...item, folder: folderName };
      }
      return item;
    });
    onUpdateItems(updatedItems);
    if (selectedItem && selectedItem.id === itemId) {
      setSelectedItem({ ...selectedItem, folder: folderName });
    }
  };

  // Bulk Handlers
  const handleSelectAll = () => {
    if (selectedItemIds.size === filteredItems.length) {
      setSelectedItemIds(new Set());
    } else {
      setSelectedItemIds(new Set(filteredItems.map((i) => i.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedItemIds.size === 0) return;
    const confirmDelete = window.confirm(
      `Are you absolutely certain you want to purge ${selectedItemIds.size} selected items?`
    );
    if (confirmDelete) {
      const remainingItems = items.filter((item) => !selectedItemIds.has(item.id));
      onUpdateItems(remainingItems);
      setSelectedItemIds(new Set());
      if (selectedItem && selectedItemIds.has(selectedItem.id)) {
        setSelectedItem(null);
      }
    }
  };

  const handleBulkAddTag = (tag: string) => {
    if (selectedItemIds.size === 0 || !tag.trim()) return;
    const cleanTag = tag.trim().toLowerCase();
    const updatedItems = items.map((item) => {
      if (selectedItemIds.has(item.id)) {
        const combined = Array.from(new Set([...item.tags, cleanTag]));
        return { ...item, tags: combined };
      }
      return item;
    });
    onUpdateItems(updatedItems);
    if (selectedItem && selectedItemIds.has(selectedItem.id)) {
      setSelectedItem({
        ...selectedItem,
        tags: Array.from(new Set([...selectedItem.tags, cleanTag])),
      });
    }
  };

  const handleBulkMoveToFolder = (folderName: string) => {
    if (selectedItemIds.size === 0 || !folderName) return;
    const updatedItems = items.map((item) => {
      if (selectedItemIds.has(item.id)) {
        return { ...item, folder: folderName };
      }
      return item;
    });
    onUpdateItems(updatedItems);
    if (selectedItem && selectedItemIds.has(selectedItem.id)) {
      setSelectedItem({ ...selectedItem, folder: folderName });
    }
    setSelectedItemIds(new Set());
  };

  const handleBulkPin = (pinValue: boolean) => {
    if (selectedItemIds.size === 0) return;
    const updatedItems = items.map((item) => {
      if (selectedItemIds.has(item.id)) {
        return { ...item, pinned: pinValue };
      }
      return item;
    });
    onUpdateItems(updatedItems);
    setSelectedItemIds(new Set());
  };

  const handleBulkExport = () => {
    if (selectedItemIds.size === 0) return;
    const selectedList = items.filter((item) => selectedItemIds.has(item.id));
    const dataStr = JSON.stringify(selectedList, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = "knoux-selected-clips-export.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const handleCleanSelected = () => {
    if (!selectedItem) {
      setServiceNotice("Select a clip before cleaning text.");
      return;
    }
    const cleaned = cleanText(selectedItem.content);
    onAddNewItem(cleaned, selectedItem.type, "Smart Text Cleaner");
    setServiceNotice("Cleaned copy saved to the local vault.");
  };

  const handleExtractSelected = () => {
    if (!selectedItem) {
      setServiceNotice("Select a clip before extracting entities.");
      return;
    }
    const entities = extractEntities(selectedItem.content);
    const lines = [
      "Extracted entities",
      `Emails: ${entities.emails.join(", ") || "none"}`,
      `Phones: ${entities.phones.join(", ") || "none"}`,
      `URLs: ${entities.urls.join(", ") || "none"}`,
      `Possible addresses: ${entities.possibleAddresses.join(" | ") || "none"}`,
    ];
    onAddNewItem(lines.join("\n"), "note", "Entity Extractor");
    setServiceNotice("Extraction result saved. No remote metadata was fetched.");
  };

  const handleRemoveDuplicates = () => {
    const cleaned = removeDuplicates(items);
    onUpdateItems(cleaned);
    setServiceNotice(`Removed ${items.length - cleaned.length} duplicate unpinned clips.`);
  };

  const handleTemplate = (content: string, label: string) => {
    onAddNewItem(content, "note", `Template: ${label}`);
    setServiceNotice(`${label} saved as a copy template.`);
  };

  const handleExportCsv = () => {
    exportCsvFile("knoux-visible-clips.csv", filteredItems);
    setServiceNotice("Visible clip list exported as CSV.");
  };

  const handleExportJson = () => {
    exportJsonFile("knoux-clipboard-vault.json", { exportedAt: new Date().toISOString(), items });
    setServiceNotice("Local clipboard vault exported as JSON.");
  };

  const handleCardClick = (item: ClipboardItem) => {
    if (isMultiSelect) {
      const next = new Set(selectedItemIds);
      if (next.has(item.id)) {
        next.delete(item.id);
      } else {
        next.add(item.id);
      }
      setSelectedItemIds(next);
    } else {
      setSelectedItem(item);
    }
  };

  // Filter Chips logic
  const filterChips = [
    { id: "all", label: "All Clips", icon: FileText },
    { id: "text", label: "Plain Text", icon: FileText },
    { id: "code", label: "Code Blocks", icon: Code },
    { id: "link", label: "Hyperlinks", icon: Link2 },
    { id: "note", label: "Custom Notes", icon: StickyNote },
    { id: "pinned", label: "Pinned", icon: Pin },
    { id: "favorite", label: "Favorites", icon: Star },
    { id: "secure", label: "Secure Vault", icon: Lock },
    { id: "ai", label: "AI Processed", icon: Sparkles },
  ];

  const filteredItems = items.filter((item) => {
    // Folder filter integration
    const inFolder = selectedFolder === "all" || (item.folder || "General") === selectedFolder;
    if (!inFolder) return false;

    if (businessMode === "Developer" && item.type !== "code" && !item.tags.includes("code")) return false;
    if (businessMode === "Office" && item.type === "code") return false;
    if (businessMode === "Customer Support" && !(item.tags.includes("email") || item.tags.includes("reply") || (item.folder || "").includes("Replies"))) return false;
    if (businessMode === "E-commerce" && !(item.tags.includes("invoice") || item.tags.includes("tracking") || (item.folder || "").includes("Shipping"))) return false;
    if (businessMode === "Personal" && (item.folder || "General") !== "Personal") return false;

    // 1. Text search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const contentMatch = item.content.toLowerCase().includes(query);
      const tagMatch = item.tags.some((t) => t.toLowerCase().includes(query));
      if (!contentMatch && !tagMatch) return false;
    }

    // 2. Tab selection filter
    if (selectedFilter === "all") return true;
    if (selectedFilter === "pinned") return item.pinned;
    if (selectedFilter === "favorite") return item.favorite;
    if (selectedFilter === "secure") return item.isSecure;
    if (selectedFilter === "ai") return !!item.aiSummarized;
    return item.type === selectedFilter;
  });

  const handleCreateSnippet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    onAddNewItem(newContent, newType, "System Note");
    setNewContent("");
    setIsAddingNew(false);
  };

  const handleExportHistory = () => {
    const dataStr = JSON.stringify(items, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = "knoux-clipboard-backup.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const toggleRevealSecure = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRevealedSecureId(revealedSecureId === id ? null : id);
  };

  const handleSendToAI = (item: ClipboardItem) => {
    setAiInputText(item.content);
    setActiveTab("ai");
  };

  const getTypeIcon = (type: ClipboardType) => {
    switch (type) {
      case "code":
        return <Code className="w-4 h-4 text-knoux-purple" />;
      case "link":
        return <Link2 className="w-4 h-4 text-blue-500" />;
      case "image":
        return <Image className="w-4 h-4 text-emerald-500" />;
      case "note":
        return <StickyNote className="w-4 h-4 text-amber-500" />;
      default:
        return <FileText className="w-4 h-4 text-knoux-purple" />;
    }
  };

  return (
    <div id="clipboard-workspace-root" className="h-[calc(100vh-64px)] flex flex-col select-none">
      <div className="px-4 pt-4 bg-transparent">
        <div className="knoux-section p-4 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 knoux-badge knoux-badge-active"><Briefcase className="w-3 h-3" /> Client services active</div>
              <h2 className="mt-2 text-lg font-black text-knoux-dark-text">Smart Clipboard Inbox</h2>
              <p className="text-xs text-knoux-muted-text">Today {grouped.Today.length} · Yesterday {grouped.Yesterday.length} · This Week {grouped["This Week"].length} · Older {grouped.Older.length}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-black">
              <span className={`knoux-badge ${navigator.onLine ? "knoux-badge-active" : "knoux-badge-guarded"}`}>{navigator.onLine ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}{runtimeLabel}</span>
              <span className="knoux-badge knoux-badge-ready">{providerLabel}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Today", value: daily.clips },
              { label: "Sensitive", value: daily.sensitive },
              { label: "Pinned", value: daily.pinned },
              { label: "Duplicates", value: duplicates.duplicateCount },
            ].map((metric) => (
              <div key={metric.label} className="knoux-premium-card p-3">
                <div className="text-[10px] text-knoux-muted-text font-black uppercase">{metric.label}</div>
                <div className="text-xl font-black text-knoux-dark-text font-mono">{metric.value}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {["All", "Developer", "Office", "Customer Support", "E-commerce", "Personal"].map((mode) => (
              <button key={mode} onClick={() => setBusinessMode(mode)} className={`px-3 py-2 rounded-xl text-xs font-black border transition ${businessMode === mode ? "bg-knoux-purple text-white border-knoux-purple" : "bg-white/60 text-knoux-dark-text border-knoux-purple/10 hover:border-knoux-purple/30"}`}>
                {mode}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-2">
            <button onClick={handleCleanSelected} className="btn-knoux-secondary h-10 text-xs px-3"><Scissors className="w-4 h-4" /> Clean Text</button>
            <button onClick={handleExtractSelected} className="btn-knoux-secondary h-10 text-xs px-3"><Search className="w-4 h-4" /> Extract</button>
            <button onClick={handleRemoveDuplicates} disabled={duplicates.duplicateCount === 0} className="btn-knoux-secondary h-10 text-xs px-3"><Trash2 className="w-4 h-4" /> Dedupe</button>
            <button onClick={handleExportJson} className="btn-knoux-secondary h-10 text-xs px-3"><Download className="w-4 h-4" /> JSON</button>
            <button onClick={handleExportCsv} className="btn-knoux-secondary h-10 text-xs px-3"><Download className="w-4 h-4" /> CSV</button>
            <button onClick={() => setActiveTab("ai")} className="btn-knoux-secondary h-10 text-xs px-3"><Sparkles className="w-4 h-4" /> AI Guarded</button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            <div className="knoux-premium-card p-3">
              <div className="text-[10px] text-knoux-muted-text font-black uppercase mb-2">One-click templates</div>
              <div className="flex flex-wrap gap-2">
                {STATIC_TEMPLATES.map((template) => (
                  <button key={template.id} onClick={() => handleTemplate(template.content, template.label)} className="px-2.5 py-1.5 rounded-lg border border-knoux-purple/10 bg-white/60 text-[10px] text-knoux-dark-text font-bold hover:text-knoux-purple">
                    {template.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="knoux-premium-card p-3">
              <div className="text-[10px] text-knoux-muted-text font-black uppercase mb-2">Service card status</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-28 overflow-y-auto pr-1">
                {CLIENT_SERVICE_CARDS.slice(0, 10).map((service) => (
                  <div key={service.id} className="flex items-center justify-between gap-2 text-[10px]">
                    <span className="text-knoux-dark-text font-bold truncate">{service.displayName}</span>
                    <span className={`knoux-badge knoux-badge-${service.status.toLowerCase()}`}>{service.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="text-[11px] text-knoux-muted-text font-semibold">{serviceNotice}</p>
        </div>
      </div>
      {/* Top filter toolbar and custom creator button */}
      <div className="p-4 border-b border-knoux-purple/10 bg-white/40 backdrop-blur-sm shrink-0 flex flex-wrap items-center justify-between gap-3">
        {/* Horizontal scrollable Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 max-w-full">
          {filterChips.map((chip) => {
            const Icon = chip.icon;
            const isSelected = selectedFilter === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => {
                  setSelectedFilter(chip.id);
                  setSelectedItem(null);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-knoux-purple text-white shadow-knoux-glow"
                    : "bg-white border border-knoux-purple/5 hover:border-knoux-purple/20 text-knoux-muted-text hover:text-knoux-dark-text"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>

        {/* Action button pack */}
        <div className="flex items-center gap-2">
          {/* Multi-Select Toggle */}
          <button
            onClick={() => {
              setIsMultiSelect(!isMultiSelect);
              setSelectedItemIds(new Set());
            }}
            className={`h-8 px-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1.5 ${
              isMultiSelect
                ? "border-knoux-purple bg-knoux-purple text-white hover:brightness-110"
                : "border-knoux-purple/10 bg-white hover:bg-knoux-purple/5 text-knoux-muted-text hover:text-knoux-purple"
            }`}
            title="Toggle batch multi-select operations mode"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Select Mode</span>
          </button>

          {/* Create custom snippet */}
          <button
            onClick={() => setIsAddingNew(!isAddingNew)}
            className="h-8 px-3 rounded-lg bg-gradient-to-tr from-knoux-purple to-knoux-neon text-white text-xs font-bold flex items-center gap-1 hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Snippet</span>
          </button>

          {/* Backup */}
          <button
            onClick={handleExportHistory}
            title="Backup Local Database"
            className="h-8 px-2.5 rounded-lg border border-knoux-purple/5 bg-white hover:bg-knoux-purple/5 text-knoux-muted-text hover:text-knoux-purple text-xs font-semibold transition-all cursor-pointer shadow-sm flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Clear history */}
          <button
            onClick={onClearHistory}
            className="h-8 px-2.5 rounded-lg border border-red-100 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            Clear Hub
          </button>
        </div>
      </div>

      {/* Main split dashboard pane */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Folder Directory Sidebar */}
        <div className="w-56 border-r border-knoux-purple/10 bg-white/45 backdrop-blur-sm p-4 flex flex-col justify-between shrink-0 hidden md:flex">
          <div className="space-y-4 overflow-y-auto max-h-[75%] select-none">
            <div className="flex items-center justify-between pb-1.5 border-b border-knoux-purple/5">
              <span className="text-[10px] font-extrabold text-knoux-dark-text tracking-wider uppercase flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-knoux-purple" /> Collections
              </span>
            </div>

            {/* List of folders */}
            <div className="space-y-1">
              {/* 'All folders' option */}
              <button
                type="button"
                onClick={() => {
                  setSelectedFolder("all");
                  setSelectedItem(null);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedFolder === "all"
                    ? "bg-knoux-purple/10 text-knoux-purple font-extrabold"
                    : "text-knoux-muted-text hover:bg-knoux-purple/5 hover:text-knoux-dark-text"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Folder className="w-3.5 h-3.5" />
                  <span>All Clips</span>
                </div>
                <span className="text-[10px] bg-knoux-purple/5 px-1.5 py-0.5 rounded font-mono text-knoux-purple">
                  {items.length}
                </span>
              </button>

              {folders.map((folder) => {
                const count = items.filter((i) => (i.folder || "General") === folder).length;
                const isSelected = selectedFolder === folder;
                return (
                  <div key={folder} className="group/folder flex items-center justify-between gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFolder(folder);
                        setSelectedItem(null);
                      }}
                      className={`flex-1 flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer truncate ${
                        isSelected
                          ? "bg-knoux-purple/10 text-knoux-purple font-extrabold"
                          : "text-knoux-muted-text hover:bg-knoux-purple/5 hover:text-knoux-dark-text"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Folder className={`w-3.5 h-3.5 ${isSelected ? "text-knoux-purple" : "text-knoux-muted-text/75"}`} />
                        <span className="truncate">{folder}</span>
                      </div>
                      <span className="text-[10px] bg-knoux-purple/5 px-1.5 py-0.5 rounded font-mono text-knoux-purple shrink-0 ml-1">
                        {count}
                      </span>
                    </button>

                    {/* Delete custom folder (if not 'General') */}
                    {folder !== "General" && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFolder(folder);
                        }}
                        className="p-1 rounded opacity-0 group-hover/folder:opacity-100 text-red-400 hover:text-red-600 hover:bg-red-50 transition-all shrink-0 ml-1 cursor-pointer"
                        title={`Delete folder ${folder}`}
                      >
                        <FolderMinus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Create new folder input */}
          <form onSubmit={handleCreateFolder} className="space-y-2 pt-4 border-t border-knoux-purple/5 mt-2">
            <label className="text-[9px] font-bold text-knoux-muted-text uppercase tracking-wider block">
              New Collection
            </label>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name..."
                className="flex-1 min-w-0 h-8 px-2.5 rounded-lg border border-knoux-purple/10 bg-white/60 text-xs text-knoux-dark-text outline-none focus:border-knoux-purple focus:ring-2 focus:ring-knoux-purple/5 font-medium"
              />
              <button
                type="submit"
                className="w-8 h-8 rounded-lg bg-knoux-purple text-white hover:bg-knoux-deep-purple transition-all flex items-center justify-center cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>

        {/* Left pane: Clipboard Cards streaming */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FCFAFF]">
          
          {/* Multi-Select Batch Operations Control Bar */}
          {isMultiSelect && (
            <div className="p-3 bg-gradient-to-tr from-white to-[#F7F2FF] border border-knoux-purple/15 rounded-2xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shrink-0 mb-3 shadow-sm">
              <div className="flex items-center justify-between lg:justify-start gap-3 border-b lg:border-b-0 pb-2 lg:pb-0 border-knoux-purple/5">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs font-bold text-knoux-purple hover:text-knoux-deep-purple flex items-center gap-1 cursor-pointer bg-knoux-purple/5 px-2.5 py-1.5 rounded-lg border border-knoux-purple/5"
                >
                  {selectedItemIds.size === filteredItems.length ? "Deselect All" : "Select All"}
                </button>
                <span className="text-xs text-knoux-muted-text font-semibold font-mono">
                  Selected: <strong className="text-knoux-purple font-extrabold">{selectedItemIds.size}</strong> / {filteredItems.length}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Bulk Tag addition */}
                <div className="flex items-center gap-1 border border-knoux-purple/10 bg-white rounded-lg p-1">
                  <input
                    type="text"
                    placeholder="Bulk tag..."
                    id="bulk-tag-input"
                    className="w-16 sm:w-20 px-1 text-[11px] outline-none text-knoux-dark-text font-semibold font-mono"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const tag = (e.target as HTMLInputElement).value.trim();
                        if (tag) {
                          handleBulkAddTag(tag);
                          (e.target as HTMLInputElement).value = "";
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById("bulk-tag-input") as HTMLInputElement;
                      const tag = input?.value.trim();
                      if (tag) {
                        handleBulkAddTag(tag);
                        input.value = "";
                      }
                    }}
                    className="text-[9px] bg-knoux-purple text-white px-2 py-0.5 rounded font-bold hover:bg-knoux-deep-purple transition-all cursor-pointer uppercase"
                  >
                    Add
                  </button>
                </div>

                {/* Bulk Move selection */}
                <select
                  onChange={(e) => {
                    const f = e.target.value;
                    if (f) {
                      handleBulkMoveToFolder(f);
                      e.target.value = "";
                    }
                  }}
                  className="h-7 rounded-lg border border-knoux-purple/10 bg-white px-2 text-[11px] text-knoux-muted-text font-bold outline-none cursor-pointer"
                >
                  <option value="">Move to Collection...</option>
                  {folders.map((f) => (
                    <option key={f} value={f}>
                      📁 {f}
                    </option>
                  ))}
                </select>

                {/* Bulk Pin */}
                <button
                  type="button"
                  onClick={() => handleBulkPin(true)}
                  title="Pin selected clips"
                  className="h-7 px-2.5 rounded-lg border border-knoux-purple/10 bg-white hover:bg-knoux-purple/5 text-knoux-purple text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Pin className="w-3 h-3 text-knoux-purple" />
                  <span>Pin</span>
                </button>

                {/* Bulk Unpin */}
                <button
                  type="button"
                  onClick={() => handleBulkPin(false)}
                  title="Unpin selected clips"
                  className="h-7 px-2.5 rounded-lg border border-knoux-purple/10 bg-white hover:bg-knoux-purple/5 text-knoux-muted-text text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Pin className="w-3 h-3 text-knoux-muted-text rotate-45" />
                  <span>Unpin</span>
                </button>

                {/* Bulk Export */}
                <button
                  type="button"
                  onClick={handleBulkExport}
                  title="Export selected snippets as backup JSON"
                  className="h-7 px-2.5 rounded-lg border border-knoux-purple/10 bg-white hover:bg-knoux-purple/5 text-knoux-purple text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>Export</span>
                </button>

                {/* Bulk Delete */}
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  className="h-7 px-2.5 rounded-lg border border-red-100 bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          )}
          {/* Custom snippet addition drawer overlay */}
          <AnimatePresence>
            {isAddingNew && (
              <motion.form
                onSubmit={handleCreateSnippet}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 rounded-2xl border border-knoux-purple/10 bg-white shadow-knoux-glow space-y-3 overflow-hidden shrink-0"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-knoux-dark-text tracking-tight uppercase flex items-center gap-1">
                    <PlusCircle className="w-4 h-4 text-knoux-purple" /> Create Custom Snippet Card
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(false)}
                    className="p-1 rounded hover:bg-knoux-purple/5 text-knoux-muted-text"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-knoux-muted-text font-bold uppercase tracking-wider block mb-1">Snippet Content</label>
                    <textarea
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      placeholder="Type note content, paste links, custom commands, or scripts..."
                      rows={3}
                      className="w-full p-2.5 rounded-xl border border-knoux-purple/10 bg-[#FCFAFF] focus:bg-white text-xs text-knoux-dark-text outline-none focus:border-knoux-purple focus:ring-4 focus:ring-knoux-purple/5 transition-all font-mono"
                    />
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] text-knoux-muted-text font-bold uppercase tracking-wider block mb-1">Type Designation</label>
                      <select
                        value={newType}
                        onChange={(e) => setNewType(e.target.value as ClipboardType)}
                        className="w-full h-9 rounded-xl border border-knoux-purple/10 bg-[#FCFAFF] px-2 text-xs text-knoux-dark-text focus:border-knoux-purple outline-none"
                      >
                        <option value="text">Plain Text</option>
                        <option value="code">Code Block</option>
                        <option value="link">Hyperlink</option>
                        <option value="note">System Note</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full h-9 rounded-xl bg-knoux-purple text-white text-xs font-bold hover:bg-knoux-deep-purple transition-all cursor-pointer"
                    >
                      Save to Local Vault
                    </button>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Clipboard card stream list */}
          {filteredItems.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-8 border border-dashed border-knoux-purple/15 rounded-2xl bg-white/40">
              <FileText className="w-10 h-10 text-knoux-purple/30 mb-2" />
              <span className="text-xs font-bold text-knoux-dark-text">No records found matching filters</span>
              <p className="text-[10px] text-knoux-muted-text mt-1 max-w-xs">
                Modify search parameters or click "New Snippet" above to add records directly.
              </p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {filteredItems.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                const isSecureHidden = item.isSecure && revealedSecureId !== item.id;
                const isChecked = selectedItemIds.has(item.id);

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 450, damping: 38 }}
                    key={item.id}
                    onClick={() => handleCardClick(item)}
                    layoutId={`clip-card-${item.id}`}
                    className={`p-4 rounded-2xl bg-white border cursor-pointer group flex items-start justify-between gap-4 knoux-card-hover ${
                      isSelected
                        ? "border-knoux-purple shadow-sm ring-4 ring-knoux-purple/5"
                        : "border-knoux-purple/5 shadow-sm"
                    } ${item.pinned ? "bg-gradient-to-r from-knoux-purple/5 via-white to-white" : ""}`}
                  >
                    {/* Custom checkbox UI for Multi-select */}
                    {isMultiSelect && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(item);
                        }}
                        className="pt-1 select-none shrink-0"
                      >
                        {isChecked ? (
                          <div className="w-4 h-4 rounded border-2 border-knoux-purple bg-knoux-purple flex items-center justify-center text-white scale-110 transition-transform">
                            <svg className="w-3 h-3 stroke-current stroke-[3.5] fill-none" viewBox="0 0 24 24">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded border-2 border-knoux-purple/20 hover:border-knoux-purple bg-white transition-colors" />
                        )}
                      </div>
                    )}

                    <div className="space-y-2 overflow-hidden flex-1">
                      {/* Badge headers */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-knoux-purple uppercase bg-knoux-purple/5 px-2 py-0.5 rounded-md shrink-0">
                          {getTypeIcon(item.type)}
                          <span>{item.type}</span>
                        </div>

                        {item.pinned && (
                          <span className="text-[10px] font-extrabold text-knoux-neon bg-knoux-neon/5 border border-knoux-neon/10 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                            <Pin className="w-2.5 h-2.5" /> Pinned
                          </span>
                        )}

                  {item.isSecure && (
                          <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" /> Secure Vault
                      </span>
                    )}

                        {detectSensitiveTypes(item.content).length > 0 && (
                          <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                            <Lock className="w-2.5 h-2.5" /> AI Guarded
                          </span>
                        )}

                        {item.aiSummarized && (
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5 animate-pulse" /> AI Analyzed
                          </span>
                        )}

                        <span className="text-[10px] text-knoux-muted-text/50 font-mono hidden sm:inline">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        </span>
                      </div>

                      {/* Clipboard actual snippet text */}
                      <p className={`text-xs text-knoux-dark-text/90 font-mono leading-relaxed truncate-2-lines break-all ${isSecureHidden ? "filter blur-sm select-none opacity-40" : ""}`}>
                        {isSecureHidden
                          ? "************************************************************************"
                          : item.content}
                      </p>

                      {/* Metadata indicators */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-[10px] text-knoux-muted-text/70 bg-[#FCFAFF] border border-knoux-purple/5 px-1.5 py-0.5 rounded font-mono">
                          Src: {item.source}
                        </span>
                        {item.folder && item.folder !== "General" && (
                          <span className="text-[10px] text-knoux-purple bg-knoux-purple/5 px-1.5 py-0.5 rounded font-bold flex items-center gap-1 border border-knoux-purple/5">
                            <Folder className="w-3 h-3" /> {item.folder}
                          </span>
                        )}
                        {item.tags.map((tag) => (
                          <span key={tag} className="text-[9px] text-knoux-purple bg-knoux-purple/5 px-1.5 py-0.5 rounded font-bold uppercase">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Immediate hovered buttons */}
                    <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                      {item.isSecure && (
                        <button
                          onClick={(e) => toggleRevealSecure(item.id, e)}
                          className="p-1.5 rounded-lg border border-knoux-purple/5 bg-[#FCFAFF] text-knoux-muted-text hover:text-knoux-purple transition-colors cursor-pointer"
                          title={isSecureHidden ? "Reveal Encrypted Block" : "Hide Encrypted Block"}
                        >
                          {isSecureHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCopyItem(item);
                        }}
                        className="p-1.5 rounded-lg bg-knoux-purple/5 hover:bg-knoux-purple/10 text-knoux-purple transition-all cursor-pointer shadow-sm"
                        title="Copy again"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {/* Move to Folder collection quick actions dropdown */}
                      <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={item.folder || "General"}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleMoveItemToFolder(item.id, e.target.value);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          title="Move to Collection..."
                        >
                          {folders.map((f) => (
                            <option key={f} value={f}>
                              📁 {f}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="p-1.5 rounded-lg border border-knoux-purple/5 bg-[#FCFAFF] text-knoux-muted-text hover:text-knoux-purple transition-all cursor-pointer flex items-center justify-center"
                          title="Move to Collection"
                        >
                          <Folder className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTogglePin(item);
                        }}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          item.pinned
                            ? "border-knoux-neon/20 bg-knoux-neon/5 text-knoux-neon"
                            : "border-knoux-purple/5 bg-[#FCFAFF] text-knoux-muted-text hover:text-knoux-purple"
                        }`}
                        title="Pin item"
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteItem(item);
                        }}
                        className="p-1.5 rounded-lg border border-red-100 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-colors cursor-pointer"
                        title="Delete item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Right pane: Drawer Clipboard Inspector */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              initial={{ x: 380, opacity: 0.9 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 380, opacity: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="w-80 md:w-96 border-l border-knoux-purple/10 bg-white/95 backdrop-blur-md p-5 flex flex-col justify-between overflow-y-auto shrink-0 z-10"
            >
              <div className="space-y-6">
                {/* Header title */}
                <div className="flex items-center justify-between border-b border-knoux-purple/5 pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-knoux-purple" />
                    <span className="text-xs font-extrabold text-knoux-dark-text uppercase tracking-wider">
                      Clip Inspector
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="p-1 rounded-lg hover:bg-knoux-purple/5 text-knoux-muted-text"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>

                {/* Substantive Metadata list */}
                <div className="p-3.5 rounded-xl border border-knoux-purple/5 bg-[#FCFAFF] space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-knoux-muted-text font-medium">Type Designation:</span>
                    <span className="text-knoux-dark-text font-bold uppercase">{selectedItem.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-knoux-muted-text font-medium">Origination Source:</span>
                    <span className="text-knoux-dark-text font-bold">{selectedItem.source}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-knoux-muted-text font-medium">Character Volume:</span>
                    <span className="text-knoux-dark-text font-mono font-bold">{selectedItem.content.length} chars</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-knoux-muted-text font-medium">Word metrics:</span>
                    <span className="text-knoux-dark-text font-mono font-bold">{selectedItem.content.split(/\s+/).filter(Boolean).length} words</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-knoux-muted-text font-medium">Vault lock state:</span>
                    <span className={`font-bold uppercase ${selectedItem.isSecure ? "text-emerald-600" : "text-knoux-muted-text/60"}`}>
                      {selectedItem.isSecure ? "Privacy guarded" : "Plaintext"}
                    </span>
                  </div>
                </div>

                {/* Main Content box */}
                <div className="space-y-2">
                  <label className="text-[10px] text-knoux-muted-text font-bold uppercase tracking-wider">Exact Clipboard Content</label>
                  <div className="p-4 rounded-xl border border-knoux-purple/10 bg-[#FCFAFF] font-mono text-xs text-knoux-dark-text max-h-48 overflow-y-auto whitespace-pre-wrap select-text leading-relaxed">
                    {selectedItem.content}
                  </div>
                </div>

                {/* Folder Category Assignment Selector */}
                <div className="space-y-2">
                  <label className="text-[10px] text-knoux-muted-text font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Folder className="w-3.5 h-3.5 text-knoux-purple" /> Folder Assignment
                  </label>
                  <select
                    value={selectedItem.folder || "General"}
                    onChange={(e) => handleMoveItemToFolder(selectedItem.id, e.target.value)}
                    className="w-full h-9 rounded-xl border border-knoux-purple/10 bg-[#FCFAFF] focus:bg-white px-2.5 text-xs text-knoux-dark-text outline-none focus:border-knoux-purple focus:ring-4 focus:ring-knoux-purple/5 transition-all font-semibold cursor-pointer"
                  >
                    {folders.map((f) => (
                      <option key={f} value={f}>
                        📁 {f}
                      </option>
                    ))}
                  </select>
                </div>

                {/* AI analysis metadata inside drawer */}
                {selectedItem.aiSummarized ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-600 uppercase">
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Knoux AI Insights
                    </div>
                    <div className="p-3.5 rounded-xl border border-amber-100 bg-amber-50 text-xs text-amber-900 font-medium whitespace-pre-wrap leading-relaxed">
                      {selectedItem.aiSummarized}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-knoux-purple/10 text-center space-y-2 bg-[#FCFAFF]">
                    <Sparkles className="w-5 h-5 text-knoux-purple/50 mx-auto" />
                    <span className="text-xs font-bold text-knoux-dark-text block">Untapped AI Potential</span>
                    <p className="text-[10px] text-knoux-muted-text leading-normal max-w-xs mx-auto">
                      OpenRouter AI is standing by. Click "Analyze with AI" below to evaluate semantics, summarize core bullets, or rewrite formatting.
                    </p>
                    <button
                      onClick={() => handleSendToAI(selectedItem)}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-tr from-knoux-purple to-knoux-neon text-white text-[10px] font-bold hover:brightness-110 transition-all cursor-pointer shadow-sm"
                    >
                      Send to AI Pilot
                    </button>
                  </div>
                )}
              </div>

              {/* Inspector action cluster */}
              <div className="border-t border-knoux-purple/5 pt-4 space-y-2 shrink-0">
                <button
                  onClick={() => onCopyItem(selectedItem)}
                  className="w-full h-10 rounded-xl bg-gradient-to-tr from-knoux-purple to-knoux-neon text-white text-xs font-bold flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-knoux-glow"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Clip to System Clipboard</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onToggleFavorite(selectedItem)}
                    className={`h-9 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      selectedItem.favorite
                        ? "border-amber-200 bg-amber-50 text-amber-600"
                        : "border-knoux-purple/5 bg-white text-knoux-muted-text hover:text-knoux-purple hover:bg-knoux-purple/5"
                    }`}
                  >
                    <Star className={`w-4 h-4 ${selectedItem.favorite ? "fill-amber-500 text-amber-500" : ""}`} />
                    <span>{selectedItem.favorite ? "Favorited" : "Favorite"}</span>
                  </button>

                  <button
                    onClick={() => onDeleteItem(selectedItem)}
                    className="h-9 rounded-xl border border-red-100 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Clip</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
