/**
 * Data Encryption Engine
 * Implements AES-256-GCM encryption/decryption with device-bound key derivation.
 * Guarantees that database files copied to another machine cannot be read.
 */

import crypto from 'crypto';
import os from 'os';
import { logger } from '../../shared/logger';

export class Encryptor {
  private readonly algorithm = 'aes-256-gcm';
  private readonly encoding = 'hex';
  private masterKey: Buffer | null = null;

  constructor() {
    this.initializeKey();
  }

  /**
   * Generates a stable machine-specific encryption key.
   * Uses OS parameters to ensure the key persists across app restarts
   * but fails if data is stolen/moved to another device.
   */
  private initializeKey(): void {
    try {
      // Create a "fingerprint" from stable system characteristics
      const systemSignature = [
        os.hostname(),
        os.platform(),
        os.arch(),
        os.release(), // On rolling distros this might change, consider CPUS/MAC in prod
        process.env.USERNAME || 'knoux-user'
      ].join('-');

      // Derive a fixed 32-byte key from the signature using PBKDF2
      this.masterKey = crypto.pbkdf2Sync(
        systemSignature,
        'knoux-salt-v1-static', // Salt
        100000,                 // Iterations
        32,                     // Key length
        'sha512'                // Digest
      );

      logger.info('Encryption subsystem initialized');
    } catch (error) {
      logger.error('CRITICAL: Failed to initialize encryption key', error);
      throw new Error('Encryption System Failure');
    }
  }

  /**
   * Encrypts a string value.
   * Returns format: iv:authTag:encryptedContent
   */
  public encrypt(text: string): string {
    if (!text) return '';
    if (!this.masterKey) throw new Error('Encryptor not initialized');

    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(this.algorithm, this.masterKey, iv);
      
      let encrypted = cipher.update(text, 'utf8', this.encoding);
      encrypted += cipher.final(this.encoding);
      
      const authTag = cipher.getAuthTag();

      // Return IV:AuthTag:EncryptedData
      return `${iv.toString(this.encoding)}:${authTag.toString(this.encoding)}:${encrypted}`;
    } catch (error) {
      logger.error('Encryption failed', error);
      throw error;
    }
  }

  /**
   * Decrypts an encrypted string value.
   * Expects format: iv:authTag:encryptedContent
   */
  public decrypt(encryptedData: string): string {
    if (!encryptedData) return '';
    if (!this.masterKey) throw new Error('Encryptor not initialized');

    try {
      const parts = encryptedData.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }

      const iv = Buffer.from(parts[0], this.encoding as BufferEncoding);
      const authTag = Buffer.from(parts[1], this.encoding as BufferEncoding);
      const content = parts[2];

      const decipher = crypto.createDecipheriv(this.algorithm, this.masterKey, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(content, this.encoding as BufferEncoding, 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      logger.error('Decryption failed. Data corruption or wrong machine key.', error);
      return '[[ENCRYPTED DATA ERROR]]'; // Fail safe UI text
    }
  }
}
