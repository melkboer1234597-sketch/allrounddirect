import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { assets } from '@/lib/assets'

export function DeliverySection() {
  return (
    <section aria-labelledby="delivery-heading" className="section-space">
      <Container>
        <div className="grid items-center gap-6 md:gap-8 lg:grid-cols-2 lg:gap-14">
          <div className="media-frame">
            <img
              src={assets.sectionDelivery}
              alt="Magazijn met pallets en een vrachtwagen klaar voor levering"
              loading="lazy"
              className="aspect-[16/10] w-full object-cover object-[70%_center] lg:aspect-[5/4]"
            />
          </div>
          <div>
            <h2 id="delivery-heading" className="heading-section text-ink">
              Geleverd waar u het nodig heeft
            </h2>
            <p className="text-body mt-3 text-muted md:mt-4">
              Bestellingen worden geleverd op het opgegeven afleveradres. Beschikbaarheid en
              levertijd kunnen per product en leverancier verschillen.
            </p>
            <div className="mt-6 sm:mt-7">
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
