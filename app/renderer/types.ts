/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ClipboardType = "text" | "code" | "link" | "image" | "note";

export interface ClipboardItem {
  id: string;
  content: string;
  type: ClipboardType;
  timestamp: string; // ISO String
  pinned: boolean;
  favorite: boolean;
  tags: string[];
  aiSummarized?: string | null;
  aiTags?: string[];
  source: string; // e.g. "Chrome", "VS Code", "Slack", "System"
  isSecure: boolean;
  language?: string; // For code snippets
  folder?: string; // User-defined folder category
}

export type NavTab =
  | "overview"
  | "clipboard"
  | "search"
  | "ai"
  | "security"
  | "settings"
  | "labs"
  | "about";

export interface AppSettings {
  density: "compact" | "comfortable";
  glowIntensity: "low" | "medium" | "high";
  privacyMode: boolean;
  autoAnalyze: boolean;
  maxHistorySize: number;
  syncToCloud: boolean;
}

export interface LabModule {
  id: string;
  title: string;
  description: string;
  badge: "Experimental" | "Beta" | "Planned" | "Disabled";
  enabled: boolean;
}
