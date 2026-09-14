import { Link, Outlet } from 'react-router-dom'
import { assets } from '@/lib/assets'

/** Distraction-free shell for checkout — no mega menu. */
export function CheckoutLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <a href="#main" className="skip-link">
        Ga naar inhoud
      </a>
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-14 max-w-[1120px] items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
          <Link to="/" className="flex shrink-0 items-center" aria-label="AllRound Direct home">
            <img
              src={assets.logoHeader}
              alt="AllRound Direct"
              width={180}
              height={36}
              className="h-8 w-auto sm:h-9"
            />
          </Link>
          <div className="flex items-center gap-4 text-[13px]">
            <Link to="/winkelwagen" className="text-muted hover:text-ink">
              Terug naar winkelwagen
            </Link>
            <span className="hidden items-center gap-1.5 text-muted sm:inline-flex" title="Veilige verbinding">
              <LockIcon />
              <span>Veilig afrekenen</span>
            </span>
          </div>
        </div>
      </header>
      <div className="flex-1">
        <Outlet />
      </div>
      <footer className="border-t border-line bg-white py-4">
        <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-2 px-4 text-[12px] text-muted sm:px-6">
          <p>© {new Date().getFullYear()} AllRound Direct</p>
          <p className="flex flex-wrap gap-x-3 gap-y-1">
            <Link to="/algemene-voorwaarden" className="hover:text-ink">
              Voorwaarden
            </Link>
            <Link to="/privacy" className="hover:text-ink">
              Privacy
            </Link>
            <Link to="/retourneren" className="hover:text-ink">
              Retourneren
            </Link>
          </p>
        </div>
      </footer>
    </div>
  )
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden className="text-muted">
      <path
        d="M7 11V8a5 5 0 0 1 10 0v3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  )
}
