const ALLOWED_ACTIONS = new Set([
  "chat",
  "summarize",
  "enhance",
  "rewrite",
  "translate",
  "analyze",
  "classify",
  "extract",
  "reply",
  "format",
  "explain-code",
  "commit-message",
  "readme-block",
  "api-docs",
  "action-items",
  "checklist",
]);

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;
const MAX_INPUT_LENGTH = 10_000;
const buckets = new Map();

function normalizeAction(action) {
  const value = String(action || "chat").trim();
  return value === "format-text" ? "format" : value;
}

function safeModel() {
  return process.env.OPENROUTER_MODEL || "cohere/north-mini-code:free";
}

function safeReferer() {
  return process.env.OPENROUTER_SITE_URL || "https://knoux.store";
}

function safeAppName() {
  return process.env.OPENROUTER_APP_NAME || "Knoux AI Clipboard Pro";
}

function isAllowedOrigin(origin = "") {
  if (!origin) return false;
  if (origin === "https://knoux.store") return true;
  if (origin === "https://www.knoux.store") return true;
  if (process.env.NODE_ENV !== "production" && /^http:\/\/localhost:\d+$/.test(origin)) return true;
  if (/^https:\/\/knoux-ai-clipboard-pro[a-z0-9-]*\.vercel\.app$/i.test(origin)) return true;
  return false;
}

function applyCors(req, res) {
  const origin = req.headers.origin || "";
  if (isAllowedOrigin(origin) && origin) res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,x-knoux-ai-secret");
}

function clientIp(req) {
  return String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown")
    .split(",")[0]
    .trim();
}

function rateLimit(req, action) {
  const key = `${clientIp(req)}:${action}`;
  const now = Date.now();
  const current = buckets.get(key) || { count: 0, resetAt: now + WINDOW_MS };
  if (now > current.resetAt) {
    current.count = 0;
    current.resetAt = now + WINDOW_MS;
  }
  current.count += 1;
  buckets.set(key, current);
  return { ok: current.count <= MAX_REQUESTS, retryAfter: Math.ceil((current.resetAt - now) / 1000) };
}

function statusPayload(configured) {
  return {
    ok: configured,
    status: configured ? "ready" : "provider_not_configured",
    provider: "openrouter",
    configured,
    model: safeModel(),
  };
}

function errorPayload(status, message, extra = {}) {
  return {
    ok: false,
    status,
    error: message,
    provider: "openrouter",
    model: safeModel(),
    ...extra,
  };
}

function classifyProviderError(statusCode, providerMessage = "") {
  const message = String(providerMessage || "").toLowerCase();
  if (statusCode === 401 || statusCode === 403 || /invalid.*key|unauthorized|forbidden/.test(message)) {
    return { status: "invalid_api_key", http: 401, message: "OpenRouter API key is invalid or unauthorized." };
  }
  if (statusCode === 429 || /rate limit|quota/.test(message)) {
    return { status: "rate_limited", http: 429, message: "OpenRouter rate limit reached. Try again shortly." };
  }
  if (statusCode >= 500) {
    return { status: "provider_unavailable", http: 502, message: "OpenRouter is temporarily unavailable." };
  }
  return { status: "provider_unavailable", http: statusCode || 502, message: "OpenRouter request failed safely." };
}

function buildPrompt(action, text, targetLanguage) {
  const clean = String(text || "").trim();
  const prompts = {
    chat: `Respond as KNOUX AI Clipboard Pro with concise, useful guidance:\n\n${clean}`,
    summarize: `Summarize this clipboard content into concise professional bullets:\n\n${clean}`,
    enhance: `Improve clarity, grammar, structure, and professional tone without changing meaning:\n\n${clean}`,
    rewrite: `Rewrite this in a premium corporate KNOUX style without changing meaning:\n\n${clean}`,
    translate: `Translate this text into ${targetLanguage || "Arabic"} while preserving formatting and meaning:\n\n${clean}`,
    analyze: `Analyze this content. Extract intent, entities, risks, action items, structure, and recommendations:\n\n${clean}`,
    classify: `Classify this clipboard content. Return 3-6 short tags and a one-line reason:\n\n${clean}`,
    extract: `Extract key points, dates, names, links, tasks, IDs, and structured data from this content:\n\n${clean}`,
    reply: `Write a professional reply based on this clipboard content:\n\n${clean}`,
    format: `Format this clipboard content into polished Markdown with clean structure:\n\n${clean}`,
    "explain-code": `Explain this code or technical snippet clearly, including purpose, risks, and improvements:\n\n${clean}`,
    "commit-message": `Create a conventional commit message with subject and body for these changes:\n\n${clean}`,
    "readme-block": `Create a production-ready README section for this feature or project note:\n\n${clean}`,
    "api-docs": `Create concise API documentation with endpoint, method, params, examples, and errors:\n\n${clean}`,
    "action-items": `Extract clear action items with owners if present, priority, and due dates if present:\n\n${clean}`,
    checklist: `Convert this content into a practical checklist grouped by phase or priority:\n\n${clean}`,
  };
  return prompts[action] || prompts.chat;
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  applyCors(req, res);

  if (req.method === "OPTIONS") return res.status(204).end();

  const origin = req.headers.origin || "";
  const expectedSecret = process.env.KNOUX_AI_PROXY_SECRET;
  const hasValidSecret = expectedSecret && req.headers["x-knoux-ai-secret"] === expectedSecret;

  // Allow requests with a valid origin OR a valid proxy secret (server-to-server)
  if (!isAllowedOrigin(origin) && !hasValidSecret) {
    return res.status(403).json(errorPayload("origin_not_allowed", "Origin not allowed."));
  }

  const action = normalizeAction(req.query.action);
  const configured = Boolean(process.env.OPENROUTER_API_KEY);

  if (req.method === "GET") return res.status(configured ? 200 : 503).json(statusPayload(configured));
  if (req.method !== "POST") return res.status(405).json(errorPayload("method_not_allowed", "Method not allowed."));
  if (!ALLOWED_ACTIONS.has(action)) return res.status(400).json(errorPayload("action_not_supported", `Unsupported AI action: ${action}`));

  if (expectedSecret && !hasValidSecret) {
    return res.status(401).json(errorPayload("proxy_secret_invalid", "AI proxy secret is invalid or missing."));
  }

  const quota = rateLimit(req, action);
  if (!quota.ok) {
    res.setHeader("Retry-After", String(quota.retryAfter));
    return res.status(429).json(errorPayload("rate_limited", "Rate limit exceeded. Try again shortly.", { retryAfter: quota.retryAfter }));
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return res.status(503).json(statusPayload(false));

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const text = String(body.text || "").trim();
    if (!text) return res.status(400).json(errorPayload("empty_input", "No input text provided."));
    if (text.length > MAX_INPUT_LENGTH) return res.status(413).json(errorPayload("input_too_large", `Input exceeds ${MAX_INPUT_LENGTH} characters.`));

    const model = safeModel();
    const upstream = await fetch(`${process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1"}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": safeReferer(),
        "X-OpenRouter-Title": safeAppName(),
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: "You are KNOUX AI Clipboard Pro, a precise clipboard productivity assistant. Never fabricate provider success or expose secrets." },
          { role: "user", content: buildPrompt(action, text, body.targetLanguage) },
        ],
        temperature: 0.35,
        max_tokens: 1200,
      }),
    });

    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      const mapped = classifyProviderError(upstream.status, data.error?.message || data.message || "");
      return res.status(mapped.http).json(errorPayload(mapped.status, mapped.message));
    }

    const result = data.choices?.[0]?.message?.content || "";
    return res.status(200).json({ ok: true, success: true, status: "ready", result, provider: "openrouter", model, action, simulated: false, usage: data.usage || null });
  } catch {
    return res.status(502).json(errorPayload("network_error", "AI API request failed safely."));
  }
};
