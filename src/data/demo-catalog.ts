/**
 * DEMO/MOCK CATALOGUS
 * Gecentraliseerd. Later vervangen door Worker + D1.
 * Merken en SKU's zijn voorbeelddata, geen live voorraad.
 */
import { assets } from '@/lib/assets'
import { CATALOG_TAXONOMY } from '@/data/taxonomy'
import type { DemoProduct, ProductImage, StockStatus } from '@/types/catalog'

const IMAGES: Record<string, ProductImage> = {
  meubels: { src: assets.categoryMeubels, alt: 'Meubel in woonsetting', fit: 'cover' },
  vloeren: { src: assets.categoryVloeren, alt: 'Vloer in woonsetting', fit: 'cover' },
  keuken: { src: assets.hero, alt: 'Keukeninterieur', fit: 'cover' },
  'koelen-vriezen': { src: assets.categoryKoelen, alt: 'Koelkast', fit: 'contain' },
  horeca: { src: assets.categoryHoreca, alt: 'Horecakeuken', fit: 'contain' },
  wonen: { src: assets.categoryMeubels, alt: 'Woonkamer', fit: 'cover' },
  zakelijk: { src: assets.sectionBusiness, alt: 'Zakelijke inrichting', fit: 'cover' },
  outlet: { src: assets.sectionOutlet, alt: 'Outletproducten', fit: 'cover' },
}

const BRANDS: Record<string, string[]> = {
  meubels: ['Nordic Form', 'Atelier Huis', 'Direct Wonen'],
  vloeren: ['FloorLine', 'VloerDirect', 'Parket Huis'],
  keuken: ['KitchenLine', 'Blad & Bak', 'Kookmaat'],
  'koelen-vriezen': ['CoolTech', 'KoudeLijn', 'FrostWerk'],
  horeca: ['HorecaStar', 'RVS Pro', 'KeukenForce'],
  wonen: ['Nordic Form', 'Home Basic', 'Atelier Huis'],
  zakelijk: ['HorecaStar', 'ProjectLine', 'Direct Wonen'],
  outlet: ['Direct Wonen', 'FloorLine', 'KitchenLine'],
}

const COLORS = ['beige', 'grijs', 'zwart', 'groen', 'bruin', 'eiken', 'wit'] as const
const MATERIALS = ['stof', 'hout', 'metaal', 'rvs', 'leerlook'] as const
const LEAD = ['1-2 weken', '2-4 weken', '4-8 weken', 'Op aanvraag'] as const
const STOCK: StockStatus[] = ['in_stock', 'in_stock', 'backorder', 'unknown']

function hash(input: string): number {
  let value = 0
  for (let i = 0; i < input.length; i += 1) value = (value * 31 + input.charCodeAt(i)) >>> 0
  return value
}

function pick<T>(list: readonly T[], seed: number): T {
  return list[seed % list.length]
}

export const DEMO_CATALOG: DemoProduct[] = CATALOG_TAXONOMY.flatMap((root) => {
  const perSub = root.slug === 'meubels' || root.slug === 'vloeren' ? 8 : 5

  function productsFor(
    child: (typeof root.children)[number],
    href: string,
    childIndex: number,
  ): DemoProduct[] {
    const brands = BRANDS[root.slug] ?? ['AllRound']
    const image = IMAGES[root.slug] ?? IMAGES.meubels
    const own = Array.from({ length: perSub }, (_, index) => {
      const seed = hash(`${root.slug}-${child.slug}-${href}-${index}`)
      const brand = pick(brands, seed)
      const n = index + 1
      const slug = `${child.slug}-${brand.toLowerCase().replace(/\s+/g, '-')}-${n}`
      const isFloor =
        root.slug === 'vloeren' &&
        !['plinten', 'profielen', 'ondervloeren', 'vloeraccessoires'].includes(child.slug)
      const basePrice = isFloor
        ? 18 + (seed % 40) + index * 1.5
        : 79 + (seed % 900) + childIndex * 20
      const price = Math.round(basePrice * 100) / 100
      const outlet = root.slug === 'outlet' || seed % 11 === 0
      const stock =
        root.slug === 'zakelijk' && child.slug === 'offerte' ? 'unknown' : pick(STOCK, seed)
      const color = pick(COLORS, seed)
      const material =
        root.slug === 'horeca' || root.slug === 'koelen-vriezen' ? 'rvs' : pick(MATERIALS, seed + 1)

      const product: DemoProduct = {
        id: `demo-${root.slug}-${href.replace(/\//g, '-')}-${n}`,
        slug: `${slug}-${childIndex}`,
        name: `${child.name} ${brand} ${n}`,
        sku: `AD-${root.slug.slice(0, 3).toUpperCase()}-${child.slug.slice(0, 3).toUpperCase()}-${String(n).padStart(3, '0')}`,
        brand,
        category: root.name,
        categoryHref: href,
        categorySlug: root.slug,
        subcategorySlug: child.slug,
        subcategoryName: child.name,
        price: { amount: price, currency: 'EUR', per: isFloor ? 'm2' : undefined },
        compareAtPrice:
          outlet && !isFloor ? { amount: Math.round(price * 1.18), currency: 'EUR' } : undefined,
        stockStatus: stock,
        leadTime: pick(LEAD, seed + 3),
        supplierId: `sup-${brand.toLowerCase().replace(/\s+/g, '-')}`,
        images: [{ ...image, alt: `${child.name} ${brand}` }],
        attributes: {
          color,
          material,
          brand,
          availability: stock,
          leadTime: pick(LEAD, seed + 3),
          outlet,
          seats: String((seed % 3) + 2),
          style: pick(['modern', 'landelijk', 'industrieel'], seed),
          floorType: isFloor
            ? child.slug.includes('pvc')
              ? 'pvc'
              : child.slug === 'laminaat'
                ? 'laminaat'
                : child.slug === 'parket'
                  ? 'parket'
                  : child.slug === 'tegels'
                    ? 'tegel'
                    : 'accessoire'
            : undefined,
          thickness: isFloor ? 5 + (seed % 8) : undefined,
          underfloorHeating: isFloor ? seed % 2 === 0 : undefined,
          waterproof: isFloor ? seed % 3 !== 0 : undefined,
          usageClass: isFloor ? pick(['21', '23', '32', '33'], seed) : undefined,
          width: 40 + (seed % 180),
          height: 40 + (seed % 160),
          depth: 30 + (seed % 90),
          capacity:
            root.slug === 'koelen-vriezen' || root.slug === 'horeca'
              ? 120 + (seed % 500)
              : undefined,
          tempRange:
            root.slug === 'koelen-vriezen' ? pick(['koel', 'vries', 'combi'], seed) : undefined,
          energy:
            root.slug === 'koelen-vriezen' ? pick(['A', 'B', 'C', 'D', 'E'], seed) : undefined,
          doors: root.slug === 'koelen-vriezen' ? pick(['1', '2', '3'], seed) : undefined,
          audience:
            root.slug === 'koelen-vriezen'
              ? child.slug.includes('horeca')
                ? 'professioneel'
                : pick(['particulier', 'professioneel'], seed)
              : undefined,
          productType:
            root.slug === 'horeca'
              ? pick(['koeling', 'koken', 'meubel', 'spoelen'], seed)
              : undefined,
          power: root.slug === 'horeca' ? 2 + (seed % 12) : undefined,
          connection: root.slug === 'horeca' ? pick(['230V', '400V', 'gas'], seed) : undefined,
        },
        isBusinessOnly:
          root.slug === 'zakelijk' || root.slug === 'horeca' || child.slug.includes('horeca'),
        isOutlet: outlet,
        isFeatured: childIndex < 2 && index === 0,
        isDemo: true,
        createdAt: `2026-0${(index % 8) + 1}-1${index % 9}`,
        rankingScore: 40 + (seed % 60),
        synonyms: [child.name.toLowerCase(), brand.toLowerCase(), root.name.toLowerCase()],
        vatRate: 21,
      }

      if (root.slug === 'zakelijk' && child.slug === 'offerte') {
        product.price = null
        product.priceLabel = 'Prijs op aanvraag'
      }

      return product
    })

    const nested = (child.children ?? []).flatMap((nestedChild, nestedIndex) =>
      productsFor(nestedChild, `${href}/${nestedChild.slug}`, nestedIndex),
    )
    return [...own, ...nested]
  }

  return root.children.flatMap((child, childIndex) =>
    productsFor(child, `/${root.slug}/${child.slug}`, childIndex),
  )
})

export const SEARCH_SYNONYMS: Record<string, string[]> = {
  koelkast: ['koelen', 'koel-vries', 'fridge'],
  vriezer: ['vries', 'freezer'],
  bank: ['banken', 'hoekbank', 'sofa'],
  pvc: ['vinyl', 'klik pvc', 'plak pvc'],
  laminaat: ['kliklaminaat'],
  horeca: ['professioneel', 'rvs', 'grootkeuken'],
}
