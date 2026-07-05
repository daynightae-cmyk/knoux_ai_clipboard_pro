import { ClipboardItem } from "../types";
import { copyToClipboard, readFromClipboard } from "../../shared/clipboard-utils";
import { readJsonStorage } from "../../shared/storage-utils";

export interface StorageHealth {
  bytes: number;
  kb: number;
  mb: number;
  usagePct: number;
  records: number;
}

export interface GuardScanResult {
  sensitive: boolean;
  types: string[];
  message: string;
}

export function getStoredClips(): ClipboardItem[] {
  const parsed = readJsonStorage<ClipboardItem[]>("knoux_clips", []);
  return Array.isArray(parsed) ? parsed : [];
}

export function getStorageHealth(items: ClipboardItem[] = getStoredClips()): StorageHealth {
  const payload = JSON.stringify(items);
  const bytes = new Blob([payload]).size;
  const mb = bytes / 1024 / 1024;
  return {
    bytes,
    kb: Number((bytes / 1024).toFixed(2)),
    mb: Number(mb.toFixed(3)),
    usagePct: Math.min(100, Number(((mb / 10) * 100).toFixed(1))),
    records: items.length,
  };
}

export function compactLocalStore(items: ClipboardItem[]): {
  compacted: ClipboardItem[];
  health: StorageHealth;
} {
  const compacted = items
    .filter((item) => item && item.id && typeof item.content === "string")
    .map((item) => ({
      ...item,
      content: item.content.trim(),
      tags: Array.from(new Set(item.tags || [])).slice(0, 12),
    }));

  try {
    localStorage.setItem("knoux_clips", JSON.stringify(compacted));
  } catch (error) {
    console.error("Failed to save compacted clips to localStorage:", error);
  }
  return { compacted, health: getStorageHealth(compacted) };
}

export function detectSensitiveTypes(value: string): string[] {
  const text = String(value || "");
  const checks = [
    { type: "password", matched: /\b(password|passwd|pwd)\s*[:=]\s*\S+/i.test(text) },
    {
      type: "api-key",
      matched:
        /\b(api[_-]?key|client[_-]?secret|secret[_-]?key)\s*[:=]\s*["']?[A-Za-z0-9_\-]{16,}/i.test(
          text
        ),
    },
    { type: "bearer-token", matched: /\bbearer\s+[A-Za-z0-9._\-]{20,}/i.test(text) },
    {
      type: "access-token",
      matched: /\baccess[_-]?token\s*[:=]\s*["']?[A-Za-z0-9._\-]{20,}/i.test(text),
    },
    {
      type: "refresh-token",
      matched: /\brefresh[_-]?token\s*[:=]\s*["']?[A-Za-z0-9._\-]{20,}/i.test(text),
    },
    { type: "token", matched: /\b(token)\s*[:=]\s*["']?[A-Za-z0-9._\-]{20,}/i.test(text) },
    { type: "private-key", matched: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/i.test(text) },
    {
      type: "secret-env-line",
      matched: /^[A-Z0-9_]*_?(SECRET|TOKEN|KEY|PASSWORD)_?[A-Z0-9_]*\s*=\s*.+/im.test(text),
    },
    {
      type: "credential-like-text",
      matched: /\b(credential|password|bearer|private|access|refresh|secret)s?\s*[:=]/i.test(text),
    },
    { type: "email", matched: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text) },
    { type: "phone", matched: /\+?\d[\d\s().-]{7,}/.test(text) },
    { type: "card-like-number", matched: /\b(?:\d[ -]*?){13,16}\b/.test(text) },
  ];
  return checks.filter((check) => check.matched).map((check) => check.type);
}

export function scanText(value: string): GuardScanResult {
  const types = detectSensitiveTypes(value);
  return {
    sensitive: types.length > 0,
    types,
    message: types.length
      ? `Sensitive classes detected: ${types.join(", ")}. Keep Privacy Enforcer active before reusing this content.`
      : "No credential-like, email, phone, or card-like patterns were detected in the active text buffer.",
  };
}

export const readSystemClipboard = readFromClipboard;

export const writeSystemClipboard = copyToClipboard;
