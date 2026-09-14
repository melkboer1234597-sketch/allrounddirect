import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { FOOTER_ASSORTMENT, FOOTER_BUSINESS, FOOTER_LEGAL, FOOTER_SERVICE } from '@/config/site'
import { Container } from '@/components/ui/Container'
import { assets } from '@/lib/assets'

function FooterColumn({
  title,
  items,
}: {
  title: string
  items: readonly { label: string; href: string }[]
}) {
  return (
    <div>
      <p className="text-[12px] font-semibold tracking-[0.06em] text-white uppercase">{title}</p>
      <ul className="mt-4 space-y-2.5">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              to={item.href}
              className="text-[14px] text-white/75 transition-colors hover:text-white"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function FooterAccordion({
  title,
  items,
}: {
  title: string
  items: readonly { label: string; href: string }[]
}) {
  return (
    <details className="group border-b border-white/10">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between py-1 text-[15px] font-medium text-white [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown
          className="h-4 w-4 text-white/70 transition-transform duration-150 group-open:rotate-180 motion-reduce:transition-none"
          aria-hidden
        />
      </summary>
      <ul className="space-y-2.5 pb-4">
        {items.map((item) => (
          <li key={item.href}>
            <Link to={item.href} className="block min-h-10 py-1 text-[14px] text-white/75">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  )
}

const ABOUT_LINKS = [{ label: 'Over ons', href: '/over-ons' }] as const

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="isolate bg-navy text-white">
      <Container className="pt-10 pb-6 md:pt-14 lg:pt-16 lg:pb-10">
        <div className="max-w-sm">
          <Link to="/" className="inline-flex isolate">
            <img
              src={assets.logoWhite}
              alt="AllRound Direct"
              className="logo-on-dark h-9 w-auto max-w-[200px] object-contain md:h-10"
            />
          </Link>
          <p className="mt-3 text-[14px] leading-relaxed text-white/70">
            Producten voor wonen, keuken, vloer, horeca en zakelijk gebruik.
          </p>
        </div>

        <div className="mt-6 lg:hidden">
          <FooterAccordion title="Assortiment" items={FOOTER_ASSORTMENT} />
          <FooterAccordion title="Klantenservice" items={FOOTER_SERVICE} />
          <FooterAccordion title="Zakelijk" items={FOOTER_BUSINESS} />
          <FooterAccordion title="Over AllRound Direct" items={ABOUT_LINKS} />
        </div>

        <div className="mt-12 hidden grid-cols-4 gap-8 lg:grid">
          <FooterColumn title="Assortiment" items={FOOTER_ASSORTMENT} />
          <FooterColumn title="Klantenservice" items={FOOTER_SERVICE} />
          <FooterColumn title="Zakelijk" items={FOOTER_BUSINESS} />
          <FooterColumn title="Informatie" items={FOOTER_LEGAL} />
        </div>
      </Container>
      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-3 py-4 text-[12px] text-white/55 md:flex-row md:items-center md:justify-between md:py-5 md:text-[13px]">
          <p>© {year} AllRound Direct. Alle rechten voorbehouden.</p>
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            {FOOTER_LEGAL.filter((item) => item.href !== '/over-ons').map((item) => (
              <li key={item.href}>
                <Link to={item.href} className="hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </div>
    </footer>
  )
}
