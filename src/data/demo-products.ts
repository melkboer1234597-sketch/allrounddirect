import { assets } from '@/lib/assets'
import type { DemoProduct } from '@/types/catalog'

/**
 * @deprecated Gebruik DEMO_CATALOG. Deze lijst blijft als fallback voor featured.
 */
export const DEMO_FEATURED_PRODUCTS: DemoProduct[] = [
  {
    id: 'demo-hoekbank',
    slug: 'hoekbank-beige',
    name: 'Hoekbank in beige stof',
    category: 'Meubels',
    categoryHref: '/meubels/banken/hoekbanken',
    categorySlug: 'meubels',
    subcategorySlug: 'hoekbanken',
    subcategoryName: 'Hoekbanken',
    images: [
      { src: assets.categoryMeubels, alt: 'Beige hoekbank in een lichte woonkamer', fit: 'cover' },
    ],
    attributes: { color: 'beige', material: 'stof', brand: 'Nordic Form' },
    brand: 'Nordic Form',
    price: { amount: 1299, currency: 'EUR' },
    isDemo: true,
    isFeatured: true,
  },
]
