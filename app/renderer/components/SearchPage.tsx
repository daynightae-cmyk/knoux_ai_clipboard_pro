/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { ClipboardItem } from "../types";
import { motion } from "motion/react";
import { Search, Copy, Check, Calendar, ArrowRight, ShieldAlert, FileCode, ExternalLink } from "lucide-react";

interface SearchPageProps {
  items: ClipboardItem[];
  onCopyItem: (item: ClipboardItem) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function SearchPage({
  items,
  onCopyItem,
  searchQuery,
  setSearchQuery,
}: SearchPageProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (item: ClipboardItem) => {
    onCopyItem(item);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const recentSearches = ["API Key", "Sadek", "invoice", "react component", "https://knoux.store"];

  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase();
    return (
      item.content.toLowerCase().includes(q) ||
      item.tags.some((t) => t.toLowerCase().includes(q)) ||
      item.type.toLowerCase().includes(q) ||
      item.source.toLowerCase().includes(q)
    );
  });

  return (
    <div id="search-workspace-container" className="p-6 space-y-6 max-w-4xl mx-auto select-none">
      {/* 1. Large Search Input bar */}
      <div className="p-5 rounded-3xl border border-knoux-purple/10 bg-white shadow-sm space-y-4">
        <h3 className="text-xs font-extrabold text-knoux-dark-text uppercase tracking-wider">
          Universal Semantic Search Core
        </h3>

        <div className="relative">
          <Search className="w-5 h-5 text-knoux-purple absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type content query keywords, source app names, tags, or file extensions..."
            className="w-full h-12 pl-12 pr-4 rounded-2xl border border-knoux-purple/15 bg-[#FCFAFF] focus:bg-white text-sm outline-none focus:border-knoux-purple focus:ring-4 focus:ring-knoux-purple/5 transition-all"
            autoFocus
          />
        </div>

        {/* Suggestion list */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-knoux-muted-text font-semibold">Recommended Searches:</span>
          {recentSearches.map((term) => (
            <button
              key={term}
              onClick={() => setSearchQuery(term)}
              className="px-2.5 py-1 rounded-lg border border-knoux-purple/5 bg-[#FCFAFF] hover:border-knoux-purple/15 text-knoux-muted-text hover:text-knoux-purple transition-all cursor-pointer font-mono"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Results list */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold text-knoux-dark-text uppercase tracking-wider px-1">
          {searchQuery.trim()
            ? `Query Matches (${filteredItems.length} items found)`
            : "Awaiting Query Input"}
        </h3>

        {!searchQuery.trim() ? (
          <div className="p-8 text-center border border-dashed border-knoux-purple/15 rounded-2xl bg-white/40 flex flex-col items-center">
            <Search className="w-8 h-8 text-knoux-purple/30 mb-2 animate-pulse" />
            <span className="text-xs font-bold text-knoux-dark-text">Ready for search retrieval</span>
            <p className="text-[10px] text-knoux-muted-text mt-1 max-w-xs">
              Type inside the search bar above or click any suggested term to scan local clipboard records.
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-knoux-purple/15 rounded-2xl bg-white/40 flex flex-col items-center">
            <ShieldAlert className="w-8 h-8 text-amber-500/50 mb-2" />
            <span className="text-xs font-bold text-knoux-dark-text">No matches in local database</span>
            <p className="text-[10px] text-knoux-muted-text mt-1 max-w-xs">
              Try search expansion terms or clear active filters. Knoux has scanned {items.length} records in temporary memory.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <motion.div
              key={item.id}
              className="p-4 rounded-2xl bg-white border border-knoux-purple/5 group flex items-center justify-between gap-4 knoux-card-hover shadow-sm"
            >
              <div className="space-y-1.5 overflow-hidden flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-knoux-purple uppercase bg-knoux-purple/5 px-2 py-0.5 rounded-md">
                    {item.type}
                  </span>
                  <span className="text-[10px] text-knoux-muted-text/50 font-mono">
                    {new Date(item.timestamp).toLocaleDateString()} at{" "}
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className="text-[10px] text-knoux-muted-text/50 font-mono">
                    • {item.source}
                  </span>
                </div>

                <p className="text-xs text-knoux-dark-text/90 font-mono leading-relaxed truncate max-w-xl">
                  {item.content}
                </p>
              </div>

              <div className="shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleCopy(item)}
                  className="h-8 px-3 rounded-lg bg-knoux-purple/5 hover:bg-knoux-purple/10 text-knoux-purple text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  {copiedId === item.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === item.id ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
