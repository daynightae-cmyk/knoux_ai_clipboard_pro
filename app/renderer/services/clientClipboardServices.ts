import { ClipboardItem, ClipboardType } from "../types";
import { detectSensitiveTypes } from "./runtimeServices";
import { downloadJson, downloadCsv, downloadMarkdown } from "../../shared/download-utils";

export type ClientServiceStatus = "Active" | "Ready" | "Guarded" | "Planned" | "Missing" | "Disabled";

export interface ServiceCard {
  id: string;
  displayName: string;
  description: string;
  status: ClientServiceStatus;
  implemented: boolean;
  requiresConfig: boolean;
  runtimeType: "electron" | "web" | "shared" | "windows-installer";
  dependency: string;
  fallback: string;
  disabledReason?: string;
  actionHandler?: string;
}

export interface ExtractedEntities {
  emails: string[];
  phones: string[];
  urls: string[];
  possibleAddresses: string[];
}

export interface DocumentBrief {
  kind: "pdf" | "document" | "spreadsheet" | "presentation" | "unknown";
  title: string;
  extension: string;
  suggestedTags: string[];
  actionPlan: string[];
}

export const DEFAULT_COLLECTIONS = [
  "Work",
  "Personal",
  "Code",
  "Links",
  "Replies",
  "Shipping",
  "Invoices",
  "PDF & Documents",
  "Important",
];

export const STATIC_TEMPLATES = [
  { id: "professional-reply", label: "Professional reply", content: "Hello,\n\nThank you for your message. I reviewed the details and will follow up with the next step shortly.\n\nBest regards," },
  { id: "apology-reply", label: "Apology reply", content: "Hello,\n\nI apologize for the inconvenience. I understand the concern and will work on resolving it as quickly as possible.\n\nBest regards," },
  { id: "payment-reminder", label: "Payment reminder", content: "Hello,\n\nThis is a friendly reminder that the pending payment is due. Please let me know if you need the invoice resent.\n\nThank you." },
  { id: "shipping-update", label: "Shipping update", content: "Hello,\n\nYour order is being prepared for shipment. I will share the tracking details as soon as they are available.\n\nThank you." },
  { id: "meeting-note", label: "Meeting note", content: "Meeting notes\n\nAttendees:\nDecisions:\nAction items:\nDue dates:" },
  { id: "invoice-note", label: "Invoice note", content: "Invoice note\n\nInvoice number:\nAmount:\nDue date:\nPayment status:" },
  { id: "pdf-review", label: "PDF review checklist", content: "PDF review\n\nDocument title:\nPurpose:\nImportant pages:\nEntities:\nRisks:\nAction items:" },
  { id: "document-handoff", label: "Document handoff", content: "Document handoff\n\nFile:\nOwner:\nStatus:\nRequired action:\nDeadline:\nNotes:" },
  { id: "task-checklist", label: "Task checklist", content: "- [ ] Confirm requirement\n- [ ] Prepare files\n- [ ] Review output\n- [ ] Send update" },
  { id: "whatsapp-business", label: "WhatsApp business response", content: "Hello, thanks for contacting Knoux. I received your message and will assist you shortly." },
];

export function hashContent(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i += 1) {
    hash = (hash << 5) - hash + content.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export function detectClipboardType(content: string): ClipboardType {
  const text = content.trim();
  if (/^https?:\/\//i.test(text)) return "link";
  if (/\.pdf(\b|$)/i.test(text)) return "pdf";
  if (/\.(docx?|xlsx?|pptx?|csv|txt|md)(\b|$)/i.test(text)) return "file";
  if (/^\s*[{[]/.test(text) || /\b(function|const|let|class|import|export|return)\b/.test(text)) return "code";
  if (/\.(png|jpe?g|gif|webp|svg)$/i.test(text)) return "image";
  return "text";
}

export function detectDocumentKind(content: string): DocumentBrief["kind"] {
  const text = content.toLowerCase();
  if (/\.pdf\b|pdf document/.test(text)) return "pdf";
  if (/\.xlsx?\b|spreadsheet|budget|sheet/.test(text)) return "spreadsheet";
  if (/\.pptx?\b|presentation|deck/.test(text)) return "presentation";
  if (/\.docx?\b|document|proposal|contract/.test(text)) return "document";
  return "unknown";
}

export function buildDocumentBrief(content: string): DocumentBrief {
  const clean = content.trim();
  const firstLine = clean.split(/\r?\n/)[0] || "Untitled document";
  const extension = (firstLine.match(/\.([a-z0-9]{2,5})\b/i)?.[1] || "").toLowerCase();
  const kind = detectDocumentKind(clean);
  const suggestedTags = Array.from(new Set([kind !== "unknown" ? kind : "document", ...autoTags(clean)])).filter(Boolean);
  return {
    kind,
    title: firstLine.slice(0, 120),
    extension,
    suggestedTags,
    actionPlan: [
      "Identify document purpose and owner.",
      "Extract names, dates, invoice or proposal details when present.",
      "Send to OpenRouter only after sensitive data review.",
      "Save summary, action items, and follow-up notes as linked clipboard cards.",
    ],
  };
}

export function buildDocumentBriefMarkdown(content: string): string {
  const brief = buildDocumentBrief(content);
  return [
    "# KNOUX Document Brief",
    `Title: ${brief.title}`,
    `Kind: ${brief.kind}`,
    `Extension: ${brief.extension || "not detected"}`,
    `Tags: ${brief.suggestedTags.join(", ") || "document"}`,
    "",
    "## Action Plan",
    ...brief.actionPlan.map((step) => `- ${step}`),
  ].join("\n");
}

export function autoTags(content: string): string[] {
  const tags = new Set<string>();
  const text = content.trim();
  const lower = text.toLowerCase();
  if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text)) tags.add("email");
  if (/\+?\d[\d\s().-]{7,}/.test(text)) tags.add("phone");
  if (/https?:\/\/\S+/i.test(text)) tags.add("link");
  if (/^\s*[{[]/.test(text)) tags.add("json");
  if (/\b(function|const|let|class|import|export|return)\b/.test(text)) tags.add("code");
  if (/\binvoice|inv[-\s]?\d+/i.test(text)) tags.add("invoice");
  if (/\btracking|awb|shipment|fedex|dhl|ups\b/i.test(text)) tags.add("tracking");
  if (/\b(street|st\.|road|rd\.|avenue|ave\.|abu dhabi|dubai|uae)\b/i.test(text)) tags.add("address");
  if (/\.pdf\b|pdf document/.test(lower)) tags.add("pdf");
  if (/\.docx?\b|\.xlsx?\b|\.pptx?\b|document|proposal|contract|sheet|deck/.test(lower)) tags.add("document");
  if (detectSensitiveTypes(text).length) tags.add("guarded");
  return Array.from(tags);
}

export function cleanText(content: string): string {
  return content.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").replace(/^\s*[-*]\s+/gm, "- ").trim();
}

export function extractEntities(content: string): ExtractedEntities {
  const emails = content.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [];
  const phones = content.match(/\+?\d[\d\s().-]{7,}\d/g) || [];
  const urls = content.match(/https?:\/\/[^\s)]+/gi) || [];
  const possibleAddresses = content.split(/\n|;/).map((line) => line.trim()).filter((line) => /\b(street|st\.|road|rd\.|avenue|ave\.|abu dhabi|dubai|uae|zip|postal)\b/i.test(line)).slice(0, 8);
  return { emails: Array.from(new Set(emails)), phones: Array.from(new Set(phones)), urls: Array.from(new Set(urls)), possibleAddresses: Array.from(new Set(possibleAddresses)) };
}

export function groupClipsByDate(items: ClipboardItem[]) {
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startYesterday = startToday - 24 * 60 * 60 * 1000;
  const startWeek = startToday - 6 * 24 * 60 * 60 * 1000;
  return {
    Today: items.filter((item) => new Date(item.timestamp).getTime() >= startToday),
    Yesterday: items.filter((item) => { const time = new Date(item.timestamp).getTime(); return time >= startYesterday && time < startToday; }),
    "This Week": items.filter((item) => { const time = new Date(item.timestamp).getTime(); return time >= startWeek && time < startYesterday; }),
    Older: items.filter((item) => new Date(item.timestamp).getTime() < startWeek),
  };
}

export function duplicateSummary(items: ClipboardItem[]) {
  const counts = new Map<string, number>();
  items.forEach((item) => counts.set(hashContent(item.content), (counts.get(hashContent(item.content)) || 0) + 1));
  const duplicateGroups = Array.from(counts.values()).filter((count) => count > 1);
  return { duplicateGroups: duplicateGroups.length, duplicateCount: duplicateGroups.reduce((sum, count) => sum + count - 1, 0) };
}

export function removeDuplicates(items: ClipboardItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (item.pinned) return true;
    const hash = hashContent(item.content);
    if (seen.has(hash)) return false;
    seen.add(hash);
    return true;
  });
}

export function buildDailySummary(items: ClipboardItem[]) {
  const today = groupClipsByDate(items).Today;
  const typeCounts = today.reduce<Record<string, number>>((acc, item) => { acc[item.type] = (acc[item.type] || 0) + 1; return acc; }, {});
  return { clips: today.length, topTypes: Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).slice(0, 3), pinned: today.filter((item) => item.pinned).length, sensitive: today.filter((item) => item.isSecure || detectSensitiveTypes(item.content).length).length, duplicatesAvoided: duplicateSummary(items).duplicateCount };
}

export function exportJsonFile(filename: string, payload: unknown) {
  downloadJson(filename, payload);
}

export function exportCsvFile(filename: string, items: ClipboardItem[]) {
  const header = ["id", "type", "source", "timestamp", "pinned", "favorite", "tags", "content"];
  const rows = items.map((item) => [item.id, item.type, item.source, item.timestamp, String(item.pinned), String(item.favorite), item.tags.join("|"), item.content.replace(/\r?\n/g, " ")]);
  const csv = [header, ...rows].map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
  downloadCsv(filename, csv);
}

export function exportMarkdownFile(filename: string, markdown: string) {
  downloadMarkdown(filename, markdown);
}

export function isElectronRuntime() {
  return Boolean((window as any).electronAPI?.clipboard || (window as any).electron?.clipboard || (window as any).knoux?.clipboard);
}

export async function importCurrentClipboardFromRuntime(): Promise<string> {
  const api = (window as any).electronAPI?.clipboard || (window as any).electron?.clipboard || (window as any).knoux?.clipboard;
  if (api?.readText) return api.readText();
  if (api?.read) {
    const result = await api.read();
    if (typeof result === "string") return result;
    if (Array.isArray(result) && result[0]?.content) return result[0].content;
  }
  if (navigator.clipboard?.readText) return navigator.clipboard.readText();
  return "";
}

export const CLIENT_SERVICE_CARDS: ServiceCard[] = [
  { id: "smart-inbox", displayName: "Smart Clipboard Inbox", description: "Groups persisted local clips by Today, Yesterday, This Week, and Older.", status: "Active", implemented: true, requiresConfig: false, runtimeType: "shared", dependency: "knoux_clips localStorage", fallback: "Manual snippet entry remains available.", actionHandler: "groupClipsByDate" },
  { id: "pdf-brief", displayName: "PDF Brief Builder", description: "Creates a local document brief and action plan for PDF-like clipboard records.", status: "Active", implemented: true, requiresConfig: false, runtimeType: "shared", dependency: "buildDocumentBriefMarkdown", fallback: "Save the PDF filename and notes as a document card.", actionHandler: "buildDocumentBriefMarkdown" },
  { id: "document-card-classifier", displayName: "Document Card Classifier", description: "Detects PDF, Word, Excel, PowerPoint, CSV, and markdown references and routes them to PDF & Documents.", status: "Active", implemented: true, requiresConfig: false, runtimeType: "shared", dependency: "detectClipboardType/autoTags", fallback: "Use manual type selection.", actionHandler: "detectClipboardType" },
  { id: "markdown-export", displayName: "PDF / Markdown Handoff Export", description: "Exports document briefs and handoff notes as downloadable Markdown.", status: "Active", implemented: true, requiresConfig: false, runtimeType: "shared", dependency: "Blob markdown export", fallback: "Copy the generated brief manually.", actionHandler: "exportMarkdownFile" },
  { id: "quick-favorites", displayName: "Quick Paste Favorites", description: "Pinned/favorite snippets persist after restart through the local vault.", status: "Active", implemented: true, requiresConfig: false, runtimeType: "shared", dependency: "favorite and pinned fields", fallback: "Use pinned clips in Clipboard Hub.", actionHandler: "onToggleFavorite" },
  { id: "customer-reply-builder", displayName: "Customer Reply Builder", description: "Uses OpenRouter only when configured; otherwise reports provider_not_configured.", status: "Ready", implemented: true, requiresConfig: true, runtimeType: "shared", dependency: "OPENROUTER_API_KEY", fallback: "Use static reply templates.", actionHandler: "/api/ai/reply" },
  { id: "smart-text-cleaner", displayName: "Smart Text Cleaner", description: "Offline cleanup removes duplicate whitespace, excess line breaks, and normalizes bullets.", status: "Active", implemented: true, requiresConfig: false, runtimeType: "shared", dependency: "deterministic text normalizer", fallback: "Original content is preserved until user saves the cleaned copy.", actionHandler: "cleanText" },
  { id: "link-organizer", displayName: "Link Organizer", description: "Detects URLs and domains locally without remote metadata fetches.", status: "Active", implemented: true, requiresConfig: false, runtimeType: "shared", dependency: "offline URL parsing", fallback: "Copy/open detected URLs manually.", actionHandler: "extractEntities" },
  { id: "code-snippet-saver", displayName: "Code Snippet Saver", description: "Detects code-like content, tags it, and saves it into Code collection.", status: "Active", implemented: true, requiresConfig: false, runtimeType: "shared", dependency: "rule-based code detection", fallback: "AI explanation remains guarded by provider configuration.", actionHandler: "detectClipboardType" },
  { id: "entity-extractor", displayName: "Email / Phone / Address Extractor", description: "Offline regex extracts emails, phone numbers, URLs, and possible addresses.", status: "Active", implemented: true, requiresConfig: false, runtimeType: "shared", dependency: "offline regex scanner", fallback: "Copy whole clip if extraction misses an edge case.", actionHandler: "extractEntities" },
  { id: "sensitive-data-guard", displayName: "Sensitive Data Guard", description: "Detects credentials, tokens, card-like numbers, and private-key text locally.", status: "Active", implemented: true, requiresConfig: false, runtimeType: "shared", dependency: "detectSensitiveTypes", fallback: "AI actions stay guarded for sensitive content.", actionHandler: "detectSensitiveTypes" },
  { id: "duplicate-cleaner", displayName: "Duplicate Cleaner", description: "Hashes clip content, reports duplicates, and removes unpinned repeats.", status: "Active", implemented: true, requiresConfig: false, runtimeType: "shared", dependency: "hashContent", fallback: "Pinned duplicates are preserved.", actionHandler: "removeDuplicates" },
  { id: "clipboard-collections", displayName: "Clipboard Collections", description: "Work, Personal, Code, Links, Replies, Shipping, Invoices, PDF & Documents, and Important collections persist locally.", status: "Active", implemented: true, requiresConfig: false, runtimeType: "shared", dependency: "knoux_folders localStorage", fallback: "General collection is always available.", actionHandler: "folder assignment" },
  { id: "smart-labels", displayName: "Smart Labels / Auto Tags", description: "Rule-based tags include email, phone, link, code, json, invoice, tracking, address, PDF, document, and guarded.", status: "Active", implemented: true, requiresConfig: false, runtimeType: "shared", dependency: "autoTags", fallback: "Manual tags can be added.", actionHandler: "autoTags" },
  { id: "copy-templates", displayName: "One-Click Copy Templates", description: "Static business and document templates copy or save real text with no AI dependency.", status: "Active", implemented: true, requiresConfig: false, runtimeType: "shared", dependency: "STATIC_TEMPLATES", fallback: "Templates can be copied manually from the panel.", actionHandler: "STATIC_TEMPLATES" },
  { id: "backup-center", displayName: "Clipboard Backup Center", description: "Exports the vault as JSON and visible list as CSV downloads.", status: "Active", implemented: true, requiresConfig: false, runtimeType: "shared", dependency: "Blob downloads", fallback: "Restore remains planned outside verified JSON import paths.", actionHandler: "exportJsonFile/exportCsvFile" },
  { id: "smart-search", displayName: "Smart Search Assistant", description: "Searches text, type, tags, date, source, pinned, sensitive, and collection fields locally.", status: "Active", implemented: true, requiresConfig: false, runtimeType: "shared", dependency: "renderer filter pipeline", fallback: "Use global Ctrl+K search.", actionHandler: "ClipboardWorkspace filters" },
  { id: "daily-summary", displayName: "Daily Clipboard Summary", description: "Shows local counts, top types, pinned count, sensitive detections, and duplicates avoided.", status: "Active", implemented: true, requiresConfig: false, runtimeType: "shared", dependency: "buildDailySummary", fallback: "No AI summary is claimed.", actionHandler: "buildDailySummary" },
  { id: "workflow-actions", displayName: "Workflow Quick Actions", description: "Copy, pin, delete, tag, collection, clean, extract, document brief, guarded AI handoff, and export selected item.", status: "Active", implemented: true, requiresConfig: false, runtimeType: "shared", dependency: "ClipboardWorkspace handlers", fallback: "AI actions are guarded when provider or content safety blocks them.", actionHandler: "workflow action buttons" },
  { id: "business-presets", displayName: "Business Mode Presets", description: "Developer, Office, Support, E-commerce, and Personal presets filter suggested collections.", status: "Active", implemented: true, requiresConfig: false, runtimeType: "shared", dependency: "collection filter presets", fallback: "All Clips mode shows everything.", actionHandler: "businessMode state" },
  { id: "offline-indicator", displayName: "Offline Mode Indicator", description: "Truthfully reports Online, Offline, AI Provider Missing, Electron Runtime, or Web Limited Runtime.", status: "Active", implemented: true, requiresConfig: false, runtimeType: "shared", dependency: "navigator.onLine and bridge detection", fallback: "Web runtime remains browser-limited.", actionHandler: "runtime indicator" },
  { id: "windows-current-import", displayName: "Windows Current Clipboard Import", description: "Imports current clipboard through Electron bridge when present, otherwise browser permission.", status: "Ready", implemented: true, requiresConfig: false, runtimeType: "electron", dependency: "Electron preload clipboard bridge", fallback: "Web uses browser clipboard permission.", actionHandler: "importCurrentClipboardFromRuntime" },
  { id: "windows-live-monitor", displayName: "Windows Live Clipboard Monitor", description: "Main/preload monitoring exists in Electron; web build is guarded and browser-limited.", status: "Guarded", implemented: true, requiresConfig: false, runtimeType: "electron", dependency: "clipboard:start-monitoring IPC", fallback: "Use manual import in web.", actionHandler: "electronAPI.clipboard.startMonitoring" },
  { id: "historical-winv-import", displayName: "Historical Win+V Import", description: "Full Windows historical clipboard import is not verified in this build.", status: "Planned", implemented: false, requiresConfig: false, runtimeType: "electron", dependency: "Windows history API", fallback: "Import current clipboard item only.", disabledReason: "Windows Win+V history import is planned until verified." },
];
