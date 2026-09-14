import type { ButtonHTMLAttributes, ReactNode } from 'react'
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

const base =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-[4px] px-5 text-[15px] font-medium leading-none transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-hover active:bg-brand-active',
  secondary:
    'bg-white text-navy ring-1 ring-navy/20 hover:bg-navy hover:text-white active:bg-navy',
  outline: 'bg-transparent text-white ring-1 ring-white/80 hover:bg-white/10 active:bg-white/16',
  text: 'px-2 text-brand hover:underline active:text-brand-active',
  ghost: 'bg-transparent text-navy hover:bg-surface active:bg-line',
  onDark: 'bg-white text-navy hover:bg-surface active:bg-line',
  onDarkOutline: 'bg-transparent text-white ring-1 ring-white/70 hover:bg-white/10',
}

type Common = {
  variant?: ButtonVariant
  className?: string
  children: ReactNode
}

export function Button({
  variant = 'primary',
  className,
  children,
  to,
  ...rest
}: Common & ButtonHTMLAttributes<HTMLButtonElement> & { to?: string }) {
  const classes = cn(base, variants[variant], className)

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  )
}
