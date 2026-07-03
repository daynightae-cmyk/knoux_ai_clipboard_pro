# Marketing & Promotional Assets Guide

This document defines the requirements and visual style for Knoux Clipboard AI's marketing materials.

## 🎨 Visual Style Definition

- **Core Aesthetic**: "Developer-First Intelligence"
- **Keywords**: Sleek, Modern, Efficient, Dark Mode, Neon Accents.
- **Visual Elements**:
  - Dark backgrounds (`#0F0F1A`) with glowing gradients.
  - Glassmorphism effects for UI containers.
  - Abstract circuit/node patterns to represent AI.
  - High-contrast typography (Inter & JetBrains Mono).

---

## 📢 Asset Requirements

### 1. App Store / Marketplace Graphics

**Target Platforms**: Microsoft Store, Gumroad, Product Hunt.

| Asset Type | Dimensions | Description |
|------------|------------|-------------|
| **App Icon** | 1024x1024 | High-res logo on dark background. |
| **Feature 1**| 1920x1080 | "Smart Clipboard History" - Showcasing the list view. |
| **Feature 2**| 1920x1080 | "AI Transformation" - Split view: Raw Text -> Processed Text. |
| **Feature 3**| 1920x1080 | "Developer Friendly" - Code syntax highlighting & export. |
| **Feature 4**| 1920x1080 | "Secure & Local" - Lock icon/shield visualization. |
| **Banner**   | 2400x1260 | Logo + Tagline "Your Second Brain for Copy-Paste". |

### 2. Website Assets

| Asset Type | Description | Style Notes |
|------------|-------------|-------------|
| **Hero Image** | 3D/Isometric view of the app window floating over a digital grid. | Glow effects on edges. |
| **Feature Icons** | Set of 4-6 illustrative icons (Search, AI, Code, Sync). | Gradient stroke style. |
| **OG Image** | Social preview image (1200x630) for link sharing. | Bold title + UI mockup. |

### 3. Social Media Kit

**Platforms**: Twitter/X, LinkedIn, GitHub.

- **Profile Picture**: 400x400 (Logo centered, adequate padding).
- **Twitter Header**: 1500x500 (Abstract gradient pattern + subtle logo).
- **Post Template**: 1080x1080 (Square) for announcements.
  - *Layout*: Headline top, central visual/icon, footer with URL.

### 4. Email Campaign Graphics

- **Header**: 600x200 (Logo + "Newsletter" or "Update").
- **Feature Highlight**: 600x400 (Screenshot with annotated callouts).
- **Footer**: Social links icons (white on dark).

---

## 🛠 Asset Creation Workflow

1. **Screenshots**:
   - Capture UI at high resolution (2x scale).
   - Clean up data (use "John Doe" or realistic dummy code).
   - Remove system window controls (minimize/close buttons) unless essential.

2. **Composition**:
   - Use the `docs/design-tokens.json` colors for all backgrounds and accents.
   - Apply a subtle outer glow to UI screenshots (`shadow-primary-500/20`).

3. **Export**:
   - Save as PNG (Optimized) for web.
   - Save as JPG (High Quality) for social if file size is an issue.
   - Keep source files (Figma/Sketch/PSD) in `assets/marketing/source`.
