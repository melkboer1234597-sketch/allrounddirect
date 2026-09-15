import { Link, Navigate } from 'react-router-dom'
import { Heart, MapPin, Package, RotateCcw } from 'lucide-react'
import { SeoHead } from '@/components/seo/SeoHead'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { useAuthSession } from '@/hooks/useAccount'

const BENEFITS = [
  {
    icon: Package,
    title: 'Bestellingen bekijken',
    text: 'Status, tracking en facturen op één plek.',
  },
  {
    icon: MapPin,
    title: 'Adressen beheren',
    text: 'Bezorg- en factuuradressen klaarzetten.',
  },
  {
    icon: Heart,
    title: 'Favorieten bewaren',
    text: 'Bewaar producten en pak later verder.',
  },
  {
    icon: RotateCcw,
    title: 'Retourstatus volgen',
    text: 'Volg retouren wanneer die beschikbaar zijn.',
  },
] as const

export function AccountIndexPage() {
  const { data, isPending } = useAuthSession()

  if (isPending) {
    return (
      <main id="main" className="page-shell flex flex-1 items-center justify-center">
        <p className="text-[15px] text-muted">Laden…</p>
      </main>
    )
  }

  if (data?.user) {
    return <Navigate to="/account/overzicht" replace />
  }

  return (
    <main
      id="main"
      className="page-shell flex min-h-[calc(100dvh-var(--app-header-offset))] flex-col justify-center bg-surface pb-16 md:pb-20"
    >
      <SeoHead
        title="Account | AllRound Direct"
        description="Inloggen of een account aanmaken bij AllRound Direct."
        path="/account"
        robots="noindex,nofollow"
      />
      <Container>
        <div className="mx-auto max-w-[920px]">
          <div className="overflow-hidden rounded-[12px] bg-white ring-1 ring-line">
            <div className="grid md:grid-cols-2">
              <section className="flex flex-col justify-center px-6 py-8 sm:px-8 md:px-10 md:py-10">
                <h1 className="heading-page text-ink">Mijn account</h1>
                <p className="mt-2.5 max-w-sm text-[15px] leading-relaxed text-muted">
                  Beheer uw bestellingen, adressen en favorieten op één plek.
                </p>
                <div className="mt-7 flex max-w-xs flex-col gap-2.5">
                  <Button to="/account/inloggen" className="w-full justify-center">
                    Inloggen
                  </Button>
                  <Button
                    to="/account/registreren"
                    variant="secondary"
                    className="w-full justify-center"
                  >
                    Account aanmaken
                  </Button>
                </div>
              </section>

              <aside className="border-t border-line bg-surface/70 px-6 py-8 sm:px-8 md:border-t-0 md:border-l md:px-10 md:py-10">
                <p className="text-[13px] font-semibold tracking-wide text-ink">
                  Met een account
                </p>
                <ul className="mt-5 space-y-5">
                  {BENEFITS.map((item) => (
                    <li key={item.title} className="flex gap-3">
                      <span
                        className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-white text-navy ring-1 ring-line"
                        aria-hidden
                      >
                        <item.icon className="h-4 w-4" strokeWidth={1.75} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[14px] font-medium text-ink">{item.title}</p>
                        <p className="mt-0.5 text-[13px] leading-snug text-muted">{item.text}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </aside>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2 rounded-[10px] bg-white px-5 py-4 ring-1 ring-line sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-[14px] text-muted">Bestelling gedaan zonder account?</p>
            <Link
              to="/bestelling-volgen"
              className="inline-flex min-h-10 items-center text-[14px] font-medium text-brand hover:underline"
            >
              Bestelling volgen
            </Link>
          </div>
        </div>
      </Container>
    </main>
  )
}
