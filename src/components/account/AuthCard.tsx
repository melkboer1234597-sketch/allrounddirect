import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Container } from '@/components/ui/Container'

export function AuthCard({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <main id="main" className="bg-surface py-10 md:py-16">
      <Container>
        <div className="mx-auto max-w-md rounded-[12px] bg-white p-6 shadow-[0_8px_30px_-18px_rgba(7,31,63,0.35)] ring-1 ring-line md:p-8">
          <h1 className="font-heading text-[28px] leading-tight font-semibold text-navy">
            {title}
          </h1>
          {description ? <p className="mt-2 text-[15px] text-muted">{description}</p> : null}
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
