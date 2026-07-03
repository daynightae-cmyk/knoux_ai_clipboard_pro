const ALLOWED_ACTIONS = new Set([
  "chat",
  "summarize",
  "enhance",
  "rewrite",
  "translate",
  "analyze",
  "classify",
  "predict",
  "format",
  "extract",
  "reply",
  "explain-code"
]);

function normalizeAction(action) {
  if (action === "format-text") return "format";
  if (action === "explain-code") return "analyze";
  return action || "chat";
}

function buildPrompt(action, text, targetLanguage) {
  const clean = String(text || "").trim();

  switch (action) {
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

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      provider: "openrouter",
      model: process.env.OPENROUTER_MODEL || "cohere/north-mini-code:free",
      status: process.env.OPENROUTER_API_KEY ? "configured" : "missing_api_key"
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const action = normalizeAction(req.query.action);
    if (!ALLOWED_ACTIONS.has(action)) {
      return res.status(400).json({ ok: false, error: `Unsupported AI action: ${action}` });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        ok: false,
        error: "OPENROUTER_API_KEY is not configured in Vercel Environment Variables."
      });
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const text = String(body.text || "").trim();
    const targetLanguage = body.targetLanguage;

    if (!text) {
      return res.status(400).json({ ok: false, error: "No input text provided." });
    }

    const model = process.env.OPENROUTER_MODEL || "cohere/north-mini-code:free";
    const baseUrl = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
    const prompt = buildPrompt(action, text, targetLanguage);

    const upstream = await fetch(`${baseUrl}/chat/completions`, {
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

    const data = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        ok: false,
        error: data.error?.message || data.message || "OpenRouter request failed.",
        provider: "openrouter",
        model
      });
    }

    const result = data.choices?.[0]?.message?.content || "";

    return res.status(200).json({
      ok: true,
      success: true,
      result,
      provider: "openrouter",
      model,
      action,
      simulated: false,
      usage: data.usage || null
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message || "AI API failed."
    });
  }
};