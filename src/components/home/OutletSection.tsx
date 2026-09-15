import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { CoverImage } from '@/components/media/CoverImage'
import { assets } from '@/lib/assets'

export function OutletSection() {
  return (
    <section aria-labelledby="outlet-heading" className="relative overflow-hidden bg-navy">
      <CoverImage
        src={assets.sectionOutlet}
        alt=""
        loading="eager"
        className="absolute inset-0 h-full min-h-full w-full object-cover object-[center_30%] opacity-45"
      />
      <div className="absolute inset-0 bg-navy/55" aria-hidden />
      <Container className="relative flex items-center py-9 md:py-10 lg:py-11">
        <div className="max-w-md text-white">
          <h2 id="outlet-heading" className="heading-section">
            Outlet en tijdelijke partijen
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-white/85">
            Geselecteerde producten tegen scherpe prijzen, zolang de voorraad strekt.
          </p>
          <div className="mt-4">
            <Button to="/outlet" variant="onDark" size="sm">
              Bekijk outlet
            </Button>
          </div>
        </div>
      </Container>
    </section>
  )
}
