import { Building2, ClipboardList, MapPin, Truck } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import {
  deliveryLabelShort,
  freeShippingThresholdLabel,
} from '../../../shared/commerce'

const items = [
  {
    icon: MapPin,
    title: 'Levering in heel Nederland en België',
  },
  {
    icon: Truck,
    title: freeShippingThresholdLabel(),
    emphasize: true,
  },
  {
    icon: Building2,
    title: 'Voor particulier en zakelijk',
  },
  {
    icon: ClipboardList,
    title: `Levering ${deliveryLabelShort()}`,
  },
]

export function TrustStrip() {
  return (
    <section aria-label="Voordelen" className="border-y border-line bg-surface">
      <Container className="grid grid-cols-2 gap-x-4 gap-y-3 py-4 sm:gap-x-6 md:py-5 lg:grid-cols-4 lg:gap-x-8 lg:py-5">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.title} className="flex items-start gap-2.5">
              <Icon
                className="mt-0.5 h-[18px] w-[18px] shrink-0 text-brand"
                strokeWidth={1.75}
                aria-hidden
              />
              <p
                className={
                  item.emphasize
                    ? 'font-heading text-[13px] leading-snug font-semibold text-ink sm:text-[14px]'
                    : 'text-[13px] leading-snug text-ink sm:text-[14px]'
                }
              >
                {item.title}
              </p>
            </div>
          )
        })}
      </Container>
    </section>
  )
}
