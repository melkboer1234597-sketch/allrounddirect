import { COMPANY } from '@/config/legal'
import {
  deliveryLabelFull,
  deliveryLabelShort,
  freeShippingThresholdLabel,
  commerceConfig,
} from '../../../shared/commerce'
import type { LegalDoc } from './types'

export const deliveryDoc: LegalDoc = {
  path: '/bezorgen',
  title: 'Bezorgen',
  description:
    `Levering in Nederland en België: standaard ${deliveryLabelShort()}, ${freeShippingThresholdLabel().toLowerCase()}.`,
  intro:
    'AllRound Direct levert bestellingen op het afleveradres in Nederland en België. We beloven geen next-day levering voor het hele assortiment; wel een duidelijke standaardtermijn en gratis verzending vanaf een vast bedrag.',
  sections: [
    {
      id: 'landen',
      title: 'Waar leveren wij?',
      paragraphs: [
        `Wij leveren in ${commerceConfig.supportedCountries.join(' en ')} (Nederland en België) op het adres dat u bij de bestelling opgeeft.`,
        'AllRound Direct heeft geen standaard showroom of afhaalpunt. Producten gaan naar het afleveradres.',
      ],
    },
    {
      id: 'levertijden',
      title: 'Levertijd',
      paragraphs: [
        `De standaard levertijd voor verkoopbare producten is ${deliveryLabelFull().replace(/^Levering binnen /, '')}. In het kort: ${deliveryLabelShort()}.`,
        'De feitelijke afhandeling kan afhankelijk zijn van order- en productlogistiek (bijvoorbeeld grote artikelen of leverancierszendingen), zonder dat dit een andere algemene belofte invoert.',
      ],
    },
    {
      id: 'gratis-verzending',
      title: 'Gratis verzending',
      paragraphs: [
        `${freeShippingThresholdLabel()}. De drempel geldt voor het merchandisesubtotaal na productkortingen en vóór verzendkosten.`,
        'Verzendkosten zelf tellen niet mee voor de drempel. Bij afrekenen berekent de server of u in aanmerking komt.',
      ],
    },
    {
      id: 'leverwijze',
      title: 'Leverwijze',
      paragraphs: [
        'Pakketten gaan meestal via een pakketdienst. Grote of zware artikelen kunnen met een aparte rit, tot de voordeur of tot de stoep, afhankelijk van het product.',
        'Houd rekening met toegang tot de woning. Montage is niet standaard inbegrepen. Voor vloerleggen of keukenplaatsing verwijzen we naar AllRoundKlussenbedrijf.',
      ],
    },
    {
      id: 'leveranciers',
      title: 'Leverancierslevering',
      paragraphs: [
        'Veel artikelen liggen bij een leverancier. De zending kan daardoor van een andere afzender komen dan AllRound Direct. Dat is normaal.',
        'Tracking en status tonen we per zending in Bestelling volgen of in uw account, zodra die gegevens bekend zijn.',
      ],
    },
    {
      id: 'deelzendingen',
      title: 'Deelzendingen',
      paragraphs: [
        'Artikelen uit één bestelling kunnen op verschillende dagen aankomen. U betaalt verzendkosten zoals getoond bij checkout.',
      ],
    },
    {
      id: 'kosten',
      title: 'Bezorgkosten onder de drempel',
      paragraphs: [
        `Onder ${freeShippingThresholdLabel().replace('Gratis verzending vanaf ', '')} tonen we bij checkout de berekende verzendkosten zodra die zijn geconfigureerd. We verzinnen geen vast bedrag op deze pagina.`,
        'Boven de drempel is standaardverzending gratis.',
      ],
    },
    {
      id: 'beschadiging',
      title: 'Beschadigde levering',
      paragraphs: [
        'Controleer de zending bij ontvangst zo goed als redelijk is. Ziet u schade, meld dat via Contact of Klantenservice en bewaar foto’s en de verpakking.',
      ],
    },
    {
      id: 'zakelijk',
      title: 'Zakelijke levering',
      paragraphs: [
        'Zakelijke adressen kunnen andere losvoorwaarden hebben. Zet bijzonderheden in de orderopmerking of de offerte.',
        `Vragen: ${COMPANY.supportEmail}.`,
      ],
    },
  ],
}
