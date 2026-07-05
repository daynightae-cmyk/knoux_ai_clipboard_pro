import { VaultCiphertext } from "./securityTypes";

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const ITERATIONS = 240000;

const bytesToBase64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const base64ToBytes = (value: string) => Uint8Array.from(atob(value), (char) => char.charCodeAt(0));

async function deriveKey(password: string, salt: Uint8Array) {
  const material = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export function assertWebCryptoAvailable() {
  if (!globalThis.crypto?.subtle) throw new Error("Web Crypto API is unavailable in this runtime.");
}

export async function encryptVaultText(plainText: string, password: string): Promise<VaultCiphertext> {
  assertWebCryptoAvailable();
  if (!password || password.length < 8) throw new Error("Vault password must contain at least 8 characters.");
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(plainText));
  return {
    version: 1,
    algorithm: "AES-GCM",
    kdf: "PBKDF2",
    iterations: ITERATIONS,
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(encrypted)),
    createdAt: new Date().toISOString(),
  };
}

export async function decryptVaultText(payload: VaultCiphertext, password: string): Promise<string> {
  assertWebCryptoAvailable();
  const salt = base64ToBytes(payload.salt);
  const iv = base64ToBytes(payload.iv);
  const data = base64ToBytes(payload.ciphertext);
  const key = await deriveKey(password, salt);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
  return decoder.decode(decrypted);
}
