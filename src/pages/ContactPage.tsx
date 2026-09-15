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

export function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
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
        subject,
        message,
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
        title="Contact | AllRound Direct"
        description="Neem contact op met AllRound Direct over producten, levering of een zakelijke aanvraag."
        path="/contact"
      />
      <Container>
        <div className="mx-auto max-w-[42rem]">
          <h1 className="heading-page text-navy">Contact</h1>
          <p className="text-body mt-4 text-ink">
            Heeft u een vraag over een product, levering of een zakelijke aanvraag? Stuur een
            bericht. Voor herroeping van een aankoop gebruikt u bij voorkeur{' '}
            <Link to="/herroepen" className="text-brand underline">
              Overeenkomst herroepen
            </Link>
            , zodat de datum en tijd worden vastgelegd.
          </p>
          <p className="mt-4 rounded-[8px] bg-surface px-4 py-3 text-[13px] text-muted">
            {CONCEPT_NOTICE}
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
                label="E-mailadres"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <TextField
                label="Onderwerp"
                name="subject"
                required
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
              />
              <div className="space-y-1.5">
                <label htmlFor="contact-message" className="block text-[14px] font-medium text-ink">
                  Bericht
                </label>
                <textarea
                  id="contact-message"
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
                {pending ? 'Verzenden…' : 'Bericht versturen'}
              </Button>
            </form>
          )}
        </div>
      </Container>
    </main>
  )
}
