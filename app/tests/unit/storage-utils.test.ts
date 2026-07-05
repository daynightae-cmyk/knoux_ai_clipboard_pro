/**
 * Unit tests for shared storage utilities.
 * Tests localStorage error handling and fallback behavior.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readJsonStorage, writeJsonStorage } from '@shared/storage-utils';

describe('storage-utils', () => {
  const originalLocalStorage = window.localStorage;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Restore localStorage if it was mocked
    if (window.localStorage !== originalLocalStorage) {
      Object.assign(window, { localStorage: originalLocalStorage });
    }
  });

  describe('readJsonStorage', () => {
    it('returns parsed JSON when key exists and is valid', () => {
      localStorage.setItem('test-key', JSON.stringify({ foo: 'bar' }));
      const result = readJsonStorage('test-key', { default: true });
      expect(result).toEqual({ foo: 'bar' });
    });

    it('returns fallback when key does not exist', () => {
      const result = readJsonStorage('nonexistent', { default: true });
      expect(result).toEqual({ default: true });
    });

    it('returns fallback when JSON is malformed', () => {
      localStorage.setItem('bad-json', '{invalid json}');
      const result = readJsonStorage('bad-json', { default: true });
      expect(result).toEqual({ default: true });
    });

    it('returns fallback when localStorage throws', () => {
      const mockStorage = {
        getItem: vi.fn(() => {
          throw new Error('Storage quota exceeded');
        }),
      };
      Object.assign(window, { localStorage: mockStorage });
      const result = readJsonStorage('test-key', { default: true });
      expect(result).toEqual({ default: true });
    });
  });

  describe('writeJsonStorage', () => {
    it('writes JSON to localStorage successfully', () => {
      writeJsonStorage('test-key', { foo: 'bar' });
      const stored = localStorage.getItem('test-key');
      expect(stored).toBe(JSON.stringify({ foo: 'bar' }));
    });

    it('does not throw when localStorage is full', () => {
      const mockStorage = {
        setItem: vi.fn(() => {
          throw new Error('QuotaExceededError');
        }),
      };
      Object.assign(window, { localStorage: mockStorage });
      expect(() => writeJsonStorage('test-key', { foo: 'bar' })).not.toThrow();
    });

    it('does not throw when localStorage is unavailable', () => {
      Object.assign(window, { localStorage: null });
      expect(() => writeJsonStorage('test-key', { foo: 'bar' })).not.toThrow();
    });
  });
});
