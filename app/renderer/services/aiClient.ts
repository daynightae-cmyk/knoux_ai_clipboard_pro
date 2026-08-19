import { detectSensitiveTypes } from "./runtimeServices";

export type KnouxAIAction =
  | "chat"
  | "summarize"
  | "enhance"
  | "rewrite"
  | "translate"
  | "analyze"
  | "classify"
  | "format"
  | "format-text"
  | "extract"
  | "reply"
  | "explain-code"
  | "commit-message"
  | "readme-block"
  | "api-docs"
  | "action-items"
  | "checklist";

export type AIStatus =
  | "ready"
  | "fallback"
  | "provider_missing"
  | "invalid_api_key"
  | "rate_limited"
  | "provider_unavailable"
  | "network_error"
  | "runtime_guarded"
  | "blocked_sensitive_content"
  | "empty_result"
  | "route_unavailable"
  | "action_not_supported"
  | "input_too_large"
  | "empty_input";

export interface RunAIActionInput {
  action: string;
  text: string;
  targetLanguage?: string;
}

export interface RunAIActionResult {
  result: string;
  provider?: string;
  model?: string;
  simulated?: boolean;
  status?: AIStatus | string;
  providerStatus?: string;
}

export interface AIStatusSummary {
  label: string;
  tone: "success" | "warning" | "danger" | "info";
  detail: string;
  routeOk: boolean;
  configured: boolean;
  status: string;
}

type ElectronAI = {
  run: (input: RunAIActionInput) => Promise<Record<string, unknown>>;
  status: () => Promise<Record<string, unknown>>;
};

const normalizeAction = (action: string): KnouxAIAction => {
  if (action === "format-text") return "format";
  return action as KnouxAIAction;
};

const mapSafeStatus = (data: unknown, fallback: string) => {
  const safe = data as { status?: unknown; error?: unknown } | undefined;
  return String(safe?.status || safe?.error || fallback || "network_error");
};

function getElectronAI(): ElectronAI | null {
  if (typeof window === "undefined") return null;
  const candidate = (window as typeof window & { knoux?: { ai?: ElectronAI } }).knoux?.ai;
  return candidate && typeof candidate.run === "function" && typeof candidate.status === "function" ? candidate : null;
}

export function isElectronAITransport(): boolean {
  return Boolean(getElectronAI());
}

export function deriveAIStatus(
  providerResult: unknown,
  context: { hasSensitiveContent?: boolean; isRuntimeGuarded?: boolean } = {}
): AIStatusSummary {
  const data = (providerResult || {}) as { status?: unknown; error?: unknown; configured?: unknown; ok?: unknown; simulated?: unknown; providerStatus?: unknown };
  const status = String(data.status || data.error || "").toLowerCase();
  const configured = Boolean(data.configured);
  const ok = Boolean(data.ok);
  const hasSensitiveContent = Boolean(context.hasSensitiveContent);
  const isRuntimeGuarded = Boolean(context.isRuntimeGuarded);

  if (hasSensitiveContent || status === "blocked_sensitive_content") {
    return { label: "Sensitive Content Guarded", tone: "warning", detail: "Sensitive content was detected locally, so AI actions stay blocked until the content is redacted.", routeOk: false, configured, status: "blocked_sensitive_content" };
  }
  if (isRuntimeGuarded || status === "runtime_guarded") {
    return { label: "Runtime Guarded", tone: "warning", detail: "The current runtime cannot safely send AI requests to the provider.", routeOk: false, configured, status: "runtime_guarded" };
  }
  if (data.simulated || status === "fallback") {
    return { label: "Offline Fallback", tone: "warning", detail: "A deterministic local fallback produced this output; OpenRouter is not confirmed ready.", routeOk: false, configured, status: "fallback" };
  }
  if (ok && configured && status === "ready") {
    return { label: "OpenRouter Connected", tone: "success", detail: "The configured AI transport completed a live provider check.", routeOk: true, configured: true, status: "ready" };
  }
  if (status === "invalid_api_key") return { label: "Invalid API Key", tone: "danger", detail: "OpenRouter rejected the configured credential.", routeOk: false, configured, status };
  if (status === "rate_limited") return { label: "Rate Limited", tone: "warning", detail: "The provider rate limit was reached. Try again after the retry window.", routeOk: false, configured, status };
  if (status === "provider_unavailable") return { label: "Provider Unavailable", tone: "danger", detail: "OpenRouter is temporarily unavailable.", routeOk: false, configured, status };
  if (status === "network_error") return { label: "Network Error", tone: "danger", detail: "The AI transport could not be reached. Check the network and try again.", routeOk: false, configured, status };
  if (status === "route_unavailable" || status === "server_route_unavailable") return { label: "Server Route Unavailable", tone: "danger", detail: "The web AI route is unreachable or returned a server-side error.", routeOk: false, configured, status: "route_unavailable" };
  return { label: "Provider Missing", tone: "warning", detail: "OpenRouter is not configured for this runtime.", routeOk: false, configured: false, status: "provider_missing" };
}

export async function checkProviderRoute(action = "chat") {
  const electronAI = getElectronAI();
  if (electronAI) {
    const data = await electronAI.status().catch(() => null);
    if (!data) return { ok: false, configured: false, status: "network_error", provider: "openrouter" };
    return {
      ok: Boolean(data.ok),
      configured: Boolean(data.configured),
      status: mapSafeStatus(data, "provider_missing"),
      provider: String(data.provider || "openrouter"),
      model: typeof data.model === "string" ? data.model : undefined,
      error: typeof data.error === "string" ? data.error : undefined,
      transport: "electron-ipc",
      action: normalizeAction(action),
    };
  }

  const response = await fetch(`/api/ai/${normalizeAction(action)}`, { method: "GET", cache: "no-store" }).catch(() => null);
  if (!response) return { ok: false, configured: false, status: "network_error", provider: "openrouter", transport: "web" };
  const data = await response.json().catch(() => ({}));
  return {
    ok: Boolean(response.ok && data?.ok),
    configured: Boolean(data?.configured),
    status: mapSafeStatus(data, response.ok ? "ready" : "provider_missing"),
    provider: data?.provider || "openrouter",
    model: data?.model,
    error: data?.error,
    transport: "web",
  };
}

function ensureSafeAIInput(text: string) {
  const types = detectSensitiveTypes(text);
  if (types.length > 0) throw new Error("blocked_sensitive_content");
}

export async function runKnouxAIAction(input: RunAIActionInput): Promise<RunAIActionResult> {
  const cleanText = input.text?.trim();
  if (!cleanText) throw new Error("empty_input");
  ensureSafeAIInput(cleanText);

  const endpointAction = normalizeAction(input.action);
  const electronAI = getElectronAI();
  if (electronAI) {
    const data = await electronAI.run({ action: endpointAction, text: cleanText, targetLanguage: input.targetLanguage });
    if (!data?.ok) throw new Error(mapSafeStatus(data, "provider_unavailable"));
    const result = typeof data.result === "string" ? data.result : typeof data.data === "string" ? data.data : "";
    if (!result.trim()) throw new Error(mapSafeStatus(data, "empty_result"));
    return {
      result,
      provider: typeof data.provider === "string" ? data.provider : "openrouter",
      model: typeof data.model === "string" ? data.model : undefined,
      simulated: Boolean(data.simulated),
      status: mapSafeStatus(data, data.simulated ? "fallback" : "ready"),
      providerStatus: typeof data.providerStatus === "string" ? data.providerStatus : undefined,
    };
  }

  const response = await fetch(`/api/ai/${endpointAction}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: cleanText, action: endpointAction, targetLanguage: input.targetLanguage }),
  }).catch(() => null);

  if (!response) throw new Error("network_error");
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(mapSafeStatus(data, `AI route returned ${response.status}`));
  const result = typeof data?.result === "string" ? data.result : "";
  if (!result.trim()) throw new Error(mapSafeStatus(data, "empty_result"));

  return {
    result,
    provider: data.provider || "openrouter",
    model: data.model,
    simulated: Boolean(data.simulated),
    status: mapSafeStatus(data, data.simulated ? "fallback" : "ready"),
    providerStatus: data.providerStatus,
  };
}
