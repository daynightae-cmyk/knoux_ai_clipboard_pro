import { MarkdownPayload, WorkerResponse, WorkerTask } from './workerTypes';

const send = <T>(message: WorkerResponse<T>) => globalThis.postMessage(message);

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const renderMarkdown = (input: string) =>
  escapeHtml(input)
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
    .replace(/^[-*] (.*)$/gm, '<li>$1</li>')
    .replace(/\n{2,}/g, '</p><p>');

globalThis.onmessage = (event: MessageEvent<WorkerTask<MarkdownPayload | string>>) => {
  const task = event.data;
  const start = performance.now();

  try {
    const payload = typeof task.payload === 'string' ? { text: task.payload } : task.payload;
    const source = String(payload?.text || '');
    const html = `<article class="knoux-markdown-preview"><p>${renderMarkdown(source)}</p></article>`;
    const lines = source.split(/\r?\n/);

    send({
      taskId: task.taskId,
      ok: true,
      result: {
        html,
        source,
        wordCount: source.split(/\s+/).filter(Boolean).length,
        characters: source.length,
        lineCount: lines.length,
      },
      durationMs: Math.round(performance.now() - start),
    });
  } catch (error) {
    send({
      taskId: task.taskId,
      ok: false,
      error: error instanceof Error ? error.message : 'Markdown task failed',
      durationMs: Math.round(performance.now() - start),
    });
  }
};

export {};
