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

const aiAction = (name: string) => svc(
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  name,
  "AI",
  "Ready",
  "shared",
  true,
  "OpenRouter server route",
  `${name} calls the real guarded AI route when OpenRouter is configured.`,
  "Returns provider_not_configured rather than fake AI output when the provider key is missing.",
  `/api/ai/${name.toLowerCase().replace(/\s+/g, "-")}`,
  true,
);

const dev = (id: string, displayName: string, description: string, status: ServiceStatus = "Active") => svc(
  id,
  displayName,
  "Developer",
  status,
  "shared",
  true,
  "Developer Studio local utility engine",
  description,
  "Uses local deterministic output and copy/export fallbacks; no fake provider success is displayed.",
  `developerTools.${id}`,
);

export const PRODUCTION_SERVICES: ProductionService[] = [
  svc("smart-clipboard-inbox", "Smart Clipboard Inbox", "Clipboard", "Active", "shared", true, "knoux_clips localStorage", "Grouped Today, Yesterday, This Week, and Older inbox backed by persisted local clips.", "Manual snippet entry remains available.", "groupClipsByDate"),
  svc("windows-current-clipboard-import", "Windows Current Clipboard Import", "Clipboard", "Ready", "electron", true, "Electron preload bridge or browser clipboard permission", "Imports the current clipboard item through Electron when available, with browser permission fallback.", "Use manual paste in web runtime.", "importCurrentClipboardFromRuntime"),
  svc("windows-live-clipboard-monitor", "Windows Live Clipboard Monitor", "Clipboard", "Guarded", "electron", true, "clipboard:start-monitoring IPC", "Live monitoring is presented as Electron-guarded only; the web runtime never pretends to monitor the OS clipboard.", "Use current clipboard import in web.", "electronAPI.clipboard.startMonitoring"),
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
  svc("web-clipboard-limited-mode", "Web Clipboard Limited Mode", "Clipboard", "Guarded", "web", true, "navigator.clipboard permission", "Web builds only read/write clipboard after browser permission and user gesture.", "Use manual paste when permission is denied.", "navigator.clipboard"),
  svc("start-on-login-status", "Start-on-Login Status", "Clipboard", "Guarded", "electron", true, "Electron app startup setting", "Reports the start-on-login boundary honestly until a verified native toggle is present.", "Launch manually from Windows until the Electron setting is verified.", "startup boundary"),
  svc("current-session-import", "Current Session Import", "Clipboard", "Active", "shared", true, "session buffer and manual paste", "Imports current text from browser/electron clipboard permission or manual paste into the same local vault.", "Paste manually if permission is denied.", "importCurrentClipboardFromRuntime"),

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
  svc("vault-encryption", "Vault Encryption Boundary", "Security", "Guarded", "electron", true, "Electron security IPC", "Electron encryption IPC is checked at runtime; web localStorage is never described as fully encrypted.", "Use local privacy guard and JSON export in web.", "security:encrypt/security:decrypt"),
  svc("cloud-sync-boundary", "Cloud Sync Boundary", "Security", "Guarded", "shared", true, "No account sync backend", "Cloud sync remains intentionally blocked until an account/backend model is implemented.", "Use local JSON export/import.", "no-cloud-boundary"),
  svc("secrets-exposure-guard", "Secrets Exposure Guard", "Security", "Active", "shared", true, "sensitive scanner and provider guard", "Credential-like content is flagged and AI upload is blocked by UI guard wording.", "Keep AI actions disabled for secrets.", "detectSensitiveTypes"),
  svc("ai-upload-guard", "AI Upload Guard", "Security", "Guarded", "shared", true, "OpenRouter config and sensitive scan", "Sensitive content shows guard copy before AI handoff.", "Clean or redact content before AI.", "AIToolsPage guard"),
  svc("redaction-lab", "Redaction Lab", "Security", "Active", "shared", true, "local redaction patterns", "Emails, long tokens, private keys, and card-like values can be redacted before sharing.", "Copy redacted output manually.", "developerTools.redaction-map"),
  svc("security-audit-trail", "Security Audit Trail", "Security", "Active", "shared", true, "local event log", "Security page keeps a local audit trail for scans, vault unlocks, locks, and privacy toggles.", "Export the handoff JSON for records.", "SecurityPage auditTrail"),

  svc("openrouter-live-ai", "OpenRouter Live AI", "AI", "Ready", "shared", true, "OPENROUTER_API_KEY", "Server route supports real AI actions when the provider key is configured.", "Reports provider_not_configured or route errors without fake output.", "/api/ai/[action]", true),
  svc("offline-ai-boundary", "Offline AI Boundary", "AI", "Guarded", "shared", true, "No bundled local model runtime", "Offline generation is presented as a boundary check and never faked.", "Use manual editing or configure OpenRouter.", "offline-ai-boundary"),
  ...["Summarize Clip", "Rewrite Clip", "Translate Clip", "Analyze Clip", "Format Clip", "Explain Code Clip", "AI Commit Message", "AI README Block", "API Docs", "Action Items", "Checklist"].map(aiAction),

  svc("camera-scan", "Camera Scan", "Barcode", "Active", "web", true, "@zxing/browser and camera permission", "ZXing camera scanning is implemented with browser permission handling.", "Use manual paste or image upload.", "BarcodeScannerPage"),
  svc("image-upload-scan", "Image Upload Scan", "Barcode", "Active", "web", true, "@zxing/browser", "Image upload barcode decode is implemented.", "Use manual paste if decode fails.", "BarcodeScannerPage"),
  svc("clipboard-image-scan", "Clipboard Image Scan", "Barcode", "Ready", "web", true, "navigator.clipboard.read and @zxing/browser", "Reads an image copied to the clipboard when browser permission allows it, then decodes locally.", "Upload the image manually if clipboard-image read is denied.", "scanClipboardImage"),
  svc("manual-paste-decode", "Manual Paste Decode", "Barcode", "Active", "shared", true, "manual text parser", "Manual barcode result paste and save are available.", "Save result as a note.", "BarcodeScannerPage"),
  svc("save-barcode-result", "Save Barcode Result", "Barcode", "Active", "shared", true, "onAddNewItem", "Decoded barcode results can be saved to local clipboard history.", "Copy result manually.", "onAddNewItem"),
  svc("barcode-extract-from-clipboard", "Barcode Extract From Clipboard", "Barcode", "Ready", "shared", true, "current clipboard import", "Barcode-like clipboard text can be saved and tagged after import.", "Paste into Barcode Scanner manually.", "importCurrentClipboardFromRuntime"),

  dev("json-format", "JSON Formatter", "Validate and pretty-print JSON locally with safe parse errors."),
  dev("regex-test", "Regex Lab", "Run browser-local JavaScript regex tests against pasted sample text."),
  dev("markdown-table", "Markdown Table Builder", "Convert CSV-style rows into a polished Markdown table."),
  dev("env-checklist", "Environment Checklist", "Build production, preview, and local environment variable checklists."),
  dev("api-action", "API Action Builder", "Generate guarded payloads for /api/ai/[action] testing.", "Ready"),
  dev("commit-message", "Commit Message Generator", "Convert change notes into a conventional commit draft.", "Ready"),
  dev("readme-block", "README Block Generator", "Generate README feature sections for handoff docs.", "Ready"),
  dev("pdf-brief", "Document Brief Builder", "Prepare proposal/PDF/invoice handoff briefs with review steps."),
  dev("jwt-inspector", "JWT Inspector", "Decode JWT header and payload locally without sending the token anywhere."),
  dev("url-parser", "URL Parser", "Break a URL into protocol, host, pathname, query, and hash."),
  dev("diff-summary", "Diff Summary", "Count files, added lines, removed lines, and patch risk from a diff."),
  dev("typescript-interface", "TypeScript Interface Builder", "Build an exported TypeScript interface from key:type notes."),
  dev("zod-schema", "Zod Schema Builder", "Generate a Zod object schema from key:type notes."),
  dev("sql-checklist", "SQL Safety Checklist", "Flag SQL migration hazards before production execution.", "Guarded"),
  dev("release-notes", "Release Notes Builder", "Convert implementation notes into professional release notes."),
  dev("bug-report", "Bug Report Builder", "Structure issue, evidence, impact, and fix path."),
  dev("test-plan", "Test Plan Builder", "Generate manual QA steps for production feature validation."),
  dev("i18n-audit", "Arabic/English i18n Audit", "Review mixed Arabic/English interface copy and RTL/LTR risks."),
  dev("redaction-map", "Secret Redaction Map", "Mask secrets, emails, private keys, tokens, and card-like numbers."),

  svc("windows-installer-branding", "Windows Installer Branding", "Packaging", "Ready", "windows-installer", true, "electron-builder NSIS config", "Installer branding is configured through safe electron-builder fields.", "Default NSIS UI remains in use.", "package.json build.nsis"),
  svc("installer-icon", "Installer Icon", "Packaging", "Ready", "windows-installer", true, "assets/icons/icon.ico", "Installer icon uses the existing official product icon path.", "Use existing icon asset.", "win.icon"),
  svc("uninstaller-icon", "Uninstaller Icon", "Packaging", "Ready", "windows-installer", true, "assets/icons/icon.ico", "Uninstaller icon can use the official product icon copy.", "Use existing icon asset.", "nsis.uninstallerIcon"),
  svc("wizard-header-image-boundary", "Wizard Header Image Boundary", "Packaging", "Guarded", "windows-installer", true, "build/installer/wizard-header.bmp", "Reports whether premium wizard header assets exist before claiming custom installer visuals.", "Use default NSIS header.", "asset-boundary"),
  svc("wizard-sidebar-image-boundary", "Wizard Sidebar Image Boundary", "Packaging", "Guarded", "windows-installer", true, "build/installer/wizard-sidebar.bmp", "Reports whether premium wizard sidebar assets exist before claiming custom installer visuals.", "Use default NSIS sidebar.", "asset-boundary"),
  ...["Install Directory Selection", "Desktop Shortcut", "Start Menu Shortcut", "Launch After Install", "Safe Uninstall", "Preserve User Data", "Premium Installer Copywriting"].map((name) =>
    svc(name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), name, "Packaging", "Ready", "windows-installer", true, "electron-builder NSIS", `${name} is supported by safe electron-builder NSIS configuration.`, "Use default installer behavior if unsupported.", "package.json build.nsis")
  ),
  svc("start-with-windows-packaging-boundary", "Start With Windows Boundary", "Packaging", "Guarded", "windows-installer", true, "auto-start integration", "Reports the start-with-Windows packaging boundary truthfully until runtime auto-start is verified.", "Launch manually.", "auto-start-boundary"),
  ...["Signed Installer Boundary", "SmartScreen Copy", "Installer QA Checklist"].map((name) =>
    svc(name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), name, "Packaging", "Guarded", "windows-installer", true, "release checklist", `${name} is represented as a guarded production checklist, not a fake completed signature.`, "Use the checklist output and sign externally when certificate is available.", "release-checklist")
  ),
];

export const PRODUCTION_SCORE = {
  webDeploy: 100,
  openRouterBridge: 95,
  electronBridge: 88,
  securityVault: 91,
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
    Guarded: 0.72,
    Planned: 0.25,
    Missing: 0.1,
    Disabled: 0,
  };

  const total = PRODUCTION_SERVICES.reduce((sum, service) => sum + weights[service.status], 0);
  return Math.round((total / PRODUCTION_SERVICES.length) * 100);
}
