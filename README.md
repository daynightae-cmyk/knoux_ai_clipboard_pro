# KNOUX AI Clipboard Pro

A local-first Electron and React clipboard workspace with guarded AI actions, Developer Studio, barcode utilities, and Arabic/English UI support.

> **Current status:** **Release candidate under verification.** Do not treat catalog metadata, historical reports, or this document as production evidence. The executable release gate is `npm run doctor` and the evidence record is `docs/audit/FINAL-RELEASE-GATE.md`.

## Runtime baseline

| Component | Required baseline | Source of truth |
|---|---:|---|
| Node.js | 22.x | `.nvmrc` |
| Electron | 43.4.1 | `package.json` |
| Renderer | React + Vite | `package.json` |
| Tests | Vitest | `package.json` |
| Lint | ESLint Flat Config | `eslint.config.mjs` |

The app uses a single renderer AI gateway. In a web deployment it calls `/api/ai/[action]`; in packaged Electron it uses a constrained preload API and IPC. The renderer never receives the OpenRouter credential.

## Security boundaries

AI input is scanned locally before transport. Credential-like values, OpenRouter keys, bearer tokens, JWTs, private keys, SSH keys, emails, phone numbers, and card-like values are blocked with `blocked_sensitive_content`; redact the text before retrying.

The Electron vault IPC uses AES-256-GCM with a random 16-byte salt, 12-byte IV, and scrypt-derived key in `knoux:v2` payloads. Historical `knoux:v1` payloads can be decrypted once and return a migration payload. Browser `localStorage` is **not** presented as encrypted vault storage.

Local Transformer inference is intentionally guarded because its former dependency chain was not verified for the release baseline. OpenRouter configuration is required for live AI. A deterministic offline fallback, when returned by Electron IPC, is explicitly labelled `fallback` and never `ready`.

## Setup

```bash
git clone https://github.com/daynightae-cmyk/knoux_ai_clipboard_pro.git
cd knoux_ai_clipboard_pro
nvm use
npm ci
cp .env.example .env
```

Set `OPENROUTER_API_KEY` only in a local ignored dotenv file or your deployment environment. Never define it in renderer variables or commit it to Git.

## Development and validation

```bash
npm run dev
npm run lint
npm test
npm run build
npm run secret:scan
npm run audit:production
npm run electron:smoke
npm run doctor
```

`npm run doctor` checks required files, Node and Electron baselines, tracked dotenv files, centralized IPC setup, truthful service catalog wiring, secret scan, dependency audit, lint, tests, and builds.

## Packaging

```bash
npm run dist:installer
```

The NSIS installer is built and verified on Windows in GitHub Actions. Installer installation, launch, and uninstall require Windows runtime evidence and remain release-gate checks rather than documentation assertions.

## Service truth model

A service is shown as **Active** only when it resolves through a verified executable runner. Services without a real runner are converted to **Guarded** automatically. QA Lab performs static catalog checks and, when run, dispatches every Active service for non-empty runtime output; Electron additionally exposes a constrained IPC-integrity check.

## CI gates

Pull requests to `main` must pass the following before the Windows installer job starts:

```text
secret scan → production dependency audit → lint → test → build → Electron smoke
```

The current deployment status and remaining release blockers are recorded in `docs/audit/FINAL-RELEASE-GATE.md`; no document should claim “Production Ready” without command output tied to a specific commit.

## License

MIT. See [LICENSE](LICENSE).
