import { WorkerResponse, WorkerTask, WorkerTaskKind } from "../workers/workerTypes";

export const KNOUX_TASK_CLIENT_VERSION = "1.1.0";

export interface RunWorkerTaskOptions<TPayload = unknown> {
  kind: WorkerTaskKind;
  payload: TPayload;
  createWorker: () => Worker;
  timeoutMs?: number;
  signal?: AbortSignal;
}
