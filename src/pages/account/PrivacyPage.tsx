import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SeoHead } from '@/components/seo/SeoHead'
import { CheckField } from '@/components/account/Fields'
import { Button } from '@/components/ui/Button'
import { useAccount } from '@/hooks/useAccount'
import { requestAccountDeletion, updatePrivacy } from '@/lib/account-api'
import { authClient } from '@/lib/auth-client'
import { openCookieSettings } from '@/lib/consent'

export function PrivacyPage() {
  const { user, refetch } = useAccount()
  const navigate = useNavigate()
  const [marketing, setMarketing] = useState(user.marketingOptIn)
  const [message, setMessage] = useState('')

  return (
    <>
      <SeoHead
        title="Privacy | AllRound Direct"
        description="Privacy-instellingen van uw account."
        path="/account/privacy"
        robots="noindex,nofollow"
      />
      <h1 className="font-heading text-[26px] font-semibold text-navy">Privacy</h1>
      <section className="mt-4 space-y-4 rounded-[12px] bg-white p-5 ring-1 ring-line">
        <CheckField
          checked={marketing}
          onChange={setMarketing}
          label="Ja, ik wil aanbiedingen en nieuws van AllRound Direct ontvangen."
        />
        <Button
          type="button"
          onClick={async () => {
            await updatePrivacy(marketing)
            await refetch()
            setMessage('Voorkeur opgeslagen.')
          }}
        >
          Voorkeur opslaan
        </Button>
        {message ? <p className="text-[14px]">{message}</p> : null}
        <p className="text-[14px]">
          <button
            type="button"
            className="text-brand underline"
            onClick={() => openCookieSettings()}
          >
            Cookie-instellingen
          </button>
          {' · '}
          <Link to="/cookies" className="text-brand underline">
            cookieverklaring
          </Link>
          {' · '}
          <Link to="/privacy" className="text-brand underline">
            privacyverklaring
          </Link>
          .
        </p>
      </section>
      <section className="mt-4 rounded-[12px] bg-white p-5 ring-1 ring-line">
        <h2 className="font-heading text-[18px] font-semibold text-navy">Account verwijderen</h2>
        <p className="mt-2 text-[14px] text-muted">
          Een verwijderverzoek sluit de inlog. Bestellingen, facturen en gegevens die we wettelijk
          moeten bewaren blijven in de orderadministratie staan, los van uw accounttoegang.
        </p>
        <Button
          className="mt-4"
          variant="secondary"
          type="button"
          onClick={async () => {
            const confirmed = window.confirm(
              'Verwijderverzoek indienen? U kunt daarna niet meer inloggen. Ordergegevens blijven bewaard.',
            )
            if (!confirmed) return
            await requestAccountDeletion()
            await authClient.revokeSessions()
            await authClient.signOut()
            navigate('/account')
          }}
        >
          Verwijderverzoek indienen
        </Button>
      </section>
    </>
  )
}
