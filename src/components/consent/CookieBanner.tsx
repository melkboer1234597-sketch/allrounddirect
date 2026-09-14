import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { useFocusTrap } from '@/lib/a11y'

export function CookieBanner({
  visible,
  onNecessary,
  onPreferences,
  onAcceptAll,
}: {
  visible: boolean
  onNecessary: () => void
  onPreferences: () => void
  onAcceptAll: () => void
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  useFocusTrap(visible, panelRef)

  if (!visible) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center p-3 md:p-4">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-banner-title"
        aria-describedby="cookie-banner-text"
        className="pointer-events-auto w-full max-w-3xl rounded-[12px] bg-white p-4 shadow-[0_-8px_40px_-12px_rgba(7,31,63,0.35)] ring-1 ring-line md:p-5"
      >
        <h2
          id="cookie-banner-title"
          className="font-heading text-[18px] font-semibold text-navy md:text-[20px]"
        >
          Uw privacy, uw keuze
        </h2>
        <p
          id="cookie-banner-text"
          className="mt-2 text-[14px] leading-relaxed text-ink md:text-[15px]"
        >
          Noodzakelijke cookies hebben we nodig om de webshop te laten werken: sessie, winkelwagen,
          beveiliging en het onthouden van deze keuze. Optionele cookies voor voorkeuren, statistiek
          of marketing zetten we alleen aan als u dat wilt. U kunt later altijd wijzigen via
          Cookie-instellingen.
        </p>
        <p className="mt-2 text-[13px] text-muted">
          Meer informatie:{' '}
          <Link to="/cookies" className="text-brand underline">
            cookieverklaring
          </Link>
          {' en '}
          <Link to="/privacy" className="text-brand underline">
            privacyverklaring
          </Link>
          .
        </p>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Button
            type="button"
            variant="secondary"
            className="min-h-11 w-full"
            onClick={onNecessary}
          >
            Alleen noodzakelijk
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="min-h-11 w-full"
            onClick={onPreferences}
          >
            Voorkeuren
          </Button>
          <Button type="button" variant="primary" className="min-h-11 w-full" onClick={onAcceptAll}>
            Alles accepteren
          </Button>
        </div>
      </div>
    </div>
  )
}
