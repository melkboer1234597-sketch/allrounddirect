/** Slug-tree voor sitemaps (Worker + Vite). Houd gelijk met `src/data/taxonomy.ts`. */

export type TaxonomySlugNode = {
  slug: string
  children?: TaxonomySlugNode[]
}

export const TAXONOMY_SLUG_TREE: TaxonomySlugNode[] = [
  {
    slug: 'meubels',
    children: [
      { slug: 'banken', children: [{ slug: 'hoekbanken' }] },
      { slug: 'fauteuils' },
      { slug: 'stoelen' },
      { slug: 'eettafels' },
      { slug: 'salontafels' },
      { slug: 'bijzettafels' },
      { slug: 'kasten' },
      { slug: 'dressoirs' },
      { slug: 'tv-meubels' },
      { slug: 'bedden' },
      { slug: 'eetkamermeubels' },
    ],
  },
  {
    slug: 'vloeren',
    children: [
      { slug: 'pvc', children: [{ slug: 'klik-pvc' }, { slug: 'plak-pvc' }] },
      { slug: 'laminaat' },
      { slug: 'parket' },
      { slug: 'tegels' },
      { slug: 'ondervloeren' },
      { slug: 'plinten' },
      { slug: 'profielen' },
      { slug: 'vloeraccessoires' },
    ],
  },
  {
    slug: 'keuken',
    children: [
      { slug: 'keukenkasten' },
      { slug: 'werkbladen' },
      { slug: 'spoelbakken' },
      { slug: 'kranen' },
      { slug: 'keukenapparatuur' },
      { slug: 'keukenonderdelen' },
      { slug: 'accessoires' },
    ],
  },
  {
    slug: 'koelen-vriezen',
    children: [
      { slug: 'koelkasten' },
      { slug: 'vriezers' },
      { slug: 'koel-vriescombinaties' },
      { slug: 'drankkoelingen' },
      { slug: 'wijnkoelkasten' },
      { slug: 'horecakoeling' },
      { slug: 'koelvitrines' },
      { slug: 'koelwerkbanken' },
    ],
  },
  {
    slug: 'horeca',
    children: [
      { slug: 'koeling' },
      { slug: 'kookapparatuur' },
      { slug: 'rvs-meubilair' },
      { slug: 'spoelen-reinigen' },
      { slug: 'restaurantmeubilair' },
      { slug: 'opslag' },
      { slug: 'buffet-presentatie' },
      { slug: 'bar' },
      { slug: 'professionele-keuken' },
      { slug: 'accessoires' },
    ],
  },
  {
    slug: 'wonen',
    children: [
      { slug: 'woonkamer' },
      { slug: 'eetkamer' },
      { slug: 'slaapkamer' },
      { slug: 'verlichting' },
      { slug: 'opbergen' },
      { slug: 'woonaccessoires' },
      { slug: 'deuren' },
      { slug: 'tuinmeubels' },
    ],
  },
  {
    slug: 'huishouden',
    children: [{ slug: 'wasmachines' }],
  },
  {
    slug: 'zakelijk',
    children: [
      { slug: 'horeca' },
      { slug: 'projectinrichting' },
      { slug: 'kantoor-bedrijfsruimte' },
      { slug: 'grootafname' },
      { slug: 'offerte' },
    ],
  },
  {
    slug: 'outlet',
    children: [
      { slug: 'laatste-stuks' },
      { slug: 'restpartijen' },
      { slug: 'tijdelijke-aanbiedingen' },
    ],
  },
]

export function categorySitemapPaths(): string[] {
  const paths = ['/assortiment']

  function walk(prefix: string, nodes: TaxonomySlugNode[]) {
    for (const node of nodes) {
      const href = `${prefix}/${node.slug}`
      paths.push(href)
      if (node.children?.length) walk(href, node.children)
    }
  }

  for (const root of TAXONOMY_SLUG_TREE) {
    paths.push(`/${root.slug}`)
    walk(`/${root.slug}`, root.children ?? [])
  }

  return paths
}
