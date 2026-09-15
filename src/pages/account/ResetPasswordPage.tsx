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
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirm?: string }>({})
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState(false)

  function validate() {
    const nextErrors: { password?: string; confirm?: string } = {}
    if (!password) nextErrors.password = 'Kies een nieuw wachtwoord.'
    else if (password.length < 10) nextErrors.password = 'Minimaal 10 tekens.'
    if (!confirm) nextErrors.confirm = 'Bevestig uw wachtwoord.'
    else if (password !== confirm) nextErrors.confirm = 'De wachtwoorden komen niet overeen.'
    if (!token) setError('Deze resetlink is ongeldig of verlopen.')
    setFieldErrors(nextErrors)
    return Object.keys(nextErrors).length === 0 && Boolean(token)
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    if (!validate()) return
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
      <AuthCard
        title="Nieuw wachtwoord"
        description="Kies een sterk wachtwoord van minimaal 10 tekens."
      >
        {done ? (
          <div className="space-y-4 text-[15px] text-ink">
            <p>Uw wachtwoord is gewijzigd. U kunt nu inloggen.</p>
            <Button to="/account/inloggen">Inloggen</Button>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={onSubmit} noValidate>
            <PasswordField
              label="Nieuw wachtwoord"
              name="new-password"
              autoComplete="new-password"
              enterKeyHint="next"
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
            <PasswordField
              label="Bevestig wachtwoord"
              name="confirm-password"
              autoComplete="new-password"
              enterKeyHint="done"
              required
              value={confirm}
              error={fieldErrors.confirm}
              onChange={(event) => {
                setConfirm(event.target.value)
                if (fieldErrors.confirm) {
                  setFieldErrors((prev) => ({ ...prev, confirm: undefined }))
                }
              }}
            />
            {error ? (
              <p
                className="rounded-[8px] bg-red-50 px-3 py-2.5 text-[14px] text-red-700 ring-1 ring-red-100"
                role="alert"
              >
                {error}
              </p>
            ) : null}
            <Button type="submit" className="w-full" disabled={pending} aria-busy={pending}>
              {pending ? 'Bezig…' : 'Wachtwoord opslaan'}
            </Button>
            <p className="pt-1 text-center text-[14px] text-muted">
              <Link to="/account/inloggen" className="font-medium text-brand hover:underline">
                Terug naar inloggen
              </Link>
            </p>
          </form>
        )}
      </AuthCard>
    </>
  )
}
