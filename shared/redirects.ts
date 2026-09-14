/** 301-klaar: oude of alias-URL’s naar de canonieke taxonomy. */
export const SEO_REDIRECTS: Array<{ from: string; to: string; status: 301 | 302 }> = [
  { from: '/meubels/hoekbanken', to: '/meubels/banken/hoekbanken', status: 301 },
  { from: '/vloeren/klik-pvc', to: '/vloeren/pvc/klik-pvc', status: 301 },
  { from: '/vloeren/plak-pvc', to: '/vloeren/pvc/plak-pvc', status: 301 },
  { from: '/offerte', to: '/zakelijk/offerte', status: 301 },
]

export const SITEMAP_CHUNK_LIMIT = 40_000
