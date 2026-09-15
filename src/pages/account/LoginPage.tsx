import { useCallback, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { SeoHead } from '@/components/seo/SeoHead'
import { AuthCard } from '@/components/account/AuthCard'
import { PasswordField, TextField } from '@/components/account/Fields'
import { TurnstileField } from '@/components/account/TurnstileField'
import { Button } from '@/components/ui/Button'
import { authClient } from '@/lib/auth-client'
import { safeInternalPath } from '@/lib/safe-path'

export function LoginPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const next = safeInternalPath(params.get('volgende'), '/account/overzicht')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [turnstile, setTurnstile] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [showTurnstile, setShowTurnstile] = useState(false)

  const onToken = useCallback((token: string) => setTurnstile(token), [])

  function validate() {
    const nextErrors: { email?: string; password?: string } = {}
    if (!email.trim()) nextErrors.email = 'Vul uw e-mailadres in.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Vul een geldig e-mailadres in.'
    }
    if (!password) nextErrors.password = 'Vul uw wachtwoord in.'
    setFieldErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    if (!validate()) return
    setPending(true)
    const { error: authError } = await authClient.signIn.email(
      {
        email: email.trim(),
        password,
        callbackURL: '/account/overzicht',
      },
      {
        headers: turnstile ? { 'x-turnstile-token': turnstile } : undefined,
      },
    )
    setPending(false)
    if (authError) {
      const payload = authError as { message?: string; status?: number }
      if (payload.message?.toLowerCase().includes('turnstile') || authError.status === 400) {
        setShowTurnstile(true)
      }
      setError(authError.message || 'Inloggen is niet gelukt. Controleer e-mail en wachtwoord.')
      return
    }
    navigate(next)
  }

  return (
    <>
      <SeoHead
        title="Inloggen | AllRound Direct"
        description="Log in op uw AllRound Direct-account."
        path="/account/inloggen"
        robots="noindex,nofollow"
      />
      <AuthCard
        title="Inloggen"
        description="Welkom terug. Afrekenen zonder account blijft mogelijk."
      >
        <form className="space-y-5" onSubmit={onSubmit} noValidate>
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
            name="current-password"
            autoComplete="current-password"
            enterKeyHint="go"
            required
            value={password}
            error={fieldErrors.password}
            labelAside={
              <Link to="/account/wachtwoord-vergeten" className="text-brand hover:underline">
                Vergeten?
              </Link>
            }
            onChange={(event) => {
              setPassword(event.target.value)
              if (fieldErrors.password) {
                setFieldErrors((prev) => ({ ...prev, password: undefined }))
              }
            }}
          />
          {showTurnstile ? <TurnstileField onToken={onToken} /> : null}
          {error ? (
            <p
              className="rounded-[8px] bg-red-50 px-3 py-2.5 text-[14px] text-red-700 ring-1 ring-red-100"
              role="alert"
            >
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={pending} aria-busy={pending}>
            {pending ? 'Bezig met inloggen…' : 'Inloggen'}
          </Button>
          <p className="pt-1 text-center text-[14px] text-muted">
            Nog geen account?{' '}
            <Link
              to={`/account/registreren${params.get('volgende') ? `?volgende=${encodeURIComponent(params.get('volgende')!)}` : ''}`}
              className="font-medium text-brand hover:underline"
            >
              Account aanmaken
            </Link>
          </p>
        </form>
      </AuthCard>
    </>
  )
}
