export type WorkerTaskKind =
  | "json-format"
  | "json-minify"
  | "regex-test"
  | "markdown-preview"
  | "markdown-parse"
  | "hash-generate"
  | "base64-encode"
  | "base64-decode"
  | "jwt-inspect"
  | "code-format"
  | "secret-scan"
  | "redact"
  | "large-text-analyze"
  | "clipboard-bulk-process";

export type WorkerChannel =
  | "json"
  | "regex"
  | "markdown"
  | "hash"
  | "security"
  | "clipboard";

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

export interface JsonPayload {
  text: string;
  indent?: number;
}

export interface MarkdownPayload {
  text: string;
}

export interface HashPayload {
  text: string;
  algorithm?: "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";
}

export interface Base64Payload {
  text: string;
}

export interface ClipboardWorkerItem {
  id: string;
  content: string;
  type?: string;
  tags?: string[];
  source?: string;
  timestamp?: string;
  pinned?: boolean;
  favorite?: boolean;
  isSecure?: boolean;
  folder?: string;
  language?: string;
}

export interface ClipboardBulkPayload {
  items: ClipboardWorkerItem[];
  query?: string;
  selectedFilter?: string;
  selectedFolder?: string;
  businessMode?: string;
  mode?: "search" | "dedupe" | "analyze";
}

export interface ClipboardBulkResult {
  items: ClipboardWorkerItem[];
  metrics: {
    total: number;
    matched: number;
    pinned: number;
    favorites: number;
    secure: number;
    generatedAt: string;
  };
}

export interface LargeTextAnalysisResult {
  characters: number;
  words: number;
  lines: number;
  paragraphs: number;
  estimatedReadMinutes: number;
  hasStructuredData: boolean;
}

export interface SecurityFinding {
  type: string;
  index: number;
  length: number;
  preview: string;
}
