/**
 * Available theme options
 * - 'dark': Forces dark mode appearance
 * - 'light': Forces light mode appearance
 * - 'system': Automatically follows system color scheme preferences
 */
export type DarkModeTheme = 'dark' | 'light' | 'system'

/**
 * Interface defining the hook's return value and available operations
 */
export interface DarkModeReturn {
  /** Toggles between light and dark mode */
  toggle: () => void
  /** Activates dark mode */
  enable: () => void
  /** Activates light mode */
  disable: () => void
  /** Sets theme to follow system preferences */
  system: () => void
}

/**
 * Configuration for circular reveal transition
 */
export type CircularRevealCenter =
  | { ref: React.RefObject<HTMLElement | null> }
  | { x: number, y: number }

/**
 * Transition types for theme switching
 */
export type TransitionType =
  | { type: 'none' | 'fade' }
  | { type: 'circular-reveal', center: CircularRevealCenter }
  | { type: 'custom', clipPath: { from: string, to: string } }

/**
 * Configuration options for the useDarkMode hook
 */
export interface DarkModeConfig {
  /** Optional transition configuration. Default is 'fade' */
  transition?: TransitionType
  /** Optional duration for the transition in milliseconds. Default is 500 */
  duration?: number
  /** Optional easing function for the transition. Default is 'ease-in-out' */
  easing?: string
}
