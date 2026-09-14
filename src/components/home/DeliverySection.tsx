import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { CoverImage } from '@/components/media/CoverImage'
import { assets } from '@/lib/assets'
import {
  deliveryLabelFull,
  freeShippingThresholdLabel,
} from '../../../shared/commerce'

export function DeliverySection() {
  return (
    <section aria-labelledby="delivery-heading" className="section-space">
      <Container>
        <div className="grid items-center gap-5 lg:grid-cols-2 lg:gap-10">
          <div className="media-frame overflow-hidden bg-navy">
            <CoverImage
              src={assets.sectionDelivery}
              alt="Producten klaar voor levering"
              width={1200}
              height={720}
              className="aspect-[16/10] max-h-[260px] w-full object-[70%_center] md:max-h-[320px] lg:aspect-auto lg:h-[min(360px,36vw)] lg:max-h-[360px]"
            />
          </div>
          <div className="min-w-0 lg:py-1">
            <h2 id="delivery-heading" className="heading-section text-ink">
              Geleverd waar u het nodig heeft
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              Wij leveren bestellingen in Nederland en België. {deliveryLabelFull()}.
            </p>
            <p className="mt-3 font-heading text-[15px] font-semibold text-ink">
              {freeShippingThresholdLabel()}
            </p>
            <div className="mt-5">
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
