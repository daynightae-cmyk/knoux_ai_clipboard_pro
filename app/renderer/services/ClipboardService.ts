/**
 * Clipboard Service - Real clipboard monitoring and management
 */

interface ClipboardItemData {
  id: string;
  content: string;
  format: string;
  timestamp: string;
  tags: string[];
  metadata?: {
    sensitive?: boolean;
    isUrl?: boolean;
  };
  favorite?: boolean;
}

let clipboardHistory: ClipboardItemData[] = [];
let lastClipboardContent = '';
let isMonitoring = false;

/**
 * Initialize clipboard service
 */
export const initializeClipboardService = async () => {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      const text = await navigator.clipboard.readText();
      lastClipboardContent = text;
    } catch (err) {
      console.log('Clipboard access denied on init');
    }
  }
};

/**
 * Start monitoring clipboard for changes
 */
export const startClipboardMonitoring = (callback: (items: ClipboardItemData[]) => void) => {
  if (isMonitoring) return;
  isMonitoring = true;

  const checkClipboard = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        const text = await navigator.clipboard.readText();

        if (text !== lastClipboardContent && text.trim()) {
          lastClipboardContent = text;

          const newItem: ClipboardItemData = {
            id: Date.now().toString(),
            content: text,
            format: detectFormat(text),
            timestamp: new Date().toISOString(),
            tags: detectTags(text),
            metadata: {
              sensitive: detectSensitive(text),
              isUrl: isUrl(text),
            },
            favorite: false,
          };

          clipboardHistory.unshift(newItem);

          // Keep only last 1000 items
          if (clipboardHistory.length > 1000) {
            clipboardHistory = clipboardHistory.slice(0, 1000);
          }

          // Save to localStorage
          try {
            localStorage.setItem('clipboard-history', JSON.stringify(clipboardHistory));
          } catch (e) {
            console.warn('Failed to save clipboard history');
          }

          callback(clipboardHistory);
        }
      }
    } catch (err) {
      // Clipboard access denied
    }
  };

  // Check every 1 second
  const interval = setInterval(checkClipboard, 1000);

  return () => clearInterval(interval);
};

/**
 * Detect clipboard content format
 */
export const detectFormat = (content: string): string => {
  if (isUrl(content)) return 'URL';
  if (isEmail(content)) return 'Email';
  if (isJSON(content)) return 'JSON';
  if (isCode(content)) return 'Code';
  if (isPhoneNumber(content)) return 'Phone';
  if (content.length > 500) return 'Large Text';
  return 'Text';
};

/**
 * Detect tags from content
 */
export const detectTags = (content: string): string[] => {
  const tags: string[] = [];

  if (isUrl(content)) tags.push('url');
  if (isEmail(content)) tags.push('email');
  if (isJSON(content)) tags.push('json');
  if (isCode(content)) tags.push('code');
  if (containsNumbers(content)) tags.push('numbers');
  if (content.length > 500) tags.push('long-text');

  return tags;
};

/**
 * Detect sensitive content
 */
export const detectSensitive = (content: string): boolean => {
  // Credit card
  if (/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/.test(content)) return true;

  // Social security number
  if (/\b\d{3}-\d{2}-\d{4}\b/.test(content)) return true;

  // API keys
  if (/api[_-]?key|secret|password|token|bearer/i.test(content)) return true;

  // Email with password context
  if (isEmail(content) && content.length > 50) return true;

  return false;
};

/**
 * Helper functions
 */
const isUrl = (content: string): boolean => {
  try {
    new URL(content);
    return true;
  } catch {
    return /^https?:\/\//.test(content);
  }
};

const isEmail = (content: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(content.trim());
};

const isJSON = (content: string): boolean => {
  try {
    JSON.parse(content);
    return true;
  } catch {
    return false;
  }
};

const isCode = (content: string): boolean => {
  const codeKeywords = ['function', 'const', 'let', 'var', 'class', 'import', 'export', 'if', 'for', 'while', '{', '}'];
  return codeKeywords.some(keyword => content.includes(keyword));
};

const isPhoneNumber = (content: string): boolean => {
  return /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/.test(content.trim());
};

const containsNumbers = (content: string): boolean => {
  return /\d/.test(content);
};

/**
 * Get clipboard history
 */
export const getClipboardHistory = (): ClipboardItemData[] => {
  // Try to load from localStorage first
  try {
    const stored = localStorage.getItem('clipboard-history');
    if (stored) {
      clipboardHistory = JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to load clipboard history');
  }

  return clipboardHistory;
};

/**
 * Delete item
 */
export const deleteClipboardItem = (id: string): ClipboardItemData[] => {
  clipboardHistory = clipboardHistory.filter(item => item.id !== id);
  try {
    localStorage.setItem('clipboard-history', JSON.stringify(clipboardHistory));
  } catch (e) {
    console.warn('Failed to save clipboard history');
  }
  return clipboardHistory;
};

/**
 * Clear all history
 */
export const clearClipboardHistory = (): ClipboardItemData[] => {
  clipboardHistory = [];
  try {
    localStorage.removeItem('clipboard-history');
  } catch (e) {
    console.warn('Failed to clear clipboard history');
  }
  return clipboardHistory;
};

/**
 * Toggle favorite
 */
export const toggleFavorite = (id: string): ClipboardItemData[] => {
  clipboardHistory = clipboardHistory.map(item =>
    item.id === id ? { ...item, favorite: !item.favorite } : item
  );
  try {
    localStorage.setItem('clipboard-history', JSON.stringify(clipboardHistory));
  } catch (e) {
    console.warn('Failed to save clipboard history');
  }
  return clipboardHistory;
};
