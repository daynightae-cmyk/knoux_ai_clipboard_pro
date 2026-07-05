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

const LOCAL_OPENROUTER_KEY = "knoux_openrouter_local";

const normalizeAction = (action: string): KnouxAIAction => {
  if (action === "format-text") return "format";
  return action as KnouxAIAction;
};

const isElectronRuntime = () => {
  if (typeof window === "undefined") return false;
  return Boolean((window as any).knoux || (window as any).electronAPI || window.location.protocol === "file:");
};

const unwrap = (response: any): string | null => {
  if (!response) return null;
  if (typeof response === "string") return response;
  if (typeof response.result === "string") return response.result;
  if (typeof response.data === "string") return response.data;
  if (response.data && typeof response.data.result === "string") return response.data.result;
  if (response.ok === false || response.success === false) throw new Error(response.status || response.error || "AI provider returned an error.");
  return null;
};

const buildPrompt = (action: string, text: string, targetLanguage?: string) => {
  switch (normalizeAction(action)) {
    case "summarize": return `Summarize this clipboard content into concise professional bullets:\n\n${text}`;
    case "reply": return `Write a professional reply to this clipboard content:\n\n${text}`;
    case "extract": return `Extract key points, actions, dates, names, links, and structured bullets from this clipboard content:\n\n${text}`;
    case "rewrite": return `Rewrite this clipboard text in a professional KNOUX style without changing meaning:\n\n${text}`;
    case "enhance": return `Improve clarity, grammar, structure, and professional tone without changing meaning:\n\n${text}`;
    case "format": return `Clean and format this clipboard content as polished Markdown:\n\n${text}`;
    case "explain-code": return `Explain this code clearly, identify risks, and suggest improvements:\n\n${text}`;
    case "translate": return `Translate this clipboard text into ${targetLanguage || "Arabic"} while preserving meaning and formatting:\n\n${text}`;
    case "classify": return `Classify this clipboard content with useful tags only:\n\n${text}`;
    case "commit-message": return `Create a conventional commit message with subject and body for these changes:\n\n${text}`;
    case "readme-block": return `Create a production-ready README section for this feature or project note:\n\n${text}`;
    case "api-docs": return `Create concise API documentation with endpoint, method, params, examples, and errors:\n\n${text}`;
    case "action-items": return `Extract clear action items with priority and due dates if present:\n\n${text}`;
    case "checklist": return `Convert this content into a practical checklist grouped by phase or priority:\n\n${text}`;
    default: return text;
  }
};

const readLocalOpenRouterConfig = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_OPENROUTER_KEY) || "{}");
  } catch {
    return {};
  }
};

const mapSafeStatus = (data: any, fallback: string) => {
  return String(data?.status || data?.error || fallback || "network_error");
};

const runViaElectronBridge = async ({ action, text, targetLanguage }: RunAIActionInput): Promise<RunAIActionResult | null> => {
  const knoux = (window as any).knoux;
  const ai = knoux?.ai;
  if (!ai) return null;
  const normalized = normalizeAction(action);
  let response: any = null;
  if (normalized === "summarize" && ai.summarize) response = await ai.summarize(text);
  else if ((normalized === "enhance" || normalized === "rewrite" || normalized === "format") && ai.enhance) response = await ai.enhance(text, { action: normalized, targetLanguage, brand: "KNOUX", provider: "openrouter" });
  else if (normalized === "translate" && ai.translate) response = await ai.translate(text, targetLanguage || "Arabic");
  else if ((normalized === "analyze" || normalized === "extract" || normalized === "explain-code") && ai.analyze) response = await ai.analyze(buildPrompt(normalized, text, targetLanguage));
  else if (normalized === "classify" && ai.classify) response = await ai.classify(text);
  else if (ai.chat) response = await ai.chat(buildPrompt(normalized, text, targetLanguage));
  const result = unwrap(response);
  return result ? { result, provider: response?.provider || "openrouter", model: response?.model, simulated: false, status: response?.status } : null;
};

const runViaHttp = async ({ action, text, targetLanguage }: RunAIActionInput): Promise<RunAIActionResult | null> => {
  const endpointAction = normalizeAction(action);
  const response = await fetch(`/api/ai/${endpointAction}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, action: endpointAction, targetLanguage }),
  }).catch(() => null);
  if (!response) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) return null;
    throw new Error(mapSafeStatus(data, `AI HTTP endpoint returned ${response.status}`));
  }
  const result = unwrap(data);
  return result ? { result, provider: data.provider || "openrouter", model: data.model, simulated: false, status: data.status } : null;
};

const runViaLocalOpenRouterKey = async ({ action, text, targetLanguage }: RunAIActionInput): Promise<RunAIActionResult | null> => {
  if (!isElectronRuntime()) return null;
  const settings = readLocalOpenRouterConfig();
  const apiKey = String(settings.apiKey || "").trim();
  if (!apiKey) return null;
  const model = String(settings.model || "cohere/north-mini-code:free").trim();
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://knoux.store",
      "X-OpenRouter-Title": "Knoux AI Clipboard Pro",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: "You are the KNOUX AI Clipboard Pro assistant. Be precise, useful, and concise. Never expose secrets." },
        { role: "user", content: buildPrompt(action, text, targetLanguage) },
      ],
      temperature: 0.35,
      max_tokens: 900,
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new Error("invalid_api_key");
    if (response.status === 429) throw new Error("rate_limited");
    throw new Error(data?.error?.message || "provider_unavailable");
  }
  const result = data?.choices?.[0]?.message?.content || "";
  return result ? { result, provider: "openrouter-local-key", model, simulated: false, status: "ready" } : null;
};

export async function testLocalOpenRouterKey(apiKey: string, model = "cohere/north-mini-code:free"): Promise<RunAIActionResult> {
  if (!apiKey.trim()) throw new Error("provider_not_configured");
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey.trim()}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://knoux.store",
      "X-OpenRouter-Title": "Knoux AI Clipboard Pro",
    },
    body: JSON.stringify({
      model: model || "cohere/north-mini-code:free",
      messages: [
        { role: "system", content: "You are KNOUX AI Clipboard Pro. Reply with a short provider readiness confirmation." },
        { role: "user", content: "Return: KNOUX OpenRouter provider ready." },
      ],
      temperature: 0.1,
      max_tokens: 40,
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new Error("invalid_api_key");
    if (response.status === 429) throw new Error("rate_limited");
    throw new Error(data?.error?.message || "provider_unavailable");
  }
  return { result: data?.choices?.[0]?.message?.content || "ready", provider: "openrouter-local-key", model, simulated: false, status: "ready" };
}

export function getLocalOpenRouterSummary() {
  const config = readLocalOpenRouterConfig();
  const key = String(config.apiKey || "").trim();
  return {
    configured: key.length > 0,
    model: String(config.model || "cohere/north-mini-code:free"),
    keyPreview: key ? `${key.slice(0, 8)}••••${key.slice(-4)}` : "",
    electronOnly: true,
  };
}

export function saveLocalOpenRouterConfig(apiKey: string, model = "cohere/north-mini-code:free") {
  const clean = apiKey.trim();
  if (!clean) throw new Error("provider_not_configured");
  localStorage.setItem(LOCAL_OPENROUTER_KEY, JSON.stringify({ apiKey: clean, model: model.trim() || "cohere/north-mini-code:free", updatedAt: new Date().toISOString(), storage: "local-guarded-electron-only" }));
}

export function clearLocalOpenRouterConfig() {
  localStorage.removeItem(LOCAL_OPENROUTER_KEY);
}

export async function runKnouxAIAction(input: RunAIActionInput): Promise<RunAIActionResult> {
  const cleanText = input.text?.trim();
  if (!cleanText) throw new Error("No clipboard text provided.");
  const normalized = { ...input, action: normalizeAction(input.action), text: cleanText };
  const electronResult = await runViaElectronBridge(normalized);
  if (electronResult) return electronResult;
  const httpResult = await runViaHttp(normalized);
  if (httpResult) return httpResult;
  const localKeyResult = await runViaLocalOpenRouterKey(normalized);
  if (localKeyResult) return localKeyResult;
  throw new Error("provider_not_configured");
}
