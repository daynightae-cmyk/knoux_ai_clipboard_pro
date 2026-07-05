export interface VaultCiphertext {
  version: 1;
  algorithm: "AES-GCM";
  kdf: "PBKDF2";
  iterations: number;
  salt: string;
  iv: string;
  ciphertext: string;
  createdAt: string;
}

export interface VaultEntry {
  id: string;
  title: string;
  type: "secret" | "note" | "api-key" | "credential";
  encrypted: VaultCiphertext;
  updatedAt: string;
}

export interface VaultAuditEvent {
  id: string;
  type: "vault-unlocked" | "vault-locked" | "secret-detected" | "redaction-applied" | "panic-triggered" | "failed-unlock";
  createdAt: string;
  detail: string;
}

export interface VaultUnlockResult {
  ok: boolean;
  error?: string;
}
