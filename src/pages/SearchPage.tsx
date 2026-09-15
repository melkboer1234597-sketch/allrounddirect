import { useSearchParams } from 'react-router-dom'
import { CatalogListing } from '@/components/catalog/CatalogListing'
import { SeoHead } from '@/components/seo/SeoHead'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Container } from '@/components/ui/Container'
import { SITE } from '@/config/site'

export function SearchPage() {
  const [params] = useSearchParams()
  const q = params.get('q')?.trim() ?? ''
  const heading = q ? `Zoeken naar “${q}”` : 'Zoeken'

  return (
    <main id="main" className="section-space">
      <SeoHead
        title={`${heading} | ${SITE.name}`}
        description="Zoekresultaten van AllRound Direct."
        path="/zoeken"
        robots="noindex,nofollow"
      />
      <Container>
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Zoeken' }]} />
        <h1 className="heading-page mt-4 text-ink">{heading}</h1>
        <p className="mt-3 text-[15px] text-muted">
          Resultaten op productnaam, SKU, merk en categorie.
        </p>
        <div className="mt-8">
          <CatalogListing
            schemaId="generic"
            pathname="/zoeken"
            searchQuery={q || undefined}
            emptyTitle="Geen zoekresultaten"
            emptyDescription="Pas uw zoekterm of filters aan, of bekijk een andere categorie."
          />
        </div>
      </Container>
    </main>
  )
}
