import { useQuery } from '@tanstack/react-query'
import { Navigate, Outlet } from 'react-router-dom'
import { adminFetch } from '@/lib/admin-api'
import { useAuthSession } from '@/hooks/useAccount'

export function useAdminSession() {
  const session = useAuthSession()
  const admin = useQuery({
    queryKey: ['admin', 'session'],
    queryFn: () => adminFetch<{ user: { id: string; email: string; role: string } }>('/session'),
    enabled: Boolean(session.data?.user),
    retry: false,
  })
  return { session, admin }
}

export function RequireStaff() {
  const { session, admin } = useAdminSession()

  if (session.isPending || (session.data?.user && admin.isPending)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy text-white">
        Beheer laden…
      </div>
    )
  }

  if (!session.data?.user) {
    return <Navigate to="/scotdejewish/login" replace />
  }

  if (admin.error) {
    return <Navigate to="/scotdejewish/login" replace />
  }

  return <Outlet />
}
