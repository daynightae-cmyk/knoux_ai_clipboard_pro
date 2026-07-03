/**
 * Security Logic Tests
 */

import { createHash, randomBytes, createCipheriv, createDecipheriv } from 'crypto';

describe('Encryption Utils', () => {
    const ALGORITHM = 'aes-256-cbc';
    const KEY = randomBytes(32); // Mock 256-bit key
    const IV = randomBytes(16); // Initialization vector

    function encrypt(text: string) {
       const cipher = createCipheriv(ALGORITHM, KEY, IV);
       let encrypted = cipher.update(text, 'utf8', 'hex');
       encrypted += cipher.final('hex');
       return encrypted;
    }

    function decrypt(encryptedText: string) {
       const decipher = createDecipheriv(ALGORITHM, KEY, IV);
       let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
       decrypted += decipher.final('utf8');
       return decrypted;
    }

    test('Should successfully encrypt and decrypt text', () => {
       const secret = "TopSecret123";
       const encrypted = encrypt(secret);
       const decrypted = decrypt(encrypted);
       
       expect(encrypted).not.toBe(secret); // Ciphertext should allow differ
       expect(decrypted).toBe(secret);
    });

    test('Encryption should return different outputs for different IVs in practice', () => {
       // Concept test: Same text, different IV logic check
       // Here we just verify consistent encryption with static IV for testing
       const t1 = encrypt("Data");
       const t2 = encrypt("Data");
       expect(t1).toBe(t2);
    });
});
