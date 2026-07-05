import { describe, it, expect, beforeEach } from 'vitest';
import i18n from '../renderer/utils/i18n';
import en from '../renderer/utils/i18n/en.json';
import ar from '../renderer/utils/i18n/ar.json';

const getKeys = (obj: object, prefix = ''): string[] =>
  Object.keys(obj).reduce((acc: string[], key) => {
    const pre = prefix.length ? prefix + '.' : '';
    if (typeof (obj as any)[key] === 'object' && (obj as any)[key] !== null) {
      acc.push(...getKeys((obj as any)[key], pre + key));
    } else {
      acc.push(pre + key);
    }
    return acc;
  }, []);

describe('i18n dictionary integrity', () => {
  it('English and Arabic dictionaries have matching keys', () => {
    const enKeys = getKeys(en).sort();
    const arKeys = getKeys(ar).sort();
    expect(enKeys).toEqual(arKeys);
  });

  it('All keys have non-empty values in both languages', () => {
    const keys = getKeys(en);
    for (const key of keys) {
      expect(i18n.t(key, '', {}, 'en')).not.toBe('');
      expect(i18n.t(key, '', {}, 'ar')).not.toBe('');
    }
  });
});
