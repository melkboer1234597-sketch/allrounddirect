import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CONCEPT_NOTICE, COOKIE_INVENTORY, type CookieInventoryRow } from '@/config/legal'
import type { LegalDoc } from '@/content/legal/types'
import { SeoHead } from '@/components/seo/SeoHead'
import { Container } from '@/components/ui/Container'
import { cn } from '@/lib/cn'

const CATEGORY_LABEL: Record<CookieInventoryRow['category'], string> = {
  necessary: 'Noodzakelijk',
  preferences: 'Voorkeuren',
  analytics: 'Analytics',
  marketing: 'Marketing',
}

function CookieTable() {
  return (
    <div className="mt-4 overflow-x-auto rounded-[8px] ring-1 ring-line">
      <table className="w-full min-w-[640px] text-left text-[14px]">
        <caption className="sr-only">Overzicht van gebruikte cookies en lokale opslag</caption>
        <thead className="bg-surface text-[12px] tracking-wide text-muted uppercase">
          <tr>
            <th className="px-3 py-2 font-semibold">Naam</th>
            <th className="px-3 py-2 font-semibold">Aanbieder</th>
            <th className="px-3 py-2 font-semibold">Doel</th>
            <th className="px-3 py-2 font-semibold">Categorie</th>
            <th className="px-3 py-2 font-semibold">Duur</th>
          </tr>
        </thead>
        <tbody>
          {COOKIE_INVENTORY.map((row) => (
            <tr key={row.name} className="border-t border-line">
              <td className="px-3 py-2 font-medium text-ink">{row.name}</td>
              <td className="px-3 py-2">{row.provider}</td>
              <td className="px-3 py-2">{row.purpose}</td>
              <td className="px-3 py-2">{CATEGORY_LABEL[row.category]}</td>
              <td className="px-3 py-2">{row.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function LegalDocument({ doc, extra }: { doc: LegalDoc; extra?: ReactNode }) {
  return (
    <main id="main" className="section-space bg-white">
      <SeoHead
        title={`${doc.title} | AllRound Direct`}
        description={doc.description}
        path={doc.path}
      />
      <Container>
        <article className="mx-auto max-w-[42rem]">
          <h1 className="heading-page text-navy">{doc.title}</h1>
          <p className="text-body mt-4 text-ink">{doc.intro}</p>
          <p className="mt-4 rounded-[8px] bg-surface px-4 py-3 text-[13px] leading-relaxed text-muted">
            {CONCEPT_NOTICE}
          </p>

          <nav aria-label="Inhoudsopgave" className="mt-8 border-t border-line pt-6">
            <p className="text-[13px] font-semibold tracking-wide text-navy uppercase">Inhoud</p>
            <ol className="mt-3 space-y-1.5 text-[15px]">
              {doc.sections.map((section, index) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className="text-brand hover:underline">
                    {index + 1}. {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {doc.sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-24 border-t border-line pt-8 mt-8"
            >
              <h2 className="font-heading text-[1.375rem] font-semibold text-navy">
                {section.title}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 48)} className="mt-3 text-[16px] leading-[1.7] text-ink">
                  {paragraph}
                </p>
              ))}
              {section.id === 'tabel' ? <CookieTable /> : null}
            </section>
          ))}

          {extra}

          <p className="mt-10 text-[14px] text-muted">
            <Link to="/contact" className="text-brand hover:underline">
              Contact
            </Link>
            {' · '}
            <Link to="/privacy" className="text-brand hover:underline">
              Privacy
            </Link>
            {' · '}
            <Link to="/cookies" className="text-brand hover:underline">
              Cookies
            </Link>
          </p>
        </article>
      </Container>
    </main>
  )
}

export function LegalHubLinks({ className }: { className?: string }) {
  return (
    <ul className={cn('mt-4 space-y-2 text-[15px]', className)}>
      <li>
        <Link className="text-brand hover:underline" to="/herroepen">
          Overeenkomst herroepen
        </Link>
      </li>
      <li>
        <Link className="text-brand hover:underline" to="/herroepingsformulier">
          Modelformulier herroeping
        </Link>
      </li>
    </ul>
  )
}
