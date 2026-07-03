# Assets Directory

This directory contains all static assets for the Knoux Clipboard AI project.

## 📂 Structure

### `/logo`
Contains the official logo files.
- `logo-full.svg`: Full logo with wordmark.
- `logo-icon.svg`: Icon only.
- `logo-dark.png`: For light backgrounds.
- `logo-light.png`: For dark backgrounds.

### `/icons`
Contains application icons and system tray icons.
- `app-icon.ico`: Windows application icon.
- `tray-icon.png`: System tray icon.
- `src/`: Source SVG files for custom icons.

### `/fonts`
Contains local font files (if not using system/web fonts).
- `Inter-*.ttf`
- `JetBrainsMono-*.ttf`

### `/marketing`
Contains promotional materials and social media assets.
- `/app-store`: Screenshots, banners, and feature graphics for store listings.
- `/social`: Profile pictures, headers, and post templates.
- `/website`: Hero images, feature illustrations, and OG tags.
- `/source`: Editable source files (Figma, Sketch, PSD).

## 📝 Guidelines

- **Naming Convention**: Use `kebab-case` for file names (e.g., `feature-graphic-01.png`).
- **Optimization**: Always optimize images before committing (use TinyPNG or SVGO).
- **SVGs**: Ensure SVGs have `viewBox` attributes and clean paths.

For detailed design specifications, please refer to the [Brand Guidelines](../docs/BRAND_GUIDELINES.md).
