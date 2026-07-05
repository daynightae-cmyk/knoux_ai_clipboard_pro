/**
 * Unit tests for the offline clipboard service helpers.
 * Targets app/renderer/services/clientClipboardServices.ts (previously ~34% coverage).
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ClipboardItem } from '@renderer/types';
import {
  hashContent,
  detectClipboardType,
  detectDocumentKind,
  buildDocumentBrief,
  buildDocumentBriefMarkdown,
  autoTags,
  cleanText,
  extractEntities,
  groupClipsByDate,
  duplicateSummary,
  removeDuplicates,
  buildDailySummary,
  exportJsonFile,
  exportCsvFile,
  exportMarkdownFile,
  isElectronRuntime,
} from '@renderer/services/clientClipboardServices';

const makeItem = (overrides: Partial<ClipboardItem> = {}): ClipboardItem => ({
  id: overrides.id ?? `id-${Math.random().toString(36).slice(2)}`,
  content: 'sample content',
  type: 'text',
  timestamp: new Date().toISOString(),
  pinned: false,
  favorite: false,
  tags: [],
  source: 'test',
  isSecure: false,
  ...overrides,
});

describe('clientClipboardServices', () => {
  describe('hashContent', () => {
    it('is deterministic for identical input', () => {
      expect(hashContent('knoux')).toBe(hashContent('knoux'));
    });

    it('differs for different input', () => {
      expect(hashContent('a')).not.toBe(hashContent('b'));
    });

    it('returns "0" for empty string', () => {
      expect(hashContent('')).toBe('0');
    });
  });

  describe('detectClipboardType', () => {
    it('detects links', () => {
      expect(detectClipboardType('https://knoux.store')).toBe('link');
    });

    it('detects pdf references', () => {
      expect(detectClipboardType('Proposal.pdf')).toBe('pdf');
    });

    it('detects office/document files', () => {
      expect(detectClipboardType('report.docx')).toBe('file');
      expect(detectClipboardType('data.csv')).toBe('file');
    });

    it('detects code', () => {
      expect(detectClipboardType('const x = 1;')).toBe('code');
      expect(detectClipboardType('{ "a": 1 }')).toBe('code');
    });

    it('detects images', () => {
      expect(detectClipboardType('photo.png')).toBe('image');
    });

    it('falls back to text', () => {
      expect(detectClipboardType('just some plain words')).toBe('text');
    });
  });

  describe('detectDocumentKind', () => {
    it('classifies document kinds', () => {
      expect(detectDocumentKind('invoice.pdf')).toBe('pdf');
      expect(detectDocumentKind('budget.xlsx')).toBe('spreadsheet');
      expect(detectDocumentKind('deck.pptx')).toBe('presentation');
      expect(detectDocumentKind('contract.docx')).toBe('document');
      expect(detectDocumentKind('random text')).toBe('unknown');
    });
  });

  describe('buildDocumentBrief', () => {
    it('builds a structured brief from content', () => {
      const brief = buildDocumentBrief('Proposal.pdf\nClient: KNOUX');
      expect(brief.kind).toBe('pdf');
      expect(brief.title).toBe('Proposal.pdf');
      expect(brief.extension).toBe('pdf');
      expect(brief.suggestedTags).toContain('pdf');
      expect(brief.actionPlan.length).toBeGreaterThan(0);
    });

    it('handles empty content gracefully', () => {
      const brief = buildDocumentBrief('');
      expect(brief.kind).toBe('unknown');
      expect(brief.title).toBe('Untitled document');
    });
  });

  describe('buildDocumentBriefMarkdown', () => {
    it('produces markdown with a title heading and action plan', () => {
      const md = buildDocumentBriefMarkdown('Proposal.pdf');
      expect(md).toContain('# KNOUX Document Brief');
      expect(md).toContain('Title: Proposal.pdf');
      expect(md).toContain('## Action Plan');
    });
  });

  describe('autoTags', () => {
    it('tags emails, phones, links and code', () => {
      expect(autoTags('reach me at admin@knoux.store')).toContain('email');
      expect(autoTags('call +971 50 328 1920')).toContain('phone');
      expect(autoTags('visit https://knoux.store')).toContain('link');
      expect(autoTags('const value = 1;')).toContain('code');
    });

    it('tags invoices and tracking references', () => {
      expect(autoTags('Invoice INV-2026-104')).toContain('invoice');
      expect(autoTags('tracking KNX-4455 via dhl')).toContain('tracking');
    });

    it('flags guarded content when secrets are present', () => {
      expect(autoTags('password: hunter2secret')).toContain('guarded');
    });

    it('returns an empty array for plain words', () => {
      expect(autoTags('hello there')).toEqual([]);
    });
  });

  describe('cleanText', () => {
    it('normalizes whitespace, line breaks and bullets', () => {
      const messy = 'line1\r\n\r\n\r\n\r\nline2   with    spaces\n*  bullet';
      const cleaned = cleanText(messy);
      expect(cleaned).not.toContain('\r');
      expect(cleaned).not.toMatch(/\n{3,}/);
      expect(cleaned).toContain('- bullet');
      expect(cleaned).toContain('line2 with spaces');
    });
  });

  describe('extractEntities', () => {
    it('extracts unique emails, phones and urls', () => {
      const text =
        'Email admin@knoux.store and admin@knoux.store, call +971503281920, see https://knoux.store';
      const entities = extractEntities(text);
      expect(entities.emails).toEqual(['admin@knoux.store']);
      expect(entities.urls).toEqual(['https://knoux.store']);
      expect(entities.phones.length).toBe(1);
    });

    it('extracts possible addresses', () => {
      const entities = extractEntities('123 Main Street\nAbu Dhabi, UAE');
      expect(entities.possibleAddresses.length).toBeGreaterThan(0);
    });
  });

  describe('groupClipsByDate', () => {
    it('buckets clips into Today / Yesterday / This Week / Older', () => {
      const now = Date.now();
      const items = [
        makeItem({ id: 'today', timestamp: new Date(now).toISOString() }),
        makeItem({ id: 'yesterday', timestamp: new Date(now - 26 * 3600 * 1000).toISOString() }),
        makeItem({ id: 'week', timestamp: new Date(now - 3 * 86400 * 1000).toISOString() }),
        makeItem({ id: 'old', timestamp: new Date(now - 30 * 86400 * 1000).toISOString() }),
      ];
      const grouped = groupClipsByDate(items);
      expect(grouped.Today.map((c) => c.id)).toContain('today');
      expect(grouped.Yesterday.map((c) => c.id)).toContain('yesterday');
      expect(grouped['This Week'].map((c) => c.id)).toContain('week');
      expect(grouped.Older.map((c) => c.id)).toContain('old');
    });
  });

  describe('duplicateSummary / removeDuplicates', () => {
    it('reports and removes duplicate content', () => {
      const items = [
        makeItem({ id: '1', content: 'dup' }),
        makeItem({ id: '2', content: 'dup' }),
        makeItem({ id: '3', content: 'unique' }),
      ];
      const summary = duplicateSummary(items);
      expect(summary.duplicateGroups).toBe(1);
      expect(summary.duplicateCount).toBe(1);

      const deduped = removeDuplicates(items);
      expect(deduped).toHaveLength(2);
    });

    it('preserves pinned duplicates', () => {
      const items = [
        makeItem({ id: '1', content: 'dup', pinned: true }),
        makeItem({ id: '2', content: 'dup', pinned: true }),
      ];
      expect(removeDuplicates(items)).toHaveLength(2);
    });
  });

  describe('buildDailySummary', () => {
    it('summarizes today\'s clips', () => {
      const now = Date.now();
      const items = [
        makeItem({ id: '1', type: 'text', timestamp: new Date(now).toISOString(), pinned: true }),
        makeItem({ id: '2', type: 'code', timestamp: new Date(now).toISOString() }),
        makeItem({ id: '3', type: 'text', timestamp: new Date(now).toISOString() }),
      ];
      const summary = buildDailySummary(items);
      expect(summary.clips).toBe(3);
      expect(summary.pinned).toBe(1);
      expect(summary.topTypes[0][0]).toBe('text');
    });
  });

  describe('file export helpers', () => {
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

    it('exportJsonFile creates and revokes an object url', () => {
      exportJsonFile('out.json', { a: 1 });
      expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
      expect(clickSpy).toHaveBeenCalledTimes(1);
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock');
    });

    it('exportCsvFile triggers a download', () => {
      exportCsvFile('out.csv', [makeItem({ id: '1', content: 'a,b\n"c"' })]);
      expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
      expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    it('exportMarkdownFile triggers a download', () => {
      exportMarkdownFile('out.md', '# hi');
      expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
      expect(clickSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('isElectronRuntime', () => {
    afterEach(() => {
      delete (window as any).electronAPI;
      delete (window as any).electron;
    });

    it('returns false when no bridge is present', () => {
      const original = (window as any).knoux;
      delete (window as any).knoux;
      expect(isElectronRuntime()).toBe(false);
      (window as any).knoux = original;
    });

    it('returns true when an electron clipboard bridge exists', () => {
      (window as any).electronAPI = { clipboard: {} };
      expect(isElectronRuntime()).toBe(true);
    });
  });
});
