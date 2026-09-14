/** Publieke paden naar officiële assets in `public/media` (niet R2). */
export const assets = {
  logoHeader: '/media/branding/allround-direct-logo-horizontal-compact.png',
  logoHeaderWide: '/media/branding/allround-direct-logo-horizontal-wide.png',
  logoPrimary: '/media/branding/allround-direct-logo-primary.png',
  logoWhite: '/media/branding/allround-direct-logo-white.png',
  logoMark: '/media/branding/allround-direct-app-icon.png',
  appIcon: '/media/branding/allround-direct-app-icon.png',
  hero: '/media/hero/hero-homepage-wonen-keuken.png',
  categoryMeubels: '/media/categories/category-meubels.png',
  categoryVloeren: '/media/categories/category-vloeren.png',
  categoryKoelen: '/media/categories/category-koelen-vriezen.png',
  categoryHoreca: '/media/categories/category-horeca.png',
  sectionDelivery: '/media/sections/section-landelijke-levering.png',
  sectionBusiness: '/media/sections/section-zakelijk-grootafname.png',
  sectionOutlet: '/media/sections/section-outlet-direct-aanbod.png',
  brandPattern: '/media/backgrounds/background-brand-pattern-blue.png',
} as const

const CATEGORY_STILLS: Record<string, string> = {
  meubels: assets.categoryMeubels,
  vloeren: assets.categoryVloeren,
  'koelen-vriezen': assets.categoryKoelen,
  horeca: assets.categoryHoreca,
  keuken: assets.hero,
  wonen: assets.hero,
  outlet: assets.sectionOutlet,
  zakelijk: assets.sectionBusiness,
  huishouden: assets.sectionBusiness,
}

export function homeCategoryImage(slug: string, catalogSrc?: string | null) {
  return CATEGORY_STILLS[slug] || catalogSrc || assets.hero
}

/** Fit hint for catalog cards based on category. */
export function categoryImageFit(categorySlug: string): 'cover' | 'contain' {
  if (categorySlug === 'meubels' || categorySlug === 'wonen' || categorySlug === 'vloeren') {
    return 'cover'
  }
  return 'contain'
}

