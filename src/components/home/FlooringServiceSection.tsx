import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { assets } from '@/lib/assets'

export function FlooringServiceSection() {
  return (
    <section aria-labelledby="floors-heading" className="section-space bg-surface">
      <Container>
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
          <div className="overflow-hidden rounded-[12px]">
            <img
              src={assets.categoryVloeren}
              alt="Houtlook vloer in een woonkamer, gefotografeerd van dichtbij"
              loading="lazy"
              className="h-full min-h-[260px] w-full object-cover md:min-h-[360px]"
            />
          </div>
          <div>
            <h2
              id="floors-heading"
              className="font-heading text-[28px] leading-tight font-semibold text-ink md:text-[32px] lg:text-[36px]"
            >
              Een nieuwe vloer nodig?
            </h2>
            <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-muted md:text-[17px]">
              Bekijk ons assortiment vloeren en toebehoren. Hulp nodig bij het leggen? Voor montage
              kunnen wij u doorverwijzen naar AllRoundKlussenbedrijf.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button to="/vloeren">Bekijk vloeren</Button>
              <Button to="/montage" variant="secondary">
                Montage aanvragen
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
