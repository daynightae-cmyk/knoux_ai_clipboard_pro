/**
 * Security Module - Enhanced Security Implementation
 * Comprehensive security features for Knoux Clipboard AI
 */

import crypto from "crypto";
import { logger } from "../../shared/logger";
import type {
  SecurityConfig,
  EncryptedData,
  SecurityEvent,
} from "../shared/types";

export class SecurityManager {
  private config: SecurityConfig;
  private encryptionKey: Buffer;
  private isInitialized: boolean = false;

  constructor(config?: Partial<SecurityConfig>) {
    this.config = {
      algorithm: "aes-256-gcm",
      keyDerivation: {
        algorithm: "pbkdf2",
        iterations: 100000,
        saltLength: 32,
        keyLength: 32,
      },
      encryption: {
        ivLength: 16,
        authTagLength: 16,
      },
      passwordPolicy: {
        minLength: 12,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
      },
      session: {
        timeout: 3600,
        maxAttempts: 5,
        lockoutDuration: 900,
      },
      ...config,
    };
  }

  /**
   * Initialize security manager
   */
  async initialize(masterPassword?: string): Promise<boolean> {
    try {
      logger.info("Initializing security manager");

      if (masterPassword) {
        this.encryptionKey = await this.deriveKey(masterPassword);
      } else {
        this.encryptionKey = crypto.randomBytes(32);
        logger.warn("Using random encryption key - save this key securely!");
      }

      this.isInitialized = true;
      logger.info("Security manager initialized successfully");

      this.logSecurityEvent({
        type: "security_init",
        severity: "info",
        title: "Security Manager Initialized",
        description: "Security system initialized successfully",
      });

      return true;
    } catch (error) {
      logger.error("Failed to initialize security manager:", error);
      this.isInitialized = false;
      return false;
    }
  }

  /**
   * Encrypt sensitive data
   */
  async encrypt(data: string | Buffer): Promise<EncryptedData> {
    this.ensureInitialized();

    try {
      const iv = crypto.randomBytes(this.config.encryption.ivLength);
      const cipher = crypto.createCipheriv(
        this.config.algorithm,
        this.encryptionKey,
        iv,
      );

      let encrypted = cipher.update(data as Buffer);
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      const authTag = cipher.getAuthTag();

      const result: EncryptedData = {
        encrypted: encrypted.toString("base64"),
        iv: iv.toString("base64"),
        authTag: authTag.toString("base64"),
        algorithm: this.config.algorithm,
        timestamp: new Date().toISOString(),
      };

      this.logSecurityEvent({
        type: "encryption",
        severity: "info",
        title: "Data Encrypted",
        description: `Encrypted data using ${this.config.algorithm}`,
        metadata: { algorithm: this.config.algorithm },
      });

      return result;
    } catch (error) {
      logger.error("Encryption failed:", error);
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt encrypted data
   */
  async decrypt(encryptedData: EncryptedData): Promise<string> {
    this.ensureInitialized();

    try {
      const decipher = crypto.createDecipheriv(
        encryptedData.algorithm,
        this.encryptionKey,
        Buffer.from(encryptedData.iv, "base64"),
      );

      decipher.setAuthTag(Buffer.from(encryptedData.authTag, "base64"));

      let decrypted = decipher.update(
        Buffer.from(encryptedData.encrypted, "base64"),
      );
      decrypted = Buffer.concat([decrypted, decipher.final()]);

      this.logSecurityEvent({
        type: "decryption",
        severity: "info",
        title: "Data Decrypted",
        description: "Successfully decrypted data",
        metadata: { algorithm: encryptedData.algorithm },
      });

      return decrypted.toString();
    } catch (error) {
      logger.error("Decryption failed:", error);
      this.logSecurityEvent({
        type: "security_breach",
        severity: "error",
        title: "Decryption Failed",
        description: "Failed to decrypt data - possible tampering",
        metadata: { error: error.message },
      });

      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Hash password securely
   */
  async hashPassword(password: string, salt?: string): Promise<string> {
    const saltBuffer = salt
      ? Buffer.from(salt, "base64")
      : crypto.randomBytes(32);

    const hash = crypto.pbkdf2Sync(
      password,
      saltBuffer,
      this.config.keyDerivation.iterations,
      this.config.keyDerivation.keyLength,
      "sha512",
    );

    return `${saltBuffer.toString("base64")}:${hash.toString("base64")}`;
  }

  /**
   * Verify password against hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      const [salt, originalHash] = hash.split(":");

      const newHash = await this.hashPassword(password, salt);
      const [, newHashPart] = newHash.split(":");

      return crypto.timingSafeEqual(
        Buffer.from(originalHash, "base64"),
        Buffer.from(newHashPart, "base64"),
      );
    } catch (error) {
      logger.error("Password verification failed:", error);
      return false;
    }
  }

  /**
   * Check password strength
   */
  checkPasswordStrength(password: string): {
    score: number;
    strength: "weak" | "fair" | "good" | "strong";
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= this.config.passwordPolicy.minLength) {
      score += 25;
    } else {
      feedback.push(
        `Password should be at least ${this.config.passwordPolicy.minLength} characters`,
      );
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 20;
    } else if (this.config.passwordPolicy.requireUppercase) {
      feedback.push("Password should contain at least one uppercase letter");
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 20;
    } else if (this.config.passwordPolicy.requireLowercase) {
      feedback.push("Password should contain at least one lowercase letter");
    }

    // Numbers check
    if (/\d/.test(password)) {
      score += 20;
    } else if (this.config.passwordPolicy.requireNumbers) {
      feedback.push("Password should contain at least one number");
    }

    // Special characters check
    if (/[^A-Za-z0-9]/.test(password)) {
      score += 15;
    } else if (this.config.passwordPolicy.requireSpecialChars) {
      feedback.push("Password should contain at least one special character");
    }

    // Determine strength
    let strength: "weak" | "fair" | "good" | "strong" = "weak";
    if (score >= 80) strength = "strong";
    else if (score >= 60) strength = "good";
    else if (score >= 40) strength = "fair";

    return { score, strength, feedback };
  }

  /**
   * Generate secure random token
   */
  generateToken(length: number = 32): string {
    return crypto
      .randomBytes(length)
      .toString("base64")
      .replace(/[+/]/g, "")
      .slice(0, length);
  }

  /**
   * Sanitize user input
   */
  sanitizeInput(input: string, type: "html" | "sql" | "path" = "html"): string {
    switch (type) {
      case "html":
        return input
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#x27;");

      case "sql":
        return input.replace(/['"\\]/g, "\\$&");

      case "path":
        return input.replace(/[<>:"|?*]/g, "");

      default:
        return input;
    }
  }

  /**
   * Check for sensitive data patterns
   */
  detectSensitiveData(content: string): Array<{
    type: "email" | "phone" | "credit_card" | "ssn" | "api_key";
    match: string;
    confidence: number;
  }> {
    const patterns = {
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,
      phone: /\b(?:\+?1[-.\s]?)?\(?[2-9]\d{2}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/gi,
      credit_card: /\b(?:\d[ -]*?){13,16}\b/gi,
      ssn: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/gi,
      api_key: /\b(?:sk|pk)_[a-zA-Z0-9]{24,}\b/gi,
    };

    const results: Array<{
      type: "email" | "phone" | "credit_card" | "ssn" | "api_key";
      match: string;
      confidence: number;
    }> = [];

    Object.entries(patterns).forEach(([type, pattern]) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          results.push({
            type: type as any,
            match,
            confidence: this.calculateConfidence(
              type as keyof typeof patterns,
              match,
            ),
          });
        });
      }
    });

    return results;
  }

  /**
   * Log security event
   */
  private logSecurityEvent(
    event: Omit<SecurityEvent, "id" | "timestamp">,
  ): void {
    const securityEvent: SecurityEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...event,
    };

    logger.info("Security event:", securityEvent);

    // In production, send to security monitoring system
    if (process.env.NODE_ENV === "production") {
      this.sendToSecurityMonitor(securityEvent);
    }
  }

  /**
   * Derive encryption key from password
   */
  private async deriveKey(password: string, salt?: Buffer): Promise<Buffer> {
    const saltBuffer =
      salt || crypto.randomBytes(this.config.keyDerivation.saltLength);

    return new Promise((resolve, reject) => {
      crypto.pbkdf2(
        password,
        saltBuffer,
        this.config.keyDerivation.iterations,
        this.config.keyDerivation.keyLength,
        "sha512",
        (err, derivedKey) => {
          if (err) reject(err);
          else resolve(derivedKey);
        },
      );
    });
  }

  /**
   * Calculate pattern detection confidence
   */
  private calculateConfidence(
    type: keyof typeof patterns,
    match: string,
  ): number {
    const validators = {
      email: (email: string) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email) ? 0.95 : 0.5;
      },
      phone: (phone: string) => {
        const cleaned = phone.replace(/[^\d]/g, "");
        return cleaned.length === 10 ? 0.9 : 0.6;
      },
      credit_card: (card: string) => {
        const cleaned = card.replace(/[^\d]/g, "");
        if (cleaned.length < 13 || cleaned.length > 19) return 0.3;

        // Luhn algorithm check
        let sum = 0;
        let shouldDouble = false;
        for (let i = cleaned.length - 1; i >= 0; i--) {
          let digit = parseInt(cleaned.charAt(i));
          if (shouldDouble) {
            digit *= 2;
            if (digit > 9) digit -= 9;
          }
          sum += digit;
          shouldDouble = !shouldDouble;
        }
        return sum % 10 === 0 ? 0.98 : 0.4;
      },
      ssn: (ssn: string) => {
        const cleaned = ssn.replace(/[^\d]/g, "");
        if (cleaned.length !== 9) return 0.3;
        if (cleaned.startsWith("000") || cleaned.startsWith("666")) return 0.2;
        if (cleaned.substring(3, 5) === "00") return 0.3;
        if (cleaned.substring(5) === "0000") return 0.3;
        return 0.9;
      },
      api_key: (key: string) => {
        return key.length > 30 ? 0.85 : 0.4;
      },
    };

    return validators[type](match);
  }

  /**
   * Ensure security manager is initialized
   */
  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error(
        "Security manager not initialized. Call initialize() first.",
      );
    }
  }

  /**
   * Send event to security monitoring system
   */
  private sendToSecurityMonitor(event: SecurityEvent): void {
    // Implementation for security monitoring integration
    // This could send to SIEM, log aggregation service, etc.
    console.log("[Security Monitor]", event);
  }
}

// Export singleton instance
export const securityManager = new SecurityManager();
export default securityManager;
