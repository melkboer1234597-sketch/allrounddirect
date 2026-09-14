import { Link } from 'react-router-dom'
import { Container } from '@/components/ui/Container'

/** Compact placeholder until Resend newsletter is live — no fake subscribe form. */
export function NewsletterSection() {
  return (
    <section aria-labelledby="newsletter-heading" className="border-t border-line">
      <Container className="flex flex-col gap-2 py-8 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6 md:py-9">
        <div className="min-w-0">
          <h2 id="newsletter-heading" className="font-heading text-[18px] font-semibold text-ink">
            Op de hoogte blijven?
          </h2>
          <p className="mt-1 text-[14px] text-muted">
            Ontvang later productnieuws, acties en zakelijke updates.
          </p>
        </div>
        <Link
          to="/contact"
          className="shrink-0 text-[14px] font-medium text-brand hover:underline"
        >
          Contact opnemen
        </Link>
      </Container>
    </section>
  )
}
