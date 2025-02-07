<div align="center">

# next-easy-darkmode

[![npm version](https://img.shields.io/npm/v/next-easy-darkmode.svg)](https://www.npmjs.com/package/next-easy-darkmode)
[![npm downloads](https://img.shields.io/npm/dm/next-easy-darkmode.svg)](https://www.npmjs.com/package/next-easy-darkmode)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/next-easy-darkmode)](https://bundlephobia.com/package/next-easy-darkmode)
[![License](https://img.shields.io/npm/l/next-easy-darkmode.svg)](https://github.com/superjump22/next-easy-darkmode/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/superjump22/next-easy-darkmode/pulls)

A simple but powerful dark mode solution for Next.js with smooth theme transitions

[Examples](https://github.com/superjump22/next-easy-darkmode-example) •
[Live Demo](https://next-easy-darkmode-example.vercel.app)

</div>

## Features

- Support for dark, light, and system theme modes
- Multiple theme transition effects
  - Fade transition (default)
  - Circular reveal from element or coordinates
  - Custom clip-path animations
- Based on [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)
- Server-side rendering (SSR) compatible
- Prevents flash of unstyled content (FOUC)

> 💡 This package extends [`next-themes`](https://github.com/pacocoursey/next-themes) with enhanced transition capabilities. For browsers that don't support the [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API), it gracefully falls back to instant theme switching.

## Installation

```bash
npm install next-themes next-easy-darkmode
# or
yarn add next-themes next-easy-darkmode
# or
pnpm add next-themes next-easy-darkmode
# or
bun add next-themes next-easy-darkmode
```

## 🚀 Quick Start

1. Create a theme provider:

```tsx
// components/theme-provider.tsx
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

2. Wrap your root layout:

```tsx
// app/layout.tsx
import { ThemeProvider } from "@/components/theme-provider"

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    </>
  )
}
```

3. Use the hook in your components:

```tsx
import { useDarkMode } from 'next-easy-darkmode'

const MyComponent = () => {
  const { toggle } = useDarkMode()

  return (
    <button onClick={toggle}>
      toggle
    </button>
  )
}
```

## Transition Options

The hook supports several transition types for theme switching:

### 1. Default (Fade)

<details>
<summary>Simple fade transition between themes</summary>

```tsx
// Default fade transition
const { toggle } = useDarkMode()

// Customized fade transition
const { toggle } = useDarkMode({
  transition: { type: 'fade' },
  duration: 300,
  easing: 'ease-out'
})
```
</details>

### 2. No Transition

<details>
<summary>Instant theme switching without effects</summary>

```tsx
const { toggle } = useDarkMode({
  transition: { type: 'none' }
})
```
</details>

### 3. Circular Reveal

Circular reveal transition that expands from a point:

<details>
<summary>View examples</summary>

```tsx
// Using an element reference
const MyComponent = () => {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const { toggle } = useDarkMode({
    transition: { 
      type: 'circular-reveal', 
      center: { ref: buttonRef }
    },
    duration: 300
  })

  return (
    <button ref={buttonRef} onClick={toggle}>
      toggle
    </button>
  )
}

// Using specific coordinates
const { toggle } = useDarkMode({
  transition: { 
    type: 'circular-reveal', 
    center: { x: 100, y: 100 }
  },
  duration: 300
})
```
</details>

### 4. Custom Transition

<details>
<summary>Creative transition effects using clip-path</summary>

```tsx
// Slide from top
const { toggle } = useDarkMode({
  transition: {
    type: 'custom',
    clipPath: {
      from: 'inset(0 0 100% 0)',
      to: 'inset(0)'
    }
  },
  duration: 300
})

// Diamond expand
const { toggle } = useDarkMode({
  transition: {
    type: 'custom',
    clipPath: {
      from: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)',
      to: 'polygon(-50% 50%, 50% -50%, 150% 50%, 50% 150%)'
    }
  },
  duration: 400
})
```
</details>

## API

<details>
<summary>View complete API documentation</summary>

### useDarkMode

```typescript
function useDarkMode(config?: DarkModeConfig): DarkModeReturn

interface DarkModeConfig {
  /** Optional transition configuration. Default is { type: 'fade' } */
  transition?: TransitionType
  /** Optional duration for the transition in milliseconds. Default is 500 */
  duration?: number
  /** Optional easing function for the transition. Default is 'ease-in-out' */
  easing?: string
}

type TransitionType =
  | { type: 'none' | 'fade' }
  | { type: 'circular-reveal'; center: CircularRevealConfig }
  | { type: 'custom'; clipPath: { from: string; to: string } }

type CircularRevealConfig =
  | { ref: React.RefObject<HTMLElement | null> }
  | { x: number; y: number }

interface DarkModeReturn {
  /** Toggles between light and dark mode */
  toggle: () => void
  /** Activates dark mode */
  enable: () => void
  /** Activates light mode */
  disable: () => void
  /** Sets theme to follow system preferences */
  system: () => void
}
```
</details>

## Browser Support

The smooth transitions require the [View Transitions API](https://caniuse.com/view-transitions). For browsers that don't support it, the theme will change instantly without transition effects.

<details>
<summary>View browser compatibility</summary>

| Browser | Version | Global Support |
|---------|---------|----------------|
| Chrome  | ✅ 111+ | 84.72% |
| Edge    | ✅ 111+ | 4.82% |
| Firefox | ❌ Not supported | - |
| Safari  | ✅ 18.0+ | 2.65% |
| Opera   | ✅ 97+ | 2.37% |
| Android Chrome | ✅ 111+ | 42.13% |
| iOS Safari | ✅ 18.0+ | 18.62% |
| Samsung Internet | ✅ 23+ | 2.84% |

> Data from [Can I Use](https://caniuse.com/view-transitions) (2025)

</details>

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT](./LICENSE) © [Super Jump](https://github.com/superjump22)
