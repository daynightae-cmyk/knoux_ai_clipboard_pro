import { HashPayload, WorkerTask, WorkerResponse } from "../workers/workerTypes";

const send = <T>(message: WorkerResponse<T>) => globalThis.postMessage(message);
const toHex = (buffer: ArrayBuffer) => Array.from(new Uint8Array(buffer)).map((byte) => byte.toString(16).padStart(2, "0")).join("");

globalThis.onmessage = async (event: MessageEvent<WorkerTask<HashPayload | string>>) => {
  const task = event.data;
  const start = performance.now();
  try {
    if (task.kind === "base64-encode") {
      const value = btoa(unescape(encodeURIComponent(String(task.payload || ""))));
      send({ taskId: task.taskId, ok: true, result: value, durationMs: Math.round(performance.now() - start) });
      return;
    }
    if (task.kind === "base64-decode") {
      const value = decodeURIComponent(escape(atob(String(task.payload || ""))));
      send({ taskId: task.taskId, ok: true, result: value, durationMs: Math.round(performance.now() - start) });
      return;
    }
    const payload = task.payload as HashPayload;
    const text = typeof task.payload === "string" ? task.payload : payload.text;
    const algorithm = typeof task.payload === "string" ? "SHA-256" : (payload.algorithm || "SHA-256");
    const digest = await crypto.subtle.digest(algorithm, new TextEncoder().encode(text || ""));
    send({ taskId: task.taskId, ok: true, result: { algorithm, hex: toHex(digest) }, durationMs: Math.round(performance.now() - start) });
  } catch (error: any) {
    send({ taskId: task.taskId, ok: false, error: error?.message || "Hash task failed", durationMs: Math.round(performance.now() - start) });
  }
};

export {};
