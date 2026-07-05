/**
 * Knoux AI Clipboard Pro — Shared system-clipboard utilities
 *
 * Canonical wrappers around navigator.clipboard with fallbacks.
 * All components should use these instead of calling
 * navigator.clipboard directly.
 */

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}

export async function readFromClipboard(): Promise<string> {
  if (!navigator.clipboard?.readText) return '';
  try {
    return await navigator.clipboard.readText();
  } catch {
    return '';
  }
}
