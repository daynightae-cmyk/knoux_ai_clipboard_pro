import { useCallback, useRef, useState } from "react";
import { runWorkerTask } from "../performance/taskClient";
import { WorkerTaskKind } from "../workers/workerTypes";

interface UseTaskRunnerOptions {
  kind: WorkerTaskKind;
  createWorker: () => Worker;
  timeoutMs?: number;
}

export function useTaskRunner<TResult = unknown, TPayload = unknown>({ kind, createWorker, timeoutMs = 12000 }: UseTaskRunnerOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TResult | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setLoading(false);
  }, []);

  const run = useCallback(async (payload: TPayload) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      const next = await runWorkerTask<TResult, TPayload>({ kind, payload, createWorker, timeoutMs, signal: controller.signal });
      setResult(next);
      return next;
    } catch (err: any) {
      if (!controller.signal.aborted) setError(err?.message || "Background task failed.");
      return null;
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [kind, createWorker, timeoutMs]);

  return { run, cancel, loading, error, result };
}
