import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { SeoHead } from '@/components/seo/SeoHead'
import { AuthCard } from '@/components/account/AuthCard'
import { TextField } from '@/components/account/Fields'
import { TurnstileField } from '@/components/account/TurnstileField'
import { Button } from '@/components/ui/Button'
import { authClient } from '@/lib/auth-client'
import { getDevEmail } from '@/lib/account-api'

const GENERIC = 'Als dit e-mailadres bij ons bekend is, ontvangt u instructies.'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [turnstile, setTurnstile] = useState('')
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState(false)
  const [devUrl, setDevUrl] = useState<string | null>(null)
  const onToken = useCallback((token: string) => setTurnstile(token), [])

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setPending(true)
    await authClient.requestPasswordReset(
      {
        email,
        redirectTo: '/account/wachtwoord-resetten',
      },
      {
        headers: turnstile ? { 'x-turnstile-token': turnstile } : undefined,
      },
    )
    setPending(false)
    setDone(true)
    try {
      const mailbox = await getDevEmail(email)
      setDevUrl(mailbox.email?.type === 'password_reset' ? mailbox.email.actionUrl : null)
    } catch {
      setDevUrl(null)
    }
  }

  return (
    <>
      <SeoHead
        title="Wachtwoord vergeten | AllRound Direct"
        description="Vraag een nieuw wachtwoord aan bij AllRound Direct."
        path="/account/wachtwoord-vergeten"
        robots="noindex,nofollow"
      />
      <AuthCard title="Wachtwoord vergeten">
        {done ? (
          <div className="space-y-3 text-[15px]">
            <p>{GENERIC}</p>
            {devUrl ? (
              <p className="rounded-[4px] bg-surface p-3 text-[13px]">
                Lokale development:{' '}
                <a className="text-brand underline" href={devUrl}>
                  wachtwoord resetten
                </a>
              </p>
            ) : null}
            <Link to="/account/inloggen" className="text-brand hover:underline">
              Terug naar inloggen
            </Link>
          </div>
        ) : (
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
            <TurnstileField onToken={onToken} />
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? 'Bezig…' : 'Verstuur instructies'}
            </Button>
          </form>
        )}
      </AuthCard>
    </>
  )
}
