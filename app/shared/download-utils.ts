/**
 * Knoux AI Clipboard Pro — Shared file-download utilities
 *
 * Single implementation of the Blob→Object-URL→anchor download pattern.
 * All components should use triggerDownload instead of inlining this logic.
 */

export function triggerDownload(
  content: string | BlobPart,
  filename: string,
  contentType: string,
): void {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadJson(filename: string, payload: unknown): void {
  triggerDownload(JSON.stringify(payload, null, 2), filename, 'application/json');
}

export function downloadCsv(filename: string, csvContent: string): void {
  triggerDownload(csvContent, filename, 'text/csv;charset=utf-8');
}

export function downloadMarkdown(filename: string, markdown: string): void {
  triggerDownload(markdown, filename, 'text/markdown;charset=utf-8');
}

export function downloadText(filename: string, text: string): void {
  triggerDownload(text, filename, 'text/plain');
}
