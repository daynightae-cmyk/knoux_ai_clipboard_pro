const ALLOWED_ACTIONS = new Set(["chat","summarize","enhance","rewrite","translate","analyze","classify","extract","reply","format","explain-code","commit-message","readme-block","api-docs","action-items","checklist"]);
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;
const MAX_INPUT_LENGTH = 10_000;
const buckets = new Map();

function normalizeAction(action) { return String(action || "chat").trim(); }
function safeModel() { return process.env.OPENROUTER_MODEL || "cohere/north-mini-code:free"; }
function isAllowedOrigin(origin = "") {
  if (!origin) return true;
  if (origin === "https://knoux.store") return true;
  if (process.env.NODE_ENV !== "production" && /^http:\/\/localhost:\d+$/.test(origin)) return true;
  if (/^https:\/\/[a-z0-9-]+(?:-[a-z0-9-]+)?\.vercel\.app$/i.test(origin)) return true;
  return false;
}
function applyCors(req, res) {
  const origin = req.headers.origin || "";
  if (isAllowedOrigin(origin) && origin) res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,x-knoux-ai-secret");
}
function clientIp(req) { return String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown").split(",")[0].trim(); }
function rateLimit(req, action) {
  const key = `${clientIp(req)}:${action}`;
  const now = Date.now();
  const current = buckets.get(key) || { count: 0, resetAt: now + WINDOW_MS };
  if (now > current.resetAt) { current.count = 0; current.resetAt = now + WINDOW_MS; }
  current.count += 1; buckets.set(key, current);
  return { ok: current.count <= MAX_REQUESTS, retryAfter: Math.ceil((current.resetAt - now) / 1000) };
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
  if (!isAllowedOrigin(req.headers.origin || "")) return res.status(403).json({ ok: false, error: "Origin not allowed." });
  const action = normalizeAction(req.query.action);
  if (req.method === "GET") return res.status(200).json({ ok: true, status: process.env.OPENROUTER_API_KEY ? "configured" : "missing_key", provider: "openrouter", model: safeModel() });
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed." });
  if (!ALLOWED_ACTIONS.has(action)) return res.status(400).json({ ok: false, error: `Unsupported AI action: ${action}` });
  const expectedSecret = process.env.KNOUX_AI_PROXY_SECRET;
  if (expectedSecret && req.headers["x-knoux-ai-secret"] !== expectedSecret) return res.status(401).json({ ok: false, error: "AI proxy secret is invalid or missing." });
  const quota = rateLimit(req, action);
  if (!quota.ok) { res.setHeader("Retry-After", String(quota.retryAfter)); return res.status(429).json({ ok: false, error: "Rate limit exceeded. Try again shortly." }); }
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return res.status(503).json({ ok: false, error: "AI provider is not configured.", status: "missing_key", provider: "openrouter", model: safeModel() });
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const text = String(body.text || "").trim();
    if (!text) return res.status(400).json({ ok: false, error: "No input text provided." });
    if (text.length > MAX_INPUT_LENGTH) return res.status(413).json({ ok: false, error: `Input exceeds ${MAX_INPUT_LENGTH} characters.` });
    const model = safeModel();
    const upstream = await fetch(`${process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1"}/chat/completions`, { method:"POST", headers:{ Authorization:`Bearer ${apiKey}`, "Content-Type":"application/json", "HTTP-Referer":"https://knoux.store", "X-Title":"Knoux AI Clipboard Pro" }, body: JSON.stringify({ model, messages:[{ role:"system", content:"You are KNOUX AI Clipboard Pro, a precise clipboard productivity assistant. Never fabricate provider success or expose secrets." },{ role:"user", content: buildPrompt(action, text, body.targetLanguage) }], temperature:0.35, max_tokens:1200 }) });
    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) return res.status(upstream.status >= 500 ? 502 : upstream.status).json({ ok:false, error:data.error?.message || "AI provider request failed.", status:"provider_error", provider:"openrouter", model });
    return res.status(200).json({ ok:true, success:true, result:data.choices?.[0]?.message?.content || "", provider:"openrouter", model, action, simulated:false, usage:data.usage || null });
  } catch { return res.status(500).json({ ok:false, error:"AI API request failed safely.", status:"network_error" }); }
};
