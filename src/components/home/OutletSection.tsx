import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { CoverImage } from '@/components/media/CoverImage'
import { assets } from '@/lib/assets'

export function OutletSection() {
  return (
    <section aria-labelledby="outlet-heading" className="bg-navy">
      <div className="relative min-h-[280px] overflow-hidden md:min-h-[300px] lg:min-h-[320px] lg:max-h-[360px]">
        <CoverImage
          src={assets.sectionOutlet}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-45 md:object-left"
        />
        <div className="absolute inset-0 bg-navy/60" aria-hidden />
        <Container className="relative flex min-h-[280px] items-center py-10 md:min-h-[300px] md:py-12 lg:min-h-[320px] lg:py-14">
          <div className="max-w-lg text-white">
            <h2 id="outlet-heading" className="heading-section">
              Outlet en tijdelijke partijen
            </h2>
            <p className="mt-2.5 text-[15px] leading-relaxed text-white/85">
              Geselecteerde producten en partijen tegen scherpe prijzen. Beschikbaarheid zolang de
              voorraad strekt.
            </p>
            <div className="mt-5">
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
