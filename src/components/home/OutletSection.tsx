import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { assets } from '@/lib/assets'

export function OutletSection() {
  return (
    <section aria-labelledby="outlet-heading" className="bg-navy">
      <div className="relative overflow-hidden">
        <img
          src={assets.sectionOutlet}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-[20%_center] opacity-40 md:object-left"
        />
        <div className="absolute inset-0 bg-navy/55" />
        <Container className="relative py-12 md:py-16 lg:py-20">
          <div className="max-w-xl text-white">
            <h2 id="outlet-heading" className="heading-section">
              Outlet en tijdelijke partijen
            </h2>
            <p className="text-body mt-3 text-white/85 md:mt-4">
              Geselecteerde producten en partijen tegen scherpe prijzen. Beschikbaarheid verschilt
              per product en voorraad.
            </p>
            <div className="mt-6 sm:mt-7">
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
