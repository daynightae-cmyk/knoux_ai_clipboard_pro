import { WorkerTask, WorkerResponse } from "../workers/workerTypes";

const send = <T>(message: WorkerResponse<T>) => globalThis.postMessage(message);

globalThis.onmessage = (event: MessageEvent<WorkerTask<string>>) => {
  const task = event.data;
  const start = performance.now();
  try {
    const parsed = JSON.parse(String(task.payload || ""));
    const result = task.kind === "json-minify" ? JSON.stringify(parsed) : JSON.stringify(parsed, null, 2);
    send({ taskId: task.taskId, ok: true, result, durationMs: Math.round(performance.now() - start) });
  } catch (error: any) {
    send({ taskId: task.taskId, ok: false, error: error?.message || "Invalid JSON", durationMs: Math.round(performance.now() - start) });
  }
};

export {};
