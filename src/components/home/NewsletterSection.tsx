import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'

export function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email.trim()) return
    setSubmitted(true)
  }

  return (
    <section aria-labelledby="newsletter-heading" className="border-t border-line">
      <Container className="py-10 md:py-14">
        <div className="grid items-end gap-5 md:grid-cols-[1fr_minmax(260px,400px)] md:gap-10">
          <div>
            <h2 id="newsletter-heading" className="heading-section text-ink">
              Op de hoogte blijven?
            </h2>
            <p className="text-body mt-2 text-muted">
              Ontvang nieuwe producten, aanbiedingen en zakelijke updates per e-mail.
            </p>
          </div>
          {submitted ? (
            <p className="text-[15px] text-ink" role="status">
              Dit formulier is nog niet actief. Er is niets verstuurd.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row">
              <label htmlFor="newsletter-email" className="sr-only">
                E-mailadres
              </label>
              <input
                id="newsletter-email"
                type="email"
                name="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Uw e-mailadres"
                className="h-11 min-w-0 flex-1 rounded-[4px] bg-white px-3 text-[15px] text-ink ring-1 ring-line outline-none placeholder:text-muted focus:ring-2 focus:ring-brand"
              />
              <Button type="submit">Aanmelden</Button>
            </form>
          )}
        </div>
      </Container>
    </section>
  )
}
