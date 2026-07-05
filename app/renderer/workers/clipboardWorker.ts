import {
  ClipboardBulkPayload,
  ClipboardBulkResult,
  ClipboardWorkerItem,
  LargeTextAnalysisResult,
  WorkerResponse,
  WorkerTask,
} from './workerTypes';

const send = <T>(message: WorkerResponse<T>) => globalThis.postMessage(message);

const hashContent = (content: string) => {
  let hash = 0;
  for (let i = 0; i < content.length; i += 1) {
    hash = (hash << 5) - hash + content.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
};

const detectSensitiveTypes = (value: string): string[] => {
  const text = String(value || '');
  const checks = [
    { type: 'password', matched: /\b(password|passwd|pwd)\s*[:=]\s*\S+/i.test(text) },
    {
      type: 'api-key',
      matched: /\b(api[_-]?key|client[_-]?secret|secret[_-]?key)\s*[:=]\s*["']?[A-Za-z0-9_\-]{16,}/i.test(text),
    },
    { type: 'bearer-token', matched: /\bbearer\s+[A-Za-z0-9._\-]{20,}/i.test(text) },
    { type: 'private-key', matched: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/i.test(text) },
    { type: 'email', matched: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text) },
    { type: 'phone', matched: /\+?\d[\d\s().-]{7,}/.test(text) },
    { type: 'card-like-number', matched: /\b(?:\d[ -]*?){13,16}\b/.test(text) },
  ];
  return checks.filter((check) => check.matched).map((check) => check.type);
};

const filterItems = (payload: ClipboardBulkPayload): ClipboardWorkerItem[] => {
  const query = String(payload.query || '').trim().toLowerCase();

  return payload.items.filter((item) => {
    const tags = item.tags || [];
    const folder = item.folder || 'General';
    const sensitiveTypes = detectSensitiveTypes(item.content);
    const inFolder = payload.selectedFolder === 'all' || !payload.selectedFolder || folder === payload.selectedFolder;

    if (!inFolder) return false;

    if (payload.businessMode === 'Developer' && item.type !== 'code' && !tags.includes('code')) return false;
    if (payload.businessMode === 'Office' && item.type === 'code') return false;
    if (payload.businessMode === 'Customer Support' && !tags.some((tag) => ['email', 'reply'].includes(tag))) return false;
    if (payload.businessMode === 'E-commerce' && !tags.some((tag) => ['invoice', 'tracking'].includes(tag))) return false;
    if (payload.businessMode === 'Personal' && folder !== 'Personal') return false;

    if (query) {
      const haystacks = [
        item.content.toLowerCase(),
        item.source?.toLowerCase() || '',
        folder.toLowerCase(),
        ...tags.map((tag) => tag.toLowerCase()),
      ];
      if (!haystacks.some((segment) => segment.includes(query))) return false;
    }

    switch (payload.selectedFilter) {
      case 'pinned':
        return Boolean(item.pinned);
      case 'favorite':
        return Boolean(item.favorite);
      case 'secure':
        return Boolean(item.isSecure || sensitiveTypes.length);
      case 'ai':
        return Boolean((item as { aiSummarized?: string | null }).aiSummarized);
      case 'all':
      case undefined:
        return true;
      default:
        return item.type === payload.selectedFilter;
    }
  });
};

globalThis.onmessage = (event: MessageEvent<WorkerTask<ClipboardBulkPayload | string>>) => {
  const task = event.data;
  const start = performance.now();

  try {
    if (task.kind === 'large-text-analyze') {
      const text = String(task.payload || '');
      const lines = text.split(/\r?\n/);
      const result: LargeTextAnalysisResult = {
        characters: text.length,
        words: text.split(/\s+/).filter(Boolean).length,
        lines: lines.length,
        paragraphs: text.split(/\n\s*\n/).filter(Boolean).length,
        estimatedReadMinutes: Math.max(1, Math.ceil(text.split(/\s+/).filter(Boolean).length / 220)),
        hasStructuredData: /^\s*[{[]/.test(text) || /^\s*[A-Z0-9_]+\s*=.+$/m.test(text),
      };

      send({
        taskId: task.taskId,
        ok: true,
        result,
        durationMs: Math.round(performance.now() - start),
      });
      return;
    }

    const payload: ClipboardBulkPayload =
      typeof task.payload === 'string' ? { items: [], query: task.payload } : task.payload;

    if (task.kind === 'clipboard-bulk-process' && payload.mode === 'dedupe') {
      const seen = new Set<string>();
      const items = payload.items.filter((item) => {
        if (item.pinned) return true;
        const hash = hashContent(item.content);
        if (seen.has(hash)) return false;
        seen.add(hash);
        return true;
      });

      send({
        taskId: task.taskId,
        ok: true,
        result: {
          items,
          metrics: {
            total: payload.items.length,
            matched: items.length,
            pinned: items.filter((item) => item.pinned).length,
            favorites: items.filter((item) => item.favorite).length,
            secure: items.filter((item) => item.isSecure).length,
            generatedAt: new Date().toISOString(),
          },
        } satisfies ClipboardBulkResult,
        durationMs: Math.round(performance.now() - start),
      });
      return;
    }

    const items = filterItems(payload);

    send({
      taskId: task.taskId,
      ok: true,
      result: {
        items,
        metrics: {
          total: payload.items.length,
          matched: items.length,
          pinned: items.filter((item) => item.pinned).length,
          favorites: items.filter((item) => item.favorite).length,
          secure: items.filter((item) => item.isSecure || detectSensitiveTypes(item.content).length)
            .length,
          generatedAt: new Date().toISOString(),
        },
      } satisfies ClipboardBulkResult,
      durationMs: Math.round(performance.now() - start),
    });
  } catch (error) {
    send({
      taskId: task.taskId,
      ok: false,
      error: error instanceof Error ? error.message : 'Clipboard worker task failed',
      durationMs: Math.round(performance.now() - start),
    });
  }
};

export {};
