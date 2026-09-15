import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'text'
  | 'ghost'
  | 'onDark'
  | 'onDarkOutline'

type ButtonSize = 'md' | 'sm'

const base =
  'inline-flex items-center justify-center gap-2 rounded-[8px] text-[15px] font-medium leading-none transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none'

const sizes: Record<ButtonSize, string> = {
  md: 'min-h-12 px-5',
  sm: 'min-h-11 px-4',
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-hover active:bg-brand-active',
  secondary:
    'bg-white text-navy ring-1 ring-line hover:ring-navy/30 hover:bg-surface active:bg-line',
  outline: 'bg-transparent text-white ring-1 ring-white/80 hover:bg-white/10 active:bg-white/16',
  text: 'min-h-11 px-1.5 text-brand hover:underline active:text-brand-active',
  ghost: 'bg-transparent text-navy hover:bg-surface active:bg-line',
  onDark: 'bg-white text-navy hover:bg-surface active:bg-line',
  onDarkOutline: 'bg-transparent text-white ring-1 ring-white/70 hover:bg-white/10',
}

type Common = {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  children: ReactNode
  to?: string
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  to,
  type = 'button',
  disabled,
  onClick,
  ...rest
}: Common & ButtonHTMLAttributes<HTMLButtonElement> & { to?: string }) {
  const classes = cn(base, sizes[size], variants[variant], className)

  if (to) {
    if (disabled) {
      return (
        <span className={cn(classes, 'pointer-events-none opacity-50')} aria-disabled="true">
          {children}
        </span>
      )
    }
    return (
      <Link
        to={to}
        className={classes}
        onClick={onClick as ((event: MouseEvent<HTMLAnchorElement>) => void) | undefined}
      >
        {children}
      </Link>
    )
  }

  return (
    <button type={type} className={classes} disabled={disabled} onClick={onClick} {...rest}>
      {children}
    </button>
  )
}
