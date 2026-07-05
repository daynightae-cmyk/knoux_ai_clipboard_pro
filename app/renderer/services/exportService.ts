import { ClipboardItem } from '../types';

/**
 * Converts an array of clipboard items into a single Markdown string.
 * @param clips - The array of clipboard items to export.
 * @returns A string formatted in Markdown.
 */
export function exportClipsToMarkdown(clips: Partial<ClipboardItem>[]): string {
  let markdown = `# Clipboard Export\n\n*Exported on: ${new Date().toUTCString()}*\n\n---\n\n`;

  clips.forEach((clip, index) => {
    const title = `Clip ${index + 1}: ${clip.source || 'Unknown Source'}`;
    const timestamp = clip.createdAt ? new Date(clip.createdAt).toLocaleString() : 'N/A';
    const type = clip.type || 'text';
    const language = (clip as any).classifiedType?.language || '';

    markdown += `## ${title}\n`;
    markdown += `* **Timestamp:** ${timestamp}\n`;
    markdown += `* **Type:** ${type}\n`;
    if (language) {
      markdown += `* **Language:** ${language}\n`;
    }
    markdown += '\n';

    if (type === 'text' && language) {
      markdown += `\`\`\`${language}\n`;
      markdown += `${clip.content || ''}\n`;
      markdown += `\`\`\`\n\n`;
    } else if (type === 'image') {
        markdown += `!Image Clip\n\n`;
    } else {
      markdown += `\`\`\`\n`;
      markdown += `${clip.content || ''}\n`;
      markdown += `\`\`\`\n\n`;
    }

    markdown += '---\n\n';
  });

  return markdown;
}

/**
 * Triggers a file download in the browser.
 * @param content - The string content to download.
 * @param filename - The name of the file to be downloaded.
 * @param contentType - The MIME type of the content.
 */
export function triggerDownload(content: string, filename: string, contentType: string) {
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