import { Link } from 'react-router-dom'
import { NOT_FOUND_SEO } from '@/config/site'
import { SeoHead } from '@/components/seo/SeoHead'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'

export function NotFoundPage() {
  return (
    <main id="main" className="section-space">
      <SeoHead
        title={NOT_FOUND_SEO.seoTitle}
        description={NOT_FOUND_SEO.description}
        path="/"
        robots={NOT_FOUND_SEO.robots}
      />
      <Container>
        <div className="max-w-2xl">
          <h1 className="heading-display text-ink">Pagina niet gevonden</h1>
          <p className="text-body mt-4 text-muted">
            Deze pagina bestaat niet of is verplaatst. Ga terug naar de homepage of bekijk het
            assortiment.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button to="/">Naar homepage</Button>
            <Button to="/assortiment" variant="secondary">
              Assortiment
            </Button>
          </div>
          <p className="mt-10 text-[14px] text-muted">
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
