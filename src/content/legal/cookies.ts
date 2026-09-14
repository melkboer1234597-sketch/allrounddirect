import { COOKIE_CATEGORY_COPY, COMPANY } from '@/config/legal'
import type { LegalDoc } from './types'

export const cookiesDoc: LegalDoc = {
  path: '/cookies',
  title: 'Cookieverklaring',
  description:
    'Uitleg over noodzakelijke, voorkeur-, analytics- en marketingcookies bij AllRound Direct.',
  intro:
    'AllRound Direct gebruikt cookies en vergelijkbare technieken. Noodzakelijke cookies zijn nodig om de webshop te laten werken. Optionele cookies gebruiken we alleen als u daarvoor toestemming geeft.',
  sections: [
    {
      id: 'wat-zijn-cookies',
      title: 'Wat zijn cookies?',
      paragraphs: [
        'Cookies zijn kleine tekstbestanden die een site op uw apparaat zet. We gebruiken ook lokale opslag in de browser voor dezelfde doelen, bijvoorbeeld om uw cookiekeuze te bewaren. We gebruiken geen fingerprinting om u te volgen.',
      ],
    },
    {
      id: 'noodzakelijk',
      title: COOKIE_CATEGORY_COPY.necessary.title,
      paragraphs: [
        COOKIE_CATEGORY_COPY.necessary.summary,
        'Voorbeelden: inlogsessie, winkelwagen (zodra checkout live is), beveiliging en het onthouden van uw cookievoorkeur.',
      ],
    },
    {
      id: 'voorkeuren',
      title: COOKIE_CATEGORY_COPY.preferences.title,
      paragraphs: [COOKIE_CATEGORY_COPY.preferences.summary],
    },
    {
      id: 'analytics',
      title: COOKIE_CATEGORY_COPY.analytics.title,
      paragraphs: [
        COOKIE_CATEGORY_COPY.analytics.summary,
        'Er staat nu geen analytics-script klaar. Als we later een meettool toevoegen, verschijnt die in de cookietabel en laden we die alleen na toestemming.',
      ],
    },
    {
      id: 'marketing',
      title: COOKIE_CATEGORY_COPY.marketing.title,
      paragraphs: [
        COOKIE_CATEGORY_COPY.marketing.summary,
        'Er staat nu geen marketingpixel klaar. Toekomstige pixels worden alleen na toestemming geladen.',
      ],
    },
    {
      id: 'keuze',
      title: 'Uw keuze wijzigen',
      paragraphs: [
        'Via Cookie-instellingen in de footer opent u het voorkeurenpaneel. Intrekken van toestemming is even eenvoudig als toestemming geven. Alleen noodzakelijk weigert optionele categorieën.',
        `Vragen: ${COMPANY.privacyEmail}.`,
      ],
    },
    {
      id: 'tabel',
      title: 'Overzicht van cookies',
      paragraphs: [
        'De tabel op deze pagina toont alleen cookies en lokale opslag die de site nu gebruikt. We verzinnen geen cookies van diensten die nog niet zijn gekoppeld. Later kan de tabel dynamisch worden uitgebreid (naam, aanbieder, doel, categorie, duur).',
      ],
    },
  ],
}
