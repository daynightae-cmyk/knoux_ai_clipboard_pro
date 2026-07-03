# Knoux Clipboard AI - Brand & Design Guidelines

## 1. Logo Usage

The Knoux logo represents intelligence, efficiency, and seamless integration.

- **Primary Logo**: The Clipboard icon with a gradient fill (Primary to Secondary) and the "Knoux" wordmark in bold.
- **Icon Only**: The gradient Clipboard icon on its own.
- **Monochrome**: Use pure white or black for high-contrast applications.
- **Clear Space**: Maintain at least 50% of the logo height as clear space around the logo to ensure visibility and impact.
- **Minimum Size**:
  - Digital: 24px height for icon, 32px height for full logo.
  - Print: 10mm height.
- **Background Restrictions**:
  - Do not place the logo on cluttered backgrounds.
  - Ensure sufficient contrast (at least 4.5:1) against the background color.

- **Incorrect Usage**:
  - Do NOT stretch or distort the logo.
  - Do NOT change the colors of the gradient or wordmark.
  - Do NOT rotate the logo.
  - Do NOT place the logo on a busy background without a scrim or container.
  - Do NOT add drop shadows or glow effects to the logo (unless part of a specific dark mode treatment).

## 2. Color System

### Primary Palette (Midnight Theme)

- **Primary (Smart Blue)**: `#667EEA` - Used for primary actions, active states, and brand identity.
- **Secondary (AI Green)**: `#00D4AA` - Used for success states, AI features, and accents.
- **Accent (Purple-Blue)**: `#764BA2` - Used for gradients and special highlights.
- **Background**: `#0F0F1A` - Deep dark blue/black for main application background.
- **Surface**: `#1A1A2E` - Slightly lighter for cards, sidebars, and panels.

### Secondary Palette (Daylight Theme)

- **Primary**: `#4F46E5`
- **Secondary**: `#059669`
- **Background**: `#F8FAFC`
- **Surface**: `#FFFFFF`

### Functional Colors

- **Success**: `#00D4AA`
- **Warning**: `#FFA502`
- **Error**: `#FF4757`
- **Info**: `#667EEA`

### Accessibility Contrast

- Ensure all text meets **WCAG AA** standards (4.5:1 contrast ratio) for normal text and **3:1** for large text/UI components.
- Use high-contrast themes for users with visual impairments.

## 3. Typography

Knoux uses a modern, sans-serif font stack prioritizing readability and clean aesthetics.

- **Font Families**:
  - **Sans**: `Inter`, `system-ui`, `-apple-system`, `sans-serif` (UI elements, body text).
  - **Mono**: `JetBrains Mono`, `Consolas`, `monospace` (Code snippets, technical data).

- **Weights**:
  - **Regular (400)**: Body text.
  - **Medium (500)**: Labels, buttons, navigation.
  - **Bold (700)**: Headings, emphasis.

### Type Scale (8px Base)

- **Display**: 64px (4rem) - Marketing headers
- **H1**: 32px (2rem) - Page Titles
- **H2**: 24px (1.5rem) - Section Headers
- **H3**: 20px (1.25rem) - Card Titles
- **Body Large**: 16px (1rem) - Lead text
- **Body**: 14px (0.875rem) - Standard Text
- **Small**: 12px (0.75rem) - Captions, Metadata
- **Tiny**: 10px (0.625rem) - Badges, labels

### Line Heights

- **Headings**: 1.2
- **Body**: 1.5 - 1.6 for readability.

## 4. Iconography

Icons should be consistent, clear, and follow the "Outline" style.

- **Library**: Lucide React
- **Grid System**: Icons are designed on a 24x24 pixel grid.
- **Sizes**:
  - Small: 16px
  - Medium (Default): 24px
  - Large: 32px
  - Extra Large: 48px
- **Stroke Width**: 2px for standard sizes.
- **Corner Radius**: 2px (rounded joins).
- **Color States**:
  - Default: Text Secondary (`#8a8a9e`)
  - Active: Primary Color (`#667EEA`)
  - Hover: White (`#FFFFFF`)

- **Animation Principles**:
  - **Micro-interactions**: Use subtle scale (1.1x) or color shifts on hover.
  - **Morphing**: Icons can morph between states (e.g., Menu -> Close) using smooth path transitions.
  - **Stroke Animation**: Use `stroke-dasharray` and `stroke-dashoffset` for drawing effects on load or action.
  - **Duration**: Keep icon animations fast (200ms - 300ms).

## 5. Components

### Buttons

- **Primary**: Gradient background (`from-primary to-secondary`), white text, rounded corners (8px/12px).
- **Secondary**: Transparent background, border (1px solid `border-primary`), text color matches border.
- **Ghost**: No background/border, hover effect (`bg-white/5`) only.
- **Icon Button**: Square or circular container, centered icon.

### Cards & Containers

- **Background**: Surface color (`#1A1A2E` dark / `#FFFFFF` light).
- **Border**: 1px solid `rgba(255, 255, 255, 0.05)`.
- **Shadow**: `lg` or `xl` for elevation.
- **Glassmorphism**: Use `backdrop-blur-xl` and semi-transparent backgrounds (`bg-surface/80`) for overlays.

### Inputs

- **Background**: Darker/Lighter than surface (`bg-input`).
- **Border**: 1px solid border, focused state has primary color ring (2px).
- **Radius**: 8px or 12px.
- **States**: Default, Hover, Focus, Error, Disabled.

### Data Visualization

- Use functional colors for charts (Success/Green for positive, Error/Red for negative).
- Ensure charts have tooltips for precise data reading.

## 6. Spacing System

- **Base Unit**: 4px (Tailwind Scale).
- **Scale**:
  - `0`: 0px
  - `1`: 4px
  - `2`: 8px
  - `4`: 16px
  - `6`: 24px
  - `8`: 32px
  - `12`: 48px
  - `16`: 64px
  - `24`: 96px
  - `32`: 128px

## 7. Animation Principles

- **Duration**:
  - Micro-interactions: 100ms - 200ms
  - Page Transitions: 300ms
  - Complex Animations (Loading): 1000ms+
- **Easing**: `ease-in-out` (smooth start/end) or `spring` (for bouncy, natural feel).
- **Types**:
  - `Fade In`: Opacity 0 -> 1.
  - `Slide Up`: TranslateY 20px -> 0px.
  - `Pulse`: Scale 1 -> 1.05 -> 1.
  - `Shimmer`: Loading skeletons.

## 8. Asset Delivery

- **Folder Structure**:
  - `/assets/logo`: SVG, PNG variations.
  - `/assets/icons`: Custom SVG icons.
  - `/assets/fonts`: Local font files (if not using system fonts).
- **Formats**:
  - **SVG**: Primary format for logos and icons (resolution independent).
  - **PNG**: For social media and app store assets (@1x, @2x, @3x).
  - **JSON**: Design tokens and Lottie animations.
