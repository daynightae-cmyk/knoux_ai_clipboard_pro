const ALLOWED_ACTIONS = new Set(["chat", "summarize", "enhance", "rewrite", "translate", "analyze", "classify", "predict", "format", "format-text", "extract", "reply", "explain-code"]);

function normalizeAction(action: string) {
  if (action === "format-text") return "format";
  if (action === "explain-code") return "analyze";
  return action;
}

function buildPrompt(action: string, text: string, targetLanguage?: string) {
  switch (action) {
    case "summarize": return `Summarize this clipboard content into crisp bullets:\n\n${text}`;
    case "enhance": return `Improve readability, grammar, and professional clarity without changing meaning:\n\n${text}`;
    case "rewrite": return `Rewrite this in a premium KNOUX product style without changing meaning:\n\n${text}`;
    case "translate": return `Translate this text into ${targetLanguage || "Arabic"} and preserve formatting:\n\n${text}`;
    case "classify": return `Classify this clipboard item. Return short comma-separated tags only:\n\n${text}`;
    case "extract": return `Extract key points, action items, names, dates, links, and structured facts:\n\n${text}`;
    case "reply": return `Draft a professional reply to this clipboard content:\n\n${text}`;
    case "format": return `Clean and format this clipboard content as polished Markdown:\n\n${text}`;
    case "analyze": return `Analyze this content clearly and identify risks, context, and improvements:\n\n${text}`;
    default: return text;
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ success: false, error: "Method not allowed" });

  const action = normalizeAction(String(req.query.action || req.body?.action || "chat"));
  if (!ALLOWED_ACTIONS.has(action)) return res.status(400).json({ success: false, error: "Unsupported AI action" });

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return res.status(401).json({ success: false, code: "OPENROUTER_KEY_MISSING", error: "OPENROUTER_API_KEY is not configured in Vercel Environment Variables." });

  const text = String(req.body?.text || "").trim();
  if (!text) return res.status(400).json({ success: false, error: "No text provided" });

  const model = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
  const prompt = buildPrompt(action, text, req.body?.targetLanguage);

  const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
        { role: "system", content: "You are the KNOUX AI Clipboard Pro assistant. Be precise, useful, safe, and concise." },
        { role: "user", content: prompt }
      ],
      temperature: 0.35,
      max_tokens: 900
    })
  });

  const data = await upstream.json().catch(() => ({}));
  if (!upstream.ok) return res.status(upstream.status).json({ success: false, error: data?.error?.message || "OpenRouter request failed", data });

  const result = data?.choices?.[0]?.message?.content || "";
  return res.status(200).json({ success: true, result, provider: "openrouter", model });
}
