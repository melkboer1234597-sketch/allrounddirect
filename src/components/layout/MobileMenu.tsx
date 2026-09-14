import { useEffect, useId, useRef } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { CircleUserRound, Headset, PackageSearch, Phone, X } from 'lucide-react'
import { NAV_CATEGORIES } from '@/config/site'
import { assets } from '@/lib/assets'
import { cn } from '@/lib/cn'

type MobileMenuProps = {
  open: boolean
  onClose: () => void
}

const SECONDARY = [
  { label: 'Account', href: '/account', icon: CircleUserRound },
  { label: 'Klantenservice', href: '/klantenservice', icon: Headset },
  { label: 'Bestelling volgen', href: '/bestelling-volgen', icon: PackageSearch },
  { label: 'Contact', href: '/contact', icon: Phone },
] as const

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()

  useEffect(() => {
    if (!open) return

    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
      if (event.key !== 'Tab' || !panelRef.current) return

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
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
      document.body.style.overflow = previous
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  return (
    <div
      className={cn('lg:hidden', open ? 'pointer-events-auto' : 'pointer-events-none')}
      aria-hidden={!open}
    >
      <div
        className={cn(
          'fixed inset-0 z-40 bg-navy/45 transition-opacity duration-200 motion-reduce:transition-none',
          open ? 'opacity-100' : 'opacity-0',
        )}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        id="mobile-menu"
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[min(100%,340px)] flex-col bg-white shadow-[4px_0_24px_rgba(7,31,63,0.12)] transition-transform duration-200 ease-out motion-reduce:transition-none',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-line px-3">
          <Link to="/" onClick={onClose} className="flex items-center isolate bg-white pl-1">
            <img
              src={assets.logoHeader}
              alt="AllRound Direct"
              className="logo-on-light h-8 w-auto max-w-[180px] object-contain"
            />
            <span id={titleId} className="sr-only">
              Menu
            </span>
          </Link>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Menu sluiten"
            className="inline-flex h-11 w-11 items-center justify-center rounded-[4px] text-ink hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <X className="h-5 w-5" strokeWidth={1.6} />
          </button>
        </div>

        <nav aria-label="Mobiel menu" className="flex-1 overflow-y-auto">
          <p className="px-5 pt-4 pb-1 text-[11px] font-semibold tracking-[0.08em] text-muted uppercase">
            Assortiment
          </p>
          <ul>
            {NAV_CATEGORIES.map((item) => (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex min-h-11 items-center px-5 text-[16px] font-medium',
                      'accent' in item && item.accent ? 'text-brand' : 'text-ink',
                      isActive && 'bg-surface text-brand',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="mt-2 border-t border-line">
            <p className="px-5 pt-4 pb-1 text-[11px] font-semibold tracking-[0.08em] text-muted uppercase">
              Account en service
            </p>
            {SECONDARY.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={onClose}
                  className="flex min-h-11 items-center gap-3 px-5 text-[15px] text-ink hover:bg-surface"
                >
                  <Icon className="h-[18px] w-[18px] text-muted" strokeWidth={1.75} aria-hidden />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}
