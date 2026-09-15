import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { CoverImage } from '@/components/media/CoverImage'
import { assets } from '@/lib/assets'

export function BusinessSection() {
  return (
    <section aria-labelledby="business-heading" className="border-t border-line">
      <Container className="py-9 md:py-11 lg:py-12">
        <div className="grid items-center gap-5 lg:grid-cols-[0.92fr_1.08fr] lg:gap-10">
          <div className="order-2 min-w-0 lg:order-1">
            <h2 id="business-heading" className="heading-section text-ink">
              Horeca en zakelijke inkoop
            </h2>
            <p className="mt-2.5 max-w-[42ch] text-[15px] leading-relaxed text-muted">
              Koeling, keukenlijnen en inrichting voor ondernemers. Voor grotere aantallen maken we
              een offerte.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              <Button to="/zakelijk/offerte" size="sm">
                Zakelijke offerte
              </Button>
              <Button to="/horeca" variant="text">
                Horeca
              </Button>
            </div>
          </div>
          <div className="media-frame order-1 overflow-hidden bg-navy lg:order-2">
            <CoverImage
              src={assets.sectionBusiness}
              alt="Horeca- en zakelijk assortiment"
              width={1200}
              height={750}
              loading="eager"
              className="aspect-[16/10] h-auto max-h-[240px] w-full object-[30%_center] md:max-h-[300px] lg:max-h-[340px]"
            />
          </div>
        </div>
      </Container>
    </section>
  )
}
