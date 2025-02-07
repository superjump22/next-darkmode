import type { CircularRevealCenter, DarkModeConfig, DarkModeReturn, DarkModeTheme, TransitionType } from './types'
import { useTheme } from 'next-themes'
import { flushSync } from 'react-dom'

/**
 * Gets the center coordinates for circular reveal transition
 */
const getCircularRevealCenter = (config: CircularRevealCenter): { x: number, y: number } => {
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
  // Fallback to center of viewport
  return {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  }
}

const ID_DISABLE_VIEW_TRANSITION_DEFAULT_STYLES = '__next-easy-dark-mode-disable-view-transition-default-styles__'

const disableDefaultStyles = () => {
  let style = document.getElementById(ID_DISABLE_VIEW_TRANSITION_DEFAULT_STYLES) as HTMLStyleElement | null
  if (!style) {
    style = document.createElement('style')
    style.id = ID_DISABLE_VIEW_TRANSITION_DEFAULT_STYLES
    style.textContent = `
      ::view-transition-old(root),
      ::view-transition-new(root) {
        animation: none;
        mix-blend-mode: normal;
      }
    `
    document.head.appendChild(style)
  }
}

const resetDefaultStyles = () => {
  const style = document.getElementById(ID_DISABLE_VIEW_TRANSITION_DEFAULT_STYLES) as HTMLStyleElement | null
  style?.parentNode?.removeChild(style)
}

/**
 * A custom React hook for managing dark mode with smooth transitions.
 *
 * Features:
 * - Synchronizes with system color scheme preferences
 * - Persists theme choice in local storage
 * - Supports View Transitions API for smooth theme switching
 * - Server-side rendering (SSR) compatible
 * - Prevents flash of unstyled content (FOUC)
 * - Provides multiple transition options for theme switching
 *
 * @param config - Configuration options for the hook
 * @returns An object containing the current dark mode state and control functions
 *
 * @example
 * ```tsx
 * // Basic usage with fade transition (default)
 * const { toggle } = useDarkMode()
 *
 * // No transition
 * const { toggle } = useDarkMode({
 *   transition: { type: 'none' }
 * })
 *
 * // Circular reveal from element center
 * const MyComponent = () => {
 *   const buttonRef = useRef<HTMLButtonElement>(null)
 *   const { toggle } = useDarkMode({
 *     transition: {
 *       type: 'circular-reveal',
 *       center: { ref: buttonRef }
 *     },
 *     duration: 300
 *   })
 *
 *   return (
 *     <button ref={buttonRef} onClick={toggle}>
 *       toggle
 *     </button>
 *   )
 * }
 *
 * // Custom transition with clip-path
 * const { toggle } = useDarkMode({
 *   transition: {
 *     type: 'custom',
 *     clipPath: {
 *       from: 'inset(0 0 100% 0)',
 *       to: 'inset(0)'
 *     }
 *   },
 *   duration: 300
 * })
 * ```
 */
export function useDarkMode(config: DarkModeConfig = {}): DarkModeReturn {
  const {
    transition = { type: 'fade' },
    duration = 500,
    easing = 'ease-in-out',
  } = config
  const { theme, resolvedTheme, setTheme } = useTheme()
  const isDarkMode = resolvedTheme === 'dark'

  /**
   * Applies theme change with a smooth transition when supported.
   * Falls back to an instant change if the View Transitions API is not available.
   *
   * @param newTheme - The target theme to apply ('dark', 'light', or 'system')
   */
  const applyTheme = async (newTheme: DarkModeTheme) => {
    if (theme === newTheme) {
      return
    }

    // Early return for SSR or browsers without View Transitions API
    if (typeof window === 'undefined' || !document.startViewTransition) {
      setTheme(newTheme)
      return
    }

    // Handle different transition types
    switch (transition.type) {
      case 'none':
      case 'fade': {
        if (transition.type === 'none') {
          setTheme(newTheme)
          return
        }
        resetDefaultStyles()
        document.startViewTransition(() => {
          flushSync(() => setTheme(newTheme))
        })
        return
      }

      case 'circular-reveal': {
        disableDefaultStyles()

        // Start view transition
        await document.startViewTransition(() => {
          flushSync(() => setTheme(newTheme))
        }).ready

        // Get center coordinates
        const { x: centerX, y: centerY } = getCircularRevealCenter(transition.center)

        // Calculate the maximum radius for the circular reveal
        const maxRadius = Math.hypot(
          Math.max(centerX, window.innerWidth - centerX),
          Math.max(centerY, window.innerHeight - centerY),
        )

        // Apply the circular reveal transition
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${centerX}px ${centerY}px)`,
              `circle(${maxRadius}px at ${centerX}px ${centerY}px)`,
            ],
          },
          {
            duration,
            easing,
            pseudoElement: '::view-transition-new(root)',
          },
        )
        return
      }

      case 'custom': {
        disableDefaultStyles()

        // Start view transition
        await document.startViewTransition(() => {
          flushSync(() => setTheme(newTheme))
        }).ready

        // Apply custom transition
        document.documentElement.animate(
          {
            clipPath: [transition.clipPath.from, transition.clipPath.to],
          },
          {
            duration,
            easing,
            pseudoElement: '::view-transition-new(root)',
          },
        )
      }
    }
  }

  return {
    toggle: () => applyTheme(isDarkMode ? 'light' : 'dark'),
    enable: () => applyTheme('dark'),
    disable: () => applyTheme('light'),
    system: () => applyTheme('system'),
  }
}

export type { CircularRevealCenter as CircularRevealConfig, DarkModeConfig, DarkModeReturn, DarkModeTheme, TransitionType }
