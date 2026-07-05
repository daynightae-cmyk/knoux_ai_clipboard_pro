import { SecurityFinding, WorkerResponse, WorkerTask } from './workerTypes';

const send = <T>(message: WorkerResponse<T>) => globalThis.postMessage(message);

const patterns = [
  { type: 'openrouter-key', re: /sk-or-v1-[A-Za-z0-9_-]{20,}/g },
  { type: 'openai-key', re: /sk-[A-Za-z0-9_-]{20,}/g },
  { type: 'anthropic-key', re: /sk-ant-[A-Za-z0-9_-]{20,}/g },
  { type: 'gemini-key', re: /AIza[0-9A-Za-z\-_]{20,}/g },
  { type: 'github-token', re: /gh[pousr]_[A-Za-z0-9_]{20,}/g },
  { type: 'aws-key', re: /\bAKIA[0-9A-Z]{16}\b/g },
  { type: 'bearer-token', re: /Bearer\s+[A-Za-z0-9._-]{20,}/gi },
  { type: 'jwt', re: /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g },
  { type: 'database-url', re: /\b(?:postgres|mysql|mongodb(?:\+srv)?|redis):\/\/[^\s'"]+/gi },
  { type: 'email', re: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi },
  { type: 'phone', re: /\+?\d[\d\s().-]{7,}\d/g },
  { type: 'card-like', re: /\b(?:\d[ -]*?){13,16}\b/g },
  { type: 'env-secret', re: /^\s*[A-Z0-9_]*(SECRET|TOKEN|KEY|PASSWORD)[A-Z0-9_]*\s*=\s*.+$/gim },
  { type: 'private-key', re: /-----BEGIN[\s\S]+?PRIVATE KEY-----/g },
  { type: 'ssh-key', re: /ssh-(rsa|ed25519)\s+[A-Za-z0-9+/=]+/g },
];

const previewMatch = (text: string, index: number, length: number) => {
  const start = Math.max(0, index - 8);
  const end = Math.min(text.length, index + length + 8);
  const snippet = text.slice(start, end);
  return `${snippet.slice(0, 4)}***${snippet.slice(-4)}`;
};

const createFindings = (text: string): SecurityFinding[] =>
  patterns.flatMap((pattern) =>
    Array.from(text.matchAll(pattern.re))
      .slice(0, 80)
      .map((match) => ({
        type: pattern.type,
        index: match.index || 0,
        length: match[0].length,
        preview: previewMatch(text, match.index || 0, match[0].length),
      })),
  );

const redact = (input: string) =>
  patterns.reduce((text, pattern) => text.replace(pattern.re, `[${pattern.type}-redacted]`), input);

globalThis.onmessage = (event: MessageEvent<WorkerTask<string>>) => {
  const task = event.data;
  const start = performance.now();

  try {
    const text = String(task.payload || '');
    const findings = createFindings(text);
    const redacted = redact(text);
    const riskScore = Math.min(100, findings.length * 14);

    const result =
      task.kind === 'redact'
        ? { findings, redacted, riskScore }
        : { findings, riskScore, blocked: riskScore >= 70, redacted };

    send({
      taskId: task.taskId,
      ok: true,
      result,
      durationMs: Math.round(performance.now() - start),
    });
  } catch (error) {
    send({
      taskId: task.taskId,
      ok: false,
      error: error instanceof Error ? error.message : 'Security task failed',
      durationMs: Math.round(performance.now() - start),
    });
  }
};

export {};
