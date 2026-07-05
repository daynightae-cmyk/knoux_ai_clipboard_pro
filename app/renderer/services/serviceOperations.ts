import { ClipboardItem } from "../types";
import { ProductionService } from "./productionCatalog";
import { autoTags, buildDailySummary, buildDocumentBriefMarkdown, cleanText, detectClipboardType, duplicateSummary, exportCsvFile, exportJsonFile, exportMarkdownFile, extractEntities, groupClipsByDate, removeDuplicates } from "./clientClipboardServices";
import { compactLocalStore, detectSensitiveTypes, getStorageHealth, readSystemClipboard, writeSystemClipboard } from "./runtimeServices";
import { runKnouxAIAction } from "./aiClient";

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

const format = (value: unknown) => typeof value === "string" ? value : JSON.stringify(value, null, 2);
const activeText = (input: string) => input.trim() || sampleText;

const blocked = (service: ProductionService): ServiceOperationResult => ({
  ok: false,
  status: service.status,
  title: service.displayName,
  output: `${service.displayName} is ${service.status}.\n\nReason: ${service.disabledReason || service.description}\n\nFallback: ${service.fallback}`,
  action: "guarded"
});

export function buildServiceSample(service: ProductionService): string {
  if (service.category === "AI") return "Summarize this: Knoux AI Clipboard Pro captures clipboard content, keeps it local-first, and routes AI tasks through guarded OpenRouter only when configured.";
  if (service.id.includes("code") || service.id.includes("api")) return "const service = { name: 'Knoux', ready: true };\nexport default service;";
  if (service.id.includes("json")) return '{"product":"Knoux AI Clipboard Pro","ready":true}';
  if (service.id.includes("pdf") || service.id.includes("document")) return "Project Proposal.pdf\nClient: KNOUX\nPurpose: AI Clipboard Pro deployment\nAction: review document and extract tasks.";
  if (service.category === "Security") return "OPENROUTER_API_KEY=sk-or-v1-REPLACE_ME\npassword: example-only\nadmin@knoux.store";
  if (service.category === "Barcode") return "https://knoux.store/tracking/KNX-4455";
  return sampleText;
}

export async function runServiceOperation(service: ProductionService, input: string, items: ClipboardItem[] = []): Promise<ServiceOperationResult> {
  if (!service.implemented || service.status === "Planned" || service.status === "Missing" || service.status === "Disabled") return blocked(service);
  const text = activeText(input || buildServiceSample(service));

  const aiAction = aiActionByServiceId[service.id];
  if (aiAction || service.category === "AI") {
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
    case "windows-live-clipboard-monitor": return { ok: false, status: "guarded", title: service.displayName, output: "Live monitor requires verified Electron bridge. Web runtime stays guarded. Use current clipboard import now.", action: "guarded" };
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
    case "smart-text-cleaner": return { ok: true, status: "active", title: service.displayName, output: cleanText(text), action: "clean" };
    case "link-organizer": return { ok: true, status: "active", title: service.displayName, output: format(extractEntities(text).urls.map((url) => ({ url, domain: new URL(url).hostname }))), action: "links" };
    case "code-snippet-saver": return { ok: true, status: "active", title: service.displayName, output: `Detected type: ${detectClipboardType(text)}\nTags: ${autoTags(text).join(", ") || "none"}`, action: "code-detect" };
    case "entity-extractor": return { ok: true, status: "active", title: service.displayName, output: format(extractEntities(text)), action: "entities" };
    case "one-click-copy-templates": return { ok: true, status: "active", title: service.displayName, output: "Templates are available in Clipboard Hub. Use the writing panel to save them as snippets.", action: "templates" };
    case "business-mode-presets": return { ok: true, status: "active", title: service.displayName, output: "Presets: Developer, Office, Customer Support, E-commerce, Personal, All.", action: "presets" };
    case "workflow-quick-actions": return { ok: true, status: "active", title: service.displayName, output: "Workflow controls: copy, pin, favorite, delete, clean, extract, AI handoff, export, collection assignment.", action: "workflow" };
    case "offline-mode-indicator": return { ok: true, status: navigator.onLine ? "online" : "offline", title: service.displayName, output: `navigator.onLine=${navigator.onLine}\nElectron bridge=${Boolean((window as any).knoux || (window as any).electronAPI)}`, action: "runtime" };
    case "sensitive-data-guard":
    case "secrets-exposure-guard": return { ok: true, status: "active", title: service.displayName, output: format(detectSensitiveTypes(text)), action: "guard-scan" };
    case "local-privacy-guard": localStorage.setItem("knoux_privacy_mode_last_check", new Date().toISOString()); return { ok: true, status: "active", title: service.displayName, output: "Privacy guard check recorded locally. New clips can be marked secure by Privacy Mode.", action: "privacy" };
    case "vault-encryption": return { ok: Boolean((window as any).knoux?.security), status: Boolean((window as any).knoux?.security) ? "ready" : "guarded", title: service.displayName, output: "Electron encryption bridge is checked at runtime. Web localStorage is not claimed as encrypted.", action: "encryption-check" };
    case "ai-upload-guard": return { ok: true, status: "guarded", title: service.displayName, output: detectSensitiveTypes(text).length ? "Sensitive input detected. AI upload should remain blocked until redacted." : "No sensitive classes detected in the active text buffer.", action: "ai-guard" };
    case "camera-scan":
    case "image-upload-scan":
    case "manual-paste-decode":
    case "save-barcode-result":
    case "barcode-extract-from-clipboard": return { ok: true, status: service.status.toLowerCase(), title: service.displayName, output: `Barcode action is available on Barcode Scanner page. Test value: ${text}`, action: "open-barcode" };
    default:
      if (service.category === "Developer") return { ok: true, status: "active", title: service.displayName, output: `Developer service is wired in Studio. Handler: ${service.actionHandler || "StudioPage"}\nUse the Service Console, AI Route Diagnostics, command center, and handoff export controls.`, action: "developer" };
      if (service.category === "Packaging") return { ok: service.implemented, status: service.status.toLowerCase(), title: service.displayName, output: `Packaging control: ${service.displayName}\nHandler: ${service.actionHandler || "None"}\nCommand: npm run dist:installer\nFallback: ${service.fallback}`, action: "packaging" };
      return { ok: true, status: service.status.toLowerCase(), title: service.displayName, output: `${service.displayName}\n${service.description}\nHandler: ${service.actionHandler || "None"}`, action: "info" };
  }
}

export function serviceActionLabels(service: ProductionService) {
  if (!service.implemented || service.status === "Planned" || service.status === "Disabled") return ["Show Status"];
  if (service.category === "AI" || service.requiresConfig) return ["Run AI", "Copy Payload"];
  if (service.category === "Packaging") return ["Check", "Copy Command"];
  if (service.category === "Barcode") return ["Open/Test", "Copy Sample"];
  return ["Run", "Copy Result"];
}
