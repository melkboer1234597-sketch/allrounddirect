import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'

export function AboutSection() {
  return (
    <section aria-labelledby="about-heading" className="section-space bg-surface">
      <Container>
        <div className="max-w-2xl">
          <h2 id="about-heading" className="heading-section text-ink">
            Over AllRound Direct
          </h2>
          <p className="text-body mt-3 text-muted md:mt-4">
            AllRound Direct levert producten voor wonen, verbouwen en professioneel gebruik. Door
            samen te werken met verschillende leveranciers kunnen we een breed assortiment aanbieden
            voor zowel particuliere als zakelijke klanten.
          </p>
          <div className="mt-6 sm:mt-7">
            <Button to="/over-ons" variant="secondary">
              Meer over ons
            </Button>
          </div>
        </div>
      </Container>
    </section>
  )
}
