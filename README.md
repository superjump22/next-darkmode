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

- 🌗 Support for dark, light, and system theme modes
- 🎭 Multiple transition effects
  - Fade transition (default)
  - Circular reveal from element or coordinates
  - Custom animations with Web Animations API
- 🚀 Based on [next-themes](https://github.com/pacocoursey/next-themes) and [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)
- 🖥️ Server-side rendering (SSR) compatible
- ⚡ Prevents flash of unstyled content (FOUC)
- 🔄 Graceful fallback for unsupported browsers

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

## Quick Start

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
      Toggle
    </button>
  )
}
```

## Transition Options

### 1. None

Instant theme switching without any transition effect:

```tsx
const { toggle } = useDarkMode({
  type: 'none'
})
```

### 2. Default

Simple fade transition between light and dark mode:

```tsx
// These are equivalent
const { toggle } = useDarkMode()
const { toggle } = useDarkMode({ type: 'default' })
```

### 3. Circular Reveal

Circular reveal transition that expands from a point:

```tsx
// Reveal from button center
const MyComponent = () => {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const { toggle } = useDarkMode({
    type: 'circular-reveal',
    center: { ref: buttonRef },
    duration: 300,
    easing: 'ease-out'
  })

  return (
    <button ref={buttonRef} onClick={toggle}>
      Toggle
    </button>
  )
}

// Reveal from specific coordinates
const { toggle } = useDarkMode({
  type: 'circular-reveal',
  center: { x: 100, y: 100 },
  duration: 500,
  easing: 'ease-in-out'
})
```

### 4. Custom Animations

Full control over transitions using Web Animations API:

```tsx
// Slide from top
const { toggle } = useDarkMode({
  type: 'custom',
  new: {
    keyframes: [
      { transform: 'translateY(-100%)' },
      { transform: 'translateY(0)' }
    ],
    options: {
      duration: 300,
      easing: 'ease-out'
    }
  }
})
```

See [More Examples](https://github.com/superjump22/next-easy-darkmode-example) or [Live Demo](https://next-easy-darkmode-example.vercel.app).

## Browser Support

The smooth transitions require the [View Transitions API](https://caniuse.com/view-transitions). For browsers that don't support it, the theme will change instantly without transition effects.

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

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT](./LICENSE) © [Super Jump](https://github.com/superjump22)
