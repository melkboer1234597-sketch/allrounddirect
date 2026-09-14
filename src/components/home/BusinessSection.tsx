import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { assets } from '@/lib/assets'

export function BusinessSection() {
  return (
    <section aria-labelledby="business-heading" className="section-space">
      <Container>
        <div className="grid items-center gap-6 md:gap-8 lg:grid-cols-2 lg:gap-14">
          <div className="order-2 lg:order-1">
            <h2 id="business-heading" className="heading-section text-ink">
              Ook voor horeca en zakelijke inkoop
            </h2>
            <p className="text-body mt-3 text-muted md:mt-4">
              Van koelapparatuur en professionele keukenproducten tot meubels en projectinrichting.
              Voor grotere aantallen en zakelijke aanvragen maken we graag een passende offerte.
            </p>
            <div className="mt-6 flex flex-col gap-2.5 min-[400px]:flex-row min-[400px]:items-center sm:mt-7">
              <Button to="/zakelijk/offerte">Zakelijke offerte</Button>
              <Button to="/horeca" variant="text">
                Bekijk horeca
              </Button>
            </div>
          </div>
          <div className="media-frame order-1 lg:order-2">
            <img
              src={assets.sectionBusiness}
              alt="Zakelijke inrichting met pallets, lange tafel en professionele keuken"
              width={1400}
              height={875}
              loading="lazy"
              decoding="async"
              className="aspect-[16/10] w-full object-cover object-[30%_center] lg:aspect-[5/4]"
            />
          </div>
        </div>
      </Container>
    </section>
  )
}
