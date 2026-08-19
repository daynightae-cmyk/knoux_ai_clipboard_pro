const fs = require("fs");
const path = require("path");
const {
  MAX_AI_INPUT_LENGTH,
  buildAIPrompt,
  classifyProviderError,
  isAllowedAIAction,
  normalizeAIAction,
} = require("../../shared/ai-contract");

function loadLocalEnv() {
  const candidates = [
    path.join(process.cwd(), ".env"),
    path.join(process.cwd(), ".env.local"),
  ];

  for (const file of candidates) {
    if (!fs.existsSync(file)) continue;
    const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
      const index = trimmed.indexOf("=");
      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
      if (key && process.env[key] === undefined) process.env[key] = value;
    }
  }
}

function getOpenRouterStatus() {
  loadLocalEnv();
  const configured = Boolean(process.env.OPENROUTER_API_KEY);
  return {
    ok: configured,
    configured,
    status: configured ? "ready" : "provider_missing",
    provider: "openrouter",
    model: process.env.OPENROUTER_MODEL || "cohere/north-mini-code:free",
  };
}

async function runOpenRouterAction(action, text, options = {}) {
  const normalizedAction = normalizeAIAction(action);
  if (!isAllowedAIAction(normalizedAction)) {
    const error = new Error(`Unsupported AI action: ${normalizedAction}`);
    error.status = "action_not_supported";
    error.http = 400;
    throw error;
  }

  const cleanText = String(text || "").trim();
  if (!cleanText) {
    const error = new Error("No input text provided.");
    error.status = "empty_input";
    error.http = 400;
    throw error;
  }
  if (cleanText.length > MAX_AI_INPUT_LENGTH) {
    const error = new Error(`Input exceeds ${MAX_AI_INPUT_LENGTH} characters.`);
    error.status = "input_too_large";
    error.http = 413;
    throw error;
  }

  const status = getOpenRouterStatus();
  if (!status.configured) {
    const error = new Error("OPENROUTER_API_KEY is missing. Add it to local .env or Vercel Environment Variables.");
    error.status = "provider_missing";
    error.http = 503;
    throw error;
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = status.model;
  const baseUrl = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";

  let response;
  try {
    response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "https://knoux.store",
        "X-OpenRouter-Title": process.env.OPENROUTER_APP_NAME || "Knoux AI Clipboard Pro",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "You are KNOUX AI Clipboard Pro, a precise clipboard productivity assistant. Never fabricate provider success or expose secrets.",
          },
          { role: "user", content: buildAIPrompt(normalizedAction, cleanText, options.targetLanguage) },
        ],
        temperature: 0.35,
        max_tokens: 1200,
      }),
    });
  } catch {
    const error = new Error("AI API request failed safely.");
    error.status = "network_error";
    error.http = 502;
    throw error;
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const mapped = classifyProviderError(response.status, data.error?.message || data.message || "");
    const error = new Error(mapped.message);
    error.status = mapped.status;
    error.http = mapped.http;
    throw error;
  }

  const result = String(data.choices?.[0]?.message?.content || "").trim();
  if (!result) {
    const error = new Error("AI provider returned an empty response.");
    error.status = "empty_result";
    error.http = 502;
    throw error;
  }

  return {
    ok: true,
    success: true,
    status: "ready",
    result,
    provider: "openrouter",
    model,
    action: normalizedAction,
    simulated: false,
    usage: data.usage || null,
  };
}

module.exports = {
  getOpenRouterStatus,
  loadLocalEnv,
  runOpenRouterAction,
};
