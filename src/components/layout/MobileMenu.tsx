import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import {
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Heart,
  Headset,
  PackageSearch,
  Phone,
  X,
} from 'lucide-react'
import { useFocusTrap } from '@/lib/a11y'
import { CATALOG_TAXONOMY, type TaxonomyRoot } from '@/data/taxonomy'
import { assets } from '@/lib/assets'
import { cn } from '@/lib/cn'

type MobileMenuProps = {
  open: boolean
  onClose: () => void
}

const SECONDARY = [
  { label: 'Account', href: '/account', icon: CircleUserRound },
  { label: 'Favorieten', href: '/favorieten', icon: Heart },
  { label: 'Klantenservice', href: '/klantenservice', icon: Headset },
  { label: 'Bestelling volgen', href: '/bestelling-volgen', icon: PackageSearch },
  { label: 'Contact', href: '/contact', icon: Phone },
] as const

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const [drill, setDrill] = useState<TaxonomyRoot | null>(null)
  useFocusTrap(open, panelRef, () => {
    if (drill) setDrill(null)
    else onClose()
  })
  useBodyScrollLock(open)

  useEffect(() => {
    if (!open) setDrill(null)
  }, [open])

  return (
    <div
      className={cn('lg:hidden', open ? 'pointer-events-auto' : 'pointer-events-none')}
      aria-hidden={!open}
    >
      <div
        className={cn(
          'fixed inset-0 z-40 bg-navy/45 transition-opacity duration-200',
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
          'fixed inset-y-0 left-0 z-50 flex w-[min(100%,360px)] flex-col bg-white shadow-[4px_0_24px_rgba(7,31,63,0.12)] transition-transform duration-200 ease-out',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
        inert={open ? undefined : true}
      >
        <div className="flex h-14 items-center justify-between border-b border-line px-3">
          <Link to="/" onClick={onClose} className="flex items-center pl-1">
            <img
              src={assets.logoHeader}
              alt="AllRound Direct"
              className="h-8 w-auto max-w-[180px] object-contain"
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
            className="inline-flex h-11 w-11 items-center justify-center rounded-[4px] text-ink hover:bg-surface"
          >
            <X className="h-5 w-5" strokeWidth={1.6} />
          </button>
        </div>

        {drill ? (
          <nav className="flex-1 overflow-y-auto" aria-label={drill.name}>
            <button
              type="button"
              onClick={() => setDrill(null)}
              className="flex min-h-12 w-full items-center gap-2 border-b border-line px-4 text-[15px] font-medium"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Terug
            </button>
            <Link
              to={`/${drill.slug}`}
              onClick={onClose}
              className="flex min-h-12 items-center px-4 text-[16px] font-semibold text-brand"
            >
              Alles in {drill.name}
            </Link>
            <ul>
              {drill.children.map((child) => (
                <li key={child.slug}>
                  <Link
                    to={`/${drill.slug}/${child.slug}`}
                    onClick={onClose}
                    className="flex min-h-12 items-center px-4 text-[16px] text-ink"
                  >
                    {child.name}
                  </Link>
                  {child.children?.length ? (
                    <ul className="pb-2">
                      {child.children.map((leaf) => (
                        <li key={leaf.slug}>
                          <Link
                            to={`/${drill.slug}/${child.slug}/${leaf.slug}`}
                            onClick={onClose}
                            className="flex min-h-11 items-center px-4 pl-8 text-[15px] text-muted"
                          >
                            {leaf.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          </nav>
        ) : (
          <nav aria-label="Mobiel menu" className="flex-1 overflow-y-auto">
            <p className="px-5 pt-4 pb-1 text-[11px] font-semibold tracking-[0.08em] text-muted uppercase">
              Categorieën
            </p>
            <ul>
              {CATALOG_TAXONOMY.map((item) => (
                <li key={item.slug}>
                  <button
                    type="button"
                    onClick={() => setDrill(item)}
                    className={cn(
                      'flex min-h-12 w-full items-center justify-between px-5 text-[16px] font-medium',
                      item.accent ? 'text-brand' : 'text-ink',
                    )}
                  >
                    {item.name}
                    <ChevronRight className="h-4 w-4 text-muted" aria-hidden />
                  </button>
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
                    className="flex min-h-12 items-center gap-3 px-5 text-[15px] text-ink"
                  >
                    <Icon className="h-[18px] w-[18px] text-muted" strokeWidth={1.75} aria-hidden />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </nav>
        )}
      </div>
    </div>
  )
}
