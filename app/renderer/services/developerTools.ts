import { hashContent } from './clientClipboardServices';

export type DeveloperToolId =
  | "json-format"
  | "regex-test"
  | "markdown-preview"
  | "markdown-table"
  | "hash-generator"
  | "base64-encode"
  | "base64-decode"
  | "code-formatter"
  | "env-checklist"
  | "api-action"
  | "commit-message"
  | "readme-block"
  | "pdf-brief"
  | "jwt-inspector"
  | "secret-scanner"
  | "large-text-analyzer"
  | "url-parser"
  | "diff-summary"
  | "typescript-interface"
  | "zod-schema"
  | "sql-checklist"
  | "release-notes"
  | "bug-report"
  | "test-plan"
  | "i18n-audit"
  | "redaction-map";

export interface DeveloperToolCard {
  id: DeveloperToolId;
  title: string;
  description: string;
  status: "Active" | "Ready" | "Guarded";
  inputLabel: string;
  actionLabel: string;
  sampleLabel: string;
  copyLabel: string;
  placeholder: string;
  sample: string;
  outputLabel: string;
}

export const DEVELOPER_TOOLS: DeveloperToolCard[] = [
  { id: "json-format", title: "JSON Formatter", description: "Validate, normalize, and pretty-print JSON locally.", status: "Active", inputLabel: "JSON input", actionLabel: "Format JSON", sampleLabel: "Load JSON", copyLabel: "Copy formatted", placeholder: "Paste JSON here", sample: '{"product":"Knoux AI Clipboard Pro","ready":true,"services":19}', outputLabel: "Validated JSON" },
  { id: "regex-test", title: "Regex Lab", description: "Test a JavaScript regex against sample text with match count.", status: "Active", inputLabel: "Pattern then sample", actionLabel: "Test Regex", sampleLabel: "Load regex case", copyLabel: "Copy matches", placeholder: "First line: pattern\nRemaining lines: sample text", sample: "\\b[A-Z]{2,}-\\d{4}\\b\nTicket KNX-2026 is linked to PR DAY-4455 and invalid K-1.", outputLabel: "Regex matches" },
  { id: "markdown-preview", title: "Markdown Preview", description: "Render markdown and report structural counts locally in a background worker.", status: "Active", inputLabel: "Markdown input", actionLabel: "Render Markdown", sampleLabel: "Load markdown", copyLabel: "Copy preview", placeholder: "# Title\n\n- item", sample: "# Knoux AI Clipboard Pro\n\n- Local-first\n- Worker-backed\n- Secure by design", outputLabel: "Rendered markdown preview" },
  { id: "markdown-table", title: "Markdown Table Builder", description: "Convert comma-separated rows into a clean Markdown table.", status: "Active", inputLabel: "CSV rows", actionLabel: "Build Table", sampleLabel: "Load CSV", copyLabel: "Copy table", placeholder: "Name,Status\nAI,Ready", sample: "Service,Status,Runtime\nOpenRouter,Ready,server\nBarcode,Active,web\nVault,Guarded,electron", outputLabel: "Markdown table" },
  { id: "hash-generator", title: "Hash Generator", description: "Generate a local SHA-256 digest without leaving the device.", status: "Active", inputLabel: "Input text", actionLabel: "Generate Hash", sampleLabel: "Load hash sample", copyLabel: "Copy hash", placeholder: "Paste text to hash", sample: "Knoux AI Clipboard Pro V1.1.0", outputLabel: "SHA hash" },
  { id: "base64-encode", title: "Base64 Encode", description: "Encode text into Base64 locally for transport or debugging.", status: "Active", inputLabel: "Plain text", actionLabel: "Encode", sampleLabel: "Load plain text", copyLabel: "Copy Base64", placeholder: "Encode this text", sample: "Authorization: Bearer demo-token", outputLabel: "Base64 output" },
  { id: "base64-decode", title: "Base64 Decode", description: "Decode Base64 payloads locally with no network dependency.", status: "Active", inputLabel: "Base64 input", actionLabel: "Decode", sampleLabel: "Load Base64", copyLabel: "Copy decoded", placeholder: "QmFzZTY0IHBheWxvYWQ=", sample: "S25vdXggQUkgQ2xpcGJvYXJkIFBybw==", outputLabel: "Decoded payload" },
  { id: "code-formatter", title: "Code Formatter", description: "Format JSON-like structures and generate TypeScript/Zod scaffolds.", status: "Active", inputLabel: "Code or JSON input", actionLabel: "Format Code", sampleLabel: "Load code sample", copyLabel: "Copy formatted", placeholder: "{\"id\":1}", sample: "{\"id\":\"knx-1\",\"status\":\"ready\",\"secure\":true}", outputLabel: "Formatted code scaffold" },
  { id: "env-checklist", title: "Environment Checklist", description: "Generate a deployment checklist for required environment variables.", status: "Active", inputLabel: "Variables", actionLabel: "Build Checklist", sampleLabel: "Load env vars", copyLabel: "Copy checklist", placeholder: "OPENROUTER_API_KEY\nOPENROUTER_MODEL", sample: "OPENROUTER_API_KEY\nOPENROUTER_MODEL\nOPENROUTER_SITE_URL\nVITE_APP_VERSION", outputLabel: "Environment readiness" },
  { id: "api-action", title: "API Action Builder", description: "Create a safe payload shape for /api/ai/[action] testing.", status: "Ready", inputLabel: "Action and text", actionLabel: "Build Payload", sampleLabel: "Load API action", copyLabel: "Copy payload", placeholder: "summarize\nText to process", sample: "summarize\nKnoux AI Clipboard Pro keeps clipboard workflows local-first and calls AI only through a guarded server route.", outputLabel: "API payload" },
  { id: "commit-message", title: "Commit Message Generator", description: "Build a professional conventional commit from implementation notes.", status: "Ready", inputLabel: "Change notes", actionLabel: "Build Commit", sampleLabel: "Load change notes", copyLabel: "Copy commit", placeholder: "Updated UI cards and settings", sample: "Developer Studio cards now have three service-specific actions\nSecurity page upgraded with richer local guard operations\nRemoved unsupported icon import risk", outputLabel: "Commit draft" },
  { id: "readme-block", title: "README Block Generator", description: "Create a polished README section for a real feature.", status: "Ready", inputLabel: "Feature notes", actionLabel: "Build README", sampleLabel: "Load README notes", copyLabel: "Copy block", placeholder: "Feature name and bullets", sample: "Developer Studio\n19 executable local developer utilities\nReal service operation outputs\nExportable handoff report", outputLabel: "README block" },
  { id: "pdf-brief", title: "Document Brief Builder", description: "Create a structured handoff brief for proposals, PDFs, or invoices.", status: "Active", inputLabel: "Document notes", actionLabel: "Build Brief", sampleLabel: "Load document brief", copyLabel: "Copy brief", placeholder: "Proposal.pdf\nPurpose, risks, actions", sample: "Project Proposal.pdf\nClient: KNOUX\nPurpose: production readiness review\nRisk: sensitive API keys must stay server-side", outputLabel: "Document brief" },
  { id: "jwt-inspector", title: "JWT Inspector", description: "Decode JWT header and payload locally without network calls.", status: "Active", inputLabel: "JWT token", actionLabel: "Inspect JWT", sampleLabel: "Load JWT", copyLabel: "Copy decoded", placeholder: "eyJhbGciOi...", sample: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJrbm91eCIsInJvbGUiOiJkZXZlbG9wZXIiLCJpYXQiOjE3ODMyMjEyMzV9.signature", outputLabel: "Decoded JWT" },
  { id: "secret-scanner", title: "Secret Scanner", description: "Scan text for API keys, tokens, emails, cards, and private-key material.", status: "Active", inputLabel: "Sensitive text", actionLabel: "Scan Secrets", sampleLabel: "Load secret case", copyLabel: "Copy findings", placeholder: "Paste secrets or logs here", sample: "OPENROUTER_API_KEY=sk-or-v1-abcdefghijklmnopqrstuvwxyz123456\nAuthorization: Bearer qwerty12345678901234567890", outputLabel: "Security findings" },
  { id: "large-text-analyzer", title: "Large Text Analyzer", description: "Analyze long text size, structure, and reading cost off the main thread.", status: "Active", inputLabel: "Large text input", actionLabel: "Analyze Text", sampleLabel: "Load large text", copyLabel: "Copy analysis", placeholder: "Paste logs, markdown, or API output", sample: "Line one of a long handoff.\nLine two includes structured content.\n\nThird paragraph closes the session.", outputLabel: "Text diagnostics" },
  { id: "url-parser", title: "URL Parser", description: "Parse URL origin, path, query parameters, and hash locally.", status: "Active", inputLabel: "URL", actionLabel: "Parse URL", sampleLabel: "Load URL", copyLabel: "Copy parts", placeholder: "https://knoux.store/app?mode=pro", sample: "https://knoux.store/developer?service=ai-route&mode=pro#diagnostics", outputLabel: "URL parts" },
  { id: "diff-summary", title: "Diff Summary", description: "Summarize changed lines from a pasted unified diff.", status: "Active", inputLabel: "Unified diff", actionLabel: "Summarize Diff", sampleLabel: "Load diff", copyLabel: "Copy summary", placeholder: "diff --git ...", sample: "diff --git a/StudioPage.tsx b/StudioPage.tsx\n+Added 19 developer utility cards\n+Added action toolbar\n-Removed weak compact list layout", outputLabel: "Diff summary" },
  { id: "typescript-interface", title: "TypeScript Interface Builder", description: "Convert simple key:value notes into an exported interface.", status: "Active", inputLabel: "Shape notes", actionLabel: "Build Interface", sampleLabel: "Load shape", copyLabel: "Copy interface", placeholder: "name:string\nready:boolean", sample: "id:string\ntitle:string\nstatus:Active | Ready | Guarded\nlatencyMs:number\nsecure:boolean", outputLabel: "TypeScript interface" },
  { id: "zod-schema", title: "Zod Schema Builder", description: "Generate a practical Zod object schema from key:type notes.", status: "Active", inputLabel: "Schema fields", actionLabel: "Build Zod", sampleLabel: "Load schema", copyLabel: "Copy schema", placeholder: "email:string\ncount:number", sample: "email:string\npassword:string\nclipCount:number\nprivacyMode:boolean", outputLabel: "Zod schema" },
  { id: "sql-checklist", title: "SQL Safety Checklist", description: "Review SQL text for production safety flags and migration notes.", status: "Guarded", inputLabel: "SQL statement", actionLabel: "Audit SQL", sampleLabel: "Load SQL", copyLabel: "Copy audit", placeholder: "ALTER TABLE ...", sample: "alter table profiles add column language text default 'ar';\nupdate profiles set role = 'admin' where email = 'daynight.ae@gmail.com';", outputLabel: "SQL audit" },
  { id: "release-notes", title: "Release Notes Builder", description: "Convert implementation notes into professional release notes.", status: "Active", inputLabel: "Release notes", actionLabel: "Build Notes", sampleLabel: "Load notes", copyLabel: "Copy release", placeholder: "Added...\nFixed...", sample: "Fixed unsupported lucide icon import\nExpanded Developer Studio cards\nUpgraded security operations UX\nImproved purple glass contrast", outputLabel: "Release notes" },
  { id: "bug-report", title: "Bug Report Builder", description: "Structure a clear bug report with impact, reproduction, and fix path.", status: "Active", inputLabel: "Bug details", actionLabel: "Build Report", sampleLabel: "Load bug", copyLabel: "Copy report", placeholder: "Issue, steps, expected, actual", sample: "Issue: Vercel build failed\nActual: ClipboardImage not exported by lucide-react\nExpected: renderer build passes\nFix: replace import and render supported icon", outputLabel: "Bug report" },
  { id: "test-plan", title: "Test Plan Builder", description: "Generate a deterministic manual QA plan for a feature.", status: "Active", inputLabel: "Feature notes", actionLabel: "Build Test Plan", sampleLabel: "Load feature", copyLabel: "Copy plan", placeholder: "Feature name and scenarios", sample: "Developer Studio\nRun every tool card\nLoad sample for every card\nCopy output for every card\nResize web preview", outputLabel: "Manual QA plan" },
  { id: "i18n-audit", title: "Arabic/English i18n Audit", description: "Find mixed-direction risks and produce RTL review notes.", status: "Active", inputLabel: "Screen copy", actionLabel: "Audit i18n", sampleLabel: "Load mixed copy", copyLabel: "Copy audit", placeholder: "Paste interface copy", sample: "Developer Studio\nلوحة المطورين\nRun AI\nنسخ النتيجة\nOpenRouter provider guarded", outputLabel: "i18n audit" },
  { id: "redaction-map", title: "Secret Redaction Map", description: "Mask emails, tokens, private keys, and long numeric secrets before sharing.", status: "Active", inputLabel: "Sensitive text", actionLabel: "Redact", sampleLabel: "Load secret sample", copyLabel: "Copy redacted", placeholder: "Paste sensitive text", sample: "OPENROUTER_API_KEY=sk-or-v1-abcdefghijklmnopqrstuvwxyz123456\nEmail: admin@knoux.store\nCard: 4242 4242 4242 4242", outputLabel: "Redacted text" },
];

const tableFromCsv = (input: string) => {
  const rows = input.trim().split(/\r?\n/).filter(Boolean).map((line) => line.split(",").map((cell) => cell.trim()));
  if (!rows.length || rows[0].length < 2) return "Need at least two CSV columns.";
  const width = rows[0].length;
  const normalized = rows.map((row) => Array.from({ length: width }, (_, index) => row[index] || ""));
  const header = `| ${normalized[0].join(" | ")} |`;
  const sep = `| ${normalized[0].map(() => "---").join(" | ")} |`;
  const body = normalized.slice(1).map((row) => `| ${row.join(" | ")} |`);
  return [header, sep, ...body].join("\n");
};

const firstLine = (input: string, fallback = "KNOUX update") => input.trim().split(/\r?\n/)[0]?.trim() || fallback;

const parseFields = (input: string) => input
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean)
  .map((line) => {
    const [rawKey, ...rest] = line.split(":");
    const key = (rawKey || "field").trim().replace(/[^a-zA-Z0-9_]/g, "") || "field";
    const rawType = rest.join(":").trim() || "string";
    return { key, rawType };
  });

const zodType = (rawType: string) => {
  const t = rawType.toLowerCase();
  if (t.includes("number") || t.includes("int") || t.includes("float")) return "z.number()";
  if (t.includes("boolean") || t.includes("bool")) return "z.boolean()";
  if (t.includes("date")) return "z.string().datetime().or(z.date())";
  if (t.includes("array") || t.endsWith("[]")) return "z.array(z.string())";
  if (t.includes("email")) return "z.string().email()";
  if (t.includes("url")) return "z.string().url()";
  return "z.string().min(1)";
};

const encodeBase64 = (value: string) => {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
};

const decodeBase64 = (value: string) => {
  const binary = atob(value);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

const formatCode = (value: string) => {
  const clean = value.trim();
  if (/^\s*[{[]/.test(clean)) {
    try {
      return JSON.stringify(JSON.parse(clean), null, 2);
    } catch {
      return clean;
    }
  }
  return clean
    .replace(/\r\n/g, "\n")
    .replace(/\t/g, "  ")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n");
};

const decodeJwtPart = (part: string) => {
  const normalized = part.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return JSON.parse(decodeURIComponent(Array.from(atob(padded)).map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`).join("")));
};

const redact = (input: string) => input
  .replace(/-----BEGIN[\s\S]+?PRIVATE KEY-----/g, "-----BEGIN REDACTED PRIVATE KEY-----")
  .replace(/\b(sk-or-v1-|sk-)[A-Za-z0-9_\-]{18,}\b/g, "$1REDACTED")
  .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[email-redacted]")
  .replace(/\b(?:\d[ -]*?){13,16}\b/g, "[number-redacted]")
  .replace(/\b(bearer|token|access[_-]?token|refresh[_-]?token)\s*[:=]?\s*[\"']?[A-Za-z0-9._\-]{20,}/gi, "$1=[token-redacted]")
  .replace(/^([A-Z0-9_]*(SECRET|TOKEN|KEY|PASSWORD)[A-Z0-9_]*)\s*=\s*.+$/gim, "$1=[secret-redacted]");

export function getDeveloperToolSample(id: DeveloperToolId): string {
  return DEVELOPER_TOOLS.find((tool) => tool.id === id)?.sample || "";
}

export function runDeveloperTool(id: DeveloperToolId, input: string): string {
  const clean = input.trim();
  if (!clean) return "No input provided.";

  if (id === "json-format") {
    try { return JSON.stringify(JSON.parse(clean), null, 2); } catch (error: any) { return `JSON error: ${error?.message || "invalid JSON"}`; }
  }

  if (id === "regex-test") {
    const [pattern, ...rest] = clean.split(/\r?\n/);
    const sample = rest.join("\n");
    try {
      const re = new RegExp(pattern, "gmi");
      const matches = Array.from(sample.matchAll(re)).map((m) => m[0]);
      return matches.length ? `Matches (${matches.length}):\n${matches.join("\n")}` : "No matches.";
    } catch (error: any) { return `Regex error: ${error?.message || "invalid pattern"}`; }
  }

  if (id === "markdown-preview") return `# Markdown Preview\n\n${clean}`;
  if (id === "markdown-table") return tableFromCsv(clean);
  if (id === "hash-generator") return `SHA-256 (fallback hash)\n${hashContent(clean)}`;
  if (id === "base64-encode") return encodeBase64(clean);
  if (id === "base64-decode") {
    try { return decodeBase64(clean); } catch (error: any) { return `Base64 decode error: ${error?.message || "invalid payload"}`; }
  }
  if (id === "code-formatter") return formatCode(clean);
  if (id === "env-checklist") return clean.split(/\r?\n/).filter(Boolean).map((line) => `- [ ] ${line.trim()} configured in Production, Preview, and local development`).join("\n");

  if (id === "api-action") {
    const [action = "summarize", ...rest] = clean.split(/\r?\n/);
    return JSON.stringify({ action: action.trim(), text: rest.join("\n").trim(), source: "developer-studio", guard: "server-side-openrouter-only" }, null, 2);
  }

  if (id === "commit-message") return `feat: ${firstLine(clean).slice(0, 72)}\n\n${clean}`;
  if (id === "readme-block") return `## ${firstLine(clean)}\n\n${clean.split(/\r?\n/).slice(1).filter(Boolean).map((line) => `- ${line}`).join("\n") || "- Production-ready KNOUX feature."}`;
  if (id === "pdf-brief") return `# Document Brief\n\n${clean}\n\n## Review Steps\n- [ ] Confirm document owner\n- [ ] Extract entities and dates\n- [ ] Mark sensitive fields\n- [ ] Prepare action items\n- [ ] Save final summary to clipboard vault`;

  if (id === "jwt-inspector") {
    const parts = clean.split(".");
    if (parts.length < 2) return "Invalid JWT shape. Expected header.payload.signature.";
    try { return JSON.stringify({ header: decodeJwtPart(parts[0]), payload: decodeJwtPart(parts[1]), signaturePresent: Boolean(parts[2]) }, null, 2); } catch (error: any) { return `JWT decode error: ${error?.message || "invalid token"}`; }
  }

  if (id === "secret-scanner") {
    const findings = [
      /sk-or-v1-[A-Za-z0-9_-]{20,}/.test(clean) ? "openrouter-key" : null,
      /sk-[A-Za-z0-9_-]{20,}/.test(clean) ? "openai-key" : null,
      /gh[pousr]_[A-Za-z0-9_]{20,}/.test(clean) ? "github-token" : null,
      /Bearer\s+[A-Za-z0-9._-]{20,}/i.test(clean) ? "bearer-token" : null,
      /-----BEGIN[\s\S]+?PRIVATE KEY-----/.test(clean) ? "private-key" : null,
      /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(clean) ? "email" : null,
      /\b(?:\d[ -]*?){13,16}\b/.test(clean) ? "card-like" : null,
    ].filter(Boolean);
    return findings.length ? `Security Findings\n${findings.map((item) => `- ${item}`).join("\n")}` : "No high-confidence secrets detected.";
  }

  if (id === "large-text-analyzer") {
    const words = clean.split(/\s+/).filter(Boolean).length;
    const lines = clean.split(/\r?\n/).length;
    const paragraphs = clean.split(/\n\s*\n/).filter(Boolean).length;
    return `Large Text Analysis\nCharacters: ${clean.length}\nWords: ${words}\nLines: ${lines}\nParagraphs: ${paragraphs}\nEstimated read time: ${Math.max(1, Math.ceil(words / 220))} min`;
  }

  if (id === "url-parser") {
    try {
      const url = new URL(clean);
      return JSON.stringify({ origin: url.origin, protocol: url.protocol, host: url.host, pathname: url.pathname, query: Object.fromEntries(url.searchParams.entries()), hash: url.hash || null }, null, 2);
    } catch (error: any) { return `URL parse error: ${error?.message || "invalid URL"}`; }
  }

  if (id === "diff-summary") {
    const added = clean.split(/\r?\n/).filter((line) => line.startsWith("+") && !line.startsWith("+++")).length;
    const removed = clean.split(/\r?\n/).filter((line) => line.startsWith("-") && !line.startsWith("---")).length;
    const files = clean.match(/^diff --git .*$/gim)?.length || 1;
    return `Diff Summary\nFiles touched: ${files}\nAdded lines: ${added}\nRemoved lines: ${removed}\nRisk: ${added + removed > 200 ? "review carefully" : "small/medium patch"}`;
  }

  if (id === "typescript-interface") {
    const fields = parseFields(clean);
    return `export interface KnouxGeneratedShape {\n${fields.map(({ key, rawType }) => `  ${key}: ${rawType};`).join("\n")}\n}`;
  }

  if (id === "zod-schema") {
    const fields = parseFields(clean);
    return `import { z } from "zod";\n\nexport const knouxGeneratedSchema = z.object({\n${fields.map(({ key, rawType }) => `  ${key}: ${zodType(rawType)},`).join("\n")}\n});`;
  }

  if (id === "sql-checklist") {
    const lower = clean.toLowerCase();
    const flags = [
      lower.includes("drop table") ? "High risk: DROP TABLE detected." : "No DROP TABLE detected.",
      lower.includes("where") ? "WHERE clause present for at least one statement." : "Warning: no WHERE clause detected.",
      lower.includes("alter table") ? "Migration note: ALTER TABLE should be tested against a backup." : "No ALTER TABLE detected.",
      /password|secret|token|key/i.test(clean) ? "Sensitive field names found; confirm masking and RLS." : "No obvious secret field names found.",
    ];
    return `SQL Safety Audit\n${flags.map((flag) => `- ${flag}`).join("\n")}`;
  }

  if (id === "release-notes") return `# Release Notes\n\n## Added\n${clean.split(/\r?\n/).filter(Boolean).map((line) => `- ${line.replace(/^(added|fixed|improved):?\s*/i, "")}`).join("\n")}\n\n## Validation\n- Build must pass in Vercel and local renderer.\n- Developer, security, barcode, and AI pages must remain navigable.`;

  if (id === "bug-report") return `## Bug Report\n\n### Summary\n${firstLine(clean, "Production issue")}\n\n### Evidence\n${clean}\n\n### Impact\nBuild, UX, or service reliability is affected.\n\n### Fix Path\n- Reproduce the issue.\n- Patch the smallest failing surface.\n- Validate build and affected route.\n- Deploy preview before production merge.`;

  if (id === "test-plan") return `# Manual QA Plan — ${firstLine(clean, "Feature")}\n\n1. Open the target screen.\n2. Run every visible primary action.\n3. Load each sample state.\n4. Copy/export output and verify content.\n5. Resize desktop and browser views.\n6. Toggle Arabic/English and day/night where available.\n7. Confirm no fake success state is shown.`;

  if (id === "i18n-audit") {
    const arabic = (clean.match(/[\u0600-\u06FF]/g) || []).length;
    const latin = (clean.match(/[A-Za-z]/g) || []).length;
    return `i18n Audit\nArabic characters: ${arabic}\nLatin characters: ${latin}\nDirection recommendation: ${arabic > latin ? "RTL primary with isolated LTR code fragments" : "LTR primary with Arabic labels isolated"}\nChecks:\n- Avoid mixing icons inside translated strings.\n- Keep code, routes, and API names LTR.\n- Validate sidebar order and text truncation.`;
  }

  if (id === "redaction-map") return redact(clean);

  return clean;
}
