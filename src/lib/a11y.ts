import { useEffect, type RefObject } from 'react'

const SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export function getFocusable(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(SELECTOR)].filter(
    (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true',
  )
}

export function useFocusTrap(
  active: boolean,
  ref: RefObject<HTMLElement | null>,
  onEscape?: () => void,
) {
  useEffect(() => {
    if (!active) return
    const root = ref.current
    if (!root) return

    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const items = getFocusable(root)
    items[0]?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onEscape?.()
        return
      }
      if (event.key !== 'Tab' || !ref.current) return
      const list = getFocusable(ref.current)
      if (!list.length) return
      const first = list[0]
      const last = list[list.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      previous?.focus()
    }
  }, [active, ref, onEscape])
}
