const ALLOWED_AI_ACTIONS = new Set([
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

const MAX_AI_INPUT_LENGTH = 10_000;

function normalizeAIAction(action) {
  const value = String(action || "chat").trim();
  return value === "format-text" ? "format" : value;
}

function isAllowedAIAction(action) {
  return ALLOWED_AI_ACTIONS.has(normalizeAIAction(action));
}

function buildAIPrompt(action, text, targetLanguage) {
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
  return prompts[normalizeAIAction(action)] || prompts.chat;
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

function detectSensitiveAIInput(value) {
  const text = String(value || "");
  const checks = [
    ["password", /\b(password|passwd|pwd)\s*[:=]\s*\S+/i],
    ["api-key", /\b(api[_-]?key|client[_-]?secret|secret[_-]?key)\s*[:=]\s*["']?[A-Za-z0-9_\-]{16,}/i],
    ["openrouter-key", /\bsk-or-v1-[A-Za-z0-9_\-]{16,}\b/i],
    ["bearer-token", /\bbearer\s+[A-Za-z0-9._\-]{20,}/i],
    ["access-token", /\baccess[_-]?token\s*[:=]\s*["']?[A-Za-z0-9._\-]{20,}/i],
    ["refresh-token", /\brefresh[_-]?token\s*[:=]\s*["']?[A-Za-z0-9._\-]{20,}/i],
    ["jwt", /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/],
    ["private-key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i],
    ["ssh-key", /\bssh-(?:rsa|ed25519|ecdsa)\s+[A-Za-z0-9+/]{32,}/i],
    ["secret-env-line", /^[A-Z0-9_]*_?(SECRET|TOKEN|KEY|PASSWORD)_?[A-Z0-9_]*\s*=\s*.+/im],
    ["email", /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i],
    ["phone", /\+?\d[\d\s().-]{7,}/],
    ["card-like-number", /\b(?:\d[ -]*?){13,16}\b/],
  ];
  return checks.filter(([, pattern]) => pattern.test(text)).map(([type]) => type);
}

module.exports = {
  ALLOWED_AI_ACTIONS,
  MAX_AI_INPUT_LENGTH,
  normalizeAIAction,
  isAllowedAIAction,
  buildAIPrompt,
  classifyProviderError,
  detectSensitiveAIInput,
};
