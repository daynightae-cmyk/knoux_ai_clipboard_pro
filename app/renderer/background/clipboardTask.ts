import { ClipboardBulkPayload, WorkerTask, WorkerResponse } from "../workers/workerTypes";

const send = <T>(message: WorkerResponse<T>) => globalThis.postMessage(message);
const hash = (value: string) => {
  let next = 0;
  for (let index = 0; index < value.length; index += 1) next = ((next << 5) - next + value.charCodeAt(index)) | 0;
  return Math.abs(next).toString(36);
};

globalThis.onmessage = (event: MessageEvent<WorkerTask<ClipboardBulkPayload>>) => {
  const task = event.data;
  const start = performance.now();
  try {
    const payload = task.payload || { items: [] };
    const query = (payload.query || "").toLowerCase().trim();
    const items = Array.isArray(payload.items) ? payload.items : [];
    if (payload.mode === "dedupe") {
      const seen = new Set<string>();
      const unique = items.filter((item) => {
        const key = hash(item.content || "");
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      send({ taskId: task.taskId, ok: true, result: { total: items.length, unique, removed: items.length - unique.length }, durationMs: Math.round(performance.now() - start) });
      return;
    }
    if (payload.mode === "analyze") {
      const byType = items.reduce<Record<string, number>>((acc, item) => { const type = item.type || "unknown"; acc[type] = (acc[type] || 0) + 1; return acc; }, {});
      send({ taskId: task.taskId, ok: true, result: { total: items.length, byType }, durationMs: Math.round(performance.now() - start) });
      return;
    }
    const filtered = query ? items.filter((item) => `${item.content || ""} ${(item.tags || []).join(" ")} ${item.source || ""}`.toLowerCase().includes(query)) : items;
    send({ taskId: task.taskId, ok: true, result: { total: items.length, filtered }, durationMs: Math.round(performance.now() - start) });
  } catch (error: any) {
    send({ taskId: task.taskId, ok: false, error: error?.message || "Clipboard task failed", durationMs: Math.round(performance.now() - start) });
  }
};

export {};
