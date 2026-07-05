export type ServiceStatus = "Active" | "Ready" | "Guarded" | "Planned" | "Missing" | "Disabled";
export type RuntimeType = "electron" | "web" | "shared" | "windows-installer";
export type ServiceCategory = "Clipboard" | "Client Tools" | "Security" | "AI" | "Barcode" | "Developer" | "Packaging";

export interface ProductionService {
  id: string;
  displayName: string;
  title: string;
  category: ServiceCategory;
  status: ServiceStatus;
  runtimeType: RuntimeType;
  tier: "live" | "electron" | "web" | "guarded" | "planned";
  dependency: string;
  implemented: boolean;
  requiresConfig: boolean;
  userFallback: string;
  fallback: string;
  disabledReason?: string;
  actionHandler?: string;
  description: string;
  channel?: string;
}

const svc = (
  id: string,
  displayName: string,
  category: ServiceCategory,
  status: ServiceStatus,
  runtimeType: RuntimeType,
  implemented: boolean,
  dependency: string,
  description: string,
  fallback: string,
  actionHandler?: string,
  requiresConfig = false,
  disabledReason?: string,
): ProductionService => ({
  id,
  displayName,
  title: displayName,
  category,
  status,
  runtimeType,
  tier: status === "Planned" || status === "Disabled" || status === "Missing" ? "planned" : status === "Guarded" ? "guarded" : runtimeType === "electron" ? "electron" : runtimeType === "web" ? "web" : "live",
  dependency,
  implemented,
  requiresConfig,
  userFallback: fallback,
  fallback,
  disabledReason,
  actionHandler,
  description,
  channel: actionHandler,
});

export const PRODUCTION_SERVICES: ProductionService[] = [
  svc("smart-clipboard-inbox", "Smart Clipboard Inbox", "Clipboard", "Active", "shared", true, "knoux_clips localStorage", "Grouped Today, Yesterday, This Week, and Older inbox backed by persisted local clips.", "Manual snippet entry remains available.", "groupClipsByDate"),
  svc("windows-current-clipboard-import", "Windows Current Clipboard Import", "Clipboard", "Ready", "electron", true, "Electron preload bridge or browser clipboard permission", "Imports the current clipboard item through Electron when available, with browser permission fallback.", "Use manual paste in web runtime.", "importCurrentClipboardFromRuntime"),
  svc("windows-live-clipboard-monitor", "Windows Live Clipboard Monitor", "Clipboard", "Guarded", "electron", true, "clipboard:start-monitoring IPC", "Live monitoring is exposed through the Electron bridge only; web runtime stays browser-limited.", "Use current clipboard import in web.", "electronAPI.clipboard.startMonitoring"),
  svc("persistent-local-clipboard-vault", "Persistent Local Clipboard Vault", "Clipboard", "Active", "shared", true, "localStorage knoux_clips", "Clips, tags, pins, favorites, and folders persist after restart in the renderer vault.", "Export JSON for portable backups.", "saveClips"),
  svc("large-history-storage", "Large History Storage", "Clipboard", "Ready", "shared", true, "maxHistorySize preference", "Retention limit is configurable and clips are compacted by local maintenance.", "Keep pinned clips and export older archives.", "maxHistorySize"),
  svc("clipboard-deduplication", "Clipboard Deduplication", "Clipboard", "Active", "shared", true, "content hash", "Duplicate content is detected by hash and unpinned repeats can be removed.", "Pinned duplicates are preserved.", "removeDuplicates"),
  svc("quick-paste-favorites", "Quick Paste Favorites", "Clipboard", "Active", "shared", true, "favorite field", "Favorites and pinned snippets persist in the local vault.", "Use pinned clips if favorite filtering is not selected.", "onToggleFavorite"),
  svc("clipboard-collections", "Clipboard Collections", "Clipboard", "Active", "shared", true, "folder field and knoux_folders", "Work, Personal, Code, Links, Replies, Shipping, Invoices, and Important collections are supported.", "General collection remains available.", "folder assignment"),
  svc("smart-labels-auto-tags", "Smart Labels / Auto Tags", "Clipboard", "Active", "shared", true, "rule-based tag detector", "Offline tags identify email, phone, link, code, json, invoice, tracking, address, and secret content.", "Manual tags remain available.", "autoTags"),
  svc("clipboard-backup-export", "Clipboard Backup Export", "Clipboard", "Active", "shared", true, "Blob downloads", "Exports the local vault as JSON and visible clips as CSV.", "Copy JSON manually if downloads are blocked.", "exportJsonFile/exportCsvFile"),
  svc("clipboard-backup-restore", "Clipboard Backup Restore", "Clipboard", "Ready", "shared", true, "Settings JSON import", "Validated JSON import exists in Preferences for clip lists.", "Restore only valid KNOUX JSON exports.", "SettingsPage importJson"),
  svc("json-export", "JSON Export", "Clipboard", "Active", "shared", true, "Blob downloads", "Generates a real JSON download.", "Use developer handoff JSON if needed.", "exportJsonFile"),
  svc("csv-export", "CSV Export", "Clipboard", "Active", "shared", true, "Blob downloads", "Generates a real CSV download for the visible clip list.", "Use JSON export for full fidelity.", "exportCsvFile"),
  svc("smart-search-assistant", "Smart Search Assistant", "Clipboard", "Active", "shared", true, "renderer filters", "Searches text, type, tag, source, pinned, sensitive, and collection fields locally.", "Use Deep Search for broad text search.", "ClipboardWorkspace filters"),
  svc("daily-clipboard-summary", "Daily Clipboard Summary", "Clipboard", "Active", "shared", true, "local summary reducer", "Shows local clip counts, top types, pinned count, sensitive detections, and duplicates avoided.", "No AI summary is claimed.", "buildDailySummary"),
  svc("auto-cleanup", "Auto Cleanup", "Clipboard", "Ready", "shared", true, "local maintenance", "Local maintenance compacts records and trims content to configured history size.", "Run maintenance manually from Overview.", "compactLocalStore"),
  svc("start-on-login", "Start on Login", "Clipboard", "Planned", "electron", false, "Electron auto-start wiring", "Start with Windows is planned until the installer/runtime toggle is verified.", "Launch manually.", undefined, false, "Not verified in this PR."),
  svc("web-clipboard-limited-mode", "Web Clipboard Limited Mode", "Clipboard", "Guarded", "web", true, "navigator.clipboard permission", "Web builds only read/write clipboard after browser permission and user gesture.", "Use manual paste when permission is denied.", "navigator.clipboard"),
  svc("historical-winv-import", "Historical Win+V Import", "Clipboard", "Planned", "electron", false, "Windows clipboard history API", "Full historical Win+V import is not claimed.", "Import current clipboard item only.", undefined, false, "Windows history import is planned until verified."),

  svc("smart-text-cleaner", "Smart Text Cleaner", "Client Tools", "Active", "shared", true, "offline text normalizer", "Removes extra spaces, reduces line breaks, normalizes bullets, and saves cleaned copies.", "Original content stays untouched.", "cleanText"),
  svc("link-organizer", "Link Organizer", "Client Tools", "Active", "shared", true, "offline URL extraction", "Detects URLs, extracts domains locally, and supports copy/open/save workflows without metadata fetches.", "Open links manually if popup policies block new tabs.", "extractEntities"),
  svc("code-snippet-saver", "Code Snippet Saver", "Client Tools", "Active", "shared", true, "rule-based code detection", "Detects code-like clips, tags them, and routes them to the Code collection.", "AI explain remains provider-guarded.", "detectClipboardType"),
  svc("entity-extractor", "Email / Phone / Address Extractor", "Client Tools", "Active", "shared", true, "offline regex scanner", "Extracts emails, phones, URLs, and possible addresses with local regex.", "Copy the whole clip if an edge case is missed.", "extractEntities"),
  svc("customer-reply-builder", "Customer Reply Builder", "Client Tools", "Ready", "shared", true, "OpenRouter API key", "Generates professional replies only through configured OpenRouter.", "Shows provider_not_configured when missing.", "/api/ai/reply", true),
  svc("one-click-copy-templates", "One-Click Copy Templates", "Client Tools", "Active", "shared", true, "static template list", "Professional reply, apology, payment, shipping, meeting, invoice, checklist, and WhatsApp templates are real static snippets.", "Templates can be saved to the vault.", "STATIC_TEMPLATES"),
  svc("business-mode-presets", "Business Mode Presets", "Client Tools", "Active", "shared", true, "renderer filter state", "Developer, Office, Customer Support, E-commerce, and Personal presets filter suggested clips.", "All mode shows the full vault.", "businessMode"),
  svc("workflow-quick-actions", "Workflow Quick Actions", "Client Tools", "Active", "shared", true, "ClipboardWorkspace handlers", "Copy, pin, delete, tag, collection, clean, extract, guarded AI handoff, and export actions are wired.", "Unavailable actions are disabled or guarded.", "workflow buttons"),
  svc("offline-mode-indicator", "Offline Mode Indicator", "Client Tools", "Active", "shared", true, "navigator.onLine and Electron bridge detection", "Displays online/offline, AI-provider-missing, Electron runtime, and web-limited states truthfully.", "Web remains browser-limited.", "runtime indicator"),

  svc("sensitive-data-guard", "Sensitive Data Guard", "Security", "Active", "shared", true, "deterministic sensitive scanner", "Detects passwords, API keys, tokens, card-like numbers, private keys, and secret env lines locally.", "AI actions are guarded for sensitive content.", "detectSensitiveTypes"),
  svc("local-privacy-guard", "Local Privacy Guard", "Security", "Active", "shared", true, "renderer privacy mode", "Privacy mode marks new clips as guarded without uploading content.", "Turn Privacy Mode on for sensitive workflows.", "privacyMode"),
  svc("vault-encryption", "Vault Encryption", "Security", "Guarded", "electron", true, "Electron security IPC", "Electron encryption IPC exists, but web localStorage is not described as fully encrypted.", "Use local privacy guard and JSON export.", "security:encrypt/security:decrypt"),
  svc("cloud-sync", "Cloud Sync", "Security", "Disabled", "shared", false, "No cloud backend", "Cloud sync is intentionally unavailable.", "Use local JSON export/import.", undefined, true, "No account model or sync backend exists."),
  svc("secrets-exposure-guard", "Secrets Exposure Guard", "Security", "Active", "shared", true, "sensitive scanner and provider guard", "Credential-like content is flagged and AI upload is blocked by UI guard wording.", "Keep AI actions disabled for secrets.", "detectSensitiveTypes"),
  svc("ai-upload-guard", "AI Upload Guard", "Security", "Guarded", "shared", true, "OpenRouter config and sensitive scan", "Sensitive content shows guard copy before AI handoff.", "Clean or redact content before AI.", "AIToolsPage guard"),

  svc("openrouter-live-ai", "OpenRouter Live AI", "AI", "Ready", "shared", true, "OPENROUTER_API_KEY", "Server route supports real AI actions when the provider key is configured.", "Reports provider_not_configured or route errors without fake output.", "/api/ai/[action]", true),
  svc("offline-ai-fallback", "Offline AI Fallback", "AI", "Planned", "shared", false, "No local model runtime", "Offline generation is planned and not faked.", "Use manual editing or configure OpenRouter.", undefined, false, "No verified local inference runtime is bundled."),
  ...["Summarize Clip", "Rewrite Clip", "Translate Clip", "Analyze Clip", "Format Clip", "Explain Code Clip", "Commit Message", "README Block", "API Docs", "Action Items", "Checklist"].map((name) =>
    svc(name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), name, "AI", "Ready", "shared", true, "OpenRouter route", `${name} uses the real AI route when configured.`, "Shows provider_not_configured if the provider is missing.", `/api/ai/${name.toLowerCase().replace(/\s+/g, "-")}`, true)
  ),

  svc("camera-scan", "Camera Scan", "Barcode", "Active", "web", true, "@zxing/library and camera permission", "ZXing camera scanning is implemented with browser permission handling.", "Use manual paste or image upload.", "BarcodeScannerPage"),
  svc("image-upload-scan", "Image Upload Scan", "Barcode", "Active", "web", true, "@zxing/library", "Image upload barcode decode is implemented.", "Use manual paste if decode fails.", "BarcodeScannerPage"),
  svc("manual-paste-decode", "Manual Paste Decode", "Barcode", "Active", "shared", true, "manual text parser", "Manual barcode result paste and save are available.", "Save result as a note.", "BarcodeScannerPage"),
  svc("save-barcode-result", "Save Barcode Result", "Barcode", "Active", "shared", true, "onAddNewItem", "Decoded barcode results can be saved to local clipboard history.", "Copy result manually.", "onAddNewItem"),
  svc("barcode-extract-from-clipboard", "Barcode Extract From Clipboard", "Barcode", "Ready", "shared", true, "current clipboard import", "Barcode-like clipboard text can be saved and tagged after import.", "Paste into Barcode Scanner manually.", "importCurrentClipboardFromRuntime"),

  ...["Health Cards", "Environment Inspector", "AI Route Tester", "Build Command Center", "Developer Utilities", "Snippet Vault", "Documentation Hub", "Clipboard Engine Panel", "Windows Integration Panel"].map((name) =>
    svc(name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), name, "Developer", "Active", "shared", true, "Developer Studio", `${name} is represented in Developer Studio with truthful service data.`, "Copy build commands and export handoff JSON.", "StudioPage")
  ),

  svc("windows-installer-branding", "Windows Installer Branding", "Packaging", "Ready", "windows-installer", true, "electron-builder NSIS config", "Installer branding is configured through safe electron-builder fields.", "Default NSIS UI remains in use.", "package.json build.nsis"),
  svc("installer-icon", "Installer Icon", "Packaging", "Ready", "windows-installer", true, "assets/icons/icon.ico", "Installer icon uses the existing official product icon path.", "Use existing icon asset.", "win.icon"),
  svc("uninstaller-icon", "Uninstaller Icon", "Packaging", "Ready", "windows-installer", true, "assets/icons/icon.ico", "Uninstaller icon can use the official product icon copy.", "Use existing icon asset.", "nsis.uninstallerIcon"),
  svc("wizard-header-image", "Wizard Header Image", "Packaging", "Planned", "windows-installer", false, "build/installer/wizard-header.bmp", "Premium wizard header bitmap is planned until generated and package-verified.", "Use default NSIS header.", undefined, false, "Asset generation not yet verified."),
  svc("wizard-sidebar-image", "Wizard Sidebar Image", "Packaging", "Planned", "windows-installer", false, "build/installer/wizard-sidebar.bmp", "Premium wizard sidebar bitmap is planned until generated and package-verified.", "Use default NSIS sidebar.", undefined, false, "Asset generation not yet verified."),
  ...["Install Directory Selection", "Desktop Shortcut", "Start Menu Shortcut", "Launch After Install", "Safe Uninstall", "Preserve User Data", "Premium Installer Copywriting"].map((name) =>
    svc(name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), name, "Packaging", "Ready", "windows-installer", true, "electron-builder NSIS", `${name} is supported by safe electron-builder NSIS configuration.`, "Use default installer behavior if unsupported.", "package.json build.nsis")
  ),
  svc("start-with-windows-packaging", "Start With Windows", "Packaging", "Planned", "windows-installer", false, "auto-start integration", "Start with Windows remains planned until runtime and installer support are verified.", "Launch manually.", undefined, false, "Not implemented in this PR."),
  ...["Full Custom Installer UI", "Custom Welcome Page", "Custom Feature Tour Page", "Custom Setup Options Page", "Custom Installing Page", "Custom Finish Page"].map((name) =>
    svc(name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), name, "Packaging", "Planned", "windows-installer", false, "custom NSIS UI", `${name} is planned only and is not marked active.`, "Use safe standard NSIS pages.", undefined, false, "Full custom installer UI is planned.")
  ),
];

export const PRODUCTION_SCORE = {
  webDeploy: 100,
  openRouterBridge: 95,
  electronBridge: 88,
  securityVault: 82,
  sqlitePersistence: 35,
  serviceTransparency: 100,
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
    Disabled: 0,
  };

  const total = PRODUCTION_SERVICES.reduce((sum, service) => sum + weights[service.status], 0);
  return Math.round((total / PRODUCTION_SERVICES.length) * 100);
}
