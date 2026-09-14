import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { assets } from '@/lib/assets'

export function AboutSection() {
  return (
    <section
      aria-labelledby="about-heading"
      className="border-t border-line bg-surface/70 py-12 md:py-14 lg:py-16"
    >
      <Container>
        <div className="relative max-w-2xl overflow-hidden">
          <div
            className="pointer-events-none absolute -top-8 -right-10 h-28 w-28 opacity-[0.07]"
            style={{
              backgroundImage: `url(${assets.brandPattern})`,
              backgroundSize: 'cover',
            }}
            aria-hidden
          />
          <h2 id="about-heading" className="heading-section text-ink">
            Over AllRound Direct
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            AllRound Direct levert producten voor wonen, verbouwen, horeca en professioneel gebruik.
            We werken met verschillende leveranciers en bieden ons assortiment aan particuliere en
            zakelijke klanten in Nederland en België.
          </p>
          <div className="mt-5">
            <Button to="/over-ons" variant="secondary">
              Meer over ons
            </Button>
          </div>
        </div>
      </Container>
    </section>
  )
}
