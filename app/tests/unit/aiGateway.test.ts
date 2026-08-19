import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ALLOWED_AI_ACTIONS,
  MAX_AI_INPUT_LENGTH,
  detectSensitiveAIInput,
  isAllowedAIAction,
} from "../../shared/ai-contract.js";
import { getOpenRouterStatus, runOpenRouterAction } from "../../backend/ai/openrouter-client.js";

const originalApiKey = process.env.OPENROUTER_API_KEY;
const originalBaseUrl = process.env.OPENROUTER_BASE_URL;

function configureProvider() {
  process.env.OPENROUTER_API_KEY = "test-openrouter-key";
  process.env.OPENROUTER_BASE_URL = "https://provider.test/v1";
}

afterEach(() => {
  if (originalApiKey === undefined) delete process.env.OPENROUTER_API_KEY;
  else process.env.OPENROUTER_API_KEY = originalApiKey;
  if (originalBaseUrl === undefined) delete process.env.OPENROUTER_BASE_URL;
  else process.env.OPENROUTER_BASE_URL = originalBaseUrl;
  vi.unstubAllGlobals();
});

describe("AI gateway contract", () => {
  it("allows every production AI action through the common contract", () => {
    expect(ALLOWED_AI_ACTIONS.size).toBe(16);
    for (const action of ALLOWED_AI_ACTIONS) {
      expect(isAllowedAIAction(action)).toBe(true);
    }
    expect(isAllowedAIAction("format-text")).toBe(true);
    expect(isAllowedAIAction("unknown-action")).toBe(false);
  });

  it("blocks sensitive data before provider transport", () => {
    expect(detectSensitiveAIInput("OPENROUTER_API_KEY=sk-or-v1-abcdefghijklmnopqrstuvwxyz")).toContain("openrouter-key");
    expect(detectSensitiveAIInput("Bearer abcdefghijklmnopqrstuvwxyz123456")).toContain("bearer-token");
    expect(detectSensitiveAIInput("eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyIn0.signature-token")).toContain("jwt");
    expect(detectSensitiveAIInput("ssh-ed25519 AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA user@host")).toContain("ssh-key");
  });

  it("reports provider_missing when no key is configured", async () => {
    delete process.env.OPENROUTER_API_KEY;
    expect(getOpenRouterStatus()).toMatchObject({ ok: false, configured: false, status: "provider_missing" });
    await expect(runOpenRouterAction("chat", "hello")).rejects.toMatchObject({ status: "provider_missing", http: 503 });
  });

  it("returns ready output for every action using the same provider adapter", async () => {
    configureProvider();
    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ choices: [{ message: { content: "provider result" } }], usage: { total_tokens: 3 } }),
    }));
    vi.stubGlobal("fetch", fetchMock);

    for (const action of ALLOWED_AI_ACTIONS) {
      const result = await runOpenRouterAction(action, "safe test input");
      expect(result).toMatchObject({ ok: true, status: "ready", result: "provider result", simulated: false, action });
    }
    expect(fetchMock).toHaveBeenCalledTimes(ALLOWED_AI_ACTIONS.size);
  });

  it("maps invalid key, rate limit, provider outage, network failure, empty result, and oversized input", async () => {
    configureProvider();
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 401, json: async () => ({ error: { message: "invalid key" } }) })));
    await expect(runOpenRouterAction("chat", "safe")).rejects.toMatchObject({ status: "invalid_api_key", http: 401 });

    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 429, json: async () => ({ error: { message: "rate limit" } }) })));
    await expect(runOpenRouterAction("chat", "safe")).rejects.toMatchObject({ status: "rate_limited", http: 429 });

    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 503, json: async () => ({ error: { message: "unavailable" } }) })));
    await expect(runOpenRouterAction("chat", "safe")).rejects.toMatchObject({ status: "provider_unavailable", http: 502 });

    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("offline"); }));
    await expect(runOpenRouterAction("chat", "safe")).rejects.toMatchObject({ status: "network_error", http: 502 });

    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ choices: [] }) })));
    await expect(runOpenRouterAction("chat", "safe")).rejects.toMatchObject({ status: "empty_result", http: 502 });

    await expect(runOpenRouterAction("chat", "a".repeat(MAX_AI_INPUT_LENGTH + 1))).rejects.toMatchObject({ status: "input_too_large", http: 413 });
  });
});
