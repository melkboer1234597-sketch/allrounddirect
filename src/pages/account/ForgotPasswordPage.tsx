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
  const [fieldError, setFieldError] = useState('')
  const [devUrl, setDevUrl] = useState<string | null>(null)
  const onToken = useCallback((token: string) => setTurnstile(token), [])

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setFieldError('')
    if (!email.trim()) {
      setFieldError('Vul uw e-mailadres in.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFieldError('Vul een geldig e-mailadres in.')
      return
    }
    setPending(true)
    await authClient.requestPasswordReset(
      {
        email: email.trim(),
        redirectTo: '/account/wachtwoord-resetten',
      },
      {
        headers: turnstile ? { 'x-turnstile-token': turnstile } : undefined,
      },
    )
    setPending(false)
    setDone(true)
    try {
      const mailbox = await getDevEmail(email.trim())
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
      <AuthCard
        title="Wachtwoord vergeten"
        description="Vul uw e-mailadres in. Als het bekend is, sturen we instructies om een nieuw wachtwoord in te stellen."
      >
        {done ? (
          <div className="space-y-4 text-[15px] text-ink">
            <p className="leading-relaxed">{GENERIC}</p>
            {devUrl ? (
              <p className="rounded-[8px] bg-surface p-3 text-[13px] text-muted ring-1 ring-line">
                Lokale development:{' '}
                <a className="font-medium text-brand underline" href={devUrl}>
                  wachtwoord resetten
                </a>
              </p>
            ) : null}
            <Link
              to="/account/inloggen"
              className="inline-flex min-h-10 items-center font-medium text-brand hover:underline"
            >
              Terug naar inloggen
            </Link>
          </div>
        ) : (
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
              enterKeyHint="send"
              required
              value={email}
              error={fieldError}
              onChange={(event) => {
                setEmail(event.target.value)
                if (fieldError) setFieldError('')
              }}
            />
            <TurnstileField onToken={onToken} />
            <Button type="submit" className="w-full" disabled={pending} aria-busy={pending}>
              {pending ? 'Bezig…' : 'Verstuur instructies'}
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
