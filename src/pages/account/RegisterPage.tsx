import { useCallback, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { SeoHead } from '@/components/seo/SeoHead'
import { AuthCard } from '@/components/account/AuthCard'
import { CheckField, PasswordField, TextField } from '@/components/account/Fields'
import { TurnstileField } from '@/components/account/TurnstileField'
import { Button } from '@/components/ui/Button'
import { authClient } from '@/lib/auth-client'
import { getDevEmail } from '@/lib/account-api'

export function RegisterPage() {
  const [params] = useSearchParams()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [terms, setTerms] = useState(false)
  const [marketing, setMarketing] = useState(false)
  const [turnstile, setTurnstile] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState(false)
  const [devUrl, setDevUrl] = useState<string | null>(null)

  const onToken = useCallback((token: string) => setTurnstile(token), [])

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    if (!terms) {
      setError('Ga akkoord met de algemene voorwaarden en privacyverklaring.')
      return
    }
    if (password.length < 10) {
      setError('Kies een wachtwoord van minimaal 10 tekens.')
      return
    }
    setPending(true)
    const { error: authError } = await authClient.signUp.email(
      {
        email,
        password,
        name: `${firstName} ${lastName}`.trim(),
        firstName,
        lastName,
        marketingOptIn: marketing,
        callbackURL: '/account/overzicht',
      },
      {
        headers: {
          ...(turnstile ? { 'x-turnstile-token': turnstile } : {}),
          'x-terms-accepted': 'true',
        },
      },
    )
    setPending(false)
    if (authError) {
      setError(authError.message || 'Registreren is niet gelukt.')
      return
    }
    setDone(true)
    try {
      const mailbox = await getDevEmail(email)
      setDevUrl(mailbox.email?.actionUrl ?? null)
    } catch {
      setDevUrl(null)
    }
  }

  return (
    <>
      <SeoHead
        title="Account aanmaken | AllRound Direct"
        description="Maak een account aan bij AllRound Direct."
        path="/account/registreren"
        robots="noindex,nofollow"
      />
      <AuthCard
        title="Account aanmaken"
        description="U kunt later ook zonder account afrekenen. Een account is handig voor bestellingen en adressen."
      >
        {done ? (
          <div className="space-y-3 text-[15px] text-ink">
            <p>Controleer uw e-mail om het adres te bevestigen.</p>
            {devUrl ? (
              <p className="rounded-[4px] bg-surface p-3 text-[13px]">
                Lokale development: verificatielink staat in de dev-outbox.{' '}
                <a className="text-brand underline" href={devUrl}>
                  E-mail bevestigen
                </a>
              </p>
            ) : null}
            <Button to="/account/inloggen" variant="secondary">
              Naar inloggen
            </Button>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={onSubmit}>
            <TextField
              label="Voornaam"
              name="given-name"
              autoComplete="given-name"
              required
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
            />
            <TextField
              label="Achternaam"
              name="family-name"
              autoComplete="family-name"
              required
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
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
            <PasswordField
              label="Wachtwoord"
              name="new-password"
              autoComplete="new-password"
              required
              minLength={10}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              hint="Minimaal 10 tekens."
            />
            <CheckField
              name="terms"
              required
              checked={terms}
              onChange={setTerms}
              label={
                <>
                  Ik ga akkoord met de{' '}
                  <Link to="/algemene-voorwaarden" className="text-brand underline">
                    algemene voorwaarden
                  </Link>{' '}
                  en heb de{' '}
                  <Link to="/privacy" className="text-brand underline">
                    privacyverklaring
                  </Link>{' '}
                  gelezen.
                </>
              }
            />
            <CheckField
              name="marketing"
              checked={marketing}
              onChange={setMarketing}
              label="Ja, ik wil aanbiedingen en nieuws van AllRound Direct ontvangen. Dit is optioneel."
            />
            <TurnstileField onToken={onToken} />
            {error ? (
              <p className="text-[14px] text-red-700" role="alert">
                {error}
              </p>
            ) : null}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? 'Bezig…' : 'Account aanmaken'}
            </Button>
            <p className="text-center text-[14px] text-muted">
              Al een account?{' '}
              <Link
                to={`/account/inloggen${params.get('volgende') ? `?volgende=${params.get('volgende')}` : ''}`}
                className="text-brand hover:underline"
              >
                Inloggen
              </Link>
            </p>
          </form>
        )}
      </AuthCard>
    </>
  )
}
