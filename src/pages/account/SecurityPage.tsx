import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { SeoHead } from '@/components/seo/SeoHead'
import { PasswordField } from '@/components/account/Fields'
import { Button } from '@/components/ui/Button'
import { authClient } from '@/lib/auth-client'
import { useAccount } from '@/hooks/useAccount'
import { useState } from 'react'

export function SecurityPage() {
  const { user } = useAccount()
  const navigate = useNavigate()
  const [currentPassword, setCurrent] = useState('')
  const [newPassword, setNew] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const sessions = useQuery({
    queryKey: ['account', 'sessions'],
    queryFn: async () => {
      const result = await authClient.listSessions()
      return result.data ?? []
    },
  })

  async function changePassword(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    setMessage('')
    const { error: authError } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    })
    if (authError) {
      setError(authError.message || 'Wachtwoord wijzigen is niet gelukt.')
      return
    }
    setCurrent('')
    setNew('')
    setMessage('Wachtwoord gewijzigd. Andere sessies zijn beëindigd.')
  }

  async function logoutOthers() {
    await authClient.revokeOtherSessions()
    setMessage('Uitgelogd op andere apparaten.')
  }

  async function logout() {
    await authClient.signOut()
    navigate('/account/inloggen')
  }

  return (
    <>
      <SeoHead
        title="Beveiliging | AllRound Direct"
        description="Wachtwoord en sessies van uw account."
        path="/account/beveiliging"
        robots="noindex,nofollow"
      />
      <h1 className="font-heading text-[26px] font-semibold text-navy">Beveiliging</h1>
      <section className="mt-4 rounded-[12px] bg-white p-5 ring-1 ring-line">
        <h2 className="font-heading text-[18px] font-semibold text-navy">E-mailverificatie</h2>
        <p className="mt-2 text-[14px]">
          {user.emailVerified
            ? 'Uw e-mailadres is bevestigd.'
            : 'Uw e-mailadres is nog niet bevestigd.'}
        </p>
        {!user.emailVerified ? (
          <Button
            className="mt-3"
            variant="secondary"
            type="button"
            onClick={() => authClient.sendVerificationEmail({ email: user.email })}
          >
            Verstuur bevestigingsmail
          </Button>
        ) : null}
      </section>
      <form
        className="mt-4 max-w-xl space-y-3 rounded-[12px] bg-white p-5 ring-1 ring-line"
        onSubmit={changePassword}
      >
        <h2 className="font-heading text-[18px] font-semibold text-navy">Wachtwoord wijzigen</h2>
        <PasswordField
          label="Huidig wachtwoord"
          autoComplete="current-password"
          required
          value={currentPassword}
          onChange={(e) => setCurrent(e.target.value)}
        />
        <PasswordField
          label="Nieuw wachtwoord"
          autoComplete="new-password"
          required
          minLength={10}
          value={newPassword}
          onChange={(e) => setNew(e.target.value)}
        />
        {error ? <p className="text-[14px] text-red-700">{error}</p> : null}
        {message ? <p className="text-[14px]">{message}</p> : null}
        <Button type="submit">Wachtwoord opslaan</Button>
      </form>
      <section className="mt-4 rounded-[12px] bg-white p-5 ring-1 ring-line">
        <h2 className="font-heading text-[18px] font-semibold text-navy">Sessies</h2>
        <p className="mt-2 text-[14px] text-muted">
          {sessions.data?.length
            ? `${sessions.data.length} actieve sessie(s).`
            : 'De huidige sessie is actief op dit apparaat.'}
        </p>
        <p className="mt-2 text-[13px] text-muted">
          Twee-factor-authenticatie volgt later. De sessie-infrastructuur is daarop voorbereid.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button type="button" variant="secondary" onClick={logoutOthers}>
            Uitloggen op andere apparaten
          </Button>
          <Button type="button" variant="secondary" onClick={logout}>
            Uitloggen
          </Button>
        </div>
      </section>
    </>
  )
}
