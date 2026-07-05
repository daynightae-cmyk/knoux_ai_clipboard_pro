import { Base64Payload, HashPayload, WorkerResponse, WorkerTask } from './workerTypes';

const send = <T>(message: WorkerResponse<T>) => globalThis.postMessage(message);

const toBase64 = (value: string) => {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
};

const fromBase64 = (value: string) => {
  const binary = atob(value);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

const toHex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

const decodeJwtPart = (part: string) => {
  const normalized = part.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return JSON.parse(fromBase64(padded));
};

globalThis.onmessage = async (
  event: MessageEvent<WorkerTask<HashPayload | Base64Payload | string>>,
) => {
  const task = event.data;
  const start = performance.now();

  try {
    if (task.kind === 'base64-encode') {
      const payload = typeof task.payload === 'string' ? { text: task.payload } : task.payload;
      send({
        taskId: task.taskId,
        ok: true,
        result: toBase64(String(payload?.text || '')),
        durationMs: Math.round(performance.now() - start),
      });
      return;
    }

    if (task.kind === 'base64-decode') {
      const payload = typeof task.payload === 'string' ? { text: task.payload } : task.payload;
      send({
        taskId: task.taskId,
        ok: true,
        result: fromBase64(String(payload?.text || '')),
        durationMs: Math.round(performance.now() - start),
      });
      return;
    }

    if (task.kind === 'jwt-inspect') {
      const token = String(typeof task.payload === 'string' ? task.payload : task.payload?.text || '');
      const parts = token.split('.');
      if (parts.length < 2) {
        throw new Error('Invalid JWT shape. Expected header.payload.signature.');
      }

      send({
        taskId: task.taskId,
        ok: true,
        result: {
          header: decodeJwtPart(parts[0]),
          payload: decodeJwtPart(parts[1]),
          signaturePresent: Boolean(parts[2]),
        },
        durationMs: Math.round(performance.now() - start),
      });
      return;
    }

    const payload = typeof task.payload === 'string' ? { text: task.payload } : task.payload;
    const text = String(payload?.text || '');
    const algorithm = (payload as HashPayload)?.algorithm || 'SHA-256';
    const buffer = await crypto.subtle.digest(algorithm, new TextEncoder().encode(text));

    send({
      taskId: task.taskId,
      ok: true,
      result: {
        algorithm,
        hash: toHex(buffer),
      },
      durationMs: Math.round(performance.now() - start),
    });
  } catch (error) {
    send({
      taskId: task.taskId,
      ok: false,
      error: error instanceof Error ? error.message : 'Hash task failed',
      durationMs: Math.round(performance.now() - start),
    });
  }
};

export {};
