# PROJECT MASTER GAP REPORT

## Baseline status
- Renderer build: passing via `npm run build:renderer`
- Tests: passing via `npm test` with 81 tests
- Main build: passing via `npm run build:main`
- Installer: NSIS build succeeds via `npm run dist:installer`
- Working tree: clean at audit time

## Current truth audit
- Current Electron entry point: [main.js](main.js)
- Current renderer entry point: [app/renderer/main.tsx](app/renderer/main.tsx)
- Current app shell: [app/renderer/App.tsx](app/renderer/App.tsx)
- Active runtime entry: [app/renderer/App.tsx](app/renderer/App.tsx) renders [app/renderer/components/shell/AppShellPro.tsx](app/renderer/components/shell/AppShellPro.tsx)
- Legacy app variants:
  - [app/renderer/AppFinal.tsx](app/renderer/AppFinal.tsx) — present, not referenced by the active runtime entry
  - [app/renderer/AppClean.tsx](app/renderer/AppClean.tsx) — present, not referenced by the active runtime entry
  - [app/renderer/AppIntegrated.tsx](app/renderer/AppIntegrated.tsx) — present, not referenced by the active runtime entry
  - [app/renderer/pages/DashboardPage.tsx](app/renderer/pages/DashboardPage.tsx) — present, not referenced by the active runtime entry
- Package scripts: verified from [package.json](package.json)
- Test command: `npm test` (Vitest)
- Installer config: NSIS via `electron-builder` with branded icon paths and desktop/start menu shortcuts in [package.json](package.json)
- i18n status: existing dictionary system in [app/renderer/utils/i18n.ts](app/renderer/utils/i18n.ts) and [app/renderer/i18n](app/renderer/i18n), but several user-facing strings remain hardcoded in active UI surfaces
- AI status: runtime route checks exist in [app/renderer/services/aiClient.ts](app/renderer/services/aiClient.ts), but the UI currently needs clearer truthful states rather than a generic network_error surface
- Barcode status: [app/renderer/components/BarcodeScannerPage.tsx](app/renderer/components/BarcodeScannerPage.tsx) exists and is wired into the main app, but runtime handling is still best-effort and needs explicit truthfulness messaging
- Developer Studio status: [app/renderer/components/StudioPage.tsx](app/renderer/components/StudioPage.tsx) exists and is wired in; it is functional but still needs more structured utility cards and clearer status handling
- Security page status: [app/renderer/components/SecurityPage.tsx](app/renderer/components/SecurityPage.tsx) exists and is wired in; it is currently more informational than a fully structured tool surface
- PDF/export status: export capabilities exist in settings and clipboard workflows; a dedicated real PDF service layer is still partial and should be treated as Ready/Planned until a verified export path is exercised
- Windows EXE runtime status: Electron runtime features are present in the bridge and IPC layer, but live clipboard monitoring and runtime-specific claims should remain guarded until verified
- Service matrix truth: the catalog in [app/renderer/services/productionCatalog.ts](app/renderer/services/productionCatalog.ts) is already closer to truth than the UI, but the UI should reflect status more carefully and avoid fake Active toggles

## Immediate implementation focus
1. Remove stale runtime leakage and fix the current runtime error path.
2. Make AI status reporting truthful and UI-safe.
3. Introduce a central translation dictionary for the active shell and main pages.
4. Tighten service matrix wording so planned/guarded items are not presented as active.
5. Preserve current renderer stability while improving the product truthfulness.
