/**
 * KNOUX AI Client Bridge
 * Uses the Electron IPC bridge when available, then falls back to HTTP API,
 * then to a safe local simulation so the UI remains usable during design/build checks.
 */

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
  if (response.ok === false || response.success === false) {
    throw new Error(response.error || "AI provider returned an error.");
  }
  return null;
};

const buildPrompt = (action: string, text: string, targetLanguage?: string) => {
  switch (action) {
    case "reply":
      return `Write a professional reply to this clipboard content:\n\n${text}`;
    case "extract":
      return `Extract key points, actions, dates, names, links, and structured bullets from this clipboard content:\n\n${text}`;
    case "rewrite":
      return `Rewrite this clipboard text in a professional KNOUX style without changing meaning:\n\n${text}`;
    case "format":
    case "format-text":
      return `Clean and format this clipboard content as polished Markdown:\n\n${text}`;
    case "explain-code":
      return `Explain this code clearly, identify risks, and suggest improvements:\n\n${text}`;
    case "translate":
      return `Translate this clipboard text into ${targetLanguage || "Arabic"} while preserving meaning and formatting:\n\n${text}`;
    default:
      return text;
  }
};

const runViaElectronBridge = async ({ action, text, targetLanguage }: RunAIActionInput): Promise<RunAIActionResult | null> => {
  const knoux = (window as any).knoux;
  const ai = knoux?.ai;
  if (!ai) return null;

  const normalized = normalizeAction(action);
  let response: any = null;

  if (normalized === "summarize" && ai.summarize) response = await ai.summarize(text);
  else if ((normalized === "enhance" || normalized === "rewrite" || normalized === "format") && ai.enhance) {
    response = await ai.enhance(text, { action, targetLanguage, brand: "KNOUX", provider: "openrouter" });
  } else if (normalized === "translate" && ai.translate) response = await ai.translate(text, targetLanguage || "Arabic");
  else if ((normalized === "analyze" || normalized === "extract") && ai.analyze) response = await ai.analyze(buildPrompt(action, text, targetLanguage));
  else if (normalized === "classify" && ai.classify) response = await ai.classify(text);
  else if (normalized === "predict" && ai.predict) response = await ai.predict({ text, source: "knoux-ui", provider: "openrouter" });
  else if (ai.chat) response = await ai.chat(buildPrompt(action, text, targetLanguage));

  const result = unwrap(response);
  return result ? { result, provider: response?.provider || "openrouter", model: response?.model } : null;
};

const runViaHttp = async ({ action, text, targetLanguage }: RunAIActionInput): Promise<RunAIActionResult | null> => {
  const endpointAction = normalizeAction(action);
  const endpoint = endpointAction === "format" ? "format" : endpointAction;

  const response = await fetch(`/api/ai/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, action, targetLanguage }),
  }).catch(() => null);

  if (!response) return null;
  if (!response.ok) throw new Error(`AI HTTP endpoint returned ${response.status}`);
  const data = await response.json();
  const result = unwrap(data);
  return result ? { result, provider: data.provider || "openrouter", model: data.model, simulated: data.simulated } : null;
};

const simulate = ({ action, text, targetLanguage }: RunAIActionInput): RunAIActionResult => {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const preview = text.trim().slice(0, 180) || "No input";
  const title = action.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    simulated: true,
    provider: "openrouter-simulated",
    result: `### ${title}\n\n**Provider:** OpenRouter AI bridge is ready.\n\n**Input preview:** ${preview}\n\n**Word count:** ${words}\n\n${action === "translate" ? `**Target language:** ${targetLanguage || "Arabic"}\n\n` : ""}Configure OPENROUTER_API_KEY in the backend .env file to run the live model.`,
  };
};

export async function runKnouxAIAction(input: RunAIActionInput): Promise<RunAIActionResult> {
  const cleanText = input.text?.trim();
  if (!cleanText) throw new Error("No clipboard text provided.");

  const electronResult = await runViaElectronBridge({ ...input, text: cleanText });
  if (electronResult) return electronResult;

  const httpResult = await runViaHttp({ ...input, text: cleanText });
  if (httpResult) return httpResult;

  return simulate({ ...input, text: cleanText });
}
