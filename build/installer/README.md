# KNOUX Windows Installer Phase

## Strategy

Current installer strategy: electron-builder NSIS branding.

This phase intentionally avoids fragile custom NSIS plugins and does not claim a fully custom wizard UI. A complete standalone custom installer shell remains a later planned phase.

## Generated asset paths

The installer preparation script writes local assets to:

- `build/installer/icon.ico`
- `build/installer/uninstaller.ico`
- `build/installer/header-icon.ico`
- `build/installer/asset-manifest.json`

The icon files are copied from the official KNOUX product icon at:

- `assets/icons/icon.ico`

## Supporting visual source directory

Supporting visual source images should be stored locally under:

- `build/installer/source/`

Expected filenames:

- `installer-visual-01.png`
- `installer-visual-02.png`
- `installer-visual-03.png`
- `installer-visual-04.png`
- `installer-visual-05.png`
- `installer-visual-06.png`
- `installer-visual-07.png`
- `installer-visual-08.png`
- `installer-visual-09.png`

These source PNG files are supporting installer visuals only. They must not replace the official product logo.

## Current status

- Windows Installer Branding: Ready
- Installer Icon: Ready
- Uninstaller Icon: Ready
- Header Icon: Ready
- Wizard Header Image: Planned until local BMP generation is verified
- Wizard Sidebar Image: Planned until local BMP generation is verified
- Full Custom Installer UI: Planned
- Custom Wizard Pages: Planned
- Advanced animated installer screens: Planned

## Installer copywriting

Welcome copy:

Welcome to KNOUX AI Clipboard Pro

Subtitle:

Your clipboard. Upgraded by AI.

Benefit bullets:

- Capture clipboard history locally
- Organize clips, links, code, and replies
- Use AI tools when your provider is configured
- Keep sensitive content guarded
- Built for Windows productivity

Finish copy:

KNOUX AI Clipboard Pro is ready.
Launch the app and start organizing your clipboard.

## Data preservation

The NSIS configuration keeps `deleteAppDataOnUninstall` set to `false`. User clipboard vault data must not be silently deleted during uninstall.

## Validation gate

The Windows installer workflow job is gated behind:

1. `npm run build:renderer`
2. `npm test`
3. `npm run build:main`

The installer job does not run unless the validation job is green.
