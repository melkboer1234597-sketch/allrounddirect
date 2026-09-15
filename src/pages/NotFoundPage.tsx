import { Link, useLocation } from 'react-router-dom'
import { NOT_FOUND_SEO } from '@/config/site'
import { SeoHead } from '@/components/seo/SeoHead'
import { SearchForm } from '@/components/ui/SearchForm'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { CATALOG_TAXONOMY } from '@/data/taxonomy'

const POPULAR = CATALOG_TAXONOMY.filter((item) =>
  ['meubels', 'vloeren', 'keuken', 'horeca', 'koelen-vriezen'].includes(item.slug),
)

export function NotFoundPage() {
  const { pathname } = useLocation()

  return (
    <main id="main" className="page-shell">
      <SeoHead
        title={NOT_FOUND_SEO.seoTitle}
        description={NOT_FOUND_SEO.description}
        path={pathname}
        robots={NOT_FOUND_SEO.robots}
      />
      <Container>
        <div className="max-w-2xl">
          <h1 className="heading-page text-ink">Pagina niet gevonden</h1>
          <p className="text-body mt-3 text-muted">
            Dit adres bestaat niet of is verplaatst. Zoek een product of ga verder via een
            hoofdcategorie.
          </p>
          <div className="mt-6 max-w-lg">
            <SearchForm id="not-found-search" />
          </div>
          <ul className="mt-6 flex flex-wrap gap-2">
            {POPULAR.map((item) => (
              <li key={item.slug}>
                <Link
                  to={`/${item.slug}`}
                  className="inline-flex min-h-11 items-center rounded-[8px] bg-surface px-3 text-[14px] ring-1 ring-line hover:ring-brand"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button to="/" size="sm">
              Naar homepage
            </Button>
            <Button to="/assortiment" variant="secondary" size="sm">
              Assortiment
            </Button>
          </div>
        </div>
      </Container>
    </main>
  )
}
