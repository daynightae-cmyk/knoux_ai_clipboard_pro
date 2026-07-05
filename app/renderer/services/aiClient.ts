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
  status?: string;
}

export interface AIStatusSummary {
  label: string;
  tone: "success" | "warning" | "danger" | "info";
  detail: string;
  routeOk: boolean;
  configured: boolean;
  status: string;
}

const normalizeAction = (action: string): KnouxAIAction => {
  if (action === "format-text") return "format";
  return action as KnouxAIAction;
};

const mapSafeStatus = (data: any, fallback: string) => String(data?.status || data?.error || fallback || "network_error");

export function deriveAIStatus(providerResult: any, context: { hasSensitiveContent?: boolean; isRuntimeGuarded?: boolean } = {}): AIStatusSummary {
  const status = String(providerResult?.status || providerResult?.error || "").toLowerCase();
  const configured = Boolean(providerResult?.configured);
  const ok = Boolean(providerResult?.ok);
  const hasSensitiveContent = Boolean(context.hasSensitiveContent);
  const isRuntimeGuarded = Boolean(context.isRuntimeGuarded);

  if (hasSensitiveContent) {
    return {
      label: "Sensitive Content Guarded",
      tone: "warning",
      detail: "Sensitive content was detected locally, so AI actions stay blocked until the content is redacted.",
      routeOk: false,
      configured,
      status: "guarded",
    };
  }

  if (isRuntimeGuarded) {
    return {
      label: "Runtime Guarded",
      tone: "warning",
      detail: "The current runtime cannot safely send AI requests to the provider.",
      routeOk: false,
      configured,
      status: "runtime_guarded",
    };
  }

  if (ok) {
    return {
      label: "OpenRouter Connected",
      tone: "success",
      detail: "The server AI route responded successfully.",
      routeOk: true,
      configured: true,
      status: "ready",
    };
  }

  if (status.includes("provider") || status === "provider_not_configured" || !configured) {
    return {
      label: "Provider Missing",
      tone: "warning",
      detail: "The OpenRouter provider is not configured for this session.",
      routeOk: false,
      configured: false,
      status: "provider_missing",
    };
  }

  if (status.includes("route") || status === "server_route_unavailable" || status === "route_unavailable") {
    return {
      label: "Server Route Unavailable",
      tone: "danger",
      detail: "The AI route is unreachable or returned a server-side error.",
      routeOk: false,
      configured,
      status: "route_unavailable",
    };
  }

  if (status.includes("network")) {
    return {
      label: "Network Error",
      tone: "danger",
      detail: "The AI route could not be reached. Check the network and try again.",
      routeOk: false,
      configured,
      status: "network_error",
    };
  }

  return {
    label: "AI Ready",
    tone: "info",
    detail: "The AI route responded with a generic ready state.",
    routeOk: false,
    configured,
    status: status || "ready",
  };
}

export async function checkProviderRoute(action = "chat") {
  const response = await fetch(`/api/ai/${normalizeAction(action)}`, { method: "GET", cache: "no-store" }).catch(() => null);
  if (!response) return { ok: false, configured: false, status: "network_error", provider: "openrouter" };
  const data = await response.json().catch(() => ({}));
  return {
    ok: Boolean(response.ok && data?.ok),
    configured: Boolean(data?.configured),
    status: mapSafeStatus(data, response.ok ? "ready" : "provider_not_configured"),
    provider: data?.provider || "openrouter",
    model: data?.model,
    error: data?.error,
  };
}

export async function runKnouxAIAction(input: RunAIActionInput): Promise<RunAIActionResult> {
  const cleanText = input.text?.trim();
  if (!cleanText) throw new Error("No clipboard text provided.");

  const endpointAction = normalizeAction(input.action);
  const response = await fetch(`/api/ai/${endpointAction}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: cleanText, action: endpointAction, targetLanguage: input.targetLanguage }),
  }).catch(() => null);

  if (!response) throw new Error("network_error");
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(mapSafeStatus(data, `AI route returned ${response.status}`));

  const result = typeof data?.result === "string" ? data.result : "";
  if (!result.trim()) throw new Error(mapSafeStatus(data, "empty_ai_result"));

  return {
    result,
    provider: data.provider || "openrouter",
    model: data.model,
    simulated: false,
    status: data.status || "ready",
  };
}
