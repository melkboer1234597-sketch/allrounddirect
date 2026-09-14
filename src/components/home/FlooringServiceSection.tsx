import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { assets } from '@/lib/assets'

export function FlooringServiceSection() {
  return (
    <section aria-labelledby="floors-heading" className="section-space bg-surface">
      <Container>
        <div className="grid items-center gap-6 md:gap-8 lg:grid-cols-2 lg:gap-14">
          <div className="media-frame">
            <img
              src={assets.categoryVloeren}
              alt="Houtlook vloer in een woonkamer, gefotografeerd van dichtbij"
              width={1400}
              height={875}
              loading="lazy"
              decoding="async"
              className="aspect-[16/10] w-full object-cover object-[center_80%] lg:aspect-[5/4]"
            />
          </div>
          <div>
            <h2 id="floors-heading" className="heading-section text-ink">
              Een nieuwe vloer nodig?
            </h2>
            <p className="text-body mt-3 text-muted md:mt-4">
              Bekijk ons assortiment vloeren en toebehoren. Hulp nodig bij het leggen? Voor montage
              kunnen wij u doorverwijzen naar AllRoundKlussenbedrijf.
            </p>
            <div className="mt-6 flex flex-col gap-2.5 min-[400px]:flex-row sm:mt-7">
              <Button to="/vloeren">Bekijk vloeren</Button>
              <Button to="/advies/pvc-of-laminaat-kiezen" variant="secondary">
                PVC of laminaat kiezen
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
