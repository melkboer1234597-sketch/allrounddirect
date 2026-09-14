import { Building2, ClipboardList, MapPin, Truck } from 'lucide-react'
import { Container } from '@/components/ui/Container'

const items = [
  {
    icon: Truck,
    title: 'Levering in heel Nederland',
    text: 'Bezorging op het afleveradres. Levertijd kan per product verschillen.',
  },
  {
    icon: Building2,
    title: 'Voor particulier en zakelijk',
    text: 'Bestellen voor thuis, kantoor, horeca of een project.',
  },
  {
    icon: ClipboardList,
    title: 'Zakelijke offerte mogelijk',
    text: 'Voor grotere aantallen maken we een passende aanvraag.',
  },
  {
    icon: MapPin,
    title: 'Via geselecteerde leveranciers',
    text: 'Assortiment uit meerdere voorraden, geleverd bij u.',
  },
]

export function TrustStrip() {
  return (
    <section aria-label="Voordelen" className="border-y border-line bg-surface">
      <Container className="grid grid-cols-1 gap-6 py-8 min-[480px]:grid-cols-2 md:gap-8 md:py-10 lg:grid-cols-4 lg:py-12">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.title} className="flex gap-3">
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brand" strokeWidth={1.75} aria-hidden />
              <div>
                <p className="font-heading text-[15px] font-semibold text-ink">{item.title}</p>
                <p className="mt-1 text-[14px] leading-relaxed text-muted">{item.text}</p>
              </div>
            </div>
          )
        })}
      </Container>
    </section>
  )
}
