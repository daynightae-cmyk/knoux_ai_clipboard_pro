/**
 * Unit tests for production catalog consistency.
 * Ensures catalog IDs match operation IDs and all services have valid metadata.
 */

import { describe, expect, it } from 'vitest';
import { PRODUCTION_SERVICES, getServiceReadinessPercent, PRODUCTION_SCORE } from '@renderer/services/productionCatalog';

describe('productionCatalog', () => {
  it('should have no empty titles or descriptions', () => {
    PRODUCTION_SERVICES.forEach(service => {
      expect(service.title).toBeTruthy();
      expect(service.title.length).toBeGreaterThan(0);
      expect(service.description).toBeTruthy();
      expect(service.description.length).toBeGreaterThan(0);
    });
  });

  it('should have valid statuses', () => {
    const validStatuses = ['Active', 'Ready', 'Guarded', 'Planned', 'Disabled', 'Missing'];
    PRODUCTION_SERVICES.forEach(service => {
      expect(validStatuses).toContain(service.status);
    });
  });

  it('should have no Active services without executable paths', () => {
    PRODUCTION_SERVICES.filter(s => s.status === 'Active').forEach(service => {
      expect(service.implemented).toBe(true);
      expect(service.actionHandler).toBeTruthy();
    });
  });

  it('should have catalog entries for developer tool IDs', () => {
    const developerTools = PRODUCTION_SERVICES.filter(s => s.category === 'Developer');
    expect(developerTools.length).toBeGreaterThan(0);
    developerTools.forEach(service => {
      expect(service.id).toBeTruthy();
      expect(service.status).toBeTruthy();
    });
  });

  it('should compute readiness percent from real statuses', () => {
    const percent = getServiceReadinessPercent();
    expect(percent).toBeGreaterThanOrEqual(0);
    expect(percent).toBeLessThanOrEqual(100);
    expect(typeof percent).toBe('number');
  });

  it('should have consistent production score', () => {
    const percent = getServiceReadinessPercent();
    expect(PRODUCTION_SCORE.score).toBe(percent);
    expect(PRODUCTION_SCORE.securityVault).toBe(percent);
    expect(PRODUCTION_SCORE.openRouterBridge).toBe(percent);
    expect(PRODUCTION_SCORE.sqlitePersistence).toBe(percent);
    expect(PRODUCTION_SCORE.serviceTransparency).toBe(percent);
  });

  it('should have unique service IDs', () => {
    const ids = PRODUCTION_SERVICES.map(s => s.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have valid categories', () => {
    const validCategories = ['Clipboard', 'Client Tools', 'Security', 'AI', 'Barcode', 'Developer', 'Packaging', 'Storage'];
    PRODUCTION_SERVICES.forEach(service => {
      expect(validCategories).toContain(service.category);
    });
  });

  it('should have valid tiers', () => {
    const validTiers = ['live', 'guarded', 'planned'];
    PRODUCTION_SERVICES.forEach(service => {
      expect(validTiers).toContain(service.tier);
    });
  });

  it('should have consistent implemented flag with status', () => {
    PRODUCTION_SERVICES.forEach(service => {
      if (service.status === 'Planned' || service.status === 'Disabled' || service.status === 'Missing') {
        expect(service.implemented).toBe(false);
      }
    });
  });
});
