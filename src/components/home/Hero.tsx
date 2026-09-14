import { Button } from '@/components/ui/Button'
import { assets } from '@/lib/assets'

export function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="bg-navy">
      <div className="relative mx-auto min-h-[420px] max-w-[1600px] overflow-hidden md:min-h-[520px] lg:min-h-[580px]">
        <img
          src={assets.hero}
          alt="Open woonkeuken met bank, eettafel, houten vloer en keuken"
          width={1920}
          height={1080}
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover object-[28%_center] md:object-[42%_center]"
        />
        <div className="absolute inset-0 bg-linear-to-r from-navy/82 via-navy/45 to-navy/10 md:via-navy/35 md:to-transparent" />
        <div className="container-page relative flex min-h-[420px] items-center py-12 md:min-h-[520px] lg:min-h-[580px]">
          <div className="max-w-[540px] text-white">
            <p className="text-[13px] font-semibold tracking-[0.14em] text-white/80 uppercase">
              AllRound Direct
            </p>
            <h1
              id="hero-heading"
              className="font-heading mt-3 text-[34px] leading-[1.12] font-semibold tracking-tight sm:text-[40px] lg:text-[52px]"
            >
              Voor thuis, horeca en bedrijf.
            </h1>
            <p className="mt-4 max-w-[46ch] text-[16px] leading-relaxed text-white/90 md:text-[17px]">
              Meubels, vloeren, keukenproducten, koelapparatuur en meer. Bestel eenvoudig online en
              laat uw bestelling leveren waar u deze nodig heeft.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button to="/assortiment" variant="primary">
                Bekijk assortiment
              </Button>
              <Button to="/zakelijk" variant="outline">
                Zakelijk bestellen
              </Button>
            </div>
            <p className="mt-5 text-[13px] text-white/75">
              Voor consumenten, ondernemers en projecten
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
