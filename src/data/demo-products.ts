import { assets } from '@/lib/assets'
import type { DemoProduct } from '@/types/catalog'

/**
 * DEMO/MOCK PRODUCTDATA
 * Alleen voor layoutontwikkeling. Later vervangen door D1/API.
 * Geen voorraad, geen kortingen, geen reviews.
 */
export const DEMO_FEATURED_PRODUCTS: DemoProduct[] = [
  {
    id: 'demo-hoekbank',
    slug: 'hoekbank-beige',
    name: 'Hoekbank in beige stof',
    category: 'Meubels',
    categoryHref: '/meubels',
    image: assets.categoryMeubels,
    imageAlt: 'Beige hoekbank in een lichte woonkamer',
    price: { amount: 1299, currency: 'EUR' },
    isDemo: true,
  },
  {
    id: 'demo-eettafel',
    slug: 'eettafel-hout',
    name: 'Eettafel houtlook',
    category: 'Meubels',
    categoryHref: '/meubels',
    image: assets.hero,
    imageAlt: 'Houten eettafel met stoelen in een open woonkeuken',
    price: { amount: 449, currency: 'EUR' },
    isDemo: true,
  },
  {
    id: 'demo-pvc-vloer',
    slug: 'pvc-vloer-eikenlook',
    name: 'PVC vloer eikenlook',
    category: 'Vloeren',
    categoryHref: '/vloeren',
    image: assets.categoryVloeren,
    imageAlt: 'Houtlook PVC vloer in een woonkamer',
    price: { amount: 24.95, currency: 'EUR', per: 'm2' },
    isDemo: true,
  },
  {
    id: 'demo-koelkast',
    slug: 'amerikaanse-koelkast',
    name: 'Amerikaanse koelkast',
    category: 'Koelen & Vriezen',
    categoryHref: '/koelen-vriezen',
    image: assets.categoryKoelen,
    imageAlt: 'RVS Amerikaanse koelkast in een keuken',
    price: null,
    priceLabel: 'Prijs op aanvraag',
    isDemo: true,
  },
  {
    id: 'demo-horeca-keuken',
    slug: 'horeca-keukeninrichting',
    name: 'Horeca keukeninrichting',
    category: 'Horeca',
    categoryHref: '/horeca',
    image: assets.categoryHoreca,
    imageAlt: 'Professionele RVS horecakeuken',
    price: null,
    priceLabel: 'Prijs op aanvraag',
    isDemo: true,
  },
  {
    id: 'demo-outlet-partij',
    slug: 'outlet-partij',
    name: 'Outletpartij woon- en keukenproducten',
    category: 'Outlet',
    categoryHref: '/outlet',
    image: assets.sectionOutlet,
    imageAlt: 'Outletopstelling met meubels, keuken en voorraad',
    price: null,
    priceLabel: 'Prijs afhankelijk van partij',
    isDemo: true,
  },
]
