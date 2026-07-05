import { JsonPayload, WorkerResponse, WorkerTask } from './workerTypes';

const send = <T>(message: WorkerResponse<T>) => globalThis.postMessage(message);

const toCamelCase = (value: string) =>
  value
    .replace(/^[^a-zA-Z]+/, '')
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, char: string) => char.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, '') || 'field';

const inferTsType = (value: unknown, level = 0): string => {
  if (Array.isArray(value)) {
    if (!value.length) return 'unknown[]';
    return `${inferTsType(value[0], level + 1)}[]`;
  }

  if (value === null) return 'null';
  if (value instanceof Date) return 'string';

  switch (typeof value) {
    case 'string':
      return 'string';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'object':
      if (level > 2) return 'Record<string, unknown>';
      return `{ ${Object.entries(value as Record<string, unknown>)
        .map(([key, child]) => `${toCamelCase(key)}: ${inferTsType(child, level + 1)}`)
        .join('; ')} }`;
    default:
      return 'unknown';
  }
};

const inferZodType = (value: unknown, level = 0): string => {
  if (Array.isArray(value)) {
    if (!value.length) return 'z.array(z.unknown())';
    return `z.array(${inferZodType(value[0], level + 1)})`;
  }

  if (value === null) return 'z.null()';

  switch (typeof value) {
    case 'string':
      return 'z.string()';
    case 'number':
      return 'z.number()';
    case 'boolean':
      return 'z.boolean()';
    case 'object':
      if (level > 2) return 'z.record(z.string(), z.unknown())';
      return `z.object({ ${Object.entries(value as Record<string, unknown>)
        .map(([key, child]) => `${toCamelCase(key)}: ${inferZodType(child, level + 1)}`)
        .join(', ')} })`;
    default:
      return 'z.unknown()';
  }
};

globalThis.onmessage = (event: MessageEvent<WorkerTask<JsonPayload | string>>) => {
  const task = event.data;
  const start = performance.now();

  try {
    const payload =
      typeof task.payload === 'string'
        ? { text: task.payload, indent: 2 }
        : task.payload || { text: '', indent: 2 };
    const source = String(payload.text || '');
    const parsed = JSON.parse(source);

    if (task.kind === 'json-minify') {
      send({
        taskId: task.taskId,
        ok: true,
        result: JSON.stringify(parsed),
        durationMs: Math.round(performance.now() - start),
      });
      return;
    }

    if (task.kind === 'json-format') {
      send({
        taskId: task.taskId,
        ok: true,
        result: JSON.stringify(parsed, null, payload.indent ?? 2),
        durationMs: Math.round(performance.now() - start),
      });
      return;
    }

    if (task.kind === 'code-format') {
      const formatted = JSON.stringify(parsed, null, payload.indent ?? 2);
      const tsInterface = `export interface KnouxJsonShape ${inferTsType(parsed)}`;
      const zodSchema = `import { z } from "zod";\n\nexport const knouxJsonSchema = ${inferZodType(parsed)};`;
      send({
        taskId: task.taskId,
        ok: true,
        result: { formatted, tsInterface, zodSchema },
        durationMs: Math.round(performance.now() - start),
      });
      return;
    }

    throw new Error(`Unsupported JSON task: ${task.kind}`);
  } catch (error) {
    send({
      taskId: task.taskId,
      ok: false,
      error: error instanceof Error ? error.message : 'Invalid JSON payload',
      durationMs: Math.round(performance.now() - start),
    });
  }
};

export {};
