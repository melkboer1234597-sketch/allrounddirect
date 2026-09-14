import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { getPageSeo, SITE } from '@/config/site'
import { SeoHead } from '@/components/seo/SeoHead'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'

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
    <main id="main" className="section-space">
      <SeoHead
        title={page.seoTitle}
        description={page.description}
        path={canonicalPath}
        robots={page.robots}
      />
      <Container>
        <div className="max-w-2xl">
          <h1 className="heading-display text-ink">{page.title}</h1>
          <p className="text-body mt-4 text-muted">{page.description}</p>
          {pathname === '/zoeken' && query ? (
            <p className="mt-3 text-[15px] text-ink">
              Zoekterm: <span className="font-medium">{query}</span>
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-3">
            <Button to="/">Naar homepage</Button>
            <Button to="/assortiment" variant="secondary">
              Assortiment
            </Button>
          </div>
          <p className="mt-10 text-[14px] text-muted">
            Gerelateerd:{' '}
            <Link to="/zakelijk" className="text-brand hover:underline">
              Zakelijk bestellen
            </Link>
            {' · '}
            <Link to="/contact" className="text-brand hover:underline">
              Contact
            </Link>
            {' · '}
            <Link to="/klantenservice" className="text-brand hover:underline">
              Klantenservice
            </Link>
          </p>
        </div>
      </Container>
    </main>
  )
}
