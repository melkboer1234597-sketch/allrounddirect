import { useCallback, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { SeoHead } from '@/components/seo/SeoHead'
import { TextField } from '@/components/account/Fields'
import { TurnstileField } from '@/components/account/TurnstileField'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { CONCEPT_NOTICE } from '@/config/legal'
import { sendContactMessage } from '@/lib/legal-api'
import { ApiError } from '@/lib/api'

export function QuotePage() {
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [turnstile, setTurnstile] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState('')
  const [pending, setPending] = useState(false)
  const onToken = useCallback((token: string) => setTurnstile(token), [])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setDone('')
    setPending(true)
    try {
      const result = await sendContactMessage({
        name,
        email,
        subject: `Offerte${company ? ` (${company})` : ''}`,
        message: [
          company ? `Bedrijf: ${company}` : null,
          phone ? `Telefoon: ${phone}` : null,
          message,
        ]
          .filter(Boolean)
          .join('\n'),
        turnstileToken: turnstile || undefined,
      })
      setDone(result.message)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Verzenden is niet gelukt.')
    } finally {
      setPending(false)
    }
  }

  return (
    <main id="main" className="section-space">
      <SeoHead
        title="Offerte aanvragen | AllRound Direct"
        description="Vraag een offerte aan voor grotere aantallen, horeca of projecten bij AllRound Direct."
        path="/zakelijk/offerte"
      />
      <Container>
        <div className="mx-auto max-w-[42rem]">
          <h1 className="heading-display text-navy">Zakelijke offerte</h1>
          <p className="text-body mt-4 text-ink">
            Voor grotere aantallen, horeca of een project. Dit is geen webshop-checkout. We reageren
            op het opgegeven e-mailadres. Voor een enkele consumentenbestelling gebruikt u de
            winkelwagen wanneer die live is.
          </p>
          <p className="mt-4 rounded-[8px] bg-surface px-4 py-3 text-[13px] text-muted">
            {CONCEPT_NOTICE}
          </p>
          <p className="mt-4 text-[15px]">
            <Link to="/horeca" className="text-brand hover:underline">
              Horeca-assortiment
            </Link>
            {' · '}
            <Link to="/zakelijk" className="text-brand hover:underline">
              Zakelijk
            </Link>
            {' · '}
            <Link to="/contact" className="text-brand hover:underline">
              Algemeen contact
            </Link>
          </p>

          {done ? (
            <p className="mt-8 rounded-[8px] bg-surface p-4 text-[15px] text-ink" role="status">
              {done}
            </p>
          ) : (
            <form className="mt-8 space-y-4" onSubmit={onSubmit}>
              <TextField
                label="Naam"
                name="name"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <TextField
                label="Bedrijf"
                name="company"
                autoComplete="organization"
                value={company}
                onChange={(event) => setCompany(event.target.value)}
              />
              <TextField
                label="E-mailadres"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <TextField
                label="Telefoon"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
              <div className="space-y-1.5">
                <label htmlFor="quote-message" className="block text-[14px] font-medium text-ink">
                  Wat heeft u nodig?
                </label>
                <textarea
                  id="quote-message"
                  name="message"
                  required
                  minLength={10}
                  rows={6}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className="w-full rounded-[4px] border border-line px-3 py-2 text-[15px] outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/20"
                />
              </div>
              <TurnstileField onToken={onToken} />
              {error ? (
                <p className="text-[14px] text-red-700" role="alert">
                  {error}
                </p>
              ) : null}
              <Button type="submit" disabled={pending}>
                {pending ? 'Verzenden…' : 'Offerte aanvragen'}
              </Button>
            </form>
          )}
        </div>
      </Container>
    </main>
  )
}
