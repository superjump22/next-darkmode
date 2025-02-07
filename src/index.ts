import { useTheme } from 'next-themes'
import { flushSync } from 'react-dom'

export type DarkModeTheme = 'dark' | 'light' | 'system'

export interface DarkModeReturn {
  toggle: () => void
  enable: () => void
  disable: () => void
  system: () => void
}

type CircularRevealCenter =
  | { ref: React.RefObject<HTMLElement | null> }
  | { x: number, y: number }

interface AnimateConfig {
  keyframes: Keyframe[] | PropertyIndexedKeyframes | null
  options?: number | KeyframeAnimationOptions
}

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

const ID_DISABLE_VIEW_TRANSITION_DEFAULT_STYLES = '__next-easy-dark-mode-disable-view-transition-default-styles__'
const ID_ADD_VIEW_TRANSITION_CUSTOM_STYLES = '__next-easy-dark-mode-add-view-transition-custom-styles__'

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

const disableDefaultStyles = () => {
  addDocumentStyles(
    ID_DISABLE_VIEW_TRANSITION_DEFAULT_STYLES,
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

const resetDefaultStyles = () => {
  removeDocumentStyles(ID_DISABLE_VIEW_TRANSITION_DEFAULT_STYLES)
}

export function useDarkMode(transition: DarkModeTransition = { type: 'default' }): DarkModeReturn {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const isDarkMode = resolvedTheme === 'dark'

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
        setTheme(newTheme)
        return

      case 'default':
        resetDefaultStyles()
        document.startViewTransition(() => {
          flushSync(() => setTheme(newTheme))
        })
        return

      case 'circular-reveal': {
        disableDefaultStyles()

        // Get center coordinates
        const { x: centerX, y: centerY } = getCircularRevealCenter(transition.center)

        // Calculate the maximum radius for the circular reveal
        const maxRadius = Math.hypot(
          Math.max(centerX, window.innerWidth - centerX),
          Math.max(centerY, window.innerHeight - centerY),
        )
        // Start view transition
        const viewTransition = document.startViewTransition(() => {
          flushSync(() => setTheme(newTheme))
        })

        try {
          await viewTransition.ready
          // Apply the circular reveal transition
          document.documentElement.animate(
            {
              clipPath: [
                `circle(0px at ${centerX}px ${centerY}px)`,
                `circle(${maxRadius}px at ${centerX}px ${centerY}px)`,
              ],
            },
            {
              duration: transition.duration || 500,
              easing: transition.easing || 'ease-in-out',
              pseudoElement: '::view-transition-new(root)',
            },
          )
        }
        catch {
          // Ignore errors during animation
        }

        try {
          await viewTransition.finished
        }
        finally {
          resetDefaultStyles()
        }
        return
      }

      case 'custom': {
        disableDefaultStyles()
        if (transition.css) {
          addDocumentStyles(ID_ADD_VIEW_TRANSITION_CUSTOM_STYLES, transition.css)
        }

        const viewTransition = document.startViewTransition(() => {
          flushSync(() => setTheme(newTheme))
        })

        try {
          await viewTransition.ready

          if (transition.old) {
            const { keyframes, options } = transition.old
            document.documentElement.animate(
              keyframes,
              typeof options === 'number'
                ? { duration: options, pseudoElement: '::view-transition-new(root)' }
                : { ...options, pseudoElement: '::view-transition-old(root)' },
            )
          }

          if (transition.new) {
            const { keyframes, options } = transition.new
            document.documentElement.animate(
              keyframes,
              typeof options === 'number'
                ? { duration: options, pseudoElement: '::view-transition-new(root)' }
                : { ...options, pseudoElement: '::view-transition-new(root)' },
            )
          }
        }
        catch {
          // Ignore errors during animation
        }

        try {
          await viewTransition.finished
        }
        finally {
          resetDefaultStyles()
          if (transition.css) {
            removeDocumentStyles(ID_ADD_VIEW_TRANSITION_CUSTOM_STYLES)
          }
        }
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
