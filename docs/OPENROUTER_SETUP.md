# KNOUX AI Clipboard Pro — OpenRouter Setup

This guide configures the real OpenRouter provider for **Knoux AI Clipboard Pro** without exposing secrets to the browser, GitHub, logs, or build artifacts.

## 1. Production / Vercel setup

Use the official Vercel project that owns the production domain:

- Project: `knoux-ai-clipboard-pro`
- Domain: `knoux.store`

Add these variables in **Vercel → Project Settings → Environment Variables** and apply them to **Production**, **Preview**, and **Development**:

```env
OPENROUTER_API_KEY=REPLACE_WITH_OPENROUTER_API_KEY
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=cohere/north-mini-code:free
OPENROUTER_MODEL_FALLBACKS=openrouter/auto
OPENROUTER_SITE_URL=https://knoux.store
OPENROUTER_APP_NAME=Knoux AI Clipboard Pro
OPENROUTER_DEBUG=false
```

Optional variable:

```env
KNOUX_AI_PROXY_SECRET=
```

Leave `KNOUX_AI_PROXY_SECRET` empty unless the caller sends the matching `x-knoux-ai-secret` header.

After saving variables, redeploy the latest Production deployment.

## 2. Health check

Open:

```txt
https://knoux.store/api/ai/chat
```

Expected configured response:

```json
{
  "ok": true,
  "status": "ready",
  "provider": "openrouter",
  "configured": true,
  "model": "cohere/north-mini-code:free"
}
```

Expected missing-key response:

```json
{
  "ok": false,
  "status": "provider_not_configured",
  "provider": "openrouter",
  "configured": false,
  "model": "cohere/north-mini-code:free"
}
```

The GET health check does not call OpenRouter and never returns secrets.

## 3. Local EXE setup

The local Windows EXE can use a local OpenRouter key from:

```txt
Settings → OpenRouter AI Provider
```

Available actions:

- masked API key input
- show/hide key
- save local key
- clear local key
- test connection
- provider status
- active model
- last test result

The local key is for the device only. It is not included in KNOUX JSON backup exports.

Current local key storage is marked **Guarded** because a full encrypted safeStorage bridge is not yet implemented. Do not paste production keys into GitHub, screenshots, comments, frontend source files, or shared logs.

## 4. Server route behavior

All web AI requests must go through:

```txt
api/ai/[action].js
```

The server route calls:

```txt
POST https://openrouter.ai/api/v1/chat/completions
```

Headers used server-side:

```txt
Authorization: Bearer <OPENROUTER_API_KEY>
Content-Type: application/json
HTTP-Referer: https://knoux.store
X-OpenRouter-Title: Knoux AI Clipboard Pro
```

The key is never returned to the client.

## 5. Supported actions

- `chat`
- `summarize`
- `enhance`
- `rewrite`
- `translate`
- `analyze`
- `classify`
- `extract`
- `reply`
- `format`
- `explain-code`
- `commit-message`
- `readme-block`
- `api-docs`
- `action-items`
- `checklist`

Unsupported actions return:

```txt
action_not_supported
```

## 6. Safe error states

The API maps provider failures to safe public statuses:

- `provider_not_configured`
- `invalid_api_key`
- `rate_limited`
- `provider_unavailable`
- `network_error`
- `action_not_supported`

The API must not expose raw provider payloads, stack traces, environment values, internal file paths, or API keys.

## 7. Secret audit

Run before release:

```bash
rg "sk-or-v1|VITE_OPENROUTER|OPENROUTER_API_KEY|Authorization" app api docs .env.example -n
```

Allowed results:

- `OPENROUTER_API_KEY` in server route, docs, or `.env.example`
- `Authorization` in server-side route or guarded local provider client
- placeholder-only examples

Disallowed results:

- real OpenRouter keys
- `VITE_OPENROUTER_API_KEY`
- committed local key values
- frontend hardcoded secrets
