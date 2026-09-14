import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { CoverImage } from '@/components/media/CoverImage'
import { assets } from '@/lib/assets'

export function BusinessSection() {
  return (
    <section aria-labelledby="business-heading" className="section-space">
      <Container>
        <div className="grid items-center gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
          <div className="order-2 min-w-0 lg:order-1 lg:py-2">
            <h2 id="business-heading" className="heading-section text-ink">
              Ook voor horeca en zakelijke inkoop
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              Van koelapparatuur en professionele keukenproducten tot meubels en projectinrichting.
              Voor grotere aantallen maken we graag een passende zakelijke offerte.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2.5">
              <Button to="/zakelijk/offerte">Zakelijke offerte</Button>
              <Button to="/horeca" variant="text">
                Bekijk horeca
              </Button>
            </div>
          </div>
          <div className="media-frame order-1 overflow-hidden bg-navy lg:order-2">
            <CoverImage
              src={assets.sectionBusiness}
              alt="Horeca- en zakelijk assortiment"
              width={1200}
              height={750}
              className="aspect-[16/10] max-h-[280px] w-full object-[30%_center] md:max-h-[340px] lg:aspect-auto lg:h-[min(400px,40vw)] lg:max-h-[400px]"
            />
          </div>
        </div>
      </Container>
    </section>
  )
}
