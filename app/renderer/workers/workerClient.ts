import { WorkerChannel, WorkerResponse, WorkerTask, WorkerTaskKind } from './workerTypes';

export const KNOUX_WORKER_CLIENT_VERSION = '1.1.0';

export interface RunWorkerTaskOptions<TPayload = unknown> {
  kind: WorkerTaskKind;
  payload: TPayload;
  channel: WorkerChannel;
  timeoutMs?: number;
  signal?: AbortSignal;
}

export type WorkerFactory = () => Worker;

let taskCounter = 0;

const createTaskId = () => `knoux-task-${Date.now()}-${++taskCounter}`;

export const workerFactories: Record<WorkerChannel, WorkerFactory> = {
  json: () => new Worker(new URL('./jsonWorker.ts', import.meta.url), { type: 'module' }),
  regex: () => new Worker(new URL('./regexWorker.ts', import.meta.url), { type: 'module' }),
  markdown: () => new Worker(new URL('./markdownWorker.ts', import.meta.url), { type: 'module' }),
  hash: () => new Worker(new URL('./hashWorker.ts', import.meta.url), { type: 'module' }),
  security: () =>
    new Worker(new URL('./securityScannerWorker.ts', import.meta.url), { type: 'module' }),
  clipboard: () =>
    new Worker(new URL('./clipboardWorker.ts', import.meta.url), { type: 'module' }),
};

export function createWorker(channel: WorkerChannel): Worker {
  return workerFactories[channel]();
}

export function isWorkerRuntimeAvailable() {
  return typeof Worker !== 'undefined';
}

export function runWorkerTask<TResult = unknown, TPayload = unknown>({
  kind,
  payload,
  channel,
  timeoutMs = 12000,
  signal,
}: RunWorkerTaskOptions<TPayload>): Promise<{ result: TResult; taskId: string; durationMs: number }> {
  const taskId = createTaskId();
  const task: WorkerTask<TPayload> = { taskId, kind, payload, createdAt: performance.now(), timeoutMs };

  return new Promise((resolve, reject) => {
    if (!isWorkerRuntimeAvailable()) {
      reject(new Error('Web Workers are not available in this runtime.'));
      return;
    }

    if (signal?.aborted) {
      reject(new Error('Task cancelled before start.'));
      return;
    }

    const background = createWorker(channel);
    let completed = false;
    let timer = 0;

    const finish = (callback: () => void) => {
      if (completed) return;
      completed = true;
      background.onmessage = null;
      background.onerror = null;
      signal?.removeEventListener('abort', onAbort);
      window.clearTimeout(timer);
      background.terminate();
      callback();
    };

    const onAbort = () => finish(() => reject(new Error('Task cancelled.')));

    signal?.addEventListener('abort', onAbort, { once: true });
    timer = window.setTimeout(() => {
      finish(() => reject(new Error(`Task timed out after ${timeoutMs}ms.`)));
    }, timeoutMs);

    background.onmessage = (event: MessageEvent<WorkerResponse<TResult>>) => {
      const message = event.data;
      if (!message || message.taskId !== taskId) return;
      finish(() => {
        if (!message.ok) {
          reject(new Error(message.error));
          return;
        }
        resolve({ result: message.result, taskId, durationMs: message.durationMs });
      });
    };

    background.onerror = (event) => {
      finish(() => reject(new Error(event.message || 'Background task error.')));
    };

    background.postMessage(task);
  });
}
