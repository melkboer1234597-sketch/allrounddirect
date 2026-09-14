import { Link, Navigate } from 'react-router-dom'
import { SeoHead } from '@/components/seo/SeoHead'
import { AuthCard } from '@/components/account/AuthCard'
import { Button } from '@/components/ui/Button'
import { useAuthSession } from '@/hooks/useAccount'

export function AccountIndexPage() {
  const { data, isPending } = useAuthSession()

  if (isPending) {
    return (
      <main id="main" className="section-space">
        <p className="text-center text-muted">Laden…</p>
      </main>
    )
  }

  if (data?.user) {
    return <Navigate to="/account/overzicht" replace />
  }

  return (
    <>
      <SeoHead
        title="Account | AllRound Direct"
        description="Inloggen of een account aanmaken bij AllRound Direct."
        path="/account"
        robots="noindex,nofollow"
      />
      <AuthCard
        title="Mijn account"
        description="Bekijk bestellingen, adressen en favorieten. Afrekenen zonder account blijft mogelijk."
      >
        <div className="flex flex-col gap-3">
          <Button to="/account/inloggen">Inloggen</Button>
          <Button to="/account/registreren" variant="secondary">
            Account aanmaken
          </Button>
          <Link
            to="/bestelling-volgen"
            className="text-center text-[14px] text-brand hover:underline"
          >
            Bestelling volgen zonder account
          </Link>
        </div>
      </AuthCard>
    </>
  )
}
