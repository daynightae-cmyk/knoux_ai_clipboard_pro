export type DeveloperToolId =
  | "json-format"
  | "regex-test"
  | "markdown-table"
  | "env-checklist"
  | "api-action"
  | "commit-message"
  | "readme-block"
  | "pdf-brief";

export interface DeveloperToolCard {
  id: DeveloperToolId;
  title: string;
  description: string;
  status: "Active" | "Ready" | "Guarded";
  inputLabel: string;
  actionLabel: string;
  placeholder: string;
}

export const DEVELOPER_TOOLS: DeveloperToolCard[] = [
  { id: "json-format", title: "JSON Formatter", description: "Validate and pretty-print JSON locally.", status: "Active", inputLabel: "JSON input", actionLabel: "Format JSON", placeholder: "Paste JSON here" },
  { id: "regex-test", title: "Regex Lab", description: "Test a JavaScript regex against sample text.", status: "Active", inputLabel: "Pattern then sample", actionLabel: "Test Regex", placeholder: "First line: pattern\nRemaining lines: sample text" },
  { id: "markdown-table", title: "Markdown Builder", description: "Convert comma-separated rows into a Markdown table.", status: "Active", inputLabel: "CSV rows", actionLabel: "Build Table", placeholder: "Name,Status\nAI,Ready" },
  { id: "env-checklist", title: "Environment Checklist", description: "Generate a production environment readiness checklist.", status: "Active", inputLabel: "Variables", actionLabel: "Build Checklist", placeholder: "OPENROUTER_API_KEY\nOPENROUTER_MODEL" },
  { id: "api-action", title: "API Action Builder", description: "Create a safe payload shape for AI action testing.", status: "Ready", inputLabel: "Action and text", actionLabel: "Build Payload", placeholder: "summarize\nText to process" },
  { id: "commit-message", title: "Commit Message Generator", description: "Build a professional conventional commit from notes.", status: "Ready", inputLabel: "Change notes", actionLabel: "Build Commit", placeholder: "Updated UI cards and settings" },
  { id: "readme-block", title: "README Block Generator", description: "Create a polished README feature block.", status: "Ready", inputLabel: "Feature notes", actionLabel: "Build README", placeholder: "Feature name and bullets" },
  { id: "pdf-brief", title: "PDF Brief Builder", description: "Create a structured PDF or document handoff brief.", status: "Active", inputLabel: "Document notes", actionLabel: "Build Brief", placeholder: "Proposal.pdf\nPurpose, risks, actions" },
];

const tableFromCsv = (input: string) => {
  const rows = input.trim().split(/\r?\n/).map((line) => line.split(",").map((cell) => cell.trim()));
  if (!rows.length || rows[0].length < 2) return "Need at least two CSV columns.";
  const header = `| ${rows[0].join(" | ")} |`;
  const sep = `| ${rows[0].map(() => "---").join(" | ")} |`;
  const body = rows.slice(1).map((row) => `| ${row.join(" | ")} |`);
  return [header, sep, ...body].join("\n");
};

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
  if (id === "markdown-table") return tableFromCsv(clean);
  if (id === "env-checklist") return clean.split(/\r?\n/).map((line) => `- [ ] ${line.trim()} configured in Production, Preview, and local development`).join("\n");
  if (id === "api-action") {
    const [action = "summarize", ...rest] = clean.split(/\r?\n/);
    return JSON.stringify({ action: action.trim(), text: rest.join("\n").trim(), source: "developer-studio" }, null, 2);
  }
  if (id === "commit-message") return `feat: ${clean.split(/\r?\n/)[0].slice(0, 72)}\n\n${clean}`;
  if (id === "readme-block") return `## ${clean.split(/\r?\n/)[0]}\n\n${clean.split(/\r?\n/).slice(1).map((line) => `- ${line}`).join("\n") || "- Production-ready KNOUX feature."}`;
  if (id === "pdf-brief") return `# Document Brief\n\n${clean}\n\n## Review Steps\n- [ ] Confirm document owner\n- [ ] Extract entities and dates\n- [ ] Mark sensitive fields\n- [ ] Prepare action items\n- [ ] Save final summary to clipboard vault`;
  return clean;
}
