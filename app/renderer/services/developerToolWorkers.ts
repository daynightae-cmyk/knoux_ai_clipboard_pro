import { runWorkerTask } from "../performance/taskClient";
import { DeveloperToolId, runDeveloperTool } from "./developerTools";

const jsonBackground = () => new Worker(new URL("../background/jsonTask.ts", import.meta.url), { type: "module" });
const regexBackground = () => new Worker(new URL("../background/regexTask.ts", import.meta.url), { type: "module" });
const markdownBackground = () => new Worker(new URL("../background/markdownTask.ts", import.meta.url), { type: "module" });
const securityBackground = () => new Worker(new URL("../background/securityTask.ts", import.meta.url), { type: "module" });

export const WORKER_SUPPORTED_DEV_TOOLS: DeveloperToolId[] = ["json-format", "regex-test", "markdown-table", "redaction-map"];

export function isWorkerSupportedTool(id: DeveloperToolId) {
  return WORKER_SUPPORTED_DEV_TOOLS.includes(id) && typeof Worker !== "undefined";
}

export async function runDeveloperToolFast(id: DeveloperToolId, input: string): Promise<string> {
  if (!isWorkerSupportedTool(id)) return runDeveloperTool(id, input);
  if (id === "json-format") return runWorkerTask<string, string>({ kind: "json-format", payload: input, createWorker: jsonBackground, timeoutMs: 8000 });
  if (id === "regex-test") {
    const [pattern, ...rest] = input.split(/\r?\n/);
    const output = await runWorkerTask<{ count: number; matches: string[] }, any>({ kind: "regex-test", payload: { pattern, sample: rest.join("\n") }, createWorker: regexBackground, timeoutMs: 8000 });
    return output.count ? `Matches (${output.count}):\n${output.matches.join("\n")}` : "No matches.";
  }
  if (id === "markdown-table") {
    const output = await runWorkerTask<{ html: string; wordCount: number; characters: number }, string>({ kind: "markdown-preview", payload: input, createWorker: markdownBackground, timeoutMs: 8000 });
    return `Markdown Preview\nCharacters: ${output.characters}\nWords: ${output.wordCount}\n\n${output.html}`;
  }
  if (id === "redaction-map") {
    const output = await runWorkerTask<{ redacted: string }, string>({ kind: "redact", payload: input, createWorker: securityBackground, timeoutMs: 8000 });
    return output.redacted;
  }
  return runDeveloperTool(id, input);
}
