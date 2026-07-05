export type ServiceStatus = "Active" | "Ready" | "Guarded" | "Planned" | "Missing" | "Disabled";
export type RuntimeType = "renderer" | "electron" | "vercel-api" | "browser-api" | "localStorage" | "planned";

export interface ProductionService {
  id: string;
  displayName: string;
  title: string;
  category: "AI" | "Clipboard" | "Security" | "Storage" | "System" | "Experience";
  status: ServiceStatus;
  runtimeType: RuntimeType;
  tier: "live" | "electron" | "web" | "guarded" | "planned";
  dependency: string;
  implemented: boolean;
  requiresConfig: boolean;
  userFallback: string;
  actionHandler?: string;
  disabledReason?: string;
  description: string;
  channel?: string;
}

export const PRODUCTION_SERVICES: ProductionService[] = [
  {
    id: "clipboard-history",
    displayName: "Clipboard History",
    title: "Clipboard History",
    category: "Clipboard",
    status: "Active",
    runtimeType: "localStorage",
    tier: "web",
    dependency: "localStorage plus optional Electron clipboard bridge",
    implemented: true,
    requiresConfig: false,
    userFallback: "Manual note entry remains available when browser clipboard permission is denied.",
    actionHandler: "readSystemClipboard / writeSystemClipboard",
    description: "Local-first history, search, copy, pin, delete, tags, folders, import, and export are implemented in the renderer.",
    channel: "knoux_clips"
  },
  {
    id: "openrouter-live-ai",
    displayName: "OpenRouter Live AI",
    title: "OpenRouter Live AI",
    category: "AI",
    status: "Ready",
    runtimeType: "vercel-api",
    tier: "live",
    dependency: "OPENROUTER_API_KEY",
    implemented: true,
    requiresConfig: true,
    userFallback: "The UI reports missing_key/provider_error/network_error without producing fake AI output.",
    actionHandler: "/api/ai/[action]",
    description: "Server-side route supports chat, summarize, rewrite, translate, analyze, format, explain-code, docs, and checklist actions.",
    channel: "/api/ai/[action]"
  },
  {
    id: "barcode-zxing",
    displayName: "Barcode Scanner",
    title: "Barcode Scanner",
    category: "Experience",
    status: "Active",
    runtimeType: "browser-api",
    tier: "web",
    dependency: "@zxing/library",
    implemented: true,
    requiresConfig: false,
    userFallback: "Manual paste is available when camera or image decoding is unavailable.",
    actionHandler: "BarcodeScannerPage",
    description: "ZXing-powered camera scan, image upload decode, manual paste, copy, save, and clear states are available."
  },
  {
    id: "local-privacy-guard",
    displayName: "Local Privacy Guard",
    title: "Local Privacy Guard",
    category: "Security",
    status: "Active",
    runtimeType: "renderer",
    tier: "web",
    dependency: "deterministic pattern scanner",
    implemented: true,
    requiresConfig: false,
    userFallback: "Users can keep Privacy Enforcer enabled and avoid sending sensitive text to AI.",
    actionHandler: "detectSensitiveTypes",
    description: "Credential-like values, emails, phone numbers, and card patterns are scanned locally before reuse."
  },
  {
    id: "secrets-exposure-guard",
    displayName: "Secrets Exposure Guard",
    title: "Secrets Exposure Guard",
    category: "Security",
    status: "Guarded",
    runtimeType: "renderer",
    tier: "guarded",
    dependency: "Privacy Enforcer plus server-side AI proxy",
    implemented: true,
    requiresConfig: false,
    userFallback: "Sensitive text can be stored locally without invoking AI.",
    actionHandler: "SecurityPage guard scan",
    description: "The app warns about likely secrets and keeps provider keys server-side; it does not reveal env values."
  },
  {
    id: "export-report-generation",
    displayName: "Export / Report Generation",
    title: "Export / Report Generation",
    category: "System",
    status: "Active",
    runtimeType: "renderer",
    tier: "web",
    dependency: "Blob downloads",
    implemented: true,
    requiresConfig: false,
    userFallback: "Users can copy JSON if direct download is blocked by the browser.",
    actionHandler: "SettingsPage exportJson / StudioPage download",
    description: "Settings backup and developer handoff JSON exports are implemented."
  },
  {
    id: "theme-controls",
    displayName: "Theme Controls",
    title: "Theme Controls",
    category: "Experience",
    status: "Active",
    runtimeType: "renderer",
    tier: "web",
    dependency: "documentElement dataset and localStorage",
    implemented: true,
    requiresConfig: false,
    userFallback: "System mode follows prefers-color-scheme and updates without reload.",
    actionHandler: "themeMode setting",
    description: "Day, Night, and System theme modes persist locally and drive global CSS variables."
  },
  {
    id: "developer-studio-tools",
    displayName: "Developer Studio Tools",
    title: "Developer Studio Tools",
    category: "System",
    status: "Active",
    runtimeType: "renderer",
    tier: "web",
    dependency: "production service matrix",
    implemented: true,
    requiresConfig: false,
    userFallback: "Build commands can be copied and run locally.",
    actionHandler: "StudioPage",
    description: "Service matrix, AI route tester, environment inspector labels, build commands, snippet vault, and handoff report are visible."
  },
  {
    id: "notifications",
    displayName: "Notifications",
    title: "Notifications",
    category: "Experience",
    status: "Ready",
    runtimeType: "renderer",
    tier: "web",
    dependency: "in-app toast state",
    implemented: true,
    requiresConfig: false,
    userFallback: "Critical action results are also reflected in local page state.",
    actionHandler: "triggerToast",
    description: "In-app toasts report copy, import, export, AI pending, and maintenance outcomes."
  },
  {
    id: "offline-ai-fallback",
    displayName: "Offline AI Fallback",
    title: "Offline AI Fallback",
    category: "AI",
    status: "Planned",
    runtimeType: "planned",
    tier: "planned",
    dependency: "local model runtime not bundled",
    implemented: false,
    requiresConfig: false,
    userFallback: "Use manual editing or configure OpenRouter; the UI must not fake model results.",
    disabledReason: "No verified local model runtime is included in this production build.",
    description: "Offline generation is intentionally labeled planned until a real local inference path ships."
  },
  {
    id: "vault-encryption",
    displayName: "Vault Encryption",
    title: "Vault Encryption",
    category: "Security",
    status: "Guarded",
    runtimeType: "electron",
    tier: "guarded",
    dependency: "Electron security IPC only",
    implemented: true,
    requiresConfig: false,
    userFallback: "Web/Vercel storage remains localStorage without full database encryption claims.",
    actionHandler: "security:encrypt / security:decrypt",
    description: "AES-GCM IPC exists for Electron payloads, but the web renderer does not claim full encrypted database storage."
  },
  {
    id: "cloud-sync",
    displayName: "Cloud Sync",
    title: "Cloud Sync",
    category: "Storage",
    status: "Disabled",
    runtimeType: "planned",
    tier: "planned",
    dependency: "No sync backend configured",
    implemented: false,
    requiresConfig: true,
    userFallback: "Use local JSON export/import for portability.",
    disabledReason: "Cloud sync backend and account model are not implemented.",
    description: "Cloud sync is intentionally unavailable in this build."
  },
  {
    id: "snippet-vault",
    displayName: "Snippet Vault",
    title: "Snippet Vault",
    category: "Storage",
    status: "Ready",
    runtimeType: "localStorage",
    tier: "web",
    dependency: "local clip folders and tags",
    implemented: true,
    requiresConfig: false,
    userFallback: "Use folders/tags in Clipboard Hub.",
    actionHandler: "ClipboardWorkspace",
    description: "Snippet organization uses local folders, tags, pinning, favorites, and JSON backup."
  },
  {
    id: "labs-features",
    displayName: "Labs Features",
    title: "Labs Features",
    category: "Experience",
    status: "Planned",
    runtimeType: "planned",
    tier: "planned",
    dependency: "future provider integrations",
    implemented: false,
    requiresConfig: true,
    userFallback: "Use production Clipboard, AI, Barcode, Security, and Studio pages.",
    disabledReason: "Experimental provider slots are registry entries only until real handlers exist.",
    description: "Labs shows truthful registry statuses instead of enabling fake experimental services."
  }
];

export const PRODUCTION_SCORE = {
  webDeploy: 100,
  openRouterBridge: 95,
  electronBridge: 88,
  securityVault: 82,
  sqlitePersistence: 35,
  serviceTransparency: 100
};

export function countServicesByStatus(status: ProductionService["status"]) {
  return PRODUCTION_SERVICES.filter((service) => service.status === status).length;
}

export function getServiceReadinessPercent() {
  const weights: Record<ProductionService["status"], number> = {
    Active: 1,
    Ready: 0.85,
    Guarded: 0.7,
    Planned: 0.25,
    Missing: 0.1,
    Disabled: 0
  };

  const total = PRODUCTION_SERVICES.reduce((sum, service) => sum + weights[service.status], 0);
  return Math.round((total / PRODUCTION_SERVICES.length) * 100);
}
