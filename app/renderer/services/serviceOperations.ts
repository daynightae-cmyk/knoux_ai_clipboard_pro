import { ClipboardItem } from "../types";
import { ProductionService } from "./productionCatalog";
import { autoTags, buildDailySummary, cleanText, detectClipboardType, duplicateSummary, exportCsvFile, exportJsonFile, extractEntities, groupClipsByDate, removeDuplicates } from "./clientClipboardServices";
import { compactLocalStore, detectSensitiveTypes, getStorageHealth, readSystemClipboard, writeSystemClipboard } from "./runtimeServices";
import { runKnouxAIAction } from "./aiClient";
import { DeveloperToolId, getDeveloperToolSample, runDeveloperTool } from "./developerTools";

export interface ServiceOperationResult {
  ok: boolean;
  status: string;
  title: string;
  output: string;
  action?: string;
}

const sampleText = "Invoice INV-2026-104 for Knoux AI Clipboard Pro. Email admin@knoux.store. Tracking KNX-4455. https://knoux.store Proposal.pdf";

const aiActionByServiceId: Record<string, string> = {
  "openrouter-live-ai": "chat",
  "customer-reply-builder": "reply",
  "summarize-clip": "summarize",
  "rewrite-clip": "rewrite",
  "translate-clip": "translate",
  "analyze-clip": "analyze",
  "format-clip": "format",
  "explain-code-clip": "explain-code",
  "commit-message": "commit-message",
  "readme-block": "readme-block",
  "api-docs": "api-docs",
  "action-items": "action-items",
  "checklist": "checklist"
};

const developerToolIds = new Set<string>([
  "json-format",
  "regex-test",
  "markdown-table",
  "env-checklist",
  "api-action",
  "commit-message",
  "readme-block",
  "pdf-brief",
  "jwt-inspector",
  "url-parser",
  "diff-summary",
  "typescript-interface",
  "zod-schema",
  "sql-checklist",
  "release-notes",
  "bug-report",
  "test-plan",
  "i18n-audit",
  "redaction-map",
]);

const format = (value: unknown) => typeof value === "string" ? value : JSON.stringify(value, null, 2);
const activeText = (input: string) => input.trim() || sampleText;
const secretScanReport = (text: string) => {
  const types = detectSensitiveTypes(text);
  return { sensitive: types.length > 0, types, recommendation: types.length ? "Redact before AI upload, sharing, export, or public screenshots." : "No credential-like class detected in the active buffer." };
};

const redact = (input: string) => input
  .replace(/-----BEGIN[\s\S]+?PRIVATE KEY-----/g, "-----BEGIN REDACTED PRIVATE KEY-----")
  .replace(/\b(sk-or-v1-|sk-)[A-Za-z0-9_\-]{18,}\b/g, "$1REDACTED")
  .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[email-redacted]")
  .replace(/\b(?:\d[ -]*?){13,16}\b/g, "[number-redacted]")
  .replace(/^([A-Z0-9_]*(SECRET|TOKEN|KEY|PASSWORD)[A-Z0-9_]*)\s*=\s*.+$/gim, "$1=[secret-redacted]");

const blocked = (service: ProductionService): ServiceOperationResult => ({
  ok: false,
  status: service.status,
  title: service.displayName,
  output: `${service.displayName} is ${service.status}.\n\nReason: ${service.disabledReason || service.description}\n\nFallback: ${service.fallback}`,
  action: "guarded"
});

export function buildServiceSample(service: ProductionService): string {
  if (service.category === "Developer" && developerToolIds.has(service.id)) return getDeveloperToolSample(service.id as DeveloperToolId);
  if (service.category === "AI") return "Summarize this: Knoux AI Clipboard Pro captures clipboard content, keeps it local-first, and routes AI tasks through guarded OpenRouter only when configured.";
  if (service.id.includes("code") || service.id.includes("api")) return "const service = { name: 'Knoux', ready: true };\nexport default service;";
  if (service.id.includes("json")) return '{"product":"Knoux AI Clipboard Pro","ready":true}';
  if (service.id.includes("pdf") || service.id.includes("document")) return "Project Proposal.pdf\nClient: KNOUX\nPurpose: AI Clipboard Pro deployment\nAction: review document and extract tasks.";
  if (service.category === "Security") return "OPENROUTER_API_KEY=sk-or-v1-REPLACE_ME_12345678901234567890\npassword: example-only\nadmin@knoux.store\n4242 4242 4242 4242";
  if (service.category === "Barcode") return "https://knoux.store/tracking/KNX-4455";
  if (service.category === "Packaging") return "npm run build && npm run dist:installer";
  return sampleText;
}

export async function runServiceOperation(service: ProductionService, input: string, items: ClipboardItem[] = []): Promise<ServiceOperationResult> {
  if (!service.implemented || service.status === "Planned" || service.status === "Missing" || service.status === "Disabled") return blocked(service);
  const text = activeText(input || buildServiceSample(service));

  if (service.category === "Developer" && developerToolIds.has(service.id)) {
    return { ok: true, status: service.status.toLowerCase(), title: service.displayName, output: runDeveloperTool(service.id as DeveloperToolId, text), action: service.id };
  }

  const aiAction = aiActionByServiceId[service.id];
  if (aiAction || service.category === "AI") {
    if (service.id === "offline-ai-boundary") return { ok: false, status: "guarded", title: service.displayName, output: "Offline generation is not faked. Configure OpenRouter for real AI output or use manual editing tools.", action: "offline-boundary" };
    try {
      const result = await runKnouxAIAction({ action: aiAction || "chat", text, targetLanguage: service.id === "translate-clip" ? "Arabic" : undefined });
      return { ok: true, status: result.status || "ready", title: service.displayName, output: result.result, action: aiAction || "chat" };
    } catch (error: any) {
      return { ok: false, status: error?.message || "provider_not_configured", title: service.displayName, output: `AI provider is not configured or is unavailable.\n\nService: ${service.displayName}\nAction: ${aiAction || "chat"}\nSafe status: ${error?.message || "provider_not_configured"}\n\nConfigure OpenRouter in Settings, then run again.`, action: aiAction || "chat" };
    }
  }

  switch (service.id) {
    case "smart-clipboard-inbox": return { ok: true, status: "active", title: service.displayName, output: format(Object.fromEntries(Object.entries(groupClipsByDate(items)).map(([key, value]) => [key, value.length]))), action: "group" };
    case "windows-current-clipboard-import": return { ok: true, status: "ready", title: service.displayName, output: (await readSystemClipboard()) || "Clipboard is empty or browser permission was denied. Use manual paste.", action: "read-clipboard" };
    case "windows-live-clipboard-monitor": return { ok: false, status: "guarded", title: service.displayName, output: "Live monitor requires a verified Electron bridge. Web runtime stays guarded. Use current clipboard import now.", action: "guarded" };
    case "persistent-local-clipboard-vault": return { ok: true, status: "active", title: service.displayName, output: format(getStorageHealth(items)), action: "health" };
    case "large-history-storage": return { ok: true, status: "ready", title: service.displayName, output: `Current records: ${items.length}\nStorage: ${format(getStorageHealth(items))}`, action: "retention" };
    case "clipboard-deduplication": return { ok: true, status: "active", title: service.displayName, output: `Duplicate report:\n${format(duplicateSummary(items))}\n\nPreview after cleanup: ${removeDuplicates(items).length} records.`, action: "dedupe-preview" };
    case "quick-paste-favorites": return { ok: true, status: "active", title: service.displayName, output: format(items.filter((item) => item.favorite || item.pinned).map((item) => ({ id: item.id, type: item.type, tags: item.tags, preview: item.content.slice(0, 120) }))), action: "favorites" };
    case "clipboard-collections": return { ok: true, status: "active", title: service.displayName, output: format(items.reduce<Record<string, number>>((acc, item) => { const folder = item.folder || "General"; acc[folder] = (acc[folder] || 0) + 1; return acc; }, {})), action: "collections" };
    case "smart-labels-auto-tags": return { ok: true, status: "active", title: service.displayName, output: format(autoTags(text)), action: "tags" };
    case "clipboard-backup-export":
    case "json-export": exportJsonFile("knoux-service-export.json", { product: "Knoux AI Clipboard Pro", exportedAt: new Date().toISOString(), items }); return { ok: true, status: "downloaded", title: service.displayName, output: "JSON export generated and downloaded.", action: "download-json" };
    case "csv-export": exportCsvFile("knoux-visible-clips.csv", items); return { ok: true, status: "downloaded", title: service.displayName, output: "CSV export generated and downloaded.", action: "download-csv" };
    case "clipboard-backup-restore": return { ok: true, status: "ready", title: service.displayName, output: "Restore control is available in Preferences. Use a validated KNOUX JSON export only.", action: "open-settings" };
    case "smart-search-assistant": return { ok: true, status: "active", title: service.displayName, output: format(items.filter((item) => JSON.stringify(item).toLowerCase().includes(text.toLowerCase())).slice(0, 20)), action: "search" };
    case "daily-clipboard-summary": return { ok: true, status: "active", title: service.displayName, output: format(buildDailySummary(items)), action: "daily-summary" };
    case "auto-cleanup": return { ok: true, status: "ready", title: service.displayName, output: format(compactLocalStore(items)), action: "compact" };
    case "web-clipboard-limited-mode": return { ok: await writeSystemClipboard(text), status: "permission-dependent", title: service.displayName, output: "Attempted browser clipboard write. If permission was denied, use manual copy.", action: "write-clipboard" };
    case "start-on-login-status": return { ok: false, status: "guarded", title: service.displayName, output: "Start-on-login is a native Electron/installer boundary. This web runtime cannot honestly enable it. The UI reports the boundary and keeps manual launch as fallback.", action: "startup-boundary" };
    case "current-session-import": return { ok: true, status: "active", title: service.displayName, output: text, action: "session-import" };
    case "smart-text-cleaner": return { ok: true, status: "active", title: service.displayName, output: cleanText(text), action: "clean" };
    case "link-organizer": return { ok: true, status: "active", title: service.displayName, output: format(extractEntities(text).urls.map((url) => { try { return { url, domain: new URL(url).hostname }; } catch { return { url, domain: "invalid-url" }; } })), action: "links" };
    case "code-snippet-saver": return { ok: true, status: "active", title: service.displayName, output: `Detected type: ${detectClipboardType(text)}\nTags: ${autoTags(text).join(", ") || "none"}`, action: "code-detect" };
    case "entity-extractor": return { ok: true, status: "active", title: service.displayName, output: format(extractEntities(text)), action: "entities" };
    case "one-click-copy-templates": return { ok: true, status: "active", title: service.displayName, output: "Templates are available in Clipboard Hub. Use the writing panel to save them as snippets.", action: "templates" };
    case "business-mode-presets": return { ok: true, status: "active", title: service.displayName, output: "Presets: Developer, Office, Customer Support, E-commerce, Personal, All.", action: "presets" };
    case "workflow-quick-actions": return { ok: true, status: "active", title: service.displayName, output: "Workflow controls: copy, pin, favorite, delete, clean, extract, AI handoff, export, collection assignment.", action: "workflow" };
    case "offline-mode-indicator": return { ok: true, status: navigator.onLine ? "online" : "offline", title: service.displayName, output: `navigator.onLine=${navigator.onLine}\nElectron bridge=${Boolean((window as any).knoux || (window as any).electronAPI)}`, action: "runtime" };
    case "sensitive-data-guard":
    case "secrets-exposure-guard": return { ok: true, status: "active", title: service.displayName, output: format(secretScanReport(text)), action: "guard-scan" };
    case "local-privacy-guard": localStorage.setItem("knoux_privacy_mode_last_check", new Date().toISOString()); return { ok: true, status: "active", title: service.displayName, output: "Privacy guard check recorded locally. New clips can be marked secure by Privacy Mode.", action: "privacy" };
    case "vault-encryption": return { ok: Boolean((window as any).knoux?.security), status: Boolean((window as any).knoux?.security) ? "ready" : "guarded", title: service.displayName, output: "Electron encryption bridge is checked at runtime. Web localStorage is not claimed as encrypted.", action: "encryption-check" };
    case "cloud-sync-boundary": return { ok: false, status: "guarded", title: service.displayName, output: "Cloud sync is intentionally blocked in this local-first build. Use JSON export/import until a real account and sync backend exists.", action: "sync-boundary" };
    case "ai-upload-guard": return { ok: true, status: "guarded", title: service.displayName, output: detectSensitiveTypes(text).length ? "Sensitive input detected. AI upload should remain blocked until redacted." : "No sensitive classes detected in the active text buffer.", action: "ai-guard" };
    case "redaction-lab": return { ok: true, status: "active", title: service.displayName, output: redact(text), action: "redact" };
    case "security-audit-trail": return { ok: true, status: "active", title: service.displayName, output: `Security audit marker generated at ${new Date().toISOString()}\nRecords: ${items.length}\nScan: ${format(secretScanReport(text))}`, action: "security-audit" };
    case "camera-scan":
    case "image-upload-scan":
    case "clipboard-image-scan":
    case "manual-paste-decode":
    case "save-barcode-result":
    case "barcode-extract-from-clipboard": return { ok: true, status: service.status.toLowerCase(), title: service.displayName, output: `Barcode action is available on Barcode Scanner page. Test value: ${text}`, action: "open-barcode" };
    default:
      if (service.category === "Packaging") return { ok: service.status !== "Guarded", status: service.status.toLowerCase(), title: service.displayName, output: `Packaging control: ${service.displayName}\nHandler: ${service.actionHandler || "None"}\nCommand: npm run dist:installer\nFallback: ${service.fallback}`, action: "packaging" };
      return { ok: true, status: service.status.toLowerCase(), title: service.displayName, output: `${service.displayName}\n${service.description}\nHandler: ${service.actionHandler || "None"}`, action: "info" };
  }
}

export function serviceActionLabels(service: ProductionService) {
  const byId: Record<string, [string, string, string]> = {
    "smart-clipboard-inbox": ["Group inbox", "Load inbox sample", "Copy grouping"],
    "windows-current-clipboard-import": ["Import now", "Use paste sample", "Copy result"],
    "windows-live-clipboard-monitor": ["Check boundary", "Load monitor note", "Copy status"],
    "persistent-local-clipboard-vault": ["Audit vault", "Load vault sample", "Copy health"],
    "large-history-storage": ["Check storage", "Load retention case", "Copy limits"],
    "clipboard-deduplication": ["Find duplicates", "Load duplicate sample", "Copy report"],
    "quick-paste-favorites": ["List favorites", "Load favorite sample", "Copy list"],
    "clipboard-collections": ["Count folders", "Load folder case", "Copy folders"],
    "smart-labels-auto-tags": ["Generate tags", "Load tag sample", "Copy tags"],
    "clipboard-backup-export": ["Export JSON", "Load export sample", "Copy manifest"],
    "clipboard-backup-restore": ["Check restore", "Load restore sample", "Copy rules"],
    "json-export": ["Download JSON", "Load JSON sample", "Copy manifest"],
    "csv-export": ["Download CSV", "Load CSV sample", "Copy manifest"],
    "smart-search-assistant": ["Search vault", "Load query", "Copy matches"],
    "daily-clipboard-summary": ["Build summary", "Load day sample", "Copy summary"],
    "auto-cleanup": ["Compact store", "Load cleanup case", "Copy report"],
    "web-clipboard-limited-mode": ["Test permission", "Load write sample", "Copy status"],
    "start-on-login-status": ["Check boundary", "Load startup note", "Copy status"],
    "current-session-import": ["Import session", "Load session text", "Copy session"],
    "smart-text-cleaner": ["Clean text", "Load messy sample", "Copy cleaned"],
    "link-organizer": ["Extract links", "Load URL sample", "Copy domains"],
    "code-snippet-saver": ["Analyze code", "Load code sample", "Copy output"],
    "entity-extractor": ["Extract entities", "Load contact sample", "Copy entities"],
    "customer-reply-builder": ["Draft reply", "Load customer case", "Copy reply"],
    "one-click-copy-templates": ["Show templates", "Load template case", "Copy template"],
    "business-mode-presets": ["List presets", "Load preset case", "Copy presets"],
    "workflow-quick-actions": ["Audit actions", "Load workflow", "Copy actions"],
    "offline-mode-indicator": ["Check runtime", "Load runtime case", "Copy runtime"],
    "sensitive-data-guard": ["Scan risk", "Load secret sample", "Copy audit"],
    "local-privacy-guard": ["Record privacy", "Load privacy case", "Copy state"],
    "vault-encryption": ["Check IPC", "Load vault secret", "Copy boundary"],
    "cloud-sync-boundary": ["Check boundary", "Load sync case", "Copy fallback"],
    "secrets-exposure-guard": ["Scan secrets", "Load secret sample", "Copy findings"],
    "ai-upload-guard": ["Guard AI", "Load AI risk", "Copy decision"],
    "redaction-lab": ["Redact now", "Load secret sample", "Copy redacted"],
    "security-audit-trail": ["Write audit", "Load audit case", "Copy audit"],
    "openrouter-live-ai": ["Check AI", "Load AI sample", "Copy payload"],
    "offline-ai-boundary": ["Check boundary", "Load offline case", "Copy status"],
    "camera-scan": ["Open scanner", "Load QR sample", "Copy barcode"],
    "image-upload-scan": ["Open upload", "Load image note", "Copy route"],
    "clipboard-image-scan": ["Check clipboard image", "Load image case", "Copy status"],
    "manual-paste-decode": ["Decode paste", "Load QR sample", "Copy value"],
    "save-barcode-result": ["Save result", "Load result", "Copy saved"],
    "barcode-extract-from-clipboard": ["Import text", "Load barcode", "Copy extract"],
  };

  if (byId[service.id]) return byId[service.id];
  if (service.category === "Developer" && developerToolIds.has(service.id)) {
    const label = service.displayName.replace(/\b(Builder|Generator|Formatter|Inspector|Parser|Lab|Checklist|Audit|Map)\b/g, "").trim() || "Tool";
    return [`Run ${label}`, `Load ${label}`, `Copy ${label}`];
  }
  if (!service.implemented || service.status === "Planned" || service.status === "Disabled") return ["Show status", "View fallback", "Copy reason"];
  if (service.category === "AI" || service.requiresConfig) return ["Run AI", "Load AI sample", "Copy payload"];
  if (service.category === "Packaging") return ["Check package", "Load command", "Copy command"];
  return ["Run service", "Use sample", "Copy result"];
}
