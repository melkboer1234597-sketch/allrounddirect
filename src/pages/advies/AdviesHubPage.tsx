import { Link } from 'react-router-dom'
import { SeoHead } from '@/components/seo/SeoHead'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Container } from '@/components/ui/Container'
import { SITE } from '@/config/site'
import { ADVIES_ARTICLES, ADVIES_CLUSTERS } from '@/content/advies/articles'
import { collectionPageJsonLd } from '@/lib/seo'

export function AdviesHubPage() {
  return (
    <main id="main" className="section-space">
      <SeoHead
        title={`Advies | ${SITE.name}`}
        description="Korte, praktische gidsen over vloeren, meubels en later keuken, koelen en horeca. Geen keyword-artikelen, wel echte keuzehulp."
        path="/advies"
        extraJsonLd={[
          {
            id: 'jsonld-collection',
            data: collectionPageJsonLd({
              name: 'Advies',
              path: '/advies',
              description: 'Praktische gidsen van AllRound Direct.',
            }),
          },
        ]}
      />
      <Container>
        <article className="mx-auto max-w-[42rem]">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Advies' }]} />
          <h1 className="heading-display mt-4 text-navy">Advies</h1>
          <p className="text-body mt-4 text-ink">
            Hier komen keuzegidsen en rekenhulpen die bij het assortiment horen. We publiceren
            alleen onderwerpen die we inhoudelijk kunnen onderhouden. Clusters zonder artikel zijn
            gereserveerd; daar vullen we geen nepartikelen.
          </p>
          <ul className="mt-10 space-y-8">
            {ADVIES_CLUSTERS.map((cluster) => {
              const articles = ADVIES_ARTICLES.filter((item) => item.cluster === cluster.slug)
              return (
                <li key={cluster.slug}>
                  <h2 className="font-heading text-[1.375rem] font-semibold text-navy">
                    {cluster.name}
                  </h2>
                  <p className="mt-1 text-[15px] text-muted">{cluster.intro}</p>
                  {articles.length ? (
                    <ul className="mt-3 space-y-2">
                      {articles.map((article) => (
                        <li key={article.slug}>
                          <Link
                            to={`/advies/${article.slug}`}
                            className="text-[16px] text-brand hover:underline"
                          >
                            {article.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-[14px] text-muted">Nog geen gepubliceerde gids.</p>
                  )}
                </li>
              )
            })}
          </ul>
        </article>
      </Container>
    </main>
  )
}
