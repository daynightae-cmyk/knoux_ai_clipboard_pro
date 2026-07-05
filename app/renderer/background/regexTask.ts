import { RegexPayload, WorkerTask, WorkerResponse } from "../workers/workerTypes";

const send = <T>(message: WorkerResponse<T>) => globalThis.postMessage(message);

globalThis.onmessage = (event: MessageEvent<WorkerTask<RegexPayload>>) => {
  const task = event.data;
  const start = performance.now();
  try {
    const payload = task.payload || { pattern: "", sample: "" };
    const flags = payload.flags || "gmi";
    const matcher = new RegExp(payload.pattern, flags.includes("g") ? flags : `${flags}g`);
    const values: string[] = [];
    let match: RegExpExecArray | null;
    let guard = 0;
    while ((match = matcher.exec(String(payload.sample || ""))) && guard < 5000) {
      values.push(match[0]);
      guard += 1;
      if (match.index === matcher.lastIndex) matcher.lastIndex += 1;
    }
    send({ taskId: task.taskId, ok: true, result: { count: values.length, matches: values }, durationMs: Math.round(performance.now() - start) });
  } catch (error: any) {
    send({ taskId: task.taskId, ok: false, error: error?.message || "Invalid regular expression", durationMs: Math.round(performance.now() - start) });
  }
};

export {};
