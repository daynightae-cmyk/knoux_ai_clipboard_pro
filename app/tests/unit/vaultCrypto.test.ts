import { createCipheriv, createHash, randomBytes } from "crypto";
import { describe, expect, it } from "vitest";
import { decryptText, decryptVaultPayload, encryptText } from "../../backend/ipc/unified-service-ipc.js";

function encryptLegacyV1(text: string, password: string) {
  const iv = randomBytes(12);
  const key = createHash("sha256").update(password).digest();
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `knoux:v1:${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`;
}

describe("Vault crypto migration", () => {
  it("encrypts v2 payloads with a unique per-payload salt and decrypts them", () => {
    const first = encryptText("clipboard secret", "correct horse battery staple");
    const second = encryptText("clipboard secret", "correct horse battery staple");

    expect(first).toMatch(/^knoux:v2:/);
    expect(second).toMatch(/^knoux:v2:/);
    expect(first).not.toBe(second);
    expect(decryptText(first, "correct horse battery staple")).toBe("clipboard secret");
  });

  it("rejects wrong passwords and tampered authenticated ciphertext", () => {
    const payload = encryptText("protected", "correct password");
    expect(() => decryptText(payload, "wrong password")).toThrow();

    const parts = payload.split(":");
    parts[5] = `${parts[5].slice(0, -2)}AA`;
    expect(() => decryptText(parts.join(":"), "correct password")).toThrow();
  });

  it("decrypts legacy v1 data once and emits a v2 migration payload", () => {
    const legacy = encryptLegacyV1("legacy clipboard", "legacy password");
    const result = decryptVaultPayload(legacy, "legacy password");

    expect(result).toMatchObject({ text: "legacy clipboard", version: "v1", migrated: true });
    expect(result.migratedPayload).toMatch(/^knoux:v2:/);
    expect(decryptText(result.migratedPayload!, "legacy password")).toBe("legacy clipboard");
  });

  it("rejects empty or unsupported payloads", () => {
    expect(() => encryptText("data", "")).toThrow(/Vault password/);
    expect(() => decryptText("", "password")).toThrow(/Unsupported/);
    expect(() => decryptText("knoux:v2:bad:bad:bad:bad", "password")).toThrow();
  });
});
