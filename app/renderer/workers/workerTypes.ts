export type WorkerTaskKind =
  | "json-format"
  | "json-minify"
  | "regex-test"
  | "markdown-preview"
  | "hash-generate"
  | "base64-encode"
  | "base64-decode"
  | "jwt-inspect"
  | "redact"
  | "large-text-analyze"
  | "clipboard-bulk-process";

export interface WorkerTask<TPayload = unknown> {
  taskId: string;
  kind: WorkerTaskKind;
  payload: TPayload;
  createdAt: number;
  timeoutMs?: number;
}

export interface WorkerSuccess<TResult = unknown> {
  taskId: string;
  ok: true;
  result: TResult;
  durationMs: number;
}

export interface WorkerFailure {
  taskId: string;
  ok: false;
  error: string;
  durationMs: number;
}

export type WorkerResponse<TResult = unknown> = WorkerSuccess<TResult> | WorkerFailure;

export interface RegexPayload {
  pattern: string;
  flags?: string;
  sample: string;
}

export interface HashPayload {
  text: string;
  algorithm?: "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";
}

export interface ClipboardBulkPayload {
  items: Array<{ id: string; content: string; type?: string; tags?: string[]; source?: string; timestamp?: string }>;
  query?: string;
  mode?: "search" | "dedupe" | "analyze";
}
