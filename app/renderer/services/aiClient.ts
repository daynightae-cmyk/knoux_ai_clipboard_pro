export type KnouxAIAction =
  | "chat"
  | "summarize"
  | "enhance"
  | "rewrite"
  | "translate"
  | "analyze"
  | "classify"
  | "predict"
  | "format"
  | "format-text"
  | "extract"
  | "reply"
  | "explain-code";

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
}

const normalizeAction = (action: string): KnouxAIAction => {
  if (action === "format-text") return "format";
  if (action === "explain-code") return "analyze";
  return action as KnouxAIAction;
};

const unwrap = (response: any): string | null => {
  if (!response) return null;
  if (typeof response === "string") return response;
  if (typeof response.result === "string") return response.result;
  if (typeof response.data === "string") return response.data;
  if (response.data && typeof response.data.result === "string") return response.data.result;
  if (response.ok === false || response.success === false) throw new Error(response.error || "AI provider returned an error.");
  return null;
};

const buildPrompt = (action: string, text: string, targetLanguage?: string) => {
  switch (action) {
    case "reply": return `Write a professional reply to this clipboard content:\n\n${text}`;
    case "extract": return `Extract key points, actions, dates, names, links, and structured bullets from this clipboard content:\n\n${text}`;
    case "rewrite": return `Rewrite this clipboard text in a professional KNOUX style without changing meaning:\n\n${text}`;
    case "format":
    case "format-text": return `Clean and format this clipboard content as polished Markdown:\n\n${text}`;
    case "explain-code": return `Explain this code clearly, identify risks, and suggest improvements:\n\n${text}`;
    case "translate": return `Translate this clipboard text into ${targetLanguage || "Arabic"} while preserving meaning and formatting:\n\n${text}`;
    case "classify": return `Classify this clipboard content with useful tags only:\n\n${text}`;
    default: return text;
  }
};

const readLocalSettings = () => {
  try {
    return JSON.parse(localStorage.getItem("knoux_settings") || "{}");
  } catch {
    return {};
  }
};

const runViaElectronBridge = async ({ action, text, targetLanguage }: RunAIActionInput): Promise<RunAIActionResult | null> => {
  const knoux = (window as any).knoux;
  const ai = knoux?.ai;
  if (!ai) return null;
  const normalized = normalizeAction(action);
  let response: any = null;
  if (normalized === "summarize" && ai.summarize) response = await ai.summarize(text);
  else if ((normalized === "enhance" || normalized === "rewrite" || normalized === "format") && ai.enhance) response = await ai.enhance(text, { action, targetLanguage, brand: "KNOUX", provider: "openrouter" });
  else if (normalized === "translate" && ai.translate) response = await ai.translate(text, targetLanguage || "Arabic");
  else if ((normalized === "analyze" || normalized === "extract") && ai.analyze) response = await ai.analyze(buildPrompt(action, text, targetLanguage));
  else if (normalized === "classify" && ai.classify) response = await ai.classify(text);
  else if (normalized === "predict" && ai.predict) response = await ai.predict({ text, source: "knoux-ui", provider: "openrouter" });
  else if (ai.chat) response = await ai.chat(buildPrompt(action, text, targetLanguage));
  const result = unwrap(response);
  return result ? { result, provider: response?.provider || "openrouter", model: response?.model } : null;
};

const runViaHttp = async ({ action, text, targetLanguage }: RunAIActionInput): Promise<RunAIActionResult | null> => {
  const endpointAction = normalizeAction(action);
  const response = await fetch(`/api/ai/${endpointAction}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, action, targetLanguage }),
  }).catch(() => null);
  if (!response) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) return null;
    throw new Error(data?.error || `AI HTTP endpoint returned ${response.status}`);
  }
  const result = unwrap(data);
  return result ? { result, provider: data.provider || "openrouter", model: data.model, simulated: false } : null;
};

const runViaLocalOpenRouterKey = async ({ action, text, targetLanguage }: RunAIActionInput): Promise<RunAIActionResult | null> => {
  const settings = readLocalSettings();
  const apiKey = String(settings.openRouterApiKey || "").trim();
  if (!apiKey) return null;
  const model = String(settings.openRouterModel || "openai/gpt-4o-mini").trim();
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://knoux.store",
      "X-Title": "Knoux AI Clipboard Pro"
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: "You are the KNOUX AI Clipboard Pro assistant. Be precise, useful, and concise." },
        { role: "user", content: buildPrompt(action, text, targetLanguage) }
      ],
      temperature: 0.35,
      max_tokens: 900
    })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error?.message || "OpenRouter local key request failed.");
  const result = data?.choices?.[0]?.message?.content || "";
  return result ? { result, provider: "openrouter-local-key", model, simulated: false } : null;
};

export async function runKnouxAIAction(input: RunAIActionInput): Promise<RunAIActionResult> {
  const cleanText = input.text?.trim();
  if (!cleanText) throw new Error("No clipboard text provided.");
  const normalized = { ...input, text: cleanText };
  const electronResult = await runViaElectronBridge(normalized);
  if (electronResult) return electronResult;
  const httpResult = await runViaHttp(normalized);
  if (httpResult) return httpResult;
  const localKeyResult = await runViaLocalOpenRouterKey(normalized);
  if (localKeyResult) return localKeyResult;
  throw new Error("OpenRouter is not configured. Add OPENROUTER_API_KEY in Vercel or save a local OpenRouter key in Settings.");
}
