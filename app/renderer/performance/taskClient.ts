import {
  createWorker,
  KNOUX_WORKER_CLIENT_VERSION,
  runWorkerTask as runWorkerTaskCore,
} from '../workers/workerClient';
import { WorkerChannel, WorkerTaskKind } from '../workers/workerTypes';

export const KNOUX_TASK_CLIENT_VERSION = KNOUX_WORKER_CLIENT_VERSION;

export interface RunWorkerTaskOptions<TPayload = unknown> {
  kind: WorkerTaskKind;
  payload: TPayload;
  createWorker?: () => Worker;
  channel?: WorkerChannel;
  timeoutMs?: number;
  signal?: AbortSignal;
}

const inferChannel = (kind: WorkerTaskKind): WorkerChannel => {
  if (kind.startsWith('json') || kind === 'code-format') return 'json';
  if (kind === 'regex-test') return 'regex';
  if (kind.startsWith('markdown')) return 'markdown';
  if (kind.startsWith('hash') || kind.startsWith('base64') || kind === 'jwt-inspect') return 'hash';
  if (kind === 'redact' || kind === 'secret-scan') return 'security';
  return 'clipboard';
};

export async function runWorkerTask<TResult = unknown, TPayload = unknown>({
  kind,
  payload,
  createWorker: _createWorker,
  channel,
  timeoutMs,
  signal,
}: RunWorkerTaskOptions<TPayload>): Promise<TResult> {
  const resolvedChannel = channel || inferChannel(kind);

  if (_createWorker) {
    const result = await runWorkerTaskCore<TResult, TPayload>({
      kind,
      payload,
      channel: resolvedChannel,
      timeoutMs,
      signal,
    });
    return result.result;
  }

  const result = await runWorkerTaskCore<TResult, TPayload>({
    kind,
    payload,
    channel: resolvedChannel,
    timeoutMs,
    signal,
  });

  return result.result;
}

export { createWorker };
