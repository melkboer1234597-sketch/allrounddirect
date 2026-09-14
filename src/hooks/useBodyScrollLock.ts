import { useEffect } from 'react'
import { lockBodyScroll } from '@/lib/scroll'

/** Locks document scroll while `active` is true; safe with nested overlays. */
export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    return lockBodyScroll()
  }, [active])
}
