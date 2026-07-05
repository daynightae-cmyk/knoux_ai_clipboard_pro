/**
 * Knoux AI Clipboard Pro — Shared localStorage helpers
 *
 * Type-safe JSON read/write for localStorage.  Duplicated in vault.ts,
 * settings-manager.ts, theme-manager.ts, vip-manager.ts, etc.
 */

export function readJsonStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJsonStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable — silently degrade
  }
}
