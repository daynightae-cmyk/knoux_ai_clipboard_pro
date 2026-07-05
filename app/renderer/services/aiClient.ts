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

const normalizeAction = (action: string): KnouxAIAction => {
  if (action === "format-text") return "format";
  return action as KnouxAIAction;
};

const mapSafeStatus = (data: any, fallback: string) => String(data?.status || data?.error || fallback || "network_error");

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

export function getLocalOpenRouterSummary() {
  return { configured: false, model: "server-route-only", keyPreview: "", electronOnly: false, status: "frontend_key_storage_disabled" };
}

export function saveLocalOpenRouterConfig() {
  throw new Error("frontend_key_storage_disabled");
}

export function clearLocalOpenRouterConfig() {
  localStorage.removeItem("knoux_openrouter_local");
}

export async function testLocalOpenRouterKey() {
  throw new Error("frontend_key_storage_disabled");
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
