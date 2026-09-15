import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import {
  deliveryLabelFull,
  freeShippingThresholdLabel,
} from '../../../shared/commerce'

/**
 * Compact light delivery band — distinct from the navy outlet block below.
 */
export function DeliverySection() {
  return (
    <section aria-labelledby="delivery-heading" className="border-y border-line bg-surface">
      <Container className="flex flex-col gap-4 py-7 md:flex-row md:items-center md:justify-between md:gap-10 md:py-8">
        <div className="min-w-0 max-w-2xl">
          <h2
            id="delivery-heading"
            className="font-heading text-[20px] font-semibold tracking-tight text-ink md:text-[22px]"
          >
            Levering in Nederland en België
          </h2>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-2">
            <p className="text-[15px] text-ink">
              <span className="font-semibold">{deliveryLabelFull()}</span>
            </p>
            <p className="text-[15px] text-ink">
              <span className="font-semibold">{freeShippingThresholdLabel()}</span>
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2">
          <Button to="/bezorgen" variant="secondary" size="sm">
            Meer over bezorgen
          </Button>
          <Link
            to="/zakelijk/offerte"
            className="text-[14px] font-medium text-brand hover:underline"
          >
            Zakelijke offerte
          </Link>
        </div>
      </Container>
    </section>
  )
}
