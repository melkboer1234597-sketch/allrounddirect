import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { cn } from '@/lib/cn'

export function AuthCard({
  title,
  description,
  children,
  className,
  panelClassName,
}: {
  title: string
  description?: string
  children: ReactNode
  className?: string
  panelClassName?: string
}) {
  return (
    <main
      id="main"
      className={cn(
        'page-shell flex min-h-[calc(100dvh-var(--app-header-offset))] flex-col justify-center bg-surface pb-16 md:pb-20',
        className,
      )}
    >
      <Container>
        <div
          className={cn(
            'mx-auto w-full max-w-md rounded-[12px] bg-white px-6 py-7 ring-1 ring-line sm:px-8 sm:py-8',
            panelClassName,
          )}
        >
          <h1 className="font-heading text-[26px] leading-tight font-semibold tracking-[-0.02em] text-ink md:text-[28px]">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 text-[15px] leading-relaxed text-muted">{description}</p>
          ) : null}
          <div className="mt-6">{children}</div>
        </div>
      </Container>
    </main>
  )
}

export function AuthLinks() {
  return (
    <p className="mt-6 text-center text-[14px] text-muted">
      <Link to="/account/inloggen" className="text-brand hover:underline">
        Inloggen
      </Link>
      {' · '}
      <Link to="/account/registreren" className="text-brand hover:underline">
        Account aanmaken
      </Link>
    </p>
  )
}
