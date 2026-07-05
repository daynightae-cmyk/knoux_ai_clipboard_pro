/**
 * Unit tests for the markdown export service.
 * Targets app/renderer/services/exportService.ts (previously 0% coverage).
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ClipboardItem } from '@renderer/types';
import { exportClipsToMarkdown, triggerDownload } from '@renderer/services/exportService';

describe('exportService', () => {
  describe('exportClipsToMarkdown', () => {
    it('renders a header and export timestamp', () => {
      const md = exportClipsToMarkdown([]);
      expect(md).toContain('# Clipboard Export');
      expect(md).toContain('*Exported on:');
    });

    it('renders a text clip with a language code fence', () => {
      const clips: Partial<ClipboardItem>[] = [
        {
          source: 'VS Code',
          type: 'text',
          content: 'const x = 1;',
          createdAt: new Date('2026-01-01T00:00:00Z').getTime(),
          classifiedType: { language: 'typescript' },
        } as any,
      ];
      const md = exportClipsToMarkdown(clips);
      expect(md).toContain('## Clip 1: VS Code');
      expect(md).toContain('* **Type:** text');
      expect(md).toContain('* **Language:** typescript');
      expect(md).toContain('```typescript');
      expect(md).toContain('const x = 1;');
    });

    it('renders an image clip placeholder', () => {
      const md = exportClipsToMarkdown([{ type: 'image' } as any]);
      expect(md).toContain('Image Clip');
    });

    it('renders a generic clip in a plain code fence and defaults unknown source', () => {
      const md = exportClipsToMarkdown([{ content: 'plain text' } as any]);
      expect(md).toContain('Unknown Source');
      expect(md).toContain('* **Type:** text');
      expect(md).toContain('```\nplain text\n```');
    });
  });

  describe('triggerDownload', () => {
    let clickSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      (URL as any).createObjectURL = vi.fn(() => 'blob:mock');
      (URL as any).revokeObjectURL = vi.fn();
      clickSpy = vi
        .spyOn(HTMLAnchorElement.prototype, 'click')
        .mockImplementation(() => undefined);
    });

    afterEach(() => {
      clickSpy.mockRestore();
    });

    it('creates an anchor, clicks it and revokes the url', () => {
      triggerDownload('hello', 'file.txt', 'text/plain');
      expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
      expect(clickSpy).toHaveBeenCalledTimes(1);
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock');
    });
  });
});
