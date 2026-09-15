import { Container } from '@/components/ui/Container'
import { freeShippingThresholdLabel } from '../../../shared/commerce'

const items = [
  'Levering in Nederland en België',
  freeShippingThresholdLabel(),
  'Voor particulier en zakelijk',
  'Zakelijke offerte mogelijk',
] as const

export function TrustStrip() {
  return (
    <section aria-label="Voordelen" className="border-y border-line bg-surface">
      <Container className="py-3.5 md:py-4">
        <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 lg:grid-cols-4 lg:gap-x-8">
          {items.map((title) => (
            <li key={title} className="flex items-start gap-2">
              <span
                className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-brand"
                aria-hidden
              />
              <p className="text-[13px] leading-snug text-ink sm:text-[14px]">{title}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
