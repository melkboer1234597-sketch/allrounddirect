import { useEffect, useId, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { suggestSearch } from '@/services/catalog'
import { cn } from '@/lib/cn'
import { productPath } from '@/services/catalog'

const RECENT_KEY = 'allround-recent-searches'

function readRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    return raw ? (JSON.parse(raw) as string[]).slice(0, 5) : []
  } catch {
    return []
  }
}

function writeRecent(term: string) {
  const next = [term, ...readRecent().filter((item) => item !== term)].slice(0, 5)
  localStorage.setItem(RECENT_KEY, JSON.stringify(next))
}

type SearchAutocompleteProps = {
  id?: string
  compact?: boolean
  className?: string
}

export function SearchAutocomplete({
  id = 'site-search',
  compact = false,
  className,
}: SearchAutocompleteProps) {
  const navigate = useNavigate()
  const listId = useId()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [recent, setRecent] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<{
    categories: Array<{ name: string; href: string }>
    products: Array<{ name: string; href: string }>
    brands: string[]
  }>({ categories: [], products: [], brands: [] })
  const timer = useRef<number | undefined>(undefined)
  const rootRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    return () => document.removeEventListener('mousedown', onPointer)
  }, [])

  useEffect(() => {
    setRecent(readRecent())
  }, [])

  useEffect(() => {
    window.clearTimeout(timer.current)
    if (query.trim().length < 2) {
      setSuggestions({ categories: [], products: [], brands: [] })
      return
    }
    timer.current = window.setTimeout(() => {
      void suggestSearch(query).then((result) => {
        setSuggestions({
          categories: result.categories,
          products: result.products.map((item) => ({ name: item.name, href: productPath(item) })),
          brands: result.brands,
        })
      })
    }, 200)
    return () => window.clearTimeout(timer.current)
  }, [query])

  const items = [
    ...recent
      .filter((_item) => query.length < 2)
      .map((item) => ({
        type: 'recent' as const,
        label: item,
        href: `/zoeken?q=${encodeURIComponent(item)}`,
      })),
    ...suggestions.categories.map((item) => ({
      type: 'category' as const,
      label: item.name,
      href: item.href,
    })),
    ...suggestions.brands.map((item) => ({
      type: 'brand' as const,
      label: item,
      href: `/zoeken?q=${encodeURIComponent(item)}`,
    })),
    ...suggestions.products.map((item) => ({
      type: 'product' as const,
      label: item.name,
      href: item.href,
    })),
  ]

  function go(href: string, term?: string) {
    if (term) writeRecent(term)
    setOpen(false)
    navigate(href)
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    const value = query.trim()
    if (!value) {
      navigate('/zoeken')
      return
    }
    writeRecent(value)
    navigate(`/zoeken?q=${encodeURIComponent(value)}`)
    setOpen(false)
  }

  return (
    <form
      role="search"
      onSubmit={onSubmit}
      className={cn('relative w-full', className)}
      ref={rootRef}
    >
      <label htmlFor={id} className="sr-only">
        Zoeken
      </label>
      <div className="flex h-11 items-center rounded-[4px] bg-surface ring-1 ring-line focus-within:ring-2 focus-within:ring-brand">
        <Search
          className="ml-3 h-[18px] w-[18px] shrink-0 text-muted"
          strokeWidth={1.75}
          aria-hidden
        />
        <input
          id={id}
          type="search"
          role="combobox"
          aria-expanded={open && items.length > 0}
          aria-controls={listId}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-activedescendant={items[active] ? `${listId}-${active}` : undefined}
          value={query}
          autoComplete="off"
          placeholder={
            compact ? 'Zoek producten of categorieën' : 'Zoek naar producten, categorieën of merken'
          }
          className="h-full min-w-0 flex-1 bg-transparent px-2.5 text-[15px] text-ink outline-none placeholder:text-muted"
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
            setActive(0)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setOpen(false)
              return
            }
            if (event.key === 'ArrowDown') {
              event.preventDefault()
              setActive((index) => Math.min(items.length - 1, index + 1))
            }
            if (event.key === 'ArrowUp') {
              event.preventDefault()
              setActive((index) => Math.max(0, index - 1))
            }
            if (event.key === 'Enter' && open && items[active]) {
              event.preventDefault()
              go(items[active].href, query.trim())
            }
          }}
        />
        <button
          type="submit"
          className="mr-1 inline-flex h-9 items-center rounded-[4px] px-3 text-[13px] font-medium text-brand"
        >
          Zoek
        </button>
      </div>
      {open && items.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute top-[calc(100%+4px)] z-50 max-h-80 w-full overflow-auto rounded-[4px] bg-white py-2 shadow-lg ring-1 ring-line"
        >
          {items.map((item, index) => (
            <li
              key={`${item.type}-${item.label}-${index}`}
              role="option"
              id={`${listId}-${index}`}
              aria-selected={index === active}
            >
              <Link
                to={item.href}
                className={cn(
                  'block px-3 py-2 text-[14px] hover:bg-surface',
                  index === active && 'bg-surface',
                )}
                onClick={() => {
                  writeRecent(query.trim() || item.label)
                  setOpen(false)
                }}
              >
                <span className="text-[11px] text-muted uppercase">
                  {item.type === 'recent'
                    ? 'Recent'
                    : item.type === 'category'
                      ? 'Categorie'
                      : item.type === 'brand'
                        ? 'Merk'
                        : 'Product'}
                </span>
                <span className="mt-0.5 block">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </form>
  )
}
