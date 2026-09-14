import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { assets } from '@/lib/assets'

export function BusinessSection() {
  return (
    <section aria-labelledby="business-heading" className="section-space">
      <Container>
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
          <div className="order-2 lg:order-1">
            <h2
              id="business-heading"
              className="font-heading text-[28px] leading-tight font-semibold text-ink md:text-[32px] lg:text-[36px]"
            >
              Ook voor horeca en zakelijke inkoop
            </h2>
            <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-muted md:text-[17px]">
              Van koelapparatuur en professionele keukenproducten tot meubels en projectinrichting.
              Voor grotere aantallen en zakelijke aanvragen maken we graag een passende offerte.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button to="/offerte">Zakelijke aanvraag</Button>
              <Button to="/horeca" variant="ghost" className="px-3">
                Bekijk horeca
              </Button>
            </div>
          </div>
          <div className="order-1 overflow-hidden rounded-[12px] lg:order-2">
            <img
              src={assets.sectionBusiness}
              alt="Zakelijke inrichting met pallets, lange tafel en professionele keuken"
              loading="lazy"
              className="h-full min-h-[240px] w-full object-cover md:min-h-[360px]"
            />
          </div>
        </div>
      </Container>
    </section>
  )
}
