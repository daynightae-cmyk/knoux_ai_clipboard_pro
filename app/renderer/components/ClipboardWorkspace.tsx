import React, { useMemo, useState } from "react";
import { ClipboardItem, ClipboardType, NavTab } from "../types";
import { AnimatePresence, motion } from "motion/react";
import { Briefcase, CheckSquare, Code, Copy, Download, Eye, EyeOff, FileText, Folder, Link2, Lock, Pin, Plus, Search, Sparkles, Star, StickyNote, Trash2, X } from "lucide-react";
import { buildDailySummary, cleanText, DEFAULT_COLLECTIONS, duplicateSummary, exportCsvFile, exportJsonFile, extractEntities, groupClipsByDate, isElectronRuntime, removeDuplicates, STATIC_TEMPLATES } from "../services/clientClipboardServices";
import { detectSensitiveTypes } from "../services/runtimeServices";
import { useVirtualList } from "../hooks/useVirtualList";

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

const filters = [
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

const getTypeIcon = (type: ClipboardType) => {
  if (type === "code") return <Code className="w-4 h-4 text-knoux-purple" />;
  if (type === "link") return <Link2 className="w-4 h-4 text-blue-500" />;
  if (type === "note") return <StickyNote className="w-4 h-4 text-amber-500" />;
  return <FileText className="w-4 h-4 text-knoux-purple" />;
};

export default function ClipboardWorkspace({ items, onAddNewItem, onCopyItem, onTogglePin, onToggleFavorite, onDeleteItem, onClearHistory, setActiveTab, setAiInputText, searchQuery, onUpdateItems }: ClipboardWorkspaceProps) {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState<ClipboardItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newType, setNewType] = useState<ClipboardType>("text");
  const [revealedSecureId, setRevealedSecureId] = useState<string | null>(null);
  const [businessMode, setBusinessMode] = useState("All");
  const [serviceNotice, setServiceNotice] = useState("Local vault ready.");
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isMultiSelect, setIsMultiSelect] = useState(false);

  const folders = useMemo(() => Array.from(new Set(["General", ...DEFAULT_COLLECTIONS, ...items.map((item) => item.folder || "General")])), [items]);
  const grouped = useMemo(() => groupClipsByDate(items), [items]);
  const duplicates = useMemo(() => duplicateSummary(items), [items]);
  const daily = useMemo(() => buildDailySummary(items), [items]);
  const runtimeLabel = isElectronRuntime() ? "Electron Runtime" : navigator.onLine ? "Web Limited Runtime" : "Offline";

  const filteredItems = useMemo(() => items.filter((item) => {
    const inFolder = selectedFolder === "all" || (item.folder || "General") === selectedFolder;
    if (!inFolder) return false;
    if (businessMode === "Developer" && item.type !== "code" && !item.tags.includes("code")) return false;
    if (businessMode === "Office" && item.type === "code") return false;
    if (businessMode === "Customer Support" && !(item.tags.includes("email") || item.tags.includes("reply"))) return false;
    if (businessMode === "E-commerce" && !(item.tags.includes("invoice") || item.tags.includes("tracking"))) return false;
    if (businessMode === "Personal" && (item.folder || "General") !== "Personal") return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      if (!item.content.toLowerCase().includes(query) && !item.tags.some((tag) => tag.toLowerCase().includes(query))) return false;
    }
    if (selectedFilter === "all") return true;
    if (selectedFilter === "pinned") return item.pinned;
    if (selectedFilter === "favorite") return item.favorite;
    if (selectedFilter === "secure") return item.isSecure;
    if (selectedFilter === "ai") return !!item.aiSummarized;
    return item.type === selectedFilter;
  }), [businessMode, items, searchQuery, selectedFilter, selectedFolder]);

  const virtual = useVirtualList({ count: filteredItems.length, estimateSize: 154, overscan: 8 });

  const handleCardClick = (item: ClipboardItem) => {
    if (isMultiSelect) {
      const next = new Set(selectedIds);
      next.has(item.id) ? next.delete(item.id) : next.add(item.id);
      setSelectedIds(next);
      return;
    }
    setSelectedItem(item);
  };

  const handleCreateSnippet = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newContent.trim()) return;
    onAddNewItem(newContent, newType, "System Note");
    setNewContent("");
    setIsAddingNew(false);
  };

  const handleCleanSelected = () => {
    if (!selectedItem) { setServiceNotice("Select a clip before cleaning text."); return; }
    onAddNewItem(cleanText(selectedItem.content), selectedItem.type, "Smart Text Cleaner");
    setServiceNotice("Cleaned copy saved locally.");
  };

  const handleExtractSelected = () => {
    if (!selectedItem) { setServiceNotice("Select a clip before extracting entities."); return; }
    const entities = extractEntities(selectedItem.content);
    onAddNewItem(["Extracted entities", `Emails: ${entities.emails.join(", ") || "none"}`, `Phones: ${entities.phones.join(", ") || "none"}`, `URLs: ${entities.urls.join(", ") || "none"}`].join("\n"), "note", "Entity Extractor");
    setServiceNotice("Extraction result saved locally.");
  };

  const handleRemoveDuplicates = () => {
    const cleaned = removeDuplicates(items);
    onUpdateItems(cleaned);
    setServiceNotice(`Removed ${items.length - cleaned.length} duplicate unpinned clips.`);
  };

  const handleBulkDelete = () => {
    if (!selectedIds.size) return;
    onUpdateItems(items.filter((item) => !selectedIds.has(item.id)));
    setSelectedIds(new Set());
    setSelectedItem(null);
  };

  const handleBulkPin = (pinValue: boolean) => {
    onUpdateItems(items.map((item) => selectedIds.has(item.id) ? { ...item, pinned: pinValue } : item));
    setSelectedIds(new Set());
  };

  const handleExportJson = () => { exportJsonFile("knoux-clipboard-vault.json", { exportedAt: new Date().toISOString(), items }); setServiceNotice("Local clipboard vault exported as JSON."); };
  const handleExportCsv = () => { exportCsvFile("knoux-visible-clips.csv", filteredItems); setServiceNotice("Visible clip list exported as CSV."); };
  const handleTemplate = (content: string, label: string) => { onAddNewItem(content, "note", `Template: ${label}`); setServiceNotice(`${label} saved as a copy template.`); };
  const sendToAi = (item: ClipboardItem) => { setAiInputText(item.content); setActiveTab("ai"); };

  const renderClipCard = (item: ClipboardItem) => {
    const isSelected = selectedItem?.id === item.id;
    const isSecureHidden = item.isSecure && revealedSecureId !== item.id;
    const checked = selectedIds.has(item.id);
    return (
      <motion.div layout key={item.id} onClick={() => handleCardClick(item)} className={`p-4 rounded-2xl bg-white border cursor-pointer group flex items-start justify-between gap-4 knoux-card-hover ${isSelected ? "border-knoux-purple shadow-sm ring-4 ring-knoux-purple/5" : "border-knoux-purple/5 shadow-sm"} ${item.pinned ? "bg-gradient-to-r from-knoux-purple/5 via-white to-white" : ""}`}>
        {isMultiSelect && <div className={`mt-1 w-4 h-4 rounded border-2 ${checked ? "border-knoux-purple bg-knoux-purple" : "border-knoux-purple/20 bg-white"}`} />}
        <div className="space-y-2 overflow-hidden flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="flex items-center gap-1 text-[10px] font-bold text-knoux-purple uppercase bg-knoux-purple/5 px-2 py-0.5 rounded-md">{getTypeIcon(item.type)} {item.type}</span>
            {item.pinned && <span className="text-[10px] font-extrabold text-knoux-neon bg-knoux-neon/5 px-1.5 py-0.5 rounded-md flex items-center gap-0.5"><Pin className="w-2.5 h-2.5" /> Pinned</span>}
            {item.isSecure && <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5"><Lock className="w-2.5 h-2.5" /> Secure Vault</span>}
            {detectSensitiveTypes(item.content).length > 0 && <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md">AI Guarded</span>}
            <span className="text-[10px] text-knoux-muted-text/50 font-mono hidden sm:inline">{new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
          <p className={`text-xs text-knoux-dark-text/90 font-mono leading-relaxed line-clamp-2 break-all ${isSecureHidden ? "filter blur-sm select-none opacity-40" : ""}`}>{isSecureHidden ? "****************************************************************" : item.content}</p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[10px] text-knoux-muted-text/70 bg-[#FCFAFF] border border-knoux-purple/5 px-1.5 py-0.5 rounded font-mono">Src: {item.source}</span>
            {(item.folder || "General") !== "General" && <span className="text-[10px] text-knoux-purple bg-knoux-purple/5 px-1.5 py-0.5 rounded font-bold flex items-center gap-1"><Folder className="w-3 h-3" /> {item.folder}</span>}
            {item.tags.slice(0, 5).map((tag) => <span key={tag} className="text-[9px] text-knoux-purple bg-knoux-purple/5 px-1.5 py-0.5 rounded font-bold uppercase">{tag}</span>)}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
          {item.isSecure && <button onClick={(event) => { event.stopPropagation(); setRevealedSecureId(revealedSecureId === item.id ? null : item.id); }} className="p-1.5 rounded-lg border border-knoux-purple/5 bg-[#FCFAFF] text-knoux-muted-text hover:text-knoux-purple">{isSecureHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}</button>}
          <button onClick={(event) => { event.stopPropagation(); onCopyItem(item); }} className="p-1.5 rounded-lg bg-knoux-purple/5 hover:bg-knoux-purple/10 text-knoux-purple"><Copy className="w-3.5 h-3.5" /></button>
          <button onClick={(event) => { event.stopPropagation(); onToggleFavorite(item); }} className={`p-1.5 rounded-lg border ${item.favorite ? "border-amber-200 text-amber-500 bg-amber-50" : "border-knoux-purple/5 text-knoux-muted-text bg-[#FCFAFF]"}`}><Star className="w-3.5 h-3.5" /></button>
          <button onClick={(event) => { event.stopPropagation(); onTogglePin(item); }} className={`p-1.5 rounded-lg border ${item.pinned ? "border-knoux-neon/20 bg-knoux-neon/5 text-knoux-neon" : "border-knoux-purple/5 bg-[#FCFAFF] text-knoux-muted-text"}`}><Pin className="w-3.5 h-3.5" /></button>
          <button onClick={(event) => { event.stopPropagation(); sendToAi(item); }} className="p-1.5 rounded-lg border border-knoux-purple/5 bg-[#FCFAFF] text-knoux-purple"><Sparkles className="w-3.5 h-3.5" /></button>
          <button onClick={(event) => { event.stopPropagation(); onDeleteItem(item); }} className="p-1.5 rounded-lg border border-red-100 bg-red-50 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </motion.div>
    );
  };

  return (
    <div id="clipboard-workspace-root" className="h-[calc(100vh-64px)] flex flex-col select-none">
      <div className="px-4 pt-4 bg-transparent">
        <div className="knoux-section p-4 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div><div className="inline-flex items-center gap-2 knoux-badge knoux-badge-active"><Briefcase className="w-3 h-3" /> Client services active</div><h2 className="mt-2 text-lg font-black text-knoux-dark-text">Smart Clipboard Inbox</h2><p className="text-xs text-knoux-muted-text">Today {grouped.Today.length} · Yesterday {grouped.Yesterday.length} · This Week {grouped["This Week"].length} · Older {grouped.Older.length}</p></div>
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-black"><span className="knoux-badge knoux-badge-active">{runtimeLabel}</span><span className="knoux-badge knoux-badge-ready">Virtualized {filteredItems.length} records</span></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[{ label: "Today", value: daily.clips }, { label: "Sensitive", value: daily.sensitive }, { label: "Pinned", value: daily.pinned }, { label: "Duplicates", value: duplicates.duplicateCount }].map((metric) => <div key={metric.label} className="knoux-premium-card p-3"><div className="text-[10px] text-knoux-muted-text font-black uppercase">{metric.label}</div><div className="text-xl font-black text-knoux-dark-text font-mono">{metric.value}</div></div>)}</div>
          <div className="flex flex-wrap gap-2">{["All", "Developer", "Office", "Customer Support", "E-commerce", "Personal"].map((mode) => <button key={mode} onClick={() => setBusinessMode(mode)} className={`px-3 py-2 rounded-xl text-xs font-black border transition ${businessMode === mode ? "bg-knoux-purple text-white border-knoux-purple" : "bg-white/60 text-knoux-dark-text border-knoux-purple/10 hover:border-knoux-purple/30"}`}>{mode}</button>)}</div>
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-2"><button onClick={handleCleanSelected} className="btn-knoux-secondary h-10 text-xs px-3"><Search className="w-4 h-4" /> Clean</button><button onClick={handleExtractSelected} className="btn-knoux-secondary h-10 text-xs px-3"><Search className="w-4 h-4" /> Extract</button><button onClick={handleRemoveDuplicates} disabled={duplicates.duplicateCount === 0} className="btn-knoux-secondary h-10 text-xs px-3"><Trash2 className="w-4 h-4" /> Dedupe</button><button onClick={handleExportJson} className="btn-knoux-secondary h-10 text-xs px-3"><Download className="w-4 h-4" /> JSON</button><button onClick={handleExportCsv} className="btn-knoux-secondary h-10 text-xs px-3"><Download className="w-4 h-4" /> CSV</button><button onClick={() => setActiveTab("ai")} className="btn-knoux-secondary h-10 text-xs px-3"><Sparkles className="w-4 h-4" /> AI Guarded</button></div>
          <div className="knoux-premium-card p-3"><div className="text-[10px] text-knoux-muted-text font-black uppercase mb-2">One-click templates</div><div className="flex flex-wrap gap-2">{STATIC_TEMPLATES.map((template) => <button key={template.id} onClick={() => handleTemplate(template.content, template.label)} className="px-2.5 py-1.5 rounded-lg border border-knoux-purple/10 bg-white/60 text-[10px] text-knoux-dark-text font-bold hover:text-knoux-purple">{template.label}</button>)}</div></div>
          <p className="text-[11px] text-knoux-muted-text font-semibold">{serviceNotice}</p>
        </div>
      </div>

      <div className="p-4 border-b border-knoux-purple/10 bg-white/40 backdrop-blur-sm shrink-0 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 max-w-full">{filters.map((chip) => { const Icon = chip.icon; const selected = selectedFilter === chip.id; return <button key={chip.id} onClick={() => { setSelectedFilter(chip.id); setSelectedItem(null); }} className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${selected ? "bg-knoux-purple text-white shadow-knoux-glow" : "bg-white border border-knoux-purple/5 hover:border-knoux-purple/20 text-knoux-muted-text hover:text-knoux-dark-text"}`}><Icon className="w-3.5 h-3.5" /><span>{chip.label}</span></button>; })}</div>
        <div className="flex items-center gap-2"><button onClick={() => { setIsMultiSelect(!isMultiSelect); setSelectedIds(new Set()); }} className={`h-8 px-2.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 ${isMultiSelect ? "border-knoux-purple bg-knoux-purple text-white" : "border-knoux-purple/10 bg-white text-knoux-muted-text"}`}><CheckSquare className="w-3.5 h-3.5" /> Select Mode</button><button onClick={() => setIsAddingNew(!isAddingNew)} className="h-8 px-3 rounded-lg bg-gradient-to-tr from-knoux-purple to-knoux-neon text-white text-xs font-bold flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> New Snippet</button><button onClick={onClearHistory} className="h-8 px-2.5 rounded-lg border border-red-100 bg-red-50 text-red-600 text-xs font-bold">Clear Hub</button></div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-56 border-r border-knoux-purple/10 bg-white/45 backdrop-blur-sm p-4 shrink-0 hidden md:block overflow-y-auto"><div className="text-[10px] font-extrabold text-knoux-dark-text tracking-wider uppercase flex items-center gap-1.5 mb-3"><Folder className="w-3.5 h-3.5 text-knoux-purple" /> Collections</div><button onClick={() => setSelectedFolder("all")} className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold ${selectedFolder === "all" ? "bg-knoux-purple/10 text-knoux-purple" : "text-knoux-muted-text hover:bg-knoux-purple/5"}`}><span>All Clips</span><span>{items.length}</span></button>{folders.map((folder) => <button key={folder} onClick={() => setSelectedFolder(folder)} className={`mt-1 w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold ${selectedFolder === folder ? "bg-knoux-purple/10 text-knoux-purple" : "text-knoux-muted-text hover:bg-knoux-purple/5"}`}><span className="truncate">{folder}</span><span>{items.filter((item) => (item.folder || "General") === folder).length}</span></button>)}</aside>

        <main ref={virtual.containerRef} onScroll={virtual.onScroll} className="flex-1 overflow-y-auto p-4 bg-[#FCFAFF]">
          {isMultiSelect && <div className="p-3 mb-3 bg-white border border-knoux-purple/15 rounded-2xl flex flex-wrap items-center justify-between gap-3"><span className="text-xs font-bold text-knoux-muted-text">Selected: <b className="text-knoux-purple">{selectedIds.size}</b> / {filteredItems.length}</span><div className="flex gap-2"><button onClick={() => setSelectedIds(new Set(filteredItems.map((item) => item.id)))} className="btn-knoux-secondary text-xs">Select All</button><button onClick={() => handleBulkPin(true)} className="btn-knoux-secondary text-xs">Pin</button><button onClick={handleBulkDelete} className="btn-knoux-secondary text-xs text-red-600">Delete</button></div></div>}
          <AnimatePresence>{isAddingNew && <motion.form onSubmit={handleCreateSnippet} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="p-4 mb-3 rounded-2xl border border-knoux-purple/10 bg-white shadow-knoux-glow space-y-3 overflow-hidden"><div className="flex items-center justify-between"><b className="text-xs text-knoux-dark-text uppercase">Create Custom Snippet</b><button type="button" onClick={() => setIsAddingNew(false)}><X className="w-4 h-4" /></button></div><textarea value={newContent} onChange={(event) => setNewContent(event.target.value)} placeholder="Type note content, paste links, custom commands, or scripts..." rows={3} className="w-full p-2.5 rounded-xl border border-knoux-purple/10 bg-[#FCFAFF] text-xs text-knoux-dark-text outline-none font-mono" /><div className="flex gap-2"><select value={newType} onChange={(event) => setNewType(event.target.value as ClipboardType)} className="h-9 rounded-xl border border-knoux-purple/10 bg-[#FCFAFF] px-2 text-xs"><option value="text">Plain Text</option><option value="code">Code Block</option><option value="link">Hyperlink</option><option value="note">System Note</option></select><button type="submit" className="btn-knoux-primary text-xs">Save to Local Vault</button></div></motion.form>}</AnimatePresence>
          {filteredItems.length === 0 ? <div className="h-64 flex flex-col items-center justify-center text-center p-8 border border-dashed border-knoux-purple/15 rounded-2xl bg-white/40"><FileText className="w-10 h-10 text-knoux-purple/30 mb-2" /><span className="text-xs font-bold text-knoux-dark-text">No records found matching filters</span><p className="text-[10px] text-knoux-muted-text mt-1 max-w-xs">Modify search parameters or click New Snippet above.</p></div> : <div style={{ height: virtual.totalSize, position: "relative" }}>{virtual.virtualItems.map((row) => { const item = filteredItems[row.index]; return <div key={item.id} style={{ position: "absolute", top: row.start, left: 0, right: 0, height: row.size, paddingBottom: 12 }}>{renderClipCard(item)}</div>; })}</div>}
        </main>

        <AnimatePresence>{selectedItem && <motion.aside initial={{ x: 380, opacity: 0.9 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 380, opacity: 0.9 }} transition={{ type: "spring", stiffness: 300, damping: 28 }} className="w-80 md:w-96 border-l border-knoux-purple/10 bg-white/95 backdrop-blur-md p-5 flex flex-col justify-between overflow-y-auto shrink-0 z-10"><div className="space-y-5"><div className="flex items-center justify-between border-b border-knoux-purple/5 pb-3"><b className="text-xs text-knoux-dark-text uppercase flex items-center gap-2"><FileText className="w-4 h-4 text-knoux-purple" /> Clip Inspector</b><button onClick={() => setSelectedItem(null)}><X className="w-4 h-4" /></button></div><div className="p-3.5 rounded-xl border border-knoux-purple/5 bg-[#FCFAFF] space-y-2 text-xs"><div className="flex justify-between"><span className="text-knoux-muted-text">Type:</span><b>{selectedItem.type}</b></div><div className="flex justify-between"><span className="text-knoux-muted-text">Source:</span><b>{selectedItem.source}</b></div><div className="flex justify-between"><span className="text-knoux-muted-text">Characters:</span><b>{selectedItem.content.length}</b></div><div className="flex justify-between"><span className="text-knoux-muted-text">Security:</span><b className={selectedItem.isSecure ? "text-emerald-600" : "text-knoux-muted-text"}>{selectedItem.isSecure ? "Privacy guarded" : "Plaintext"}</b></div></div><pre className="p-4 rounded-2xl bg-[#140b25] text-[#f7f2ff] text-xs whitespace-pre-wrap max-h-80 overflow-auto">{selectedItem.isSecure && revealedSecureId !== selectedItem.id ? "Secure content hidden. Use Reveal on the card to inspect." : selectedItem.content}</pre></div><div className="grid grid-cols-2 gap-2 pt-4"><button onClick={() => onCopyItem(selectedItem)} className="btn-knoux-secondary text-xs"><Copy className="w-4 h-4" /> Copy</button><button onClick={() => sendToAi(selectedItem)} className="btn-knoux-primary text-xs"><Sparkles className="w-4 h-4" /> AI</button></div></motion.aside>}</AnimatePresence>
      </div>
    </div>
  );
}
