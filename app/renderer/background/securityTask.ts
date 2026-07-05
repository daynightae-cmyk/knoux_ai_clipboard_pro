import { WorkerTask, WorkerResponse } from "../workers/workerTypes";

const send = <T>(message: WorkerResponse<T>) => globalThis.postMessage(message);

const patterns = [
  { type: "openrouter-key", re: /sk-or-v1-[A-Za-z0-9_-]{20,}/g },
  { type: "openai-key", re: /sk-[A-Za-z0-9_-]{20,}/g },
  { type: "github-token", re: /gh[pousr]_[A-Za-z0-9_]{20,}/g },
  { type: "bearer-token", re: /Bearer\s+[A-Za-z0-9._-]{20,}/gi },
  { type: "jwt", re: /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g },
  { type: "email", re: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi },
  { type: "phone", re: /\+?\d[\d\s().-]{7,}\d/g },
  { type: "card-like", re: /\b(?:\d[ -]*?){13,16}\b/g },
  { type: "env-secret", re: /^\s*[A-Z0-9_]*(SECRET|TOKEN|KEY|PASSWORD)[A-Z0-9_]*\s*=\s*.+$/gim },
  { type: "private-key", re: /-----BEGIN[\s\S]+?PRIVATE KEY-----/g },
];

const redact = (input: string) => patterns.reduce((text, item) => text.replace(item.re, `[${item.type}-redacted]`), input);

globalThis.onmessage = (event: MessageEvent<WorkerTask<string>>) => {
  const task = event.data;
  const start = performance.now();
  try {
    const text = String(task.payload || "");
    const findings = patterns.flatMap((item) => Array.from(text.matchAll(item.re)).slice(0, 50).map((match) => ({ type: item.type, index: match.index || 0, length: match[0].length })));
    const result = task.kind === "redact" ? { findings, redacted: redact(text) } : { findings, riskScore: Math.min(100, findings.length * 12) };
    send({ taskId: task.taskId, ok: true, result, durationMs: Math.round(performance.now() - start) });
  } catch (error: any) {
    send({ taskId: task.taskId, ok: false, error: error?.message || "Security task failed", durationMs: Math.round(performance.now() - start) });
  }
};

export {};
