import { describe, expect, it } from 'vitest';
import { deriveAIStatus } from '../renderer/services/aiClient';

describe('deriveAIStatus', () => {
  it('maps provider missing and sensitive content guard states truthfully', () => {
    expect(deriveAIStatus({ ok: false, configured: false, status: 'provider_not_configured', provider: 'openrouter' }, { hasSensitiveContent: true, isRuntimeGuarded: false })).toMatchObject({
      label: 'Sensitive Content Guarded',
      tone: 'warning',
      detail: expect.stringContaining('Sensitive'),
    });

    expect(deriveAIStatus({ ok: false, configured: false, status: 'network_error', provider: 'openrouter' }, { hasSensitiveContent: false, isRuntimeGuarded: true })).toMatchObject({
      label: 'Runtime Guarded',
      tone: 'warning',
    });
  });

  it('returns an active connected state when the route is healthy', () => {
    expect(deriveAIStatus({ ok: true, configured: true, status: 'ready', provider: 'openrouter' }, { hasSensitiveContent: false, isRuntimeGuarded: false })).toMatchObject({
      label: 'OpenRouter Connected',
      tone: 'success',
    });
  });
});
