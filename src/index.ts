import type { CircularRevealConfig, DarkModeConfig, DarkModeReturn, DarkModeTheme } from './types'
import { useTheme } from 'next-themes'
import { flushSync } from 'react-dom'

/**
 * Gets the center coordinates for circular reveal transition
 */
const getCircularRevealCenter = (config: CircularRevealConfig): { x: number, y: number } => {
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
 * // Circular reveal from element center
 * const MyComponent = () => {
 *   const buttonRef = useRef<HTMLButtonElement>(null);
 *   const { isDarkMode, toggle } = useDarkMode({
 *     transition: {
 *       type: 'circular-reveal',
 *       center: { ref: buttonRef }
 *     },
 *     duration: 300
 *   });
 *
 *   return (
 *     <button ref={buttonRef} onClick={toggle}>
 *       {isDarkMode ? '🌞' : '🌙'}
 *     </button>
 *   );
 * };
 *
 * // Circular reveal from specific coordinates
 * const { isDarkMode, toggle } = useDarkMode({
 *   transition: {
 *     type: 'circular-reveal',
 *     center: { x: 100, y: 100 }
 *   },
 *   duration: 300
 * });
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

    const CIRCULAR_REVEAL_STYLE_ID = '__next-dark-mode-circular-reveal-styles__'

    // Handle different transition types
    switch (transition.type) {
      case 'none': {
        setTheme(newTheme)
        return
      }

      case 'fade': {
        const style = document.getElementById(CIRCULAR_REVEAL_STYLE_ID) as HTMLStyleElement | null
        style?.parentNode?.removeChild(style)
        document.startViewTransition(() => {
          flushSync(() => setTheme(newTheme))
        })
        return
      }

      case 'circular-reveal': {
        // Create or retrieve the style element for view transitions
        let style = document.getElementById(CIRCULAR_REVEAL_STYLE_ID) as HTMLStyleElement | null
        if (!style) {
          style = document.createElement('style')
          style.id = CIRCULAR_REVEAL_STYLE_ID
          style.textContent = `
            ::view-transition-old(root),
            ::view-transition-new(root) {
              animation: none;
              mix-blend-mode: normal;
            }
          `
          document.head.appendChild(style)
        }

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
        const style = document.getElementById(CIRCULAR_REVEAL_STYLE_ID) as HTMLStyleElement | null
        style?.parentNode?.removeChild(style)

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
    isDarkMode,
    toggle: () => applyTheme(isDarkMode ? 'light' : 'dark'),
    enable: () => applyTheme('dark'),
    disable: () => applyTheme('light'),
    system: () => applyTheme('system'),
  }
}

export type { DarkModeConfig, DarkModeReturn, DarkModeTheme }
