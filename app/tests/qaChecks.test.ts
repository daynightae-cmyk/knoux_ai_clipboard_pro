import { describe, it, expect } from 'vitest';
import { runQaChecks, summarizeQa, buildQaReport, type QAStatus } from '../renderer/services/qaChecks';

const validStatuses: QAStatus[] = ['pass', 'warning', 'fail'];

describe('QA Lab checks engine', () => {
  const results = runQaChecks();

  it('produces the full checker suite with well-formed results', () => {
    expect(results.length).toBeGreaterThanOrEqual(18);
    for (const result of results) {
      expect(result.id).toBeTruthy();
      expect(result.title).toBeTruthy();
      expect(validStatuses).toContain(result.status);
      expect(result.summary.length).toBeGreaterThan(0);
      expect(Array.isArray(result.details)).toBe(true);
      expect(result.details.length).toBeGreaterThan(0);
    }
  });

  it('uses unique checker identifiers', () => {
    const ids = results.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('confirms i18n parity and brand integrity as passing checks', () => {
    const i18nCheck = results.find((r) => r.id === 'i18n-coverage');
    const brandCheck = results.find((r) => r.id === 'brand-consistency');
    expect(i18nCheck?.status).toBe('pass');
    expect(brandCheck?.status).toBe('pass');
  });

  it('verifies every developer tool returns real output', () => {
    const toolCheck = results.find((r) => r.id === 'tool-output-integrity');
    expect(toolCheck?.status).toBe('pass');
  });

  it('validates security scanners via self-check', () => {
    const scanner = results.find((r) => r.id === 'secret-scanner-selfcheck');
    const redaction = results.find((r) => r.id === 'redaction-selfcheck');
    expect(scanner?.status).toBe('pass');
    expect(redaction?.status).toBe('pass');
  });

  it('summarizes totals consistently', () => {
    const summary = summarizeQa(results);
    expect(summary.total).toBe(results.length);
    expect(summary.passed + summary.warnings + summary.failed).toBe(results.length);
    expect(summary.readiness).toBeGreaterThanOrEqual(0);
    expect(summary.readiness).toBeLessThanOrEqual(100);
  });

  it('builds a shareable text report', () => {
    const report = buildQaReport(results);
    expect(report).toContain('QA Session Report');
    expect(report).toContain('Readiness:');
    expect(report).toContain('knoux.store');
  });
});
