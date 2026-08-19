import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { logger } from '../../shared/logger';

/**
 * Local encrypted-storage helper. It is intentionally unavailable until a
 * user-controlled vault secret is supplied through KNOUX_VAULT_MASTER_SECRET.
 * The active IPC vault uses its own versioned payload contract in
 * unified-service-ipc.js; this class protects older backend callers.
 */
export class Encryptor {
  private readonly algorithm = 'aes-256-gcm';
  private readonly encoding = 'hex';
  private masterKey: Buffer | null = null;

  constructor() {
    this.initializeKey();
  }

  private getSaltPath(): string {
    return path.join(os.homedir(), '.knoux', 'vault-kdf-salt-v2');
  }

  private getOrCreateSalt(): Buffer {
    const saltPath = this.getSaltPath();
    if (fs.existsSync(saltPath)) {
      const salt = Buffer.from(fs.readFileSync(saltPath, 'utf8').trim(), 'base64');
      if (salt.length === 16) return salt;
      throw new Error('Persisted vault KDF salt is invalid.');
    }

    const salt = crypto.randomBytes(16);
    fs.mkdirSync(path.dirname(saltPath), { recursive: true, mode: 0o700 });
    fs.writeFileSync(saltPath, salt.toString('base64'), { mode: 0o600 });
    return salt;
  }

  private legacyKey(): Buffer {
    const systemSignature = [
      os.hostname(),
      os.platform(),
      os.arch(),
      os.release(),
      process.env.USERNAME || 'knoux-user',
    ].join('-');
    return crypto.pbkdf2Sync(systemSignature, 'knoux-salt-v1-static', 100000, 32, 'sha512');
  }

  private initializeKey(): void {
    const secret = process.env.KNOUX_VAULT_MASTER_SECRET;
    if (!secret) {
      logger.warn('Vault Encryptor is guarded: KNOUX_VAULT_MASTER_SECRET is not configured.');
      return;
    }

    try {
      const salt = this.getOrCreateSalt();
      const machineBinding = `${os.hostname()}|${os.platform()}|${os.arch()}`;
      this.masterKey = crypto.scryptSync(`${secret}:${machineBinding}`, salt, 32, {
        N: 16384,
        r: 8,
        p: 1,
        maxmem: 64 * 1024 * 1024,
      });
      logger.info('Vault Encryptor initialized with scrypt v2 key derivation');
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error('Unknown key initialization error');
      logger.error('Failed to initialize vault encryption key', normalizedError);
      this.masterKey = null;
    }
  }

  public encrypt(text: string): string {
    if (!text) return '';
    if (!this.masterKey) throw new Error('Vault encryption is guarded until KNOUX_VAULT_MASTER_SECRET is configured.');

    try {
      const iv = crypto.randomBytes(12);
      const cipher = crypto.createCipheriv(this.algorithm, this.masterKey, iv);
      const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
      const authTag = cipher.getAuthTag();
      return `knoux:v2:${iv.toString(this.encoding)}:${authTag.toString(this.encoding)}:${encrypted.toString(this.encoding)}`;
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error('Unknown encryption error');
      logger.error('Encryption failed', normalizedError);
      throw normalizedError;
    }
  }

  public decrypt(encryptedData: string): string {
    if (!encryptedData) return '';

    try {
      const parts = encryptedData.split(':');
      let key: Buffer;
      let iv: Buffer;
      let authTag: Buffer;
      let content: string;

      if (parts.length === 5 && parts[0] === 'knoux' && parts[1] === 'v2') {
        if (!this.masterKey) throw new Error('Vault decryption is guarded until KNOUX_VAULT_MASTER_SECRET is configured.');
        key = this.masterKey;
        iv = Buffer.from(parts[2], this.encoding as BufferEncoding);
        authTag = Buffer.from(parts[3], this.encoding as BufferEncoding);
        content = parts[4];
      } else if (parts.length === 3) {
        // Read-only compatibility for the historical static-KDF format. Re-encrypt
        // successfully recovered values to migrate them to v2.
        key = this.legacyKey();
        iv = Buffer.from(parts[0], this.encoding as BufferEncoding);
        authTag = Buffer.from(parts[1], this.encoding as BufferEncoding);
        content = parts[2];
      } else {
        throw new Error('Invalid encrypted data format.');
      }

      if (iv.length !== 12 || authTag.length !== 16) throw new Error('Invalid encrypted data payload.');
      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
      decipher.setAuthTag(authTag);
      return Buffer.concat([
        decipher.update(Buffer.from(content, this.encoding as BufferEncoding)),
        decipher.final(),
      ]).toString('utf8');
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error('Unknown decryption error');
      logger.error('Decryption failed. Data corruption or wrong secret.', normalizedError);
      return '[[ENCRYPTED DATA ERROR]]';
    }
  }
}
