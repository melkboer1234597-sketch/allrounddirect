import { NavLink } from 'react-router-dom'
import { NAV_CATEGORIES } from '@/config/site'
import { Container } from '@/components/ui/Container'
import { cn } from '@/lib/cn'

export function DesktopNav() {
  return (
    <nav aria-label="Hoofdcategorieën" className="hidden border-t border-line lg:block">
      <Container>
        <ul className="hide-scrollbar flex items-stretch gap-0 overflow-x-auto">
          {NAV_CATEGORIES.map((item) => (
            <li key={item.href} className="shrink-0">
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'nav-link inline-flex h-12 items-center px-3 text-[13px] font-medium whitespace-nowrap transition-colors duration-150 hover:text-brand xl:px-3.5 xl:text-[14px] motion-reduce:transition-none',
                    'accent' in item && item.accent ? 'text-brand' : 'text-ink',
                    isActive && 'text-brand',
                  )
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </Container>
    </nav>
  )
}
