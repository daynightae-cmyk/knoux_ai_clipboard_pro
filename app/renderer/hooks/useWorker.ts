import { useCallback, useEffect, useRef, useState } from 'react';

import { runWorkerTask } from '../workers/workerClient';
import { WorkerChannel, WorkerTaskKind } from '../workers/workerTypes';

interface RunOptions {
  timeoutMs?: number;
}

interface UseWorkerOptions {
  channel: WorkerChannel;
  kind: WorkerTaskKind;
  timeoutMs?: number;
}

interface WorkerState<TResult> {
  result: TResult | null;
  error: string | null;
  loading: boolean;
  taskId: string | null;
  durationMs: number | null;
}

const initialState = {
  result: null,
  error: null,
  loading: false,
  taskId: null,
  durationMs: null,
};

export function useWorker<TResult = unknown, TPayload = unknown>({
  channel,
  kind,
  timeoutMs = 8000,
}: UseWorkerOptions) {
  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [state, setState] = useState<WorkerState<TResult>>(initialState);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    if (!mountedRef.current) return;
    setState((prev) => ({
      ...prev,
      loading: false,
      error: prev.loading ? 'Task cancelled.' : prev.error,
    }));
  }, []);

  const run = useCallback(
    async (payload: TPayload, options?: RunOptions) => {
      cancel();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      if (mountedRef.current) {
        setState((prev) => ({
          ...prev,
          loading: true,
          error: null,
        }));
      }

      try {
        const next = await runWorkerTask<TResult, TPayload>({
          channel,
          kind,
          payload,
          timeoutMs: options?.timeoutMs ?? timeoutMs,
          signal: controller.signal,
        });

        if (!mountedRef.current) return null;

        setState({
          result: next.result,
          error: null,
          loading: false,
          taskId: next.taskId,
          durationMs: next.durationMs,
        });

        return next.result;
      } catch (error) {
        if (!mountedRef.current) return null;
        const message = error instanceof Error ? error.message : 'Worker task failed.';
        setState((prev) => ({
          ...prev,
          loading: false,
          error: message,
        }));
        return null;
      } finally {
        abortControllerRef.current = null;
      }
    },
    [cancel, channel, kind, timeoutMs],
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
    };
  }, []);

  return {
    ...state,
    run,
    cancel,
  };
}
