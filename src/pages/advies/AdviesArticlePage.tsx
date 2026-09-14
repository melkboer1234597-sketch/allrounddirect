import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { SeoHead } from '@/components/seo/SeoHead'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Container } from '@/components/ui/Container'
import { SITE } from '@/config/site'
import { ADVIES_CLUSTERS, getAdviesArticle } from '@/content/advies/articles'
import { articleJsonLd } from '@/lib/seo'
import { NotFoundPage } from '@/pages/NotFoundPage'

function FloorCalculator() {
  const [length, setLength] = useState('5')
  const [width, setWidth] = useState('4')
  const [waste, setWaste] = useState('8')
  const area = Number(length) * Number(width)
  const withWaste = area * (1 + Number(waste) / 100)
  const valid = Number.isFinite(area) && area > 0 && area < 10000

  return (
    <form
      className="mt-6 rounded-[12px] bg-surface p-5"
      onSubmit={(event) => event.preventDefault()}
    >
      <h3 className="font-heading text-[18px] font-semibold text-navy">Oppervlakte (indicatie)</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="text-[14px]">
          Lengte (m)
          <input
            className="mt-1 h-11 w-full rounded-[4px] border border-line px-3"
            inputMode="decimal"
            value={length}
            onChange={(event) => setLength(event.target.value)}
          />
        </label>
        <label className="text-[14px]">
          Breedte (m)
          <input
            className="mt-1 h-11 w-full rounded-[4px] border border-line px-3"
            inputMode="decimal"
            value={width}
            onChange={(event) => setWidth(event.target.value)}
          />
        </label>
        <label className="text-[14px]">
          Snijverlies (%)
          <input
            className="mt-1 h-11 w-full rounded-[4px] border border-line px-3"
            inputMode="decimal"
            value={waste}
            onChange={(event) => setWaste(event.target.value)}
          />
        </label>
      </div>
      <p className="mt-4 text-[15px] text-ink">
        {valid
          ? `Ongeveer ${area.toFixed(1)} m², inclusief verlies ${withWaste.toFixed(1)} m². Rond af naar hele pakken.`
          : 'Vul geldige maten in.'}
      </p>
    </form>
  )
}

export function AdviesArticlePage() {
  const { slug = '' } = useParams()
  const article = getAdviesArticle(slug)
  const cluster = useMemo(
    () => ADVIES_CLUSTERS.find((item) => item.slug === article?.cluster),
    [article],
  )

  if (!article) return <NotFoundPage />

  return (
    <main id="main" className="section-space">
      <SeoHead
        title={`${article.title} | ${SITE.name}`}
        description={article.description}
        path={`/advies/${article.slug}`}
        ogType="article"
        extraJsonLd={[
          {
            id: 'jsonld-article',
            data: articleJsonLd({
              title: article.title,
              description: article.description,
              path: `/advies/${article.slug}`,
              datePublished: article.datePublished,
            }),
          },
        ]}
      />
      <Container>
        <article className="mx-auto max-w-[42rem]">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Advies', href: '/advies' },
              { label: article.title },
            ]}
          />
          <h1 className="heading-display mt-4 text-navy">{article.title}</h1>
          <p className="text-body mt-4 text-ink">{article.description}</p>
          {article.sections.map((section) => (
            <section key={section.heading} className="mt-8">
              <h2 className="font-heading text-[1.375rem] font-semibold text-navy">
                {section.heading}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="mt-3 text-[16px] leading-[1.7] text-ink">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
          {article.slug === 'hoeveel-vloer-heb-ik-nodig' ? <FloorCalculator /> : null}
          <p className="mt-10 text-[15px]">
            {cluster ? (
              <>
                Cluster {cluster.name}.{' '}
                <Link to="/advies" className="text-brand hover:underline">
                  Alle adviesgidsen
                </Link>
                {article.cluster === 'vloeren' ? (
                  <>
                    {' · '}
                    <Link to="/vloeren" className="text-brand hover:underline">
                      Vloeren in de shop
                    </Link>
                  </>
                ) : null}
                {article.cluster === 'meubels' ? (
                  <>
                    {' · '}
                    <Link to="/meubels/banken" className="text-brand hover:underline">
                      Banken
                    </Link>
                  </>
                ) : null}
              </>
            ) : null}
          </p>
        </article>
      </Container>
    </main>
  )
}
