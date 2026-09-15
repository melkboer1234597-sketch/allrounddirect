import { FileText, RotateCcw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SeoHead } from '@/components/seo/SeoHead'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'

export function ComingSoonAccountPage({
  title,
  path,
  description,
  icon,
}: {
  title: string
  path: string
  description: string
  icon?: React.ReactNode
}) {
  return (
    <>
      <SeoHead
        title={`${title} | AllRound Direct`}
        description={description}
        path={path}
        robots="noindex,nofollow"
      />
      <h1 className="font-heading text-[26px] font-semibold text-navy">{title}</h1>
      <div className="mt-4">
        <EmptyState
          icon={icon}
          title="Nog niet beschikbaar in het account"
          description={description}
          action={<Button to="/account/overzicht" size="sm" variant="secondary">Naar overzicht</Button>}
          secondary={
            path === '/account/retouren' ? (
              <span className="text-[14px] text-muted">
                <Link to="/retourneren" className="text-brand hover:underline">
                  Retourbeleid
                </Link>
                {' · '}
                <Link to="/herroepen" className="text-brand hover:underline">
                  Herroepen
                </Link>
              </span>
            ) : (
              <Link to="/contact" className="text-[14px] font-medium text-brand hover:underline">
                Contact
              </Link>
            )
          }
        />
      </div>
    </>
  )
}

export function InvoicesPage() {
  return (
    <ComingSoonAccountPage
      title="Facturen"
      path="/account/facturen"
      icon={<FileText className="h-5 w-5" strokeWidth={1.75} />}
      description="Factuur-pdf’s in het klantaccount volgen nog. Order- en betaalgegevens staan al bij uw bestelling."
    />
  )
}

export function ReturnsPage() {
  return (
    <ComingSoonAccountPage
      title="Retouren"
      path="/account/retouren"
      icon={<RotateCcw className="h-5 w-5" strokeWidth={1.75} />}
      description="Online retouraanvragen in het account volgen later. Tot die tijd gebruikt u het retourbeleid of neemt u contact op."
    />
  )
}
