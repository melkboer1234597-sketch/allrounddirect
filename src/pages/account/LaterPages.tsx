import { Link } from 'react-router-dom'
import { SeoHead } from '@/components/seo/SeoHead'

export function ComingSoonAccountPage({
  title,
  path,
  description,
}: {
  title: string
  path: string
  description: string
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
      <div className="mt-4 rounded-[12px] bg-white p-5 text-[15px] ring-1 ring-line">
        <p>{description}</p>
        {path === '/account/retouren' ? (
          <p className="mt-3">
            <Link to="/retourneren" className="text-brand hover:underline">
              Retourbeleid
            </Link>
            {' · '}
            <Link to="/herroepen" className="text-brand hover:underline">
              Overeenkomst herroepen
            </Link>
          </p>
        ) : null}
        <p className="mt-3 text-muted">
          <Link to="/account/overzicht" className="text-brand hover:underline">
            Terug naar overzicht
          </Link>
          {' · '}
          <Link to="/contact" className="text-brand hover:underline">
            Contact
          </Link>
        </p>
      </div>
    </>
  )
}

export function InvoicesPage() {
  return (
    <ComingSoonAccountPage
      title="Facturen"
      path="/account/facturen"
      description="Factuur-pdf’s in het klantaccount volgen nog. Order- en betaalgegevens staan al in uw bestelling en in onze administratie."
    />
  )
}

export function ReturnsPage() {
  return (
    <ComingSoonAccountPage
      title="Retouren"
      path="/account/retouren"
      description="Online retouraanvragen in het account volgen later. Tot die tijd gebruikt u het retourbeleid of neemt u contact op."
    />
  )
}
