import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'

export function NewsletterSection() {
  return (
    <section aria-labelledby="newsletter-heading" className="border-t border-line">
      <Container className="py-10 md:py-14">
        <div className="grid items-end gap-5 md:grid-cols-[1fr_auto] md:gap-10">
          <div>
            <h2 id="newsletter-heading" className="heading-section text-ink">
              Op de hoogte blijven?
            </h2>
            <p className="text-body mt-2 text-muted">
              Een nieuwsbrief is nog niet actief. Stuur een bericht als u zakelijke updates of
              productvragen heeft. We schrijven u niet in zonder werkend systeem.
            </p>
          </div>
          <Button to="/contact" variant="secondary">
            Contact opnemen
          </Button>
        </div>
      </Container>
    </section>
  )
}
