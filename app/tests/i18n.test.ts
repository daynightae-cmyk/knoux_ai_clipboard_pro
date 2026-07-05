import { describe, it, expect, beforeEach } from 'vitest';
import i18n from '../renderer/utils/i18n';

describe('i18n translation coverage', () => {
  beforeEach(() => {
    i18n.setLanguage('en');
  });

  it('returns shell labels for the active English locale', () => {
    expect(i18n.t('shell.sidebar.ai')).toBe('AI Co-Pilot');
    expect(i18n.t('shell.topbar.searchPlaceholder')).toContain('Search');
  });

  it('returns Arabic strings when Arabic is selected', () => {
    i18n.setLanguage('ar');
    expect(i18n.t('shell.sidebar.ai')).toBe('مساعد الذكاء');
    expect(i18n.t('shell.topbar.searchPlaceholder')).toContain('البحث');
  });
});
