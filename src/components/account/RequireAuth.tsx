import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { useAuthSession } from '@/hooks/useAccount'

export function RequireAuth() {
  const { data, isPending } = useAuthSession()
  const location = useLocation()

  if (isPending) {
    return (
      <main id="main" className="section-space">
        <Container>
          <p className="text-muted">Account laden…</p>
        </Container>
      </main>
    )
  }

  if (!data?.user) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/account/inloggen?volgende=${next}`} replace />
  }

  return <Outlet />
}

export function RedirectIfAuthed({ to = '/account/overzicht' }: { to?: string }) {
  const { data, isPending } = useAuthSession()
  if (isPending) return null
  if (data?.user) return <Navigate to={to} replace />
  return <Outlet />
}
