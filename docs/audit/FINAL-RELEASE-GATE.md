# KNOUX AI Clipboard Pro — Final Release Gate

**Status:** **Current evidence record — NO-GO**

**Evidence date:** 2026-08-19

**Release-candidate branch:** `codex/production-rescue-rc`

**Implementation head at evidence capture:** `9cb731b`

**Baseline:** `origin/main` at `1c50a8b235055a22cc52992d52ba5b6365429fb3`

**Remote branch:** `origin/codex/production-rescue-rc` is pushed and contains the evidence commits below.

> This document records only executed evidence. It does not grant production approval while any required external or interactive release-policy check remains blocked.

## Execution commits

| Commit | Purpose |
|---|---|
| `934f67f` | Unify Electron and web AI gateway. |
| `b557f0e` | Centralize IPC and harden vault derivation. |
| `abcd2d0` | Enforce truthful service catalog states and QA execution. |
| `e4e408d` | Upgrade supported runtime and enable strict TypeScript build. |
| `5743d00` | Enforce CI production gates, Installer preparation, and release evidence. |
| `7d80eda` | First Windows Electron-smoke compatibility repair. |
| `2877889` | Make Windows Electron smoke use Node shell execution. |
| `9cb731b` | Add Windows NSIS install, launch, and uninstall smoke lifecycle. |

## Verified remediation

| ID | Result | Executable evidence |
|---|---|---|
| P0-01 | **Fixed in code** | `aiClient.ts` selects constrained Electron IPC (`ai:run` / `ai:status`) when available and `/api/ai/[action]` only for web. `app/shared/ai-contract.js` is the common action, limit, prompt, error, and sensitive-input contract. |
| P0-02 | **Build root cause fixed; web deployment blocked** | The conflicting `api/ai/[action].ts` 501 stub was removed and the route calls the shared provider adapter. No accessible Vercel project is available for deployed-route evidence. |
| P0-03 | **Fixed and smoke-tested** | Electron is `43.4.1`. Local Electron smoke and Windows CI Electron smoke both pass. |
| P1-01 / P1-06 | **Fixed and tested** | Browser origin validation no longer exposes the proxy secret. Provider states include `ready`, `fallback`, `provider_missing`, `invalid_api_key`, `rate_limited`, `provider_unavailable`, `network_error`, `blocked_sensitive_content`, and `empty_result`. |
| P1-02 | **Fixed and tested** | `main.js` registers `canonical-ipc.js` once in `app.whenReady()`; `createWindow()` only creates a window. `canonicalIpc.test.ts` asserts duplicate registration is refused. |
| P1-03 / P1-04 | **Fixed in code** | The catalog guards Active declarations that have no verified runner. QA dispatches every Active service and runs an IPC-integrity check in Electron. |
| P1-05 | **Fixed for active IPC vault** | Vault v2 uses AES-256-GCM, random 16-byte salt, 12-byte IV, scrypt, authentication-tag validation, and a v1 migration payload. The legacy backend Encryptor is guarded without `KNOUX_VAULT_MASTER_SECRET` and uses per-user salt plus scrypt. |
| P1 security / DLP | **Fixed and tested** | AI input is blocked locally for password, API/OpenRouter key, bearer token, JWT, private key, SSH key, email, phone, and card-like content. |
| P2 toolchain / CI | **Fixed and verified** | Node 22, ESLint Flat Config, strict Electron TypeScript, production audit, secret scan, tests, build, Electron smoke, NSIS artifact, and automated Windows install/launch/uninstall are CI gates. |

## Current command and CI evidence

| Gate | Command or run | Result |
|---|---|---|
| Secret scan | `npm run secret:scan` | **PASS** — no tracked dotenv files or non-fixture credential signatures in production sources. |
| Production audit | `npm run audit:production` | **PASS** — `found 0 vulnerabilities`. |
| Lint | `npm run lint` | **PASS** — Flat Config completed with `--max-warnings=0`. |
| Tests | `npm test` | **PASS** — 18 files and 215 tests. |
| Renderer build | `npm run build:renderer` | **PASS**. A non-blocking main-chunk warning above 500 kB remains. |
| Electron TypeScript build | `npm run build:main` | **PASS** with `strict: true` and `allowJs: false`. |
| Production Doctor | `npm run doctor` | **PASS**. |
| Electron smoke | `npm run electron:smoke` | **PASS** on Electron 43.4.1. |
| Windows validation | GitHub Actions run [32251719828](https://github.com/daynightae-cmyk/knoux_ai_clipboard_pro/actions/runs/32251719828) | **PASS** — security, audit, lint, tests, build, Windows Electron smoke, NSIS build, artifact verification, silent install, launch survival, silent uninstall, and artifact upload. |

## External evidence status

| Requirement | Status | Evidence or blocker |
|---|---|---|
| Vercel production deployment | **BLOCKED** | The configured Vercel team lists zero projects. Attempting to link `knoux-ai-clipboard-pro` returned HTTP 409 because the name already exists, while `get_project` returned HTTP 404 for the accessible team. The existing project is outside the current integration scope or inaccessible. |
| Deployed `/api/ai/chat` response | **BLOCKED** | No reachable project/deployment URL is available to test a deployed route. |
| Real OpenRouter execution | **BLOCKED** | `OPENROUTER_API_KEY` is absent from the secure execution environment. Contract tests are mocked and are not presented as provider evidence. |
| Windows NSIS artifact | **PASS** | Windows CI built, verified, and uploaded the installer artifact. |
| Windows install / launch / uninstall | **PASS (automated smoke)** | Windows CI silently installed the NSIS package, confirmed the executable, launched it for eight seconds without early exit, stopped it, silently uninstalled it, and verified the application executable was removed. |
| Windows interactive clipboard, language, camera, barcode, and UI matrix | **BLOCKED** | Hosted Windows CI does not provide interactive device, camera, or user-permission evidence. |
| Bundle-size advisory | **OPEN, non-blocking** | The renderer main chunk exceeds 500 kB after minification. Do not refactor it opportunistically before measuring startup impact. |

## Remaining release-policy blockers

1. Obtain access to the existing Vercel project or identify the correct Vercel team, then deploy this release-candidate branch or its promoted `main`, verify a green deployment, and fetch `/api/ai/chat` for truthful `provider_missing` or configured-provider output.
2. Supply `OPENROUTER_API_KEY` only through a secure runtime environment, run non-sensitive `chat`, `summarize`, `rewrite`, `translate`, and `analyze` requests, then capture provider, model, result, status, and usage. Verify invalid key, 429, 5xx, network, empty-response, oversized-input, and DLP behavior against the contract.
3. Execute the manual Windows matrix for clipboard read/write/import, settings, light/dark, Arabic/English LTR/RTL, QA Lab, Developer Studio, barcode/camera where supported, export, and user-visible error handling.

## Release decision

| Dimension | Status |
|---|---|
| Source remediation | Verified locally and by Windows CI |
| Local quality gates | PASS |
| Windows installer lifecycle | PASS (automated) |
| Vercel deployment evidence | BLOCKED |
| Real provider evidence | BLOCKED |
| Windows interactive device evidence | BLOCKED |
| **Final score** | **Not eligible for a numerical production score while mandatory evidence is blocked.** |
| **Release** | **NO-GO** |

> Promotion to `main` is intentionally withheld. The release policy requires all mandatory deployment, real-provider, and interactive Windows evidence to pass; automated local and CI success alone is insufficient.
