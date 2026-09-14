import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CircleUserRound, Heart, Menu, ShoppingBag } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { DesktopNav } from '@/components/layout/DesktopNav'
import { MobileMenu } from '@/components/layout/MobileMenu'
import { Container } from '@/components/ui/Container'
import { IconButton } from '@/components/ui/IconButton'
import { IconLink } from '@/components/ui/IconLink'
import { SearchAutocomplete } from '@/components/search/SearchAutocomplete'
import { useAuthSession } from '@/hooks/useAccount'
import { useScrolled } from '@/hooks/useScrolled'
import { assets } from '@/lib/assets'
import { useCart } from '@/lib/cart'
import { cn } from '@/lib/cn'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const scrolled = useScrolled(12)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const { pathname } = useLocation()
  const session = useAuthSession()
  const { count } = useCart()
  const accountHref = session.data?.user ? '/account/overzicht' : '/account'

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  function closeMenu() {
    setMenuOpen(false)
    menuButtonRef.current?.focus()
  }

  return (
    <header>
      <TopBar />
      <div
        className={cn(
          'sticky top-0 z-30 isolate bg-white transition-shadow duration-150 motion-reduce:transition-none',
          scrolled
            ? 'border-b border-line shadow-[0_8px_16px_-12px_rgba(7,31,63,0.2)]'
            : 'border-b border-line',
        )}
      >
        <Container className="flex h-14 items-center gap-1 min-[375px]:gap-2 md:h-16 lg:h-[72px] lg:gap-8">
          <IconButton
            ref={menuButtonRef}
            label="Menu openen"
            className="-ml-1 lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <Menu className="h-5 w-5" strokeWidth={1.6} />
          </IconButton>

          <Link to="/" className="flex min-w-0 shrink items-center">
            <img
              src={assets.logoHeader}
              alt="AllRound Direct"
              className="h-7 w-auto max-w-[148px] object-contain min-[375px]:h-8 min-[375px]:max-w-[176px] sm:max-w-[200px] lg:h-10 lg:max-w-[236px]"
            />
          </Link>

          <div className="hidden min-w-0 flex-1 justify-center lg:flex">
            <SearchAutocomplete id="header-search" className="w-full max-w-[640px]" />
          </div>

          <div className="ml-auto flex items-center">
            <IconLink to={accountHref} label="Account">
              <CircleUserRound className="h-5 w-5" strokeWidth={1.6} />
            </IconLink>
            <IconLink
              to="/favorieten"
              label="Favorieten"
              className="hidden min-[400px]:inline-flex"
            >
              <Heart className="h-5 w-5" strokeWidth={1.6} />
            </IconLink>
            <IconLink to="/winkelwagen" label="Winkelwagen" badge={count || undefined}>
              <ShoppingBag className="h-5 w-5" strokeWidth={1.6} />
            </IconLink>
          </div>
        </Container>

        <Container className="pb-3 lg:hidden">
          <SearchAutocomplete id="mobile-search" compact />
        </Container>
        <DesktopNav />
      </div>
      <MobileMenu open={menuOpen} onClose={closeMenu} />
    </header>
  )
}
