import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'

export function AboutSection() {
  return (
    <section aria-labelledby="about-heading" className="section-space bg-surface">
      <Container>
        <div className="max-w-2xl">
          <h2
            id="about-heading"
            className="font-heading text-[28px] leading-tight font-semibold text-ink md:text-[32px] lg:text-[36px]"
          >
            Over AllRound Direct
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-muted md:text-[17px]">
            AllRound Direct levert producten voor wonen, verbouwen en professioneel gebruik. Door
            samen te werken met verschillende leveranciers kunnen we een breed assortiment aanbieden
            voor zowel particuliere als zakelijke klanten.
          </p>
          <div className="mt-7">
            <Button to="/over-ons" variant="secondary">
              Meer over ons
            </Button>
          </div>
        </div>
      </Container>
    </section>
  )
}
