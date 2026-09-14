import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SeoHead } from '@/components/seo/SeoHead'
import { PasswordField, TextField } from '@/components/account/Fields'
import { TurnstileField } from '@/components/account/TurnstileField'
import { Button } from '@/components/ui/Button'
import { assets } from '@/lib/assets'
import { authClient } from '@/lib/auth-client'
import { adminFetch } from '@/lib/admin-api'
import { ApiError } from '@/lib/api'

const GENERIC = 'Aanmelden is niet gelukt.'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [turnstile, setTurnstile] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const onToken = useCallback((token: string) => setTurnstile(token), [])

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    setPending(true)
    const { error: authError } = await authClient.signIn.email(
      { email, password, callbackURL: '/scotdejewish/dashboard' },
      {
        headers: {
          'x-admin-login': '1',
          ...(turnstile ? { 'x-turnstile-token': turnstile } : {}),
        },
      },
    )
    if (authError) {
      setPending(false)
      setError(GENERIC)
      return
    }
    try {
      await adminFetch('/session')
      navigate('/scotdejewish/dashboard')
    } catch (err) {
      setError(err instanceof ApiError && err.status === 403 ? 'Geen toegang.' : GENERIC)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-4">
      <SeoHead
        title="Beheer | AllRound Direct"
        description="Interne beheeromgeving."
        path="/scotdejewish/login"
        robots="noindex,nofollow"
      />
      <div className="w-full max-w-sm rounded-[12px] bg-white p-6">
        <img
          src={assets.logoHeader}
          alt="AllRound Direct"
          className="logo-on-light mx-auto h-9 w-auto"
        />
        <h1 className="mt-4 text-center font-heading text-[22px] font-semibold text-navy">
          Beheer
        </h1>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <TextField
            label="E-mailadres"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <PasswordField
            label="Wachtwoord"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <TurnstileField onToken={onToken} />
          {error ? (
            <p className="text-[14px] text-red-700" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Bezig…' : 'Inloggen'}
          </Button>
        </form>
      </div>
    </div>
  )
}
