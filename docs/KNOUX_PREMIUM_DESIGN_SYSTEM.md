# Knoux AI Clipboard Pro — Premium Design System

This document is the implementation handoff for the uploaded KNOUX premium design pack.

## Brand direction

**Glass · Glow · Gradient · Circuit**

The product interface should feel like a premium AI desktop application with a white/lavender glass base, purple neon accents, circular product emblem usage, and restrained dark badge surfaces for code, security, and diagnostics panels.

## Core palette

| Token | Hex |
|---|---|
| Purple 500 | `#8226EE` |
| Purple 700 | `#500FC8` |
| Violet 900 | `#381584` |
| Indigo 950 | `#1C0B4E` |
| Black Purple | `#0D0527` |
| Orchid 400 | `#A74CE7` |
| Lilac 300 | `#C17CEB` |
| Lavender White | `#F3E6FB` |
| Soft White | `#FCFAFF` |

## UI rules

1. Default app background: radial white/lavender page background.
2. Primary surfaces: white glass cards with blur, translucent border, and soft purple shadow.
3. Emphasis surfaces: dark violet badge/panel only for code, diagnostics, or premium hero contrast.
4. Primary actions: purple gradient button.
5. Typography: Inter for English, Cairo/Noto Sans Arabic fallback for Arabic.
6. Corners: 16px to 28px radius for all product surfaces.
7. Avoid forced dark runtime overrides unless the user explicitly chooses dark mode.

## Implemented files

- `app/renderer/styles/theme-knoux-premium.css`
- `app/renderer/styles/design-tokens.json`
- `docs/KNOUX_PREMIUM_DESIGN_SYSTEM.md`

## Implementation note

`theme-knoux-premium.css` must be imported after `knoux-theme.css` in `global.css` so the premium tokens and glass classes win the cascade.
