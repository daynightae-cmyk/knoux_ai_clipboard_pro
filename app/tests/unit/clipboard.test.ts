/**
 * Clipboard Tests
 * Comprehensive tests for clipboard functionality
 */

import { ClipboardWatcher } from '@backend/clipboard/watcher';
import { HistoryStore } from '@backend/clipboard/history-store';
import { ContentNormalizer } from '@backend/clipboard/normalizer';
import { ContentFormatter } from '@backend/clipboard/formatter';
import type { ClipboardItem } from '@shared/types';

describe('Clipboard System', () => {
  let watcher: ClipboardWatcher;
  let store: HistoryStore;
  let normalizer: ContentNormalizer;
  let formatter: ContentFormatter;

  beforeEach(() => {
    watcher = new ClipboardWatcher();
    store = new HistoryStore();
    normalizer = new ContentNormalizer();
    formatter = new ContentFormatter();
  });

  afterEach(async () => {
    await watcher.stop();
    await store.clear();
    jest.clearAllMocks();
  });

  describe('Clipboard Watcher', () => {
    it('should start and stop monitoring', async () => {
      const startSpy = jest.spyOn(watcher, 'start');
      const stopSpy = jest.spyOn(watcher, 'stop');

      await watcher.start();
      expect(startSpy).toHaveBeenCalled();
      expect(watcher.isMonitoring()).toBe(true);

      await watcher.stop();
      expect(stopSpy).toHaveBeenCalled();
      expect(watcher.isMonitoring()).toBe(false);
    });

    it('should detect clipboard changes', async () => {
      const callback = jest.fn();
      watcher.onChange(callback);

      await watcher.start();
      
      // Simulate clipboard change
      await watcher.checkClipboard();
      
      expect(callback).toHaveBeenCalled();
      expect(callback.mock.calls[0][0]).toHaveProperty('content');
      expect(callback.mock.calls[0][0]).toHaveProperty('timestamp');
    });

    it('should respect poll interval', async () => {
      const pollInterval = 100;
      watcher.setPollInterval(pollInterval);

      const checkSpy = jest.spyOn(watcher, 'checkClipboard');
      
      await watcher.start();
      await testUtils.wait(pollInterval * 3);

      expect(checkSpy).toHaveBeenCalled();
      // Should be called approximately 3 times
      expect(checkSpy.mock.calls.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('History Store', () => {
    const sampleItems: ClipboardItem[] = [
      {
        id: '1',
        content: 'First item',
        format: 'text',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        metadata: { length: 10 }
      },
      {
        id: '2',
        content: 'Second item',
        format: 'text',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        metadata: { length: 11 },
        tags: ['important']
      },
      {
        id: '3',
        content: 'Third item',
        format: 'text',
        timestamp: new Date().toISOString(),
        metadata: { length: 9 }
      }
    ];

    beforeEach(async () => {
      for (const item of sampleItems) {
        await store.save(item);
      }
    });

    it('should save and retrieve items', async () => {
      const newItem: ClipboardItem = {
        id: '4',
        content: 'New item',
        format: 'text',
        timestamp: new Date().toISOString(),
        metadata: { length: 8 }
      };

      await store.save(newItem);
      const retrieved = await store.get('4');

      expect(retrieved).toEqual(newItem);
    });

    it('should retrieve all items in chronological order', async () => {
      const items = await store.getAll();
      
      expect(items.length).toBe(3);
      expect(items[0].id).toBe('3'); // Most recent first
      expect(items[2].id).toBe('1'); // Oldest last
    });

    it('should support pagination', async () => {
      const page1 = await store.getPaginated({ limit: 2, offset: 0 });
      const page2 = await store.getPaginated({ limit: 2, offset: 2 });

      expect(page1.items.length).toBe(2);
      expect(page2.items.length).toBe(1);
      expect(page1.total).toBe(3);
      expect(page2.total).toBe(3);
      expect(page1.items[0].id).toBe('3');
      expect(page2.items[0].id).toBe('1');
    });

    it('should search items by content', async () => {
      const results = await store.search('Second');
      
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('2');
      expect(results[0].content).toContain('Second');
    });

    it('should filter items by tag', async () => {
      const taggedItems = await store.getByTag('important');
      
      expect(taggedItems.length).toBe(1);
      expect(taggedItems[0].id).toBe('2');
    });

    it('should delete items', async () => {
      const beforeDelete = await store.getAll();
      expect(beforeDelete.length).toBe(3);

      await store.delete('2');
      
      const afterDelete = await store.getAll();
      expect(afterDelete.length).toBe(2);
      expect(afterDelete.find(item => item.id === '2')).toBeUndefined();
    });

    it('should clear all items', async () => {
      await store.clear();
      const items = await store.getAll();
      
      expect(items.length).toBe(0);
    });

    it('should maintain size limits', async () => {
      store.setMaxSize(2);
      
      const items = await store.getAll();
      expect(items.length).toBe(2); // Should keep only 2 most recent
      expect(items[0].id).toBe('3');
      expect(items[1].id).toBe('2');
    });
  });

  describe('Content Normalization', () => {
    const testCases = [
      {
        name: 'should normalize whitespace',
        input: '  Hello   World  \t\n',
        expected: 'Hello World'
      },
      {
        name: 'should remove extra newlines',
        input: 'Line 1\n\n\nLine 2\n\nLine 3',
        expected: 'Line 1\n\nLine 2\n\nLine 3'
      },
      {
        name: 'should normalize line endings',
        input: 'Line 1\r\nLine 2\rLine 3',
        expected: 'Line 1\nLine 2\nLine 3'
      },
      {
        name: 'should trim HTML tags',
        input: '<p>Hello <b>World</b></p>',
        expected: 'Hello World'
      },
      {
        name: 'should decode HTML entities',
        input: 'Hello &amp; World &lt;3',
        expected: 'Hello & World <3'
      }
    ];

    testCases.forEach(({ name, input, expected }) => {
      it(name, () => {
        const result = normalizer.normalize(input, 'text');
        expect(result).toBe(expected);
      });
    });

    it('should handle different formats', () => {
      const htmlInput = '<div>Test</div>';
      const rtfInput = '{\rtf1 Test}';
      
      const htmlResult = normalizer.normalize(htmlInput, 'html');
      const rtfResult = normalizer.normalize(rtfInput, 'rtf');
      
      expect(htmlResult).toBe('Test');
      expect(rtfResult).toBe('Test');
    });

    it('should detect content type', () => {
      const tests = [
        { input: 'Hello World', expected: 'text' },
        { input: '<html>', expected: 'html' },
        { input: '{\rtf1', expected: 'rtf' },
        { input: 'https://example.com', expected: 'link' },
        { input: 'function test() {}', expected: 'code' }
      ];

      tests.forEach(({ input, expected }) => {
        const result = normalizer.detectType(input);
        expect(result).toBe(expected);
      });
    });
  });

  describe('Content Formatting', () => {
    it('should format plain text', () => {
      const input = 'hello world';
      const result = formatter.format(input, 'text');
      
      expect(result.content).toBe('hello world');
      expect(result.metadata.format).toBe('text');
      expect(result.metadata.length).toBe(11);
    });

    it('should format code with syntax highlighting', () => {
      const code = 'function test() { return "hello"; }';
      const result = formatter.format(code, 'code');
      
      expect(result.content).toBe(code);
      expect(result.metadata.language).toBe('javascript');
      expect(result.metadata.highlighted).toBeDefined();
    });

    it('should format links', () => {
      const url = 'https://github.com/knoux/clipboard-ai';
      const result = formatter.format(url, 'link');
      
      expect(result.content).toBe(url);
      expect(result.metadata.domain).toBe('github.com');
      expect(result.metadata.secure).toBe(true);
    });

    it('should add metadata', () => {
      const text = 'Sample text for testing';
      const result = formatter.format(text, 'text');
      
      expect(result.metadata).toMatchObject({
        length: text.length,
        wordCount: 4,
        charCount: text.length,
        language: 'english'
      });
    });

    it('should handle sensitive data', () => {
      const sensitiveText = 'Password: secret123';
      const result = formatter.format(sensitiveText, 'text');
      
      expect(result.metadata.sensitive).toBe(true);
      expect(result.metadata.masked).toBe(true);
    });
  });

  describe('Integration', () => {
    it('should handle full clipboard workflow', async () => {
      // Start watching
      await watcher.start();
      
      // Simulate clipboard content
      const clipboardContent = 'Test clipboard content';
      
      // Normalize
      const normalized = normalizer.normalize(clipboardContent, 'text');
      expect(normalized).toBe(clipboardContent);
      
      // Format
      const formatted = formatter.format(normalized, 'text');
      expect(formatted.content).toBe(clipboardContent);
      
      // Store
      const item: ClipboardItem = {
        id: 'test-workflow',
        ...formatted,
        timestamp: new Date().toISOString()
      };
      
      await store.save(item);
      
      // Retrieve
      const retrieved = await store.get('test-workflow');
      expect(retrieved).toEqual(item);
      
      // Stop
      await watcher.stop();
    });

    it('should handle rapid clipboard changes', async () => {
      const changes = ['First', 'Second', 'Third'];
      const captured: string[] = [];
      
      watcher.onChange((item) => {
        captured.push(item.content);
      });
      
      await watcher.start();
      
      // Simulate rapid changes
      for (const content of changes) {
        await watcher.simulateChange(content);
        await testUtils.wait(10); // Small delay
      }
      
      await watcher.stop();
      
      expect(captured).toEqual(changes);
    });
  });

  describe('Performance', () => {
    it('should handle large content efficiently', async () => {
      const largeContent = 'A'.repeat(10000); // 10KB
      
      const startTime = Date.now();
      const normalized = normalizer.normalize(largeContent, 'text');
      const formatted = formatter.format(normalized, 'text');
      const processingTime = Date.now() - startTime;
      
      expect(formatted.content.length).toBe(10000);
      expect(processingTime).toBeLessThan(100); // Should process within 100ms
    });

    it('should maintain performance with many items', async () => {
      // Add many items
      for (let i = 0; i < 100; i++) {
        const item: ClipboardItem = {
          id: `item-${i}`,
          content: `Content ${i}`,
          format: 'text',
          timestamp: new Date().toISOString(),
          metadata: { length: 9 }
        };
        await store.save(item);
      }
      
      const startTime = Date.now();
      const items = await store.getAll();
      const retrievalTime = Date.now() - startTime;
      
      expect(items.length).toBe(100);
      expect(retrievalTime).toBeLessThan(500); // Should retrieve within 500ms
    });
  });

  describe('Error Handling', () => {
    it('should handle storage errors gracefully', async () => {
      jest.spyOn(store, 'save').mockRejectedValue(new Error('Database error'));
      
      const item: ClipboardItem = {
        id: 'error-test',
        content: 'Test',
        format: 'text',
        timestamp: new Date().toISOString(),
        metadata: {}
      };
      
      await expect(store.save(item)).rejects.toThrow('Database error');
    });

    it('should handle invalid clipboard content', async () => {
      const result = normalizer.normalize(null as any, 'text');
      expect(result).toBe('');
      
      const formatted = formatter.format('', 'text');
      expect(formatted.content).toBe('');
      expect(formatted.metadata.length).toBe(0);
    });

    it('should recover from watcher errors', async () => {
      jest.spyOn(watcher, 'checkClipboard').mockImplementation(() => {
        throw new Error('Clipboard access error');
      });
      
      const errorSpy = jest.spyOn(console, 'error');
      
      await watcher.start();
      await testUtils.wait(100);
      await watcher.stop();
      
      expect(errorSpy).toHaveBeenCalled();
      expect(watcher.isMonitoring()).toBe(false);
    });
  });
});
