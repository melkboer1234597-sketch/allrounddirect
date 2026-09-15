import { CategoryCard } from '@/components/ui/CategoryCard'
import { Container } from '@/components/ui/Container'
import { assets } from '@/lib/assets'

const categories = [
  {
    title: 'Meubels',
    href: '/meubels',
    image: assets.categoryMeubels,
    alt: 'Meubels in een woonkamer',
    objectPosition: 'center 55%',
    cta: 'Bekijk meubels',
    size: 'large' as const,
    className: 'lg:col-span-6',
  },
  {
    title: 'Vloeren',
    href: '/vloeren',
    image: assets.categoryVloeren,
    alt: 'Vloeren in een woonruimte',
    objectPosition: 'center 75%',
    cta: 'Bekijk vloeren',
    size: 'large' as const,
    className: 'lg:col-span-6',
  },
  {
    title: 'Keuken',
    href: '/keuken',
    image: assets.hero,
    alt: 'Moderne keuken',
    objectPosition: '88% center',
    cta: 'Bekijk keuken',
    size: 'medium' as const,
    className: 'lg:col-span-4',
  },
  {
    title: 'Koelen & Vriezen',
    href: '/koelen-vriezen',
    image: assets.categoryKoelen,
    alt: 'Koelkast en vriesapparatuur',
    objectPosition: 'center',
    cta: 'Bekijk koelen',
    size: 'medium' as const,
    className: 'lg:col-span-4',
  },
  {
    title: 'Horeca',
    href: '/horeca',
    image: assets.categoryHoreca,
    alt: 'Professionele horecakeuken',
    objectPosition: 'center',
    cta: 'Bekijk horeca',
    size: 'medium' as const,
    className: 'lg:col-span-4',
  },
  {
    title: 'Wonen',
    href: '/wonen',
    image: assets.hero,
    alt: 'Woonruimte met meubels',
    objectPosition: '22% center',
    cta: 'Bekijk wonen',
    size: 'compact' as const,
    className: 'lg:col-span-4',
  },
  {
    title: 'Huishouden',
    href: '/huishouden',
    image: assets.sectionDelivery,
    alt: 'Huishoudelijke apparatuur en producten',
    objectPosition: 'center 40%',
    cta: 'Bekijk huishouden',
    size: 'compact' as const,
    className: 'lg:col-span-4',
  },
  {
    title: 'Outlet',
    href: '/outlet',
    image: assets.sectionOutlet,
    alt: 'Outlet en tijdelijke partijen',
    objectPosition: 'center 35%',
    cta: 'Bekijk outlet',
    size: 'compact' as const,
    className: 'lg:col-span-4',
  },
] as const

export function CategoryGrid() {
  return (
    <section aria-labelledby="categories-heading" className="section-space-tight">
      <Container>
        <div className="mb-4 md:mb-5">
          <h2 id="categories-heading" className="heading-section text-ink">
            Waar bent u naar op zoek?
          </h2>
          <p className="mt-1 text-[14px] text-muted">Kies een productgroep om verder te kijken.</p>
        </div>

        {/* Mobile / tablet: compact 2-column discovery */}
        <div className="grid grid-cols-2 gap-2 min-[400px]:gap-2.5 sm:gap-3 lg:hidden">
          {categories.map((item, index) => (
            <CategoryCard
              key={item.href}
              href={item.href}
              title={item.title}
              image={item.image}
              imageAlt={item.alt}
              cta={item.cta}
              size={index < 2 ? 'medium' : 'compact'}
              objectPosition={item.objectPosition}
            />
          ))}
        </div>

        {/* Desktop: editorial 2 / 3 / 3 */}
        <div className="hidden gap-3.5 lg:grid lg:grid-cols-12 lg:gap-4">
          {categories.map((item) => (
            <CategoryCard
              key={item.href}
              href={item.href}
              title={item.title}
              image={item.image}
              imageAlt={item.alt}
              cta={item.cta}
              size={item.size}
              objectPosition={item.objectPosition}
              className={item.className}
            />
          ))}
        </div>
      </Container>
    </section>
  )
}
