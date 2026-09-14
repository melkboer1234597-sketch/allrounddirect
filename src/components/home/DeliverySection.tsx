import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { assets } from '@/lib/assets'

export function DeliverySection() {
  return (
    <section aria-labelledby="delivery-heading" className="section-space">
      <Container>
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
          <div className="overflow-hidden rounded-[12px]">
            <img
              src={assets.sectionDelivery}
              alt="Magazijn met pallets en een vrachtwagen klaar voor levering"
              loading="lazy"
              className="h-full min-h-[240px] w-full object-cover md:min-h-[340px]"
            />
          </div>
          <div>
            <h2
              id="delivery-heading"
              className="font-heading text-[28px] leading-tight font-semibold text-ink md:text-[32px] lg:text-[36px]"
            >
              Geleverd waar u het nodig heeft
            </h2>
            <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-muted md:text-[17px]">
              Bestellingen worden geleverd op het opgegeven afleveradres. Beschikbaarheid en
              levertijd kunnen per product en leverancier verschillen.
            </p>
            <div className="mt-7">
              <Button to="/bezorgen" variant="secondary">
                Meer over levering
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
