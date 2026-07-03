const fs = require("fs");
const path = require("path");

function loadLocalEnv() {
  const candidates = [
    path.join(process.cwd(), ".env"),
    path.join(process.cwd(), ".env.local")
  ];

  for (const file of candidates) {
    if (!fs.existsSync(file)) continue;
    const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
      const idx = trimmed.indexOf("=");
      const key = trimmed.slice(0, idx).trim();
      const value = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
      if (key && process.env[key] === undefined) process.env[key] = value;
    }
  }
}

function normalizeAction(action) {
  if (action === "format-text") return "format";
  if (action === "explain-code") return "analyze";
  return action || "chat";
}

function buildPrompt(action, text, targetLanguage) {
  const clean = String(text || "").trim();

  switch (normalizeAction(action)) {
    case "summarize":
      return `Summarize this clipboard content into concise professional bullets:\n\n${clean}`;
    case "enhance":
      return `Improve clarity, grammar, structure, and professional tone without changing meaning:\n\n${clean}`;
    case "rewrite":
      return `Rewrite this in a premium corporate KNOUX style without changing meaning:\n\n${clean}`;
    case "translate":
      return `Translate this text into ${targetLanguage || "Arabic"} while preserving formatting and meaning:\n\n${clean}`;
    case "analyze":
      return `Analyze this content deeply. Extract intent, entities, risks, action items, structure, and recommendations:\n\n${clean}`;
    case "classify":
      return `Classify this clipboard content. Return 3-6 short tags starting with # and a one-line reason:\n\n${clean}`;
    case "predict":
      return `Predict the most useful next actions for this clipboard content:\n\n${clean}`;
    case "format":
      return `Format this clipboard content into polished Markdown with clean structure:\n\n${clean}`;
    case "extract":
      return `Extract key points, dates, names, links, tasks, IDs, and structured data from this content:\n\n${clean}`;
    case "reply":
      return `Write a professional reply based on this clipboard content:\n\n${clean}`;
    default:
      return clean;
  }
}

async function runOpenRouterAction(action, text, options = {}) {
  loadLocalEnv();

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is missing. Add it to local .env or Vercel Environment Variables.");
  }

  const model = process.env.OPENROUTER_MODEL || "cohere/north-mini-code:free";
  const baseUrl = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
  const prompt = buildPrompt(action, text, options.targetLanguage);

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "https://knoux.store",
      "X-Title": process.env.OPENROUTER_APP_NAME || "Knoux AI Clipboard Pro"
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: "You are KNOUX AI Clipboard Pro, a precise clipboard productivity assistant. Return useful, structured, production-ready output."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.35,
      max_tokens: 1200
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error?.message || data.message || "OpenRouter request failed.");
  }

  return {
    ok: true,
    success: true,
    result: data.choices?.[0]?.message?.content || "",
    provider: "openrouter",
    model,
    action: normalizeAction(action),
    simulated: false,
    usage: data.usage || null
  };
}

module.exports = {
  runOpenRouterAction,
  normalizeAction
};