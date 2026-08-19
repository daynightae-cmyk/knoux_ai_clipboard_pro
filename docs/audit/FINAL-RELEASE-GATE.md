# KNOUX AI Clipboard Pro — Final Release Gate

**Evidence date:** 2026-08-19  
**Branch:** `codex/production-rescue-rc`  
**Baseline:** `origin/main` at `1c50a8b235055a22cc52992d52ba5b6365429fb3`  
**Evidence status:** This record is generated from executed commands in the rescue workspace. It is not a release approval by itself.

## Implemented remediation

| ID | Result | Executable evidence |
|---|---|---|
| P0-01 | **Fixed in code** | `aiClient.ts` now selects constrained Electron IPC (`ai:run` / `ai:status`) when available and `/api/ai/[action]` only for web. `app/shared/ai-contract.js` is the common action, input-limit, prompt, error, and sensitive-input contract. |
| P0-02 | **Build root cause fixed; deployment not independently verified** | The conflicting `api/ai/[action].ts` 501 stub was removed, the remaining route calls the shared provider adapter, and `npm run build` passes. The connected Vercel team returned no KNOUX project, so a production deployment cannot be queried or made green from this session. |
| P0-03 | **Fixed and smoke-tested** | Electron moved from 25.9.8 to **43.4.1**. `npm run electron:smoke` passed after a full build. |
| P1-01 / P1-06 | **Fixed and tested** | Browser origin allowlist no longer requires exposing the proxy secret. Provider states include `ready`, `fallback`, `provider_missing`, `invalid_api_key`, `rate_limited`, `provider_unavailable`, `network_error`, `blocked_sensitive_content`, and `empty_result`. |
| P1-02 | **Fixed and tested** | `main.js` registers `canonical-ipc.js` once in `app.whenReady()`; `createWindow()` only constructs a window. `canonicalIpc.test.ts` asserts duplicate registration is refused. |
| P1-03 / P1-04 | **Fixed in code** | The production catalog automatically guards Active declarations lacking a verified runner. QA Lab dispatches every Active service and runs an IPC integrity check in Electron. |
| P1-05 | **Fixed for active IPC vault** | Vault v2 payloads use AES-256-GCM, a random 16-byte salt, 12-byte IV, scrypt, authentication tag validation, and v1 migration payloads. Legacy backend Encryptor is guarded without `KNOUX_VAULT_MASTER_SECRET` and uses persisted per-user salt plus scrypt. |
| P1 security / DLP | **Fixed and tested** | AI requests are blocked locally for password, API/OpenRouter key, bearer token, JWT, private key, SSH key, email, phone, and card-like content. |
| P2 toolchain / CI | **Fixed in code** | `.nvmrc` and both workflows use Node 22; ESLint Flat Config is active; CI now gates secret scan, production dependency audit, lint, tests, build, Electron smoke, and NSIS artifact creation. |

## Command evidence

| Gate | Command | Result |
|---|---|---|
| Secret scan | `npm run secret:scan` | **PASS** — no tracked dotenv files or non-fixture credential signatures in production sources. |
| Production audit | `npm run audit:production` | **PASS** — `found 0 vulnerabilities`. |
| Lint | `npm run lint` | **PASS** — ESLint Flat Config completed with `--max-warnings=0`. |
| Tests | `npm test` | **PASS** — 18 files, 215 tests. |
| Renderer build | `npm run build:renderer` | **PASS**. A bundle-size warning remains: the main asset exceeds 500 kB. |
| Electron TypeScript build | `npm run build:main` | **PASS** with `strict: true` and `allowJs: false` in `tsconfig.electron.json`. |
| Production Doctor | `npm run doctor` | **PASS** — required files, Node/Electron baseline, IPC/catalog integrity, secret scan, audit, lint, tests, and build. |
| Electron smoke | `npm run electron:smoke` | **PASS** — Electron 43.4.1 plus main, preload, renderer, and compiled backend artifacts. |
| NSIS package preparation | `npm run dist:installer` | **PARTIAL** — build, native SQLite rebuild, Windows unpacked application, and NSIS preparation succeeded; final NSIS generation stopped because the Linux runner has no `wine` binary (`spawn wine ENOENT`). |

## Runtime evidence and limitations

The AI gateway contract is covered by `aiGateway.test.ts` for all 16 supported actions, missing provider, invalid key, 429, upstream 5xx, network failure, empty provider output, oversized input, and sensitive-input detection. These tests mock OpenRouter rather than sending a real provider request because no production credential is stored in this workspace.

The runtime Active-service QA execution runs in the renderer and the IPC integrity check runs when the Electron bridge exists. The test environment is not an interactive Electron desktop and therefore does not prove Windows clipboard permissions, camera permission, barcode hardware access, or a real OpenRouter call.

## Remaining release blockers

| Blocker | Why it remains | Closure evidence required |
|---|---|---|
| Vercel production status | The connected Vercel team contains no KNOUX project; deployment logs and project settings could not be queried. | Push this branch to the project-linked Git remote; a Vercel preview/production deployment must build green and the `/api/ai/chat` route must return the expected configured or provider-missing response. |
| Real OpenRouter execution | Credentials are intentionally absent from the sandbox. | Run a non-sensitive request in an environment with `OPENROUTER_API_KEY`, then verify success and each mapped error state. |
| Windows install / launch / uninstall | Linux generated the Windows app directory but lacks Wine, so the final NSIS executable could not be produced or launched. | Run `npm run dist:installer` on Windows CI, install the produced NSIS file, launch it, verify clipboard and IPC smoke, then uninstall. |
| UI/manual runtime matrix | Camera, clipboard permission, language persistence, and barcode hardware paths require an interactive runtime. | Execute the Windows manual smoke matrix and attach evidence to the release candidate. |
| Bundle size warning | The renderer's minified main bundle exceeds the 500 kB advisory threshold. | Split heavy routes/workers before a performance-focused release if startup telemetry shows impact. |

## Score and decision

| Dimension | Current result |
|---|---|
| Source remediation | 8.5 / 10 |
| Automated local gates | 9 / 10 |
| Deployment evidence | 0 / 10 — project unavailable to this session |
| Windows installer/runtime evidence | 3 / 10 — package preparation passed; final installer and runtime unavailable on Linux |
| **Final production score** | **7.0 / 10** |
| **Decision** | **NO-GO** until Vercel deployment and Windows installer/runtime gates are evidenced. |

> The branch is materially hardened and passes its local executable gates. It is **not** approved for production until the listed external runtime evidence is collected.
