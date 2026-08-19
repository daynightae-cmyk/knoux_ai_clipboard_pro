const {
  ALLOWED_AI_ACTIONS,
  MAX_AI_INPUT_LENGTH,
  normalizeAIAction,
} = require("../../app/shared/ai-contract");
const { getOpenRouterStatus, runOpenRouterAction } = require("../../app/backend/ai/openrouter-client");

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;
const buckets = new Map();

function isAllowedOrigin(origin = "") {
  if (!origin) return false;
  if (origin === "https://knoux.store" || origin === "https://www.knoux.store") return true;
  if (process.env.NODE_ENV !== "production" && /^http:\/\/localhost:\d+$/.test(origin)) return true;
  return /^https:\/\/knoux-ai-clipboard-pro[a-z0-9-]*\.vercel\.app$/i.test(origin);
}

function applyCors(req, res) {
  const origin = req.headers.origin || "";
  if (isAllowedOrigin(origin)) res.setHeader("Access-Control-Allow-Origin", origin);
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

function errorPayload(status, message, extra = {}) {
  const provider = getOpenRouterStatus();
  return {
    ok: false,
    success: false,
    status,
    error: message,
    provider: "openrouter",
    configured: provider.configured,
    model: provider.model,
    ...extra,
  };
}

function parseBody(body) {
  if (typeof body !== "string") return body || {};
  try {
    return JSON.parse(body || "{}");
  } catch {
    return null;
  }
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  applyCors(req, res);

  if (req.method === "OPTIONS") return res.status(204).end();

  const origin = req.headers.origin || "";
  const expectedSecret = process.env.KNOUX_AI_PROXY_SECRET;
  const hasValidSecret = Boolean(expectedSecret && req.headers["x-knoux-ai-secret"] === expectedSecret);
  const allowedBrowserRequest = isAllowedOrigin(origin);

  // Browser traffic is authenticated by the strict origin allowlist. The proxy secret
  // remains available only for origin-less server-to-server callers; it is never exposed
  // to the renderer and must not break a configured browser deployment.
  if (!allowedBrowserRequest && !hasValidSecret) {
    return res.status(403).json(errorPayload("origin_not_allowed", "Origin not allowed."));
  }

  const action = normalizeAIAction(req.query.action);
  const provider = getOpenRouterStatus();

  if (req.method === "GET") return res.status(provider.configured ? 200 : 503).json(provider);
  if (req.method !== "POST") return res.status(405).json(errorPayload("method_not_allowed", "Method not allowed."));
  if (!ALLOWED_AI_ACTIONS.has(action)) {
    return res.status(400).json(errorPayload("action_not_supported", `Unsupported AI action: ${action}`));
  }

  const quota = rateLimit(req, action);
  if (!quota.ok) {
    res.setHeader("Retry-After", String(quota.retryAfter));
    return res.status(429).json(errorPayload("rate_limited", "Rate limit exceeded. Try again shortly.", { retryAfter: quota.retryAfter }));
  }

  const body = parseBody(req.body);
  if (!body) return res.status(400).json(errorPayload("invalid_json", "Request body must be valid JSON."));
  const text = String(body.text || "").trim();
  if (!text) return res.status(400).json(errorPayload("empty_input", "No input text provided."));
  if (text.length > MAX_AI_INPUT_LENGTH) {
    return res.status(413).json(errorPayload("input_too_large", `Input exceeds ${MAX_AI_INPUT_LENGTH} characters.`));
  }

  try {
    const result = await runOpenRouterAction(action, text, { targetLanguage: body.targetLanguage });
    return res.status(200).json(result);
  } catch (error) {
    const status = error?.status || "network_error";
    const http = error?.http || 502;
    return res.status(http).json(errorPayload(status, error?.message || "AI API request failed safely."));
  }
};
