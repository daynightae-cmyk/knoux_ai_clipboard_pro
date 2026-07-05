import { WorkerTask, WorkerResponse } from "../workers/workerTypes";

const send = <T>(message: WorkerResponse<T>) => globalThis.postMessage(message);
const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const renderMarkdown = (input: string) => escapeHtml(input)
  .replace(/^### (.*)$/gm, "<h3>$1</h3>")
  .replace(/^## (.*)$/gm, "<h2>$1</h2>")
  .replace(/^# (.*)$/gm, "<h1>$1</h1>")
  .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
  .replace(/`([^`]+)`/g, "<code>$1</code>")
  .replace(/^[-*] (.*)$/gm, "<li>$1</li>")
  .replace(/\n{2,}/g, "</p><p>");

globalThis.onmessage = (event: MessageEvent<WorkerTask<string>>) => {
  const task = event.data;
  const start = performance.now();
  try {
    const source = String(task.payload || "");
    const html = `<article class="knoux-markdown-preview"><p>${renderMarkdown(source)}</p></article>`;
    const wordCount = source.split(/\s+/).filter(Boolean).length;
    send({ taskId: task.taskId, ok: true, result: { html, wordCount, characters: source.length }, durationMs: Math.round(performance.now() - start) });
  } catch (error: any) {
    send({ taskId: task.taskId, ok: false, error: error?.message || "Markdown task failed", durationMs: Math.round(performance.now() - start) });
  }
};

export {};
