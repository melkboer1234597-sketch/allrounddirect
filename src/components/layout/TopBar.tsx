import { Building2, Headset, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { freeShippingThresholdLabel } from '../../../shared/commerce'

export function TopBar() {
  const freeShip = freeShippingThresholdLabel()

  return (
    <div className="bg-navy text-white">
      <Container className="flex h-8 items-center justify-between gap-3 text-[12px] leading-none md:h-9 md:text-[13px]">
        <p className="hidden items-center gap-1.5 lg:flex">
          <Building2 className="h-3.5 w-3.5 opacity-80" aria-hidden />
          Voor thuis en zakelijk
        </p>

        {/* Mobile / tablet: prioritize free shipping */}
        <p className="flex min-w-0 flex-1 items-center justify-center gap-1.5 truncate lg:hidden">
          <Truck className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
          <span className="truncate">{freeShip}</span>
        </p>

        {/* Desktop: three trust signals */}
        <div className="hidden min-w-0 flex-1 items-center justify-center gap-6 xl:gap-8 lg:flex">
          <p className="inline-flex items-center gap-1.5 font-medium">
            <Truck className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
            {freeShip}
          </p>
          <p className="hidden text-white/85 xl:inline">Levering in Nederland en België</p>
        </div>

        <div className="hidden items-center gap-5 sm:flex">
          <Link to="/zakelijk" className="hidden hover:text-white/80 md:inline">
            Zakelijk bestellen
          </Link>
          <Link
            to="/klantenservice"
            className="inline-flex items-center gap-1.5 hover:text-white/80"
          >
            <Headset className="h-3.5 w-3.5 opacity-80" aria-hidden />
            <span className="hidden min-[400px]:inline">Klantenservice</span>
          </Link>
        </div>
      </Container>
    </div>
  )
}
