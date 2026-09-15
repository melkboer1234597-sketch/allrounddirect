import { Link } from 'react-router-dom'
import { Container } from '@/components/ui/Container'

export function NewsletterSection() {
  return (
    <section aria-labelledby="newsletter-heading" className="border-t border-line">
      <Container className="flex flex-col gap-1.5 py-6 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6 md:py-7">
        <div className="min-w-0">
          <h2 id="newsletter-heading" className="font-heading text-[16px] font-semibold text-ink">
            Nieuwsbrief
          </h2>
          <p className="mt-0.5 text-[13px] text-muted">Updates zodra inschrijven live is.</p>
        </div>
        <Link to="/contact" className="shrink-0 text-[14px] font-medium text-brand hover:underline">
          Contact
        </Link>
      </Container>
    </section>
  )
}
