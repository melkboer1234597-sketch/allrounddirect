import { Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState, type FormEvent } from 'react'
import { cn } from '@/lib/cn'

type SearchFormProps = {
  className?: string
  id?: string
  compact?: boolean
}

export function SearchForm({ className, id = 'site-search', compact = false }: SearchFormProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = query.trim()
    navigate(value ? `/zoeken?q=${encodeURIComponent(value)}` : '/zoeken')
  }

  return (
    <form role="search" onSubmit={onSubmit} className={cn('w-full', className)}>
      <label htmlFor={id} className="sr-only">
        Zoeken
      </label>
      <div className="flex h-11 items-center rounded-[8px] bg-surface ring-1 ring-line focus-within:ring-2 focus-within:ring-brand">
        <Search
          className="ml-3 h-[18px] w-[18px] shrink-0 text-muted"
          strokeWidth={1.75}
          aria-hidden
        />
        <input
          id={id}
          type="search"
          name="q"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={
            compact ? 'Zoek producten of categorieën' : 'Zoek naar producten, categorieën of merken'
          }
          className="h-full min-w-0 flex-1 bg-transparent px-2.5 text-[15px] text-ink outline-none placeholder:text-muted"
        />
        <button
          type="submit"
          className="mr-1 inline-flex h-9 items-center justify-center rounded-[4px] px-3 text-[13px] font-medium text-brand hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Zoek
        </button>
      </div>
    </form>
  )
}
