import { WorkerResponse, WorkerTask, WorkerTaskKind } from "../workers/workerTypes";

export const KNOUX_TASK_CLIENT_VERSION = "1.1.0";

export interface RunWorkerTaskOptions<TPayload = unknown> {
  kind: WorkerTaskKind;
  payload: TPayload;
  createWorker: () => Worker;
  timeoutMs?: number;
  signal?: AbortSignal;
}

let taskCounter = 0;
const createTaskId = () => `knoux-task-${Date.now()}-${++taskCounter}`;

export function runWorkerTask<TResult = unknown, TPayload = unknown>({ kind, payload, createWorker, timeoutMs = 12000, signal }: RunWorkerTaskOptions<TPayload>): Promise<TResult> {
  const taskId = createTaskId();
  const task: WorkerTask<TPayload> = { taskId, kind, payload, createdAt: performance.now(), timeoutMs };

  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error("Task cancelled before start."));
      return;
    }

    const background = createWorker();
    let done = false;
    let timer = 0;

    const cleanup = () => {
      background.onmessage = null;
      background.onerror = null;
      signal?.removeEventListener("abort", onAbort);
      window.clearTimeout(timer);
      background.terminate();
    };

    const finish = (callback: () => void) => {
      if (done) return;
      done = true;
      cleanup();
      callback();
    };

    const onAbort = () => finish(() => reject(new Error("Task cancelled.")));
    timer = window.setTimeout(() => finish(() => reject(new Error(`Task timed out after ${timeoutMs}ms.`))), timeoutMs);
    signal?.addEventListener("abort", onAbort, { once: true });

    background.onmessage = (event: MessageEvent<WorkerResponse<TResult>>) => {
      const message = event.data;
      if (!message || message.taskId !== taskId) return;
      finish(() => message.ok ? resolve(message.result) : reject(new Error(message.error)));
    };

    background.onerror = (event) => finish(() => reject(new Error(event.message || "Background task error.")));
    background.postMessage(task);
  });
}
