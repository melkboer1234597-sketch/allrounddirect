import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { CoverImage } from '@/components/media/CoverImage'
import { assets } from '@/lib/assets'

export function FlooringServiceSection() {
  return (
    <section aria-labelledby="floors-heading" className="border-t border-line bg-surface">
      <Container className="py-9 md:py-11 lg:py-12">
        <div className="grid items-center gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <div className="media-frame overflow-hidden bg-navy">
            <CoverImage
              src={assets.categoryVloeren}
              alt="Vloeren uit het AllRound Direct assortiment"
              width={1200}
              height={750}
              loading="eager"
              className="aspect-[16/10] h-auto max-h-[240px] w-full object-[center_80%] md:max-h-[300px] lg:aspect-[16/10] lg:max-h-[340px]"
            />
          </div>
          <div className="min-w-0">
            <h2 id="floors-heading" className="heading-section text-ink">
              Een nieuwe vloer nodig?
            </h2>
            <p className="mt-2.5 max-w-[42ch] text-[15px] leading-relaxed text-muted">
              PVC, laminaat en meer voor thuis of project. Montage is apart aan te vragen via
              AllRoundKlussenbedrijf.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              <Button to="/vloeren" size="sm">
                Bekijk vloeren
              </Button>
              <Button to="/advies/pvc-of-laminaat-kiezen" variant="text">
                PVC of laminaat
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
