import { RegexPayload, WorkerResponse, WorkerTask } from './workerTypes';

const send = <T>(message: WorkerResponse<T>) => globalThis.postMessage(message);

globalThis.onmessage = (event: MessageEvent<WorkerTask<RegexPayload>>) => {
  const task = event.data;
  const start = performance.now();

  try {
    const payload = task.payload || { pattern: '', sample: '' };
    const flags = payload.flags || 'gmi';
    const matcher = new RegExp(payload.pattern, flags.includes('g') ? flags : `${flags}g`);
    const matches: Array<{ value: string; index: number }> = [];
    let current: RegExpExecArray | null;
    let guard = 0;

    while ((current = matcher.exec(String(payload.sample || ''))) && guard < 5000) {
      matches.push({ value: current[0], index: current.index });
      guard += 1;
      if (current.index === matcher.lastIndex) matcher.lastIndex += 1;
    }

    send({
      taskId: task.taskId,
      ok: true,
      result: {
        count: matches.length,
        matches: matches.map((match) => match.value),
        details: matches,
      },
      durationMs: Math.round(performance.now() - start),
    });
  } catch (error) {
    send({
      taskId: task.taskId,
      ok: false,
      error: error instanceof Error ? error.message : 'Invalid regular expression',
      durationMs: Math.round(performance.now() - start),
    });
  }
};

export {};
