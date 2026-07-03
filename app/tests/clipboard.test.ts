/**
 * Clipboard Logic Tests
 */

describe('Clipboard Manager', () => {
  let clipboardStore: string[] = [];
  
  beforeEach(() => {
    clipboardStore = [];
  });

  const addToHistory = (item: string) => {
      // Simulate limiting size
      if (clipboardStore.length >= 5) clipboardStore.pop();
      clipboardStore.unshift(item);
  };

  test('Should add items to the start of history', () => {
    addToHistory('Item 1');
    addToHistory('Item 2');
    expect(clipboardStore[0]).toBe('Item 2');
    expect(clipboardStore).toHaveLength(2);
  });

  test('Should maintain history limit', () => {
      // Simulate filling history
      [1, 2, 3, 4, 5, 6].forEach(n => addToHistory(`Item ${n}`));
      expect(clipboardStore).toHaveLength(5);
      expect(clipboardStore[0]).toBe('Item 6'); // Most recent
  });

  test('Should filter history', () => {
      clipboardStore = ['Apple', 'Banana', 'Apricot', 'Date'];
      const filtered = clipboardStore.filter(i => i.startsWith('A'));
      expect(filtered).toHaveLength(2);
      expect(filtered).toContain('Apple');
      expect(filtered).toContain('Apricot');
  });
});
