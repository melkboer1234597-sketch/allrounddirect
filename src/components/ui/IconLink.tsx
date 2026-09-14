import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'

type IconLinkProps = {
  to: string
  label: string
  badge?: number
  className?: string
  children: React.ReactNode
}

export function IconLink({ to, label, badge, className, children }: IconLinkProps) {
  return (
    <Link
      to={to}
      aria-label={label}
      className={cn(
        'relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[4px] text-ink transition-colors duration-150 hover:bg-surface active:bg-line focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transition-none',
        className,
      )}
    >
      {children}
      {typeof badge === 'number' ? (
        <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] leading-none font-semibold text-white">
          {badge}
        </span>
      ) : null}
    </Link>
  )
}
