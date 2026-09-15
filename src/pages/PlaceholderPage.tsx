import { useLocation, useSearchParams } from 'react-router-dom'
import { getPageSeo, SITE } from '@/config/site'
import { SeoHead } from '@/components/seo/SeoHead'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { EmptyState } from '@/components/ui/EmptyState'

export function PlaceholderPage() {
  const { pathname } = useLocation()
  const [params] = useSearchParams()
  const page = getPageSeo(pathname) ?? {
    title: 'Pagina',
    description: 'Deze pagina volgt later.',
    seoTitle: `Pagina | ${SITE.name}`,
    robots: 'noindex,nofollow' as const,
    path: pathname,
    sitemap: false,
  }
  const query = params.get('q')
  const canonicalPath = pathname === '/zoeken' ? '/zoeken' : page.path

  return (
    <main id="main" className="page-shell">
      <SeoHead
        title={page.seoTitle}
        description={page.description}
        path={canonicalPath}
        robots={page.robots}
      />
      <Container>
        <h1 className="heading-page text-ink">{page.title}</h1>
        {pathname === '/zoeken' && query ? (
          <p className="mt-3 text-[15px] text-ink">
            Zoekterm: <span className="font-medium">{query}</span>
          </p>
        ) : null}
        <div className="mt-6">
          <EmptyState
            title="Deze pagina is nog in opbouw"
            description={page.description}
            action={<Button to="/assortiment">Naar assortiment</Button>}
            secondary={
              <Button to="/" variant="text">
                Homepage
              </Button>
            }
          />
        </div>
      </Container>
    </main>
  )
}
