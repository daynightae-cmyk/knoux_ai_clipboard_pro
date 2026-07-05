/**
 * Unit tests for renderer helper utilities.
 * Targets app/renderer/utils/helpers.ts (previously 0% coverage).
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  formatBytes,
  formatDate,
  truncateText,
  generateId,
  debounce,
  throttle,
  memoize,
  retry,
  withTimeout,
  copyToClipboard,
  readFromClipboard,
  toSlug,
  capitalize,
  titleCase,
  getColorBrightness,
  deepClone,
  deepMerge,
  isEmail,
  isUrl,
  isJson,
  extractJson,
  formatJson,
  groupBy,
  uniqueBy,
  flatten,
  chunk,
  compareVersions,
} from '@renderer/utils/helpers';

describe('helpers', () => {
  describe('formatBytes', () => {
    it('returns "0 Bytes" for zero', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
    });

    it('formats bytes, KB, MB and GB', () => {
      expect(formatBytes(500)).toBe('500 Bytes');
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1024 * 1024)).toBe('1 MB');
      expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB');
    });

    it('respects the decimals argument', () => {
      expect(formatBytes(1536, 0)).toBe('2 KB');
      expect(formatBytes(1536, 2)).toBe('1.5 KB');
    });

    it('treats negative decimals as zero', () => {
      expect(formatBytes(1536, -5)).toBe('2 KB');
    });
  });

  describe('formatDate', () => {
    const base = new Date('2026-01-01T12:00:00Z').getTime();

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(base);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns "Just now" for very recent times', () => {
      expect(formatDate(base - 30 * 1000)).toBe('Just now');
    });

    it('returns minutes ago', () => {
      expect(formatDate(base - 5 * 60 * 1000)).toBe('5m ago');
    });

    it('returns hours ago', () => {
      expect(formatDate(base - 3 * 3600 * 1000)).toBe('3h ago');
    });

    it('returns days ago', () => {
      expect(formatDate(base - 2 * 86400 * 1000)).toBe('2d ago');
    });

    it('falls back to a locale date string for older dates', () => {
      const old = base - 30 * 86400 * 1000;
      expect(formatDate(old)).toBe(new Date(old).toLocaleDateString());
    });
  });

  describe('truncateText', () => {
    it('leaves short text untouched', () => {
      expect(truncateText('hello', 10)).toBe('hello');
    });

    it('truncates and appends an ellipsis', () => {
      expect(truncateText('abcdefghij', 3)).toBe('abc...');
    });
  });

  describe('generateId', () => {
    it('produces unique identifiers', () => {
      const a = generateId();
      const b = generateId();
      expect(a).not.toBe(b);
      expect(a).toMatch(/^\d+-[a-z0-9]+$/);
    });
  });

  describe('debounce', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('invokes the function only once after the wait window', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);
      debounced('a');
      debounced('b');
      debounced('c');
      expect(fn).not.toHaveBeenCalled();
      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('c');
    });
  });

  describe('throttle', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('runs immediately then blocks until the limit elapses', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);
      throttled('x');
      throttled('y');
      expect(fn).toHaveBeenCalledTimes(1);
      vi.advanceTimersByTime(100);
      throttled('z');
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('memoize', () => {
    it('caches results by argument signature', () => {
      const spy = vi.fn((a: number, b: number) => a + b);
      const memoized = memoize(spy);
      expect(memoized(1, 2)).toBe(3);
      expect(memoized(1, 2)).toBe(3);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(memoized(2, 2)).toBe(4);
      expect(spy).toHaveBeenCalledTimes(2);
    });
  });

  describe('retry', () => {
    it('resolves on the first successful attempt', async () => {
      const fn = vi.fn().mockResolvedValue('ok');
      await expect(retry(fn, 3, 1)).resolves.toBe('ok');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('retries until success', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('recovered');
      await expect(retry(fn, 3, 1)).resolves.toBe('recovered');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('throws the last error after exhausting retries', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('always'));
      await expect(retry(fn, 2, 1)).rejects.toThrow('always');
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('withTimeout', () => {
    it('resolves when the promise settles in time', async () => {
      await expect(withTimeout(Promise.resolve('done'), 50)).resolves.toBe('done');
    });

    it('rejects when the timeout elapses first', async () => {
      const slow = new Promise((resolve) => setTimeout(() => resolve('late'), 50));
      await expect(withTimeout(slow, 5)).rejects.toThrow('Operation timeout');
    });
  });

  describe('copyToClipboard / readFromClipboard', () => {
    const originalClipboard = navigator.clipboard;

    afterEach(() => {
      Object.assign(navigator, { clipboard: originalClipboard });
    });

    it('writes via the async clipboard API', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, { clipboard: { writeText } });
      await expect(copyToClipboard('hi')).resolves.toBe(true);
      expect(writeText).toHaveBeenCalledWith('hi');
    });

    it('returns false when the clipboard write throws', async () => {
      Object.assign(navigator, {
        clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
      });
      await expect(copyToClipboard('hi')).resolves.toBe(false);
    });

    it('reads via the async clipboard API', async () => {
      Object.assign(navigator, {
        clipboard: { readText: vi.fn().mockResolvedValue('pasted') },
      });
      await expect(readFromClipboard()).resolves.toBe('pasted');
    });

    it('returns empty string when readText is unavailable', async () => {
      Object.assign(navigator, { clipboard: {} });
      const result = await readFromClipboard();
      expect(result).toBe('');
    });

    it('returns empty string when readText throws permission error', async () => {
      Object.assign(navigator, {
        clipboard: { readText: vi.fn().mockRejectedValue(new Error('NotAllowedError')) },
      });
      const result = await readFromClipboard();
      expect(result).toBe('');
    });
  });

  describe('string helpers', () => {
    it('toSlug normalizes to a url-friendly slug', () => {
      expect(toSlug('  Hello, World! ')).toBe('hello-world');
      expect(toSlug('Multiple   spaces_and_underscores')).toBe('multiple-spaces-and-underscores');
    });

    it('capitalize uppercases the first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
    });

    it('titleCase capitalizes each word', () => {
      expect(titleCase('hello world from knoux')).toBe('Hello World From Knoux');
    });
  });

  describe('getColorBrightness', () => {
    it('classifies light and dark colors', () => {
      expect(getColorBrightness('#ffffff')).toBe('light');
      expect(getColorBrightness('#000000')).toBe('dark');
      expect(getColorBrightness('8A2BE2')).toBe('dark');
    });
  });

  describe('deepClone', () => {
    it('clones nested objects, arrays and dates', () => {
      const date = new Date('2026-01-01T00:00:00Z');
      const original = { a: 1, nested: { b: [1, 2, 3] }, when: date };
      const clone = deepClone(original);
      expect(clone).toEqual(original);
      expect(clone.nested).not.toBe(original.nested);
      expect(clone.when).not.toBe(original.when);
      expect(clone.when.getTime()).toBe(date.getTime());
    });

    it('returns primitives unchanged', () => {
      expect(deepClone(42)).toBe(42);
      expect(deepClone(null)).toBeNull();
    });
  });

  describe('deepMerge', () => {
    it('merges nested objects recursively', () => {
      const target = { a: 1, nested: { x: 1, y: 2 } };
      const source = { nested: { y: 20, z: 30 } } as any;
      expect(deepMerge(target, source)).toEqual({ a: 1, nested: { x: 1, y: 20, z: 30 } });
    });

    it('overwrites arrays instead of merging them', () => {
      expect(deepMerge({ list: [1, 2] }, { list: [3] } as any)).toEqual({ list: [3] });
    });
  });

  describe('validation helpers', () => {
    it('isEmail', () => {
      expect(isEmail('admin@knoux.store')).toBe(true);
      expect(isEmail('not-an-email')).toBe(false);
    });

    it('isUrl', () => {
      expect(isUrl('https://knoux.store')).toBe(true);
      expect(isUrl('nope')).toBe(false);
    });

    it('isJson', () => {
      expect(isJson('{"a":1}')).toBe(true);
      expect(isJson('{bad}')).toBe(false);
    });
  });

  describe('json helpers', () => {
    it('extractJson parses or returns null', () => {
      expect(extractJson('{"a":1}')).toEqual({ a: 1 });
      expect(extractJson('nope')).toBeNull();
    });

    it('formatJson pretty prints', () => {
      expect(formatJson({ a: 1 })).toBe('{\n  "a": 1\n}');
    });
  });

  describe('array helpers', () => {
    it('groupBy groups items by key', () => {
      const items = [
        { type: 'a', v: 1 },
        { type: 'b', v: 2 },
        { type: 'a', v: 3 },
      ];
      expect(groupBy(items, 'type')).toEqual({
        a: [
          { type: 'a', v: 1 },
          { type: 'a', v: 3 },
        ],
        b: [{ type: 'b', v: 2 }],
      });
    });

    it('uniqueBy removes duplicates by key', () => {
      const items = [
        { id: 1, v: 'a' },
        { id: 1, v: 'b' },
        { id: 2, v: 'c' },
      ];
      expect(uniqueBy(items, 'id')).toEqual([
        { id: 1, v: 'a' },
        { id: 2, v: 'c' },
      ]);
    });

    it('flatten flattens nested arrays', () => {
      expect(flatten([1, [2, 3], [[4] as any]])).toEqual([1, 2, 3, 4]);
    });

    it('chunk splits arrays into sized groups', () => {
      expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    });
  });

  describe('compareVersions', () => {
    it('compares semantic versions', () => {
      expect(compareVersions('1.2.0', '1.1.9')).toBe(1);
      expect(compareVersions('1.0.0', '1.0.1')).toBe(-1);
      expect(compareVersions('1.0.0', '1.0.0')).toBe(0);
      expect(compareVersions('1.1', '1.1.0')).toBe(0);
    });
  });
});
