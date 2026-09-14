import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  FileText,
  Heart,
  LayoutDashboard,
  Lock,
  MapPin,
  Package,
  RotateCcw,
  Shield,
  UserRound,
} from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { cn } from '@/lib/cn'
import { useAccount } from '@/hooks/useAccount'

export const ACCOUNT_NAV = [
  { to: '/account/overzicht', label: 'Overzicht', icon: LayoutDashboard },
  { to: '/account/bestellingen', label: 'Bestellingen', icon: Package },
  { to: '/account/facturen', label: 'Facturen', icon: FileText },
  { to: '/account/retouren', label: 'Retouren', icon: RotateCcw },
  { to: '/account/adressen', label: 'Adressen', icon: MapPin },
  { to: '/account/favorieten', label: 'Favorieten', icon: Heart },
  { to: '/account/gegevens', label: 'Mijn gegevens', icon: UserRound },
  { to: '/account/beveiliging', label: 'Beveiliging', icon: Lock },
  { to: '/account/privacy', label: 'Privacy', icon: Shield },
] as const

export function AccountLayout() {
  const { user } = useAccount()
  const location = useLocation()
  const navigate = useNavigate()
  const navValue = ACCOUNT_NAV.some((item) => item.to === location.pathname)
    ? location.pathname
    : location.pathname.startsWith('/account/bestellingen/')
      ? '/account/bestellingen'
      : '/account/overzicht'

  return (
    <main id="main" className="bg-surface py-6 md:py-10">
      <Container>
        <div className="mb-5 lg:hidden">
          <p className="text-[13px] text-muted">Mijn account</p>
          <p className="font-heading text-[24px] font-semibold text-navy lg:hidden">
            {user.firstName ? `Welkom terug, ${user.firstName}` : 'Mijn account'}
          </p>
          <label className="mt-3 block text-[13px] font-medium text-ink" htmlFor="account-nav">
            Navigatie
          </label>
          <select
            id="account-nav"
            className="mt-1 h-11 w-full rounded-[4px] border border-line bg-white px-3 text-[15px]"
            value={navValue}
            onChange={(event) => navigate(event.target.value)}
          >
            {ACCOUNT_NAV.map((item) => (
              <option key={item.to} value={item.to}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
          <aside className="hidden lg:block">
            <div className="rounded-[12px] bg-white p-4 ring-1 ring-line">
              <p className="px-2 text-[12px] font-semibold tracking-[0.06em] text-muted uppercase">
                Account
              </p>
              <nav className="mt-3 space-y-0.5" aria-label="Account">
                {ACCOUNT_NAV.map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        cn(
                          'flex min-h-11 items-center gap-2 rounded-[4px] px-2 text-[14px] font-medium',
                          isActive ? 'bg-navy text-white' : 'text-ink hover:bg-surface',
                        )
                      }
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.7} />
                      {item.label}
                    </NavLink>
                  )
                })}
              </nav>
            </div>
          </aside>
          <div className="min-w-0">
            <Outlet />
          </div>
        </div>
      </Container>
    </main>
  )
}
