import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SeoHead } from '@/components/seo/SeoHead'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { CONCEPT_NOTICE } from '@/config/legal'
import { useCart } from '@/lib/cart'
import { formatMoney } from '@/lib/money'

export function CheckoutPage() {
  const { lines, subtotal } = useCart()
  const [customerType, setCustomerType] = useState<'consumer' | 'business'>('consumer')
  const [accepted, setAccepted] = useState(false)
  const empty = lines.length === 0

  return (
    <main id="main" className="section-space bg-surface">
      <SeoHead
        title="Afrekenen | AllRound Direct"
        description="Overzicht van bestelling, prijs, levering en herroeping vóór betaling."
        path="/afrekenen"
        robots="noindex,nofollow"
      />
      <Container>
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_minmax(280px,360px)]">
          <div>
            <h1 className="heading-display text-navy">Afrekenen</h1>
            <p className="mt-3 text-[15px] text-muted">
              Deze pagina toont de wettelijke samenvatting vóór betaling. Live Mollie-betalingen
              staan uit tot test of live expliciet is geconfigureerd. De server maakt eerst een
              order met status “wacht op betaling”; pas een geverifieerde Mollie-status bevestigt de
              betaling.
            </p>
            <p className="mt-3 rounded-[8px] bg-white px-4 py-3 text-[13px] text-muted ring-1 ring-line">
              {CONCEPT_NOTICE}
            </p>

            <section className="mt-8 rounded-[12px] bg-white p-5 ring-1 ring-line">
              <h2 className="font-heading text-[18px] font-semibold text-navy">Artikelen</h2>
              {empty ? (
                <p className="mt-2 text-[15px] text-muted">
                  Nog geen artikelen.{' '}
                  <Link to="/assortiment" className="text-brand hover:underline">
                    Naar assortiment
                  </Link>
                </p>
              ) : (
                <ul className="mt-3 space-y-2 text-[15px]">
                  {lines.map((line) => (
                    <li key={line.slug} className="flex justify-between gap-4">
                      <span>
                        {line.name} × {line.quantity}
                      </span>
                      <span>{line.price ? formatMoney(line.price) : 'Op aanvraag'}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="mt-4 rounded-[12px] bg-white p-5 ring-1 ring-line">
              <h2 className="font-heading text-[18px] font-semibold text-navy">
                Voor wie bestelt u?
              </h2>
              <p className="mt-2 text-[14px] text-muted">
                Dit veld is bedoeld voor factuur- en prijscontext. Consumentenrechten hangen af van
                of u daadwerkelijk als consument koopt, niet van alleen deze keuze.
              </p>
              <div className="mt-4 space-y-2 text-[15px]">
                <label className="flex min-h-11 items-center gap-2">
                  <input
                    type="radio"
                    name="customer-type"
                    checked={customerType === 'consumer'}
                    onChange={() => setCustomerType('consumer')}
                  />
                  Consument
                </label>
                <label className="flex min-h-11 items-center gap-2">
                  <input
                    type="radio"
                    name="customer-type"
                    checked={customerType === 'business'}
                    onChange={() => setCustomerType('business')}
                  />
                  Zakelijke klant
                </label>
              </div>
              {customerType === 'business' ? (
                <p className="mt-3 text-[14px] text-ink">
                  Zakelijke prijsweergave (incl./excl. btw) volgt later. Herroepingsinformatie voor
                  consumenten blijft zichtbaar; we schakelen die niet uit op basis van dit vakje.
                </p>
              ) : null}
            </section>

            <section className="mt-4 rounded-[12px] bg-white p-5 ring-1 ring-line">
              <h2 className="font-heading text-[18px] font-semibold text-navy">
                Levering en betaling
              </h2>
              <dl className="mt-3 space-y-2 text-[15px]">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Leverwijze</dt>
                  <dd>Bezorging op afleveradres (geen standaard afhaalwinkel)</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Levertijd</dt>
                  <dd>Per product, geen algemene next-day belofte</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Betaalmethode</dt>
                  <dd>Via Mollie, zodra checkout live is</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Beperkingen</dt>
                  <dd>Zie productpagina (voorraad, formaat, bestemming)</dd>
                </div>
              </dl>
            </section>
          </div>

          <aside className="rounded-[12px] bg-white p-5 ring-1 ring-line lg:sticky lg:top-24 h-fit">
            <h2 className="font-heading text-[18px] font-semibold text-navy">Overzicht</h2>
            <dl className="mt-4 space-y-2 text-[15px]">
              <div className="flex justify-between">
                <dt>Subtotaal</dt>
                <dd>
                  {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(
                    subtotal,
                  )}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>BTW</dt>
                <dd>In prijs inbegrepen, uitsplitsing volgt bij live checkout</dd>
              </div>
              <div className="flex justify-between">
                <dt>Verzendkosten</dt>
                <dd>Wordt berekend bij live checkout</dd>
              </div>
              <div className="flex justify-between font-semibold">
                <dt>Totaal</dt>
                <dd>
                  {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(
                    subtotal,
                  )}
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-[14px] leading-relaxed text-ink">
              Herroepingsrecht: als consument kunt u de aankoop in beginsel binnen 14 dagen
              herroepen. Uitzonderingen staan bij het product of in de voorwaarden. Zie{' '}
              <Link to="/herroepen" className="text-brand underline">
                Overeenkomst herroepen
              </Link>
              .
            </p>
            <label className="mt-4 flex items-start gap-2 text-[14px]">
              <input
                type="checkbox"
                className="mt-1"
                checked={accepted}
                onChange={(event) => setAccepted(event.target.checked)}
              />
              <span>
                Ik ga akkoord met de{' '}
                <Link to="/algemene-voorwaarden" className="text-brand underline">
                  algemene voorwaarden
                </Link>{' '}
                en heb de informatie over herroeping gelezen.
              </span>
            </label>
            <Button type="button" className="mt-4 w-full" disabled>
              Bestelling plaatsen en betalen
            </Button>
            <p className="mt-2 text-[13px] text-muted">
              De knop blijft uit totdat betalen live is
              {empty ? ' en er artikelen in de winkelwagen liggen' : ''}. De tekst maakt de
              betalingsverplichting duidelijk.
            </p>
          </aside>
        </div>
      </Container>
    </main>
  )
}
