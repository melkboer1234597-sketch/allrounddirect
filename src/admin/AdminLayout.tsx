import { useState, useEffect } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  ChevronLeft,
  FileText,
  Image,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  Tag,
  Truck,
  Users,
  X,
} from 'lucide-react'
import { assets } from '@/lib/assets'
import { cn } from '@/lib/cn'
import { authClient } from '@/lib/auth-client'
import { useAdminSession } from '@/admin/RequireStaff'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'

const GROUPS = [
  {
    label: 'Overzicht',
    items: [{ to: '/scotdejewish/dashboard', label: 'Dashboard', icon: BarChart3 }],
  },
  {
    label: 'Verkoop',
    items: [
      { to: '/scotdejewish/orders', label: 'Bestellingen', icon: ShoppingCart },
      { to: '/scotdejewish/returns', label: 'Retouren', icon: Package },
      { to: '/scotdejewish/quotes', label: 'Offertes', icon: FileText },
    ],
  },
  {
    label: 'Catalogus',
    items: [
      { to: '/scotdejewish/products', label: 'Producten', icon: Package },
      { to: '/scotdejewish/quality', label: 'Kwaliteit', icon: FileText },
      { to: '/scotdejewish/categories', label: 'Categorieën', icon: Tag },
      { to: '/scotdejewish/brands', label: 'Merken', icon: Tag },
      { to: '/scotdejewish/suppliers', label: 'Leveranciers', icon: Truck },
      { to: '/scotdejewish/imports', label: 'Importeren', icon: FileText },
    ],
  },
  {
    label: 'Klanten',
    items: [{ to: '/scotdejewish/customers', label: 'Klanten', icon: Users }],
  },
  {
    label: 'Marketing',
    items: [
      { to: '/scotdejewish/coupons', label: 'Kortingscodes', icon: Tag },
      { to: '/scotdejewish/content', label: 'Content', icon: FileText },
      { to: '/scotdejewish/seo', label: 'SEO', icon: BarChart3 },
    ],
  },
  {
    label: 'Systeem',
    items: [
      { to: '/scotdejewish/media', label: 'Media', icon: Image },
      { to: '/scotdejewish/users', label: 'Gebruikers', icon: Users },
      { to: '/scotdejewish/settings', label: 'Instellingen', icon: Settings },
      { to: '/scotdejewish/email-preview', label: 'E-mail preview', icon: FileText },
      { to: '/scotdejewish/audit-log', label: 'Auditlog', icon: FileText },
    ],
  },
] as const

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { admin } = useAdminSession()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  useBodyScrollLock(mobileOpen)

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  async function logout() {
    await authClient.signOut()
    navigate('/scotdejewish/login')
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-2 border-b border-white/10 px-3">
        <img src={assets.logoWhite} alt="AllRound Direct" className="h-7 w-auto object-contain" />
        {!collapsed ? (
          <span className="text-[11px] font-semibold tracking-[0.08em] text-white/70 uppercase">
            Beheer
          </span>
        ) : null}
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Beheer">
        {GROUPS.map((group) => (
          <div key={group.label} className="mb-4">
            {!collapsed ? (
              <p className="px-2 pb-1 text-[10px] font-semibold tracking-[0.08em] text-white/45 uppercase">
                {group.label}
              </p>
            ) : null}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'flex min-h-10 items-center gap-2 rounded-[4px] px-2 text-[13px] font-medium',
                          isActive ? 'bg-brand text-white' : 'text-white/80 hover:bg-white/10',
                        )
                      }
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!collapsed ? item.label : null}
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
      <button
        type="button"
        className="hidden min-h-11 items-center gap-2 border-t border-white/10 px-3 text-[12px] text-white/70 lg:flex"
        onClick={() => setCollapsed((value) => !value)}
      >
        <ChevronLeft className={cn('h-4 w-4', collapsed && 'rotate-180')} />
        {!collapsed ? 'Inklappen' : null}
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f3f5f8]">
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-navy/50 lg:hidden"
          aria-label="Menu sluiten"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 bg-navy text-white transition-transform lg:translate-x-0',
          collapsed ? 'w-[72px]' : 'w-[240px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        {sidebar}
      </aside>
      <div className={cn('min-h-screen', collapsed ? 'lg:pl-[72px]' : 'lg:pl-[240px]')}>
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-white px-4">
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <p className="text-[13px] text-muted">{admin.data?.user.email}</p>
          <button type="button" className="text-[13px] text-brand hover:underline" onClick={logout}>
            Uitloggen
          </button>
        </header>
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
