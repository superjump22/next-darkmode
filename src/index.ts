import { useTheme } from 'next-themes'
import { flushSync } from 'react-dom'

/**
 * Theme options for dark mode
 * - 'dark': Forces dark mode
 * - 'light': Forces light mode
 * - 'system': Follows system preference
 */
export type DarkModeTheme = 'dark' | 'light' | 'system'

/**
 * Hook return value containing theme control functions
 */
export interface DarkModeReturn {
  /** Toggle between light and dark mode */
  toggle: () => void
  /** Enable dark mode */
  enable: () => void
  /** Disable dark mode */
  disable: () => void
  /** Follow system theme */
  system: () => void
}

/**
 * Configuration for the center point of circular reveal animation
 * Can be either an element reference or specific coordinates
 */
type CircularRevealCenter =
  | { ref: React.RefObject<HTMLElement | null> }
  | { x: number, y: number }

/**
 * Configuration for Web Animations API
 */
interface AnimateConfig {
  keyframes: Keyframe[] | PropertyIndexedKeyframes | null
  options?: number | KeyframeAnimationOptions
}

/**
 * Available transition types for theme switching:
 * - 'none' | 'default': No animation or default fade
 * - 'circular-reveal': Expands from a point with customizable center and timing
 * - 'custom': Full control over animation with Web Animations API
 */
export type DarkModeTransition =
  | { type: 'none' | 'default' }
  | {
    type: 'circular-reveal'
    center: CircularRevealCenter
    duration?: number | CSSNumericValue | string
    easing?: string
  }
  | {
    type: 'custom'
    old?: AnimateConfig
    new?: AnimateConfig
    css?: string
  }

// Style element IDs for managing transitions
const STYLE_IDS = {
  DISABLE_DEFAULT: '__next-easy-dark-mode-disable-view-transition-default-styles__',
  ADD_CUSTOM: '__next-easy-dark-mode-add-view-transition-custom-styles__',
} as const

/**
 * Calculate the center point for circular reveal animation
 * Falls back to viewport center if no valid reference or coordinates provided
 */
const getCircularRevealCenter = (config: CircularRevealCenter) => {
  if ('ref' in config && config.ref.current) {
    const rect = config.ref.current.getBoundingClientRect()
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }
  }
  if ('x' in config && 'y' in config) {
    return { x: config.x, y: config.y }
  }
  return {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  }
}

// Style management utilities
const addDocumentStyles = (id: string, textContent: string) => {
  let style = document.getElementById(id) as HTMLStyleElement | null
  if (!style) {
    style = document.createElement('style')
    style.id = id
    style.textContent = textContent
    document.head.appendChild(style)
  }
}

const removeDocumentStyles = (id: string) => {
  const style = document.getElementById(id) as HTMLStyleElement | null
  style?.parentNode?.removeChild(style)
}

/**
 * Disable default View Transitions API animations
 * This allows us to control the animation manually
 */
const disableDefaultStyles = () => {
  addDocumentStyles(
    STYLE_IDS.DISABLE_DEFAULT,
    `
      ::view-transition-image-pair(root) {
        isolation: auto;
      }

      ::view-transition-old(root),
      ::view-transition-new(root) {
        animation: none;
        mix-blend-mode: normal;
        display: block;
      }
    `,
  )
}

// Reset to default View Transitions behavior
const resetDefaultStyles = () => {
  removeDocumentStyles(STYLE_IDS.DISABLE_DEFAULT)
}

/**
 * Handle circular reveal transition
 * Creates an expanding circle effect from the specified center point
 */
const handleCircularReveal = async (
  newTheme: DarkModeTheme,
  setTheme: (theme: DarkModeTheme) => void,
  config: Extract<DarkModeTransition, { type: 'circular-reveal' }>,
) => {
  disableDefaultStyles()
  const { x: centerX, y: centerY } = getCircularRevealCenter(config.center)
  const maxRadius = Math.hypot(
    Math.max(centerX, window.innerWidth - centerX),
    Math.max(centerY, window.innerHeight - centerY),
  )

  const viewTransition = document.startViewTransition(() => {
    flushSync(() => setTheme(newTheme))
  })

  try {
    await viewTransition.ready
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${centerX}px ${centerY}px)`,
          `circle(${maxRadius}px at ${centerX}px ${centerY}px)`,
        ],
      },
      {
        duration: config.duration || 500,
        easing: config.easing || 'ease-in-out',
        pseudoElement: '::view-transition-new(root)',
      },
    )
  }
  catch {
    // Animation errors are non-fatal
  }

  try {
    await viewTransition.finished
  }
  finally {
    resetDefaultStyles()
  }
}

/**
 * Handle custom transition with full animation control
 * Supports separate animations for old and new views
 * Optional CSS injection for complex transitions
 */
const handleCustomTransition = async (
  newTheme: DarkModeTheme,
  setTheme: (theme: DarkModeTheme) => void,
  config: Extract<DarkModeTransition, { type: 'custom' }>,
) => {
  disableDefaultStyles()
  if (config.css) {
    addDocumentStyles(STYLE_IDS.ADD_CUSTOM, config.css)
  }

  const viewTransition = document.startViewTransition(() => {
    flushSync(() => setTheme(newTheme))
  })

  try {
    await viewTransition.ready

    if (config.old) {
      const { keyframes, options } = config.old
      document.documentElement.animate(
        keyframes,
        typeof options === 'number'
          ? { duration: options, pseudoElement: '::view-transition-old(root)' }
          : { ...options, pseudoElement: '::view-transition-old(root)' },
      )
    }

    if (config.new) {
      const { keyframes, options } = config.new
      document.documentElement.animate(
        keyframes,
        typeof options === 'number'
          ? { duration: options, pseudoElement: '::view-transition-new(root)' }
          : { ...options, pseudoElement: '::view-transition-new(root)' },
      )
    }
  }
  catch {
    // Animation errors are non-fatal
  }

  try {
    await viewTransition.finished
  }
  finally {
    resetDefaultStyles()
    if (config.css) {
      removeDocumentStyles(STYLE_IDS.ADD_CUSTOM)
    }
  }
}

/**
 * React hook for managing dark mode with smooth transitions
 * Built on top of next-themes with View Transitions API support
 *
 * Features:
 * - Multiple transition effects (fade, circular reveal, custom)
 * - SSR compatible
 * - Prevents FOUC
 * - Fallback for unsupported browsers
 */
export function useDarkMode(transition: DarkModeTransition = { type: 'default' }): DarkModeReturn {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const isDarkMode = resolvedTheme === 'dark'

  const applyTheme = async (newTheme: DarkModeTheme) => {
    if (theme === newTheme) {
      return
    }

    if (typeof window === 'undefined' || !document.startViewTransition) {
      setTheme(newTheme)
      return
    }

    switch (transition.type) {
      case 'none':
        setTheme(newTheme)
        return

      case 'default':
        resetDefaultStyles()
        document.startViewTransition(() => {
          flushSync(() => setTheme(newTheme))
        })
        return

      case 'circular-reveal':
        await handleCircularReveal(newTheme, setTheme, transition)
        return

      case 'custom':
        await handleCustomTransition(newTheme, setTheme, transition)
    }
  }

  return {
    toggle: () => applyTheme(isDarkMode ? 'light' : 'dark'),
    enable: () => applyTheme('dark'),
    disable: () => applyTheme('light'),
    system: () => applyTheme('system'),
  }
}
