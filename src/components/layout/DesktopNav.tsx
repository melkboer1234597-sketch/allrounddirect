import { useEffect, useId, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { CATALOG_TAXONOMY, flattenTaxonomyChildren, type TaxonomyRoot } from '@/data/taxonomy'
import { Container } from '@/components/ui/Container'
import { cn } from '@/lib/cn'
import { useHomeMedia } from '@/hooks/useHomeMedia'

const OPEN_DELAY = 120
const CLOSE_DELAY = 220

export function DesktopNav() {
  const [openSlug, setOpenSlug] = useState<string | null>(null)
  const { data: homeMedia } = useHomeMedia()
  const openTimer = useRef<number | undefined>(undefined)
  const closeTimer = useRef<number | undefined>(undefined)
  const navRef = useRef<HTMLElement>(null)
  const labelId = useId()

  function clearTimers() {
    window.clearTimeout(openTimer.current)
    window.clearTimeout(closeTimer.current)
  }

  function scheduleOpen(slug: string) {
    clearTimers()
    openTimer.current = window.setTimeout(() => setOpenSlug(slug), OPEN_DELAY)
  }

  function scheduleClose() {
    clearTimers()
    closeTimer.current = window.setTimeout(() => setOpenSlug(null), CLOSE_DELAY)
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpenSlug(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const active = CATALOG_TAXONOMY.find((item) => item.slug === openSlug)

  return (
    <nav
      ref={navRef}
      aria-label="Hoofdcategorieën"
      className="relative hidden border-t border-line lg:block"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setOpenSlug(null)
        }
      }}
    >
      <Container>
        <ul className="flex items-stretch">
          {CATALOG_TAXONOMY.map((item) => (
            <li
              key={item.slug}
              onMouseEnter={() => scheduleOpen(item.slug)}
              onMouseLeave={scheduleClose}
            >
              <NavLink
                to={`/${item.slug}`}
                aria-expanded={openSlug === item.slug}
                aria-haspopup="true"
                onFocus={() => setOpenSlug(item.slug)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') setOpenSlug(null)
                }}
                className={({ isActive }) =>
                  cn(
                    'nav-link inline-flex h-12 items-center px-3 text-[13px] font-medium whitespace-nowrap hover:text-brand xl:px-3.5 xl:text-[14px]',
                    item.accent ? 'text-brand' : 'text-ink',
                    isActive && 'text-brand',
                  )
                }
              >
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </Container>
      {active ? (
        <div
          className="absolute inset-x-0 top-full z-40 border-b border-line bg-white shadow-[0_12px_30px_-20px_rgba(7,31,63,0.35)]"
          onMouseEnter={clearTimers}
          onMouseLeave={scheduleClose}
        >
          <MegaPanel
            category={active}
            coverSrc={homeMedia?.bySlug[active.slug] || active.image}
            labelledBy={labelId}
            onNavigate={() => setOpenSlug(null)}
          />
        </div>
      ) : null}
    </nav>
  )
}

function MegaPanel({
  category,
  coverSrc,
  labelledBy,
  onNavigate,
}: {
  category: TaxonomyRoot
  coverSrc?: string
  labelledBy: string
  onNavigate: () => void
}) {
  const flat = flattenTaxonomyChildren(category)
  const popular = category.popular
    .map((slug) => flat.find((item) => item.node.slug === slug))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
  const rest = category.children

  return (
    <Container className="grid grid-cols-12 gap-8 py-8">
      <div
        className="col-span-12 grid grid-cols-12 gap-8"
        role="region"
        aria-labelledby={labelledBy}
      >
        <p id={labelledBy} className="sr-only">
          {category.name}
        </p>
        <div className="col-span-3">
          <p className="text-[12px] font-semibold tracking-wide text-muted uppercase">Populair</p>
          <ul className="mt-3 space-y-1">
            {popular.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  onClick={onNavigate}
                  className="block min-h-10 py-1.5 text-[14px] hover:text-brand"
                >
                  {item.node.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-span-3">
          <p className="text-[12px] font-semibold tracking-wide text-muted uppercase">
            Categorieën
          </p>
          <ul className="mt-3 space-y-1">
            {rest.map((item) => (
              <li key={item.slug}>
                <Link
                  to={`/${category.slug}/${item.slug}`}
                  onClick={onNavigate}
                  className="block min-h-10 py-1.5 text-[14px] hover:text-brand"
                >
                  {item.name}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to={`/${category.slug}`}
                onClick={onNavigate}
                className="block min-h-10 py-1.5 text-[14px] font-medium text-brand"
              >
                Alles in {category.name}
              </Link>
            </li>
          </ul>
        </div>
        <div className="col-span-3">
          <p className="text-[12px] font-semibold tracking-wide text-muted uppercase">Toepassing</p>
          <ul className="mt-3 space-y-1">
            {category.rooms.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  onClick={onNavigate}
                  className="block min-h-10 py-1.5 text-[14px] hover:text-brand"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <Link
          to={`/${category.slug}`}
          onClick={onNavigate}
          className="col-span-3 overflow-hidden rounded-[12px]"
        >
          {coverSrc ? (
            <img src={coverSrc} alt="" className="h-44 w-full object-cover" />
          ) : (
            <div className="h-44 w-full bg-navy" />
          )}
          <span className="mt-2 block text-[14px] font-medium">{category.name}</span>
        </Link>
      </div>
    </Container>
  )
}
