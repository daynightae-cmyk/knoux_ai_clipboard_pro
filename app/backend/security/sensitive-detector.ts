/**
 * Sensitive Data Detection Engine
 * Uses optimized Regex patterns to identify PII, Credentials, and Secrets.
 */

import { logger } from '../../shared/logger';

export interface SensitiveDataResult {
  hasSensitiveData: boolean;
  type?: string;
  maskedContent?: string;
}

export class SensitiveDetector {
  // Regex Patterns for sensitive data
  private readonly patterns = {
    // Basic Credit Card (Visa, MC, Amex, Discover)
    creditCard: /\b(?:\d[ -]*?){13,16}\b/g,
    
    // AWS Access Key ID
    awsKey: /(?<![A-Z0-9])[A-Z0-9]{20}(?![A-Z0-9])/g,
    
    // Email Address (Loose standard to avoid false negatives)
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    
    // Generic API Keys (high entropy alphanumeric strings 20-64 chars)
    genericApiKey: /(?i)(?:api_key|client_secret|access_token|secret)[=:\s"]+([a-zA-Z0-9-_]{20,64})\b/g,
    
    // Private Key Headers
    privateKey: /-----BEGIN [A-Z]+ PRIVATE KEY-----/g,
    
    // SSN (US)
    ssn: /\b\d{3}-\d{2}-\d{4}\b/g
  };

  /**
   * Scans content and identifies if it contains sensitive data
   */
  public scan(content: string): { type: string | null; isSensitive: boolean } {
    if (!content || content.length > 100000) return { type: null, isSensitive: false }; // Skip massive blobs

    try {
      if (this.patterns.privateKey.test(content)) return { type: 'Private Key', isSensitive: true };
      if (this.patterns.awsKey.test(content)) return { type: 'AWS Key', isSensitive: true };
      if (this.patterns.creditCard.test(content)) {
        // Simple Luhn algorithm check could be added here for 100% accuracy, 
        // but for now we trust the structure to flag it.
        return { type: 'Credit Card', isSensitive: true };
      }
      if (this.patterns.ssn.test(content)) return { type: 'SSN', isSensitive: true };
      if (this.patterns.email.test(content)) return { type: 'Email', isSensitive: true };
      if (this.patterns.genericApiKey.test(content)) return { type: 'API Secret', isSensitive: true };

      return { type: null, isSensitive: false };
    } catch (error) {
      logger.error('Error during sensitive scan:', error);
      return { type: null, isSensitive: false };
    }
  }

  /**
   * Returns a masked version of the string
   * Example: "4111 2222 3333 4444" -> "**** **** **** 4444"
   */
  public mask(content: string): string {
    const scanResult = this.scan(content);
    if (!scanResult.isSensitive) return content;

    // Naive generic masking strategy for safety
    // For specific masking we would use replacement functions per regex
    const len = content.length;
    if (len < 8) return '*'.repeat(len);
    
    const visibleChars = 4;
    return '*'.repeat(len - visibleChars) + content.substring(len - visibleChars);
  }
}
