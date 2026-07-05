import { runWorkerTask } from '../performance/taskClient';
import { DeveloperToolId, runDeveloperTool } from './developerTools';

export const WORKER_SUPPORTED_DEV_TOOLS: DeveloperToolId[] = [
  'json-format',
  'regex-test',
  'markdown-preview',
  'hash-generator',
  'base64-encode',
  'base64-decode',
  'code-formatter',
  'jwt-inspector',
  'secret-scanner',
  'large-text-analyzer',
  'redaction-map',
];

export function isWorkerSupportedTool(id: DeveloperToolId) {
  return WORKER_SUPPORTED_DEV_TOOLS.includes(id) && typeof Worker !== 'undefined';
}

export async function runDeveloperToolFast(id: DeveloperToolId, input: string): Promise<string> {
  if (!isWorkerSupportedTool(id)) return runDeveloperTool(id, input);

  if (id === 'json-format') {
    return runWorkerTask<string, string>({
      kind: 'json-format',
      payload: input,
      timeoutMs: 8000,
    });
  }

  if (id === 'regex-test') {
    const [pattern, ...rest] = input.split(/\r?\n/);
    const output = await runWorkerTask<
      { count: number; matches: string[]; details: Array<{ value: string; index: number }> },
      { pattern: string; sample: string }
    >({
      kind: 'regex-test',
      payload: { pattern, sample: rest.join('\n') },
      timeoutMs: 8000,
    });
    return output.count ? `Matches (${output.count}):\n${output.matches.join('\n')}` : 'No matches.';
  }

  if (id === 'markdown-preview') {
    const output = await runWorkerTask<
      { html: string; wordCount: number; characters: number; lineCount: number },
      string
    >({
      kind: 'markdown-preview',
      payload: input,
      timeoutMs: 8000,
    });
    return `Markdown Preview\nCharacters: ${output.characters}\nWords: ${output.wordCount}\nLines: ${output.lineCount}\n\n${output.html}`;
  }

  if (id === 'hash-generator') {
    const output = await runWorkerTask<{ algorithm: string; hash: string }, { text: string }>({
      kind: 'hash-generate',
      payload: { text: input },
      timeoutMs: 8000,
    });
    return `${output.algorithm}\n${output.hash}`;
  }

  if (id === 'base64-encode') {
    return runWorkerTask<string, { text: string }>({
      kind: 'base64-encode',
      payload: { text: input },
      timeoutMs: 8000,
    });
  }

  if (id === 'base64-decode') {
    return runWorkerTask<string, { text: string }>({
      kind: 'base64-decode',
      payload: { text: input },
      timeoutMs: 8000,
    });
  }

  if (id === 'code-formatter') {
    const output = await runWorkerTask<
      { formatted: string; tsInterface: string; zodSchema: string },
      { text: string; indent: number }
    >({
      kind: 'code-format',
      payload: { text: input, indent: 2 },
      timeoutMs: 8000,
    });
    return [
      'Formatted JSON',
      output.formatted,
      '',
      'TypeScript',
      output.tsInterface,
      '',
      'Zod',
      output.zodSchema,
    ].join('\n');
  }

  if (id === 'jwt-inspector') {
    const output = await runWorkerTask<
      { header: unknown; payload: unknown; signaturePresent: boolean },
      string
    >({
      kind: 'jwt-inspect',
      payload: input,
      timeoutMs: 8000,
    });
    return JSON.stringify(output, null, 2);
  }

  if (id === 'secret-scanner') {
    const output = await runWorkerTask<
      { findings: Array<{ type: string; preview: string }>; riskScore: number; blocked: boolean },
      string
    >({
      kind: 'secret-scan',
      payload: input,
      timeoutMs: 8000,
    });
    return output.findings.length
      ? `Risk Score: ${output.riskScore}\n${output.findings
          .map((finding) => `- ${finding.type}: ${finding.preview}`)
          .join('\n')}`
      : 'No high-confidence secrets detected.';
  }

  if (id === 'large-text-analyzer') {
    const output = await runWorkerTask<
      {
        characters: number;
        words: number;
        lines: number;
        paragraphs: number;
        estimatedReadMinutes: number;
        hasStructuredData: boolean;
      },
      string
    >({
      kind: 'large-text-analyze',
      payload: input,
      timeoutMs: 8000,
    });
    return [
      'Large Text Analysis',
      `Characters: ${output.characters}`,
      `Words: ${output.words}`,
      `Lines: ${output.lines}`,
      `Paragraphs: ${output.paragraphs}`,
      `Estimated read time: ${output.estimatedReadMinutes} min`,
      `Structured content: ${output.hasStructuredData ? 'yes' : 'no'}`,
    ].join('\n');
  }

  if (id === 'redaction-map') {
    const output = await runWorkerTask<{ redacted: string }, string>({
      kind: 'redact',
      payload: input,
      timeoutMs: 8000,
    });
    return output.redacted;
  }

  return runDeveloperTool(id, input);
}
