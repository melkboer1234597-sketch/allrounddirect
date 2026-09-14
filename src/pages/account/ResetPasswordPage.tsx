import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { SeoHead } from '@/components/seo/SeoHead'
import { AuthCard } from '@/components/account/AuthCard'
import { PasswordField } from '@/components/account/Fields'
import { Button } from '@/components/ui/Button'
import { authClient } from '@/lib/auth-client'

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState(false)

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('De wachtwoorden komen niet overeen.')
      return
    }
    if (!token) {
      setError('Deze resetlink is ongeldig of verlopen.')
      return
    }
    setPending(true)
    const { error: authError } = await authClient.resetPassword({
      newPassword: password,
      token,
    })
    setPending(false)
    if (authError) {
      setError(authError.message || 'Opnieuw instellen is niet gelukt.')
      return
    }
    setDone(true)
  }

  return (
    <>
      <SeoHead
        title="Wachtwoord resetten | AllRound Direct"
        description="Stel een nieuw wachtwoord in voor uw AllRound Direct-account."
        path="/account/wachtwoord-resetten"
        robots="noindex,nofollow"
      />
      <AuthCard title="Nieuw wachtwoord">
        {done ? (
          <p className="text-[15px]">
            Uw wachtwoord is gewijzigd.{' '}
            <Link to="/account/inloggen" className="text-brand hover:underline">
              Inloggen
            </Link>
          </p>
        ) : (
          <form className="space-y-4" onSubmit={onSubmit}>
            <PasswordField
              label="Nieuw wachtwoord"
              name="new-password"
              autoComplete="new-password"
              required
              minLength={10}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              hint="Minimaal 10 tekens."
            />
            <PasswordField
              label="Bevestig wachtwoord"
              name="confirm-password"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
            />
            {error ? (
              <p className="text-[14px] text-red-700" role="alert">
                {error}
              </p>
            ) : null}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? 'Bezig…' : 'Wachtwoord opslaan'}
            </Button>
          </form>
        )}
      </AuthCard>
    </>
  )
}
