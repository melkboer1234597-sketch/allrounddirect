import { CategoryCard } from '@/components/ui/CategoryCard'
import { Container } from '@/components/ui/Container'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { assets } from '@/lib/assets'

const categories = [
  {
    title: 'Meubels',
    href: '/meubels',
    image: assets.categoryMeubels,
    alt: 'Woonkamer met hoekbank, stoel en dressoir',
    size: 'large' as const,
  },
  {
    title: 'Vloeren',
    href: '/vloeren',
    image: assets.categoryVloeren,
    alt: 'Houtlook vloer in een lichte woonkamer',
    size: 'large' as const,
  },
  {
    title: 'Keuken',
    href: '/keuken',
    image: assets.hero,
    alt: 'Moderne keuken met donkere kasten en RVS koelkast',
    size: 'regular' as const,
  },
  {
    title: 'Koelen & Vriezen',
    href: '/koelen-vriezen',
    image: assets.categoryKoelen,
    alt: 'Amerikaanse koelkast in een keuken',
    size: 'regular' as const,
  },
  {
    title: 'Horeca',
    href: '/horeca',
    image: assets.categoryHoreca,
    alt: 'Professionele horecakeuken in RVS',
    size: 'regular' as const,
  },
  {
    title: 'Outlet',
    href: '/outlet',
    image: assets.sectionOutlet,
    alt: 'Outletopstelling met meubels, keuken en magazijnvoorraad',
    size: 'regular' as const,
  },
]

export function CategoryGrid() {
  const [meubels, vloeren, ...rest] = categories

  return (
    <section aria-labelledby="categories-heading" className="section-space">
      <Container>
        <SectionHeader
          titleId="categories-heading"
          title="Waar bent u naar op zoek?"
          description="Bekijk onze belangrijkste productgroepen."
        />

        <div className="hidden gap-4 md:grid md:grid-cols-2 lg:grid-cols-4">
          <CategoryCard
            href={meubels.href}
            title={meubels.title}
            image={meubels.image}
            imageAlt={meubels.alt}
            size="large"
            className="lg:col-span-2"
          />
          <CategoryCard
            href={vloeren.href}
            title={vloeren.title}
            image={vloeren.image}
            imageAlt={vloeren.alt}
            size="large"
            className="lg:col-span-2"
          />
          {rest.map((item) => (
            <CategoryCard
              key={item.href}
              href={item.href}
              title={item.title}
              image={item.image}
              imageAlt={item.alt}
            />
          ))}
        </div>

        <div className="category-scroll md:hidden">
          {categories.map((item) => (
            <CategoryCard
              key={item.href}
              href={item.href}
              title={item.title}
              image={item.image}
              imageAlt={item.alt}
              className="w-[78vw] max-w-[320px] shrink-0 snap-start"
            />
          ))}
        </div>
      </Container>
    </section>
  )
}
