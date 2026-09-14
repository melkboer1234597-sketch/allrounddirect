import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { assets } from '@/lib/assets'

export function OutletSection() {
  return (
    <section aria-labelledby="outlet-heading" className="bg-navy">
      <div className="relative overflow-hidden">
        <img
          src={assets.sectionOutlet}
          alt="Outletopstelling met meubels, keukenapparatuur en magazijnvoorraad"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover object-left opacity-45"
        />
        <div className="absolute inset-0 bg-navy/55" />
        <Container className="relative py-14 md:py-20 lg:py-24">
          <div className="max-w-xl text-white">
            <h2
              id="outlet-heading"
              className="font-heading text-[28px] leading-tight font-semibold md:text-[32px] lg:text-[36px]"
            >
              Outlet en tijdelijke partijen
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-white/85 md:text-[17px]">
              Geselecteerde producten en partijen tegen scherpe prijzen. Beschikbaarheid verschilt
              per product en voorraad.
            </p>
            <div className="mt-7">
              <Button to="/outlet" variant="onDark">
                Bekijk outlet
              </Button>
            </div>
          </div>
        </Container>
      </div>
    </section>
  )
}
