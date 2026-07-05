export type ClipboardType = "text" | "code" | "link" | "image" | "note" | "pdf" | "file";

export interface ClipboardItem {
  id: string;
  content: string;
  type: ClipboardType;
  timestamp: string;
  pinned: boolean;
  favorite: boolean;
  tags: string[];
  aiSummarized?: string | null;
  aiTags?: string[];
  source: string;
  isSecure: boolean;
  language?: string;
  folder?: string;
}

export type NavTab =
  | "overview"
  | "clipboard"
  | "search"
  | "ai"
  | "security"
  | "settings"
  | "labs"
  | "developer"
  | "barcode"
  | "about";

export interface AppSettings {
  themeMode: "day" | "night" | "system";
  density: "compact" | "comfortable";
  glowIntensity: "low" | "medium" | "high";
  privacyMode: boolean;
  autoAnalyze: boolean;
  maxHistorySize: number;
  syncToCloud: boolean;
  language?: "en" | "ar";
}

export interface LabModule {
  id: string;
  title: string;
  description: string;
  badge: "Experimental" | "Beta" | "Planned" | "Disabled";
  enabled: boolean;
}
