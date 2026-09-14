export type AdviesCluster = {
  slug: string
  name: string
  intro: string
}

export type AdviesArticle = {
  slug: string
  cluster: string
  title: string
  description: string
  datePublished: string
  sections: Array<{ heading: string; paragraphs: string[] }>
}

export const ADVIES_CLUSTERS: AdviesCluster[] = [
  {
    slug: 'vloeren',
    name: 'Vloeren',
    intro: 'Keuzehulp voor PVC, laminaat en hoeveelheid materiaal.',
  },
  { slug: 'meubels', name: 'Meubels', intro: 'Opmeten en levering van grote meubels.' },
  { slug: 'keuken', name: 'Keuken', intro: 'Volgt: nismaten, bladen en apparatuur.' },
  { slug: 'koelen', name: 'Koelen', intro: 'Volgt: inhoud, energie en opstelling.' },
  { slug: 'horeca', name: 'Horeca', intro: 'Volgt: koelcapaciteit en keukenindeling.' },
  { slug: 'zakelijk', name: 'Zakelijk', intro: 'Volgt: offerte, projectlevering en btw-context.' },
]

export const ADVIES_ARTICLES: AdviesArticle[] = [
  {
    slug: 'pvc-of-laminaat-kiezen',
    cluster: 'vloeren',
    title: 'PVC of laminaat kiezen',
    description:
      'Praktische verschillen tussen PVC en laminaat: gebruik, vocht, vloerverwarming en afwerking. Geen verkooppraat, wel keuzecriteria.',
    datePublished: '2026-09-14',
    sections: [
      {
        heading: 'Waar u op let',
        paragraphs: [
          'PVC is kunststof en vaak stiller en vochtbestendiger dan standaard laminaat. Laminaat is meestal een HDF-kern met een slijtlaag en een houtlook. Welk type past, hangt af van vocht, intensiteit van lopen, en of u vloerverwarming heeft.',
          'Kijk in de productspecificatie naar slijtklasse of gebruiksklasse, dikte en of de vloer geschikt is voor uw situatie. Een algemene “beste vloer” bestaat niet.',
        ],
      },
      {
        heading: 'Legwijze',
        paragraphs: [
          'Klik-PVC en laminaat liggen meestal zwevend. Plak-PVC wordt verlijmd. Dat beïnvloedt ondervloer, droogtijd en of u de vloer later wilt verwijderen. AllRound Direct levert de vloer; leggen kan via AllRoundKlussenbedrijf.',
        ],
      },
      {
        heading: 'Verder lezen in de shop',
        paragraphs: [
          'Bekijk PVC-vloeren, laminaat en toebehoren zoals ondervloer en plinten. Meet het oppervlak voordat u bestelt.',
        ],
      },
    ],
  },
  {
    slug: 'hoeveel-vloer-heb-ik-nodig',
    cluster: 'vloeren',
    title: 'Hoeveel vloer heb ik nodig?',
    description:
      'Bereken globaal het aantal vierkante meters. Tel snijverlies. Dit is een hulpmiddel, geen offerte.',
    datePublished: '2026-09-14',
    sections: [
      {
        heading: 'Oppervlakte',
        paragraphs: [
          'Meet lengte en breedte per rechthoekig vlak. Vermenigvuldig en tel de vlakken op. Bij nissen of L-vorm meet u in delen.',
          'Voor snijverlies is 5 tot 10 procent gebruikelijk, meer bij visgraat of veel uitsparingen. De verpakking vermeldt m² per pak; rond af naar boven.',
        ],
      },
      {
        heading: 'Wat deze calculator niet doet',
        paragraphs: [
          'We rekenen geen lijm, plinten of arbeidsuren. Ongelijke dekvloeren en vochtmeting horen bij een vakman. Gebruik het resultaat als startpunt, niet als bindende hoeveelheid.',
        ],
      },
    ],
  },
  {
    slug: 'bank-opmeten-voor-levering',
    cluster: 'meubels',
    title: 'Bank opmeten voor levering',
    description:
      'Meet de kamer én de aanvoerroute. Grote banken komen vaak in delen, maar de doos of het grootste deel moet nog naar binnen.',
    datePublished: '2026-09-14',
    sections: [
      {
        heading: 'In de kamer',
        paragraphs: [
          'Meet de muurlengte, de diepte tot de salontafel en de loopruimte naar deuren. Let op radiatoren, erkers en openslaande deuren.',
        ],
      },
      {
        heading: 'Naar binnen',
        paragraphs: [
          'Meet trapbreedte, draaicirkel, lift en deuren. Een hoekbank in modules is eenvoudiger dan één starre zit. De productpagina noemt afmetingen van het grootste deel wanneer die bekend zijn.',
          'AllRound Direct heeft geen standaard afhaalwinkel. Bezorging gaat naar het afleveradres; tillen naar een verdieping is niet altijd inbegrepen.',
        ],
      },
    ],
  },
]

export function getAdviesArticle(slug: string): AdviesArticle | undefined {
  return ADVIES_ARTICLES.find((item) => item.slug === slug)
}
