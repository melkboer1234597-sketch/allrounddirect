import { COMPANY } from '@/config/legal'
import type { LegalDoc } from './types'

export const deliveryDoc: LegalDoc = {
  path: '/bezorgen',
  title: 'Bezorgen',
  description:
    'Hoe AllRound Direct levert: leverancierslevering, deelzendingen en levertijden per product.',
  intro:
    'AllRound Direct is een webshop zonder standaard showroom of afhaalpunt. Producten gaan naar het afleveradres. Levertijd en wijze hangen af van het product en de leverancier, niet van een algemene slogan als “vandaag besteld, morgen in huis”.',
  sections: [
    {
      id: 'leverwijze',
      title: 'Leverwijze',
      paragraphs: [
        'We bezorgen in Nederland op het adres dat u bij de bestelling opgeeft, tenzij een product een beperking noemt (bijvoorbeeld alleen zakelijke losplaats).',
        'Pakketten gaan meestal via een pakketdienst. Grote of zware artikelen kunnen met een extra rit, tot de voordeur of tot de stoep, afhankelijk van het product.',
      ],
    },
    {
      id: 'grote-artikelen',
      title: 'Grote artikelen',
      paragraphs: [
        'Meubels, vloerdelen in grote hoeveelheden of apparatuur kunnen niet als brievenbuspakket. Op de productpagina of in checkout staat, zodra dat is ingericht, of het om een stuks zending, twoman-handling of een speciale rit gaat.',
        'Houd rekening met toegang tot de woning, verdiepingen en dat montage niet standaard in de levering zit. Voor vloerleggen of keukenplaatsing verwijzen we naar AllRoundKlussenbedrijf.',
      ],
    },
    {
      id: 'leveranciers',
      title: 'Leverancierslevering',
      paragraphs: [
        'Veel artikelen liggen niet in een eigen magazijn maar bij een leverancier. De zending kan daardoor van een andere afzender komen dan AllRound Direct. Dat is normaal en geen tweede webshop.',
        'Tracking en status tonen we per zending in Bestelling volgen of in uw account, zodra die gegevens bekend zijn.',
      ],
    },
    {
      id: 'deelzendingen',
      title: 'Deelzendingen',
      paragraphs: [
        'Artikelen uit één bestelling kunnen op verschillende dagen aankomen. U betaalt de verzendkosten zoals getoond bij checkout, niet per extra doos tenzij dat vooraf is vermeld.',
      ],
    },
    {
      id: 'status',
      title: 'Statusupdates',
      paragraphs: [
        'U ontvangt updates zodra we een track-and-trace of levermoment hebben. Zolang checkout en e-mail (Resend) niet live zijn, is dit voorbereid maar nog niet automatisch.',
        'U kunt de status opzoeken met ordernummer en e-mail, zonder account.',
      ],
    },
    {
      id: 'levertijden',
      title: 'Levertermijnen per product',
      paragraphs: [
        'De levertijd staat bij het product (bijvoorbeeld een bandbreedte in werkdagen). Die termijn is een indicatie op basis van leveranciersdata en kan wijzigen bij piekdrukte of nabestelling.',
        'We beloven geen landelijke next-day levering voor het hele assortiment.',
      ],
    },
    {
      id: 'kosten',
      title: 'Bezorgkosten',
      paragraphs: [
        'Bezorgkosten hangen af van gewicht, formaat, bestemming en soms van het product. Het exacte bedrag hoort u te zien vóór u tot betaling overgaat, in checkout en waar mogelijk al op de productpagina.',
        'Zolang tarieven niet definitief zijn, vullen we geen verzonnen vaste verzendprijs in op deze pagina.',
      ],
    },
    {
      id: 'beschadiging',
      title: 'Beschadigde levering',
      paragraphs: [
        'Controleer de zending bij ontvangst zo goed als redelijk is, vooral bij meubels en apparatuur. Ziet u schade aan de verpakking of het product, meld dat zo snel mogelijk via Contact of Klantenservice en bewaar foto’s en de verpakking.',
        'We regelen herstel, vervanging of terugbetaling volgens de wet en de aard van de schade. U hoeft een gebrek niet te accepteren.',
      ],
    },
    {
      id: 'niet-thuis',
      title: 'Niet thuis',
      paragraphs: [
        'Als u niet aanwezig bent, volgt de vervoerder meestal een afhaal- of nieuw bezorgmoment. Aanwijzingen staan op het afhaalbericht. Een mislukte speciale rit kan extra kosten geven als dat vooraf is vermeld; anders overleggen we eerst.',
      ],
    },
    {
      id: 'zakelijk',
      title: 'Zakelijke levering',
      paragraphs: [
        'Zakelijke adressen kunnen andere losvoorwaarden hebben (dock, tijdsvenster). Zet bijzonderheden in de orderopmerking of de offerte.',
        `Vragen: ${COMPANY.supportEmail}.`,
      ],
    },
  ],
}
