import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { PLACEHOLDER_PAGES, SITE } from '@/config/site'
import { SeoHead } from '@/components/seo/SeoHead'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'

export function PlaceholderPage() {
  const { pathname } = useLocation()
  const [params] = useSearchParams()
  const page = PLACEHOLDER_PAGES[pathname] ?? {
    title: 'Pagina',
    description: 'Deze pagina volgt later.',
  }
  const query = params.get('q')

  return (
    <main id="main" className="section-space">
      <SeoHead
        title={page.seoTitle ?? `${page.title} | ${SITE.name}`}
        description={page.description}
        path={pathname}
      />
      <Container>
        <div className="max-w-2xl">
          <h1 className="font-heading text-[32px] leading-tight font-semibold text-ink md:text-[40px]">
            {page.title}
          </h1>
          <p className="mt-4 text-[16px] leading-relaxed text-muted md:text-[17px]">
            {page.description}
          </p>
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
              Zakelijk
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
