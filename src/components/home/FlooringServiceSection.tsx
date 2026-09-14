import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { CoverImage } from '@/components/media/CoverImage'
import { assets } from '@/lib/assets'

export function FlooringServiceSection() {
  return (
    <section aria-labelledby="floors-heading" className="section-space bg-surface">
      <Container>
        <div className="grid items-center gap-5 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10 lg:max-h-[500px]">
          <div className="media-frame overflow-hidden bg-navy">
            <CoverImage
              src={assets.categoryVloeren}
              alt="Vloeren uit het AllRound Direct assortiment"
              width={1200}
              height={750}
              className="aspect-[16/10] max-h-[280px] w-full object-[center_80%] md:max-h-[340px] lg:aspect-auto lg:h-[min(420px,42vw)] lg:max-h-[420px]"
            />
          </div>
          <div className="min-w-0 lg:py-2">
            <h2 id="floors-heading" className="heading-section text-ink">
              Een nieuwe vloer nodig?
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              Bekijk vloeren en toebehoren voor iedere ruimte. Hulp nodig bij het leggen? Via
              AllRoundKlussenbedrijf kunt u ook montage aanvragen.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2.5">
              <Button to="/vloeren">Bekijk vloeren</Button>
              <Button to="/advies/pvc-of-laminaat-kiezen" variant="text">
                PVC of laminaat kiezen
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
