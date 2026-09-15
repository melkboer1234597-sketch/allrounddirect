import { useCallback, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { SeoHead } from '@/components/seo/SeoHead'
import { AuthCard } from '@/components/account/AuthCard'
import { CheckField, PasswordField, TextField } from '@/components/account/Fields'
import { TurnstileField } from '@/components/account/TurnstileField'
import { Button } from '@/components/ui/Button'
import { authClient } from '@/lib/auth-client'
import { getDevEmail } from '@/lib/account-api'

type FieldErrors = {
  firstName?: string
  lastName?: string
  email?: string
  password?: string
  terms?: string
}

export function RegisterPage() {
  const [params] = useSearchParams()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [terms, setTerms] = useState(false)
  const [marketing, setMarketing] = useState(false)
  const [turnstile, setTurnstile] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState(false)
  const [devUrl, setDevUrl] = useState<string | null>(null)

  const onToken = useCallback((token: string) => setTurnstile(token), [])

  function validate() {
    const nextErrors: FieldErrors = {}
    if (!firstName.trim()) nextErrors.firstName = 'Vul uw voornaam in.'
    if (!lastName.trim()) nextErrors.lastName = 'Vul uw achternaam in.'
    if (!email.trim()) nextErrors.email = 'Vul uw e-mailadres in.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Vul een geldig e-mailadres in.'
    }
    if (!password) nextErrors.password = 'Kies een wachtwoord.'
    else if (password.length < 10) nextErrors.password = 'Minimaal 10 tekens.'
    if (!terms) nextErrors.terms = 'Ga akkoord met de voorwaarden om door te gaan.'
    setFieldErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    if (!validate()) return
    setPending(true)
    const { error: authError } = await authClient.signUp.email(
      {
        email: email.trim(),
        password,
        name: `${firstName.trim()} ${lastName.trim()}`.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
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
      const mailbox = await getDevEmail(email.trim())
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
        description="Handig voor bestellingen, adressen en favorieten. Afrekenen zonder account blijft mogelijk."
        panelClassName="max-w-lg"
      >
        {done ? (
          <div className="space-y-4 text-[15px] text-ink">
            <p className="leading-relaxed">
              Controleer uw e-mail om het adres te bevestigen. Daarna kunt u inloggen.
            </p>
            {devUrl ? (
              <p className="rounded-[8px] bg-surface p-3 text-[13px] text-muted ring-1 ring-line">
                Lokale development: verificatielink staat in de dev-outbox.{' '}
                <a className="font-medium text-brand underline" href={devUrl}>
                  E-mail bevestigen
                </a>
              </p>
            ) : null}
            <Button to="/account/inloggen" variant="secondary">
              Naar inloggen
            </Button>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={onSubmit} noValidate>
            <div className="grid gap-5 sm:grid-cols-2 sm:gap-4">
              <TextField
                label="Voornaam"
                name="given-name"
                autoComplete="given-name"
                autoCapitalize="words"
                enterKeyHint="next"
                required
                value={firstName}
                error={fieldErrors.firstName}
                onChange={(event) => {
                  setFirstName(event.target.value)
                  if (fieldErrors.firstName) {
                    setFieldErrors((prev) => ({ ...prev, firstName: undefined }))
                  }
                }}
              />
              <TextField
                label="Achternaam"
                name="family-name"
                autoComplete="family-name"
                autoCapitalize="words"
                enterKeyHint="next"
                required
                value={lastName}
                error={fieldErrors.lastName}
                onChange={(event) => {
                  setLastName(event.target.value)
                  if (fieldErrors.lastName) {
                    setFieldErrors((prev) => ({ ...prev, lastName: undefined }))
                  }
                }}
              />
            </div>
            <TextField
              label="E-mailadres"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="next"
              required
              value={email}
              error={fieldErrors.email}
              onChange={(event) => {
                setEmail(event.target.value)
                if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }))
              }}
            />
            <PasswordField
              label="Wachtwoord"
              name="new-password"
              autoComplete="new-password"
              enterKeyHint="done"
              required
              minLength={10}
              value={password}
              error={fieldErrors.password}
              hint="Minimaal 10 tekens."
              onChange={(event) => {
                setPassword(event.target.value)
                if (fieldErrors.password) {
                  setFieldErrors((prev) => ({ ...prev, password: undefined }))
                }
              }}
            />
            <div className="space-y-3.5 pt-0.5">
              <CheckField
                name="terms"
                required
                checked={terms}
                error={fieldErrors.terms}
                onChange={(checked) => {
                  setTerms(checked)
                  if (fieldErrors.terms) setFieldErrors((prev) => ({ ...prev, terms: undefined }))
                }}
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
            </div>
            <TurnstileField onToken={onToken} />
            {error ? (
              <p
                className="rounded-[8px] bg-red-50 px-3 py-2.5 text-[14px] text-red-700 ring-1 ring-red-100"
                role="alert"
              >
                {error}
              </p>
            ) : null}
            <Button type="submit" className="w-full" disabled={pending} aria-busy={pending}>
              {pending ? 'Account wordt aangemaakt…' : 'Account aanmaken'}
            </Button>
            <p className="pt-1 text-center text-[14px] text-muted">
              Al een account?{' '}
              <Link
                to={`/account/inloggen${params.get('volgende') ? `?volgende=${encodeURIComponent(params.get('volgende')!)}` : ''}`}
                className="font-medium text-brand hover:underline"
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
