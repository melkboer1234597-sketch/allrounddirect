import { Building2, Headset, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Container } from '@/components/ui/Container'

export function TopBar() {
  return (
    <div className="bg-navy text-white">
      <Container className="flex h-8 items-center justify-between gap-3 text-[12px] leading-none md:h-9 md:text-[13px]">
        <p className="hidden items-center gap-1.5 sm:flex">
          <Building2 className="h-3.5 w-3.5 opacity-80" aria-hidden />
          Voor thuis en zakelijk
        </p>
        <p className="flex min-w-0 flex-1 items-center justify-center gap-1.5 truncate sm:flex-none">
          <Truck className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
          Levering in heel Nederland
        </p>
        <div className="hidden items-center gap-5 lg:flex">
          <Link to="/zakelijk" className="hover:text-white/80">
            Zakelijk bestellen
          </Link>
          <Link to="/klantenservice" className="inline-flex items-center gap-1.5 hover:text-white/80">
            <Headset className="h-3.5 w-3.5 opacity-80" aria-hidden />
            Klantenservice
          </Link>
        </div>
      </Container>
    </div>
  )
}
