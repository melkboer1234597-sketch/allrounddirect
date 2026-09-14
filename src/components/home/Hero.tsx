import { Button } from '@/components/ui/Button'
import { assets } from '@/lib/assets'

export function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="bg-navy">
      <div className="relative mx-auto max-w-[1600px] overflow-hidden">
        <div className="relative min-h-[380px] sm:min-h-[440px] md:min-h-[500px] lg:min-h-[560px]">
          <img
            src={assets.hero}
            alt="Open woonkeuken met bank, eettafel, houten vloer en keuken"
            width={1920}
            height={1080}
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover object-[62%_center] sm:object-[48%_center] lg:object-[42%_center]"
          />
          <div className="absolute inset-0 bg-linear-to-t from-navy/80 via-navy/50 to-navy/25 sm:bg-linear-to-r sm:from-navy/80 sm:via-navy/40 sm:to-navy/10 lg:via-navy/30 lg:to-transparent" />
          <div className="container-page relative flex min-h-[380px] items-end py-8 sm:items-center sm:py-12 sm:min-h-[440px] md:min-h-[500px] lg:min-h-[560px]">
            <div className="max-w-[34rem] text-white">
              <p className="text-[12px] font-semibold tracking-[0.14em] text-white/80 uppercase">
                AllRound Direct
              </p>
              <h1 id="hero-heading" className="heading-display mt-2 sm:mt-3">
                Voor thuis, horeca en bedrijf.
              </h1>
              <p className="mt-3 max-w-[42ch] text-[15px] leading-relaxed text-white/90 sm:mt-4 sm:text-[16px] md:text-[17px]">
                Meubels, vloeren, keukenproducten, koelapparatuur en meer. Bestel eenvoudig online en
                laat uw bestelling leveren waar u deze nodig heeft.
              </p>
              <div className="mt-5 flex flex-col gap-2.5 min-[400px]:flex-row min-[400px]:flex-wrap sm:mt-7">
                <Button to="/assortiment" variant="primary" className="w-full min-[400px]:w-auto">
                  Bekijk assortiment
                </Button>
                <Button to="/zakelijk" variant="outline" className="w-full min-[400px]:w-auto">
                  Zakelijk bestellen
                </Button>
              </div>
              <p className="mt-4 text-[12px] text-white/75 sm:mt-5 sm:text-[13px]">
                Voor consumenten, ondernemers en projecten
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
