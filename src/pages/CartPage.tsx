import { Link } from 'react-router-dom'
import { SeoHead } from '@/components/seo/SeoHead'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { formatMoney } from '@/lib/money'
import { useCart } from '@/lib/cart'

export function CartPage() {
  const { lines, setQuantity, subtotal } = useCart()

  return (
    <main id="main" className="section-space">
      <SeoHead
        title="Winkelwagen | AllRound Direct"
        description="Uw winkelwagen bij AllRound Direct."
        path="/winkelwagen"
        robots="noindex,nofollow"
      />
      <Container>
        <div className="mx-auto max-w-[42rem]">
          <h1 className="heading-display text-navy">Winkelwagen</h1>
          {lines.length === 0 ? (
            <>
              <p className="text-body mt-4 text-muted">
                Er liggen geen artikelen in de winkelwagen. Afrekenen met Mollie is nog niet live; u
                kunt wel producten toevoegen om de flow te testen.
              </p>
              <div className="mt-8">
                <Button to="/assortiment">Assortiment bekijken</Button>
              </div>
            </>
          ) : (
            <>
              <ul className="mt-6 divide-y divide-line">
                {lines.map((line) => (
                  <li key={line.slug} className="flex items-center gap-4 py-4">
                    {line.image ? (
                      <img
                        src={line.image}
                        alt=""
                        width={80}
                        height={60}
                        className="h-16 w-20 rounded-[4px] object-cover"
                      />
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <Link to={line.href} className="font-medium text-ink hover:text-brand">
                        {line.name}
                      </Link>
                      <p className="text-[14px] text-muted">
                        {line.price ? formatMoney(line.price) : 'Prijs op aanvraag'}
                      </p>
                    </div>
                    <label className="text-[13px] text-muted">
                      Aantal
                      <input
                        type="number"
                        min={0}
                        className="mt-1 h-11 w-16 rounded-[4px] border border-line px-2 text-[15px] text-ink"
                        value={line.quantity}
                        onChange={(event) =>
                          setQuantity(line.slug, Number(event.target.value) || 0)
                        }
                      />
                    </label>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[16px] font-semibold">
                Subtotaal{' '}
                {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(
                  subtotal,
                )}
              </p>
              <p className="mt-2 text-[14px] text-muted">
                Verzendkosten en btw-uitsplitsing volgen in de echte checkout. Betalen staat uit tot
                Mollie live is gezet.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button to="/afrekenen">Naar afrekenen</Button>
                <Button to="/assortiment" variant="secondary">
                  Verder winkelen
                </Button>
              </div>
            </>
          )}
          <p className="mt-8 text-[14px] text-muted">
            <Link to="/herroepen" className="text-brand hover:underline">
              Overeenkomst herroepen
            </Link>
            {' · '}
            <Link to="/bezorgen" className="text-brand hover:underline">
              Bezorgen
            </Link>
          </p>
        </div>
      </Container>
    </main>
  )
}
