import { encryptVaultText, decryptVaultText } from "./crypto";
import { VaultAuditEvent, VaultEntry } from "./securityTypes";
import { readJsonStorage, writeJsonStorage } from "../../shared/storage-utils";

const VAULT_KEY = "knoux_secure_vault_entries";
const AUDIT_KEY = "knoux_secure_vault_audit";

export function readVaultEntries(): VaultEntry[] {
  return readJsonStorage<VaultEntry[]>(VAULT_KEY, []);
}

export function writeVaultEntries(entries: VaultEntry[]) {
  writeJsonStorage(VAULT_KEY, entries);
}

export function appendVaultAudit(type: VaultAuditEvent["type"], detail: string) {
  const events = readJsonStorage<VaultAuditEvent[]>(AUDIT_KEY, []);
  const next = [{ id: `audit-${Date.now()}`, type, detail, createdAt: new Date().toISOString() }, ...events].slice(0, 200);
  writeJsonStorage(AUDIT_KEY, next);
}

export function readVaultAudit(): VaultAuditEvent[] {
  return readJsonStorage<VaultAuditEvent[]>(AUDIT_KEY, []);
}

export async function addEncryptedVaultEntry(title: string, plainText: string, password: string, type: VaultEntry["type"] = "secret") {
  const encrypted = await encryptVaultText(plainText, password);
  const entry: VaultEntry = { id: `vault-${Date.now()}`, title, type, encrypted, updatedAt: new Date().toISOString() };
  writeVaultEntries([entry, ...readVaultEntries()]);
  appendVaultAudit("redaction-applied", `Encrypted vault entry saved: ${title}`);
  return entry;
}

export async function unlockVaultEntry(entry: VaultEntry, password: string) {
  try {
    const plainText = await decryptVaultText(entry.encrypted, password);
    appendVaultAudit("vault-unlocked", `Vault entry unlocked: ${entry.title}`);
    return { ok: true as const, plainText };
  } catch {
    appendVaultAudit("failed-unlock", `Failed unlock attempt: ${entry.title}`);
    return { ok: false as const, error: "Invalid password or corrupted vault payload." };
  }
}

export function lockVaultSession() {
  appendVaultAudit("vault-locked", "Vault session locked.");
}

export function triggerPanicMode() {
  sessionStorage.removeItem("knoux_vault_session_unlocked");
  sessionStorage.removeItem("knoux_transient_secret_cache");
  localStorage.setItem("knoux_stealth_mode", "true");
  appendVaultAudit("panic-triggered", "Panic mode enabled. Transient session memory was cleared.");
}
