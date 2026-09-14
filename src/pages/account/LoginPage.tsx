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
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [showTurnstile, setShowTurnstile] = useState(false)

  const onToken = useCallback((token: string) => setTurnstile(token), [])

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    setPending(true)
    const { error: authError } = await authClient.signIn.email(
      {
        email,
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
      setError(authError.message || 'Inloggen is niet gelukt.')
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
        <form className="space-y-4" onSubmit={onSubmit}>
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
            name="current-password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {showTurnstile ? <TurnstileField onToken={onToken} /> : null}
          {error ? (
            <p className="text-[14px] text-red-700" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Bezig…' : 'Inloggen'}
          </Button>
          <p className="text-center text-[14px] text-muted">
            <Link to="/account/wachtwoord-vergeten" className="text-brand hover:underline">
              Wachtwoord vergeten?
            </Link>
          </p>
          <p className="text-center text-[14px] text-muted">
            Nog geen account?{' '}
            <Link to="/account/registreren" className="text-brand hover:underline">
              Account aanmaken
            </Link>
          </p>
        </form>
      </AuthCard>
    </>
  )
}
