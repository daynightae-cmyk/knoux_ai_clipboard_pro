# Development Assets & Implementation Guide

This document outlines the technical specifications for implementing the Knoux Clipboard AI design system.

## 1. Design Tokens

The source of truth for all design values is located in `docs/design-tokens.json`.

- **Colors**: Primary, Secondary, Accent, Neutral, Functional.
- **Typography**: Fonts, Weights, Sizes, Line Heights.
- **Spacing**: 4px base scale.
- **Border Radius**: Small (2px) to Full (Pill).
- **Shadows**: Tailwind-compatible scales.

## 2. Component Specifications

### Button Component

```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}
```

- **Primary**: `bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:opacity-90`
- **Secondary**: `border border-primary-500 text-primary-500 bg-transparent hover:bg-primary-500/10`
- **Ghost**: `bg-transparent text-neutral-200 hover:bg-white/10`
- **Danger**: `bg-functional-error text-white hover:opacity-90`

### Input Component

```tsx
interface InputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  type?: 'text' | 'password' | 'email' | 'number';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}
```

- **Base**: `bg-neutral-800 border border-white/10 rounded-lg p-3 text-white`
- **Focus**: `ring-2 ring-primary-500 border-transparent outline-none transition-all`
- **Error**: `border-functional-error ring-functional-error`

### Card Component

```tsx
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}
```

- **Base**: `bg-neutral-800 border border-white/5 rounded-xl p-6`
- **Hoverable**: `hover:border-primary-500/30 transition-colors duration-200`

## 3. SVG & Icon Assets

### Optimization Rules
1. **Remove `width` and `height` attributes** from the SVG root (control via CSS/Props).
2. **Set `viewBox`** correctly (usually `0 0 24 24`).
3. **Use `currentColor`** for stroke/fill to inherit text color.
4. **Clean IDs**: Ensure IDs within SVGs are unique or removed to avoid conflicts.

### React Icon Component Pattern

```tsx
import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

export const ClipboardIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = "currentColor", 
  strokeWidth = 2,
  className = "" 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={color} 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </svg>
);
```

## 4. Design System Usage

### Imports
Always import components from the shared components directory:
`import { Button, Input, Card } from '@renderer/components';`

### Theme Usage
Use the `ThemeContext` to access current theme variables if inline styles are necessary (avoid if possible, prefer CSS variables/Tailwind classes).

```tsx
const { theme } = useTheme();
// theme.colors.primary
```

### Accessibility (A11y)
- **Keyboard Navigation**: Ensure all interactive elements are focusable.
- **ARIA Labels**: Add `aria-label` to icon-only buttons.
- **Contrast**: Check text contrast against backgrounds using the dev tools.
