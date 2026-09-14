import { COMPANY } from '@/config/legal'
import type { LegalDoc } from './types'

export const termsDoc: LegalDoc = {
  path: '/algemene-voorwaarden',
  title: 'Algemene voorwaarden',
  description:
    'Concept algemene voorwaarden van AllRound Direct voor consumenten en zakelijke klanten.',
  intro:
    'Deze voorwaarden gelden voor aankopen in de webshop van AllRound Direct. Consumentenrechten die de wet dwingend toekent, blijven in stand. Onredelijke of met de wet strijdige bedingen zijn niet bedoeld en worden niet als geldig gepresenteerd.',
  sections: [
    {
      id: 'toepasselijkheid',
      title: 'Toepasselijkheid',
      paragraphs: [
        `Deze voorwaarden zijn van ${COMPANY.legalName}, handelend onder ${COMPANY.tradingName} (${COMPANY.addressLine}, ${COMPANY.postalCodeCity}, KVK ${COMPANY.kvk}).`,
        'Ze gelden voor bestellingen via de website. Afwijkingen zijn alleen bindend als ze schriftelijk zijn bevestigd.',
        'Bent u consument, dan blijven dwingende rechten uit het Burgerlijk Wetboek van toepassing, ook als een bepaling daarvan afwijkt. Die afwijking geldt dan niet jegens u.',
      ],
    },
    {
      id: 'aanbod',
      title: 'Aanbod',
      paragraphs: [
        'Aanbiedingen op de website zijn vrijblijvend en kunnen wijzigen zolang de bestelling niet tot stand is gekomen. Afbeeldingen, maten en specificaties zijn zo zorgvuldig mogelijk, maar kleine afwijkingen kunnen voorkomen.',
        'Kennelijke vergissingen in prijs of beschrijving hoeven we niet te honoreren.',
      ],
    },
    {
      id: 'prijzen',
      title: 'Prijzen',
      paragraphs: [
        'Prijzen zijn in euro en, tenzij anders vermeld, inclusief btw voor de consumentenweergave. Een latere weergave exclusief btw voor zakelijke klanten verandert niets aan wettelijke consumentenrechten.',
        'Verzendkosten, toeslagen voor grote artikelen of eilandtoeslagen worden vóór het plaatsen van de bestelling getoond, zodra checkout live is. Tot die tijd is de prijsinformatie op het product leidend waar die beschikbaar is.',
      ],
    },
    {
      id: 'bestellen',
      title: 'Bestellen',
      paragraphs: [
        'Een bestelling komt tot stand wanneer u de bestelling plaatst en de betaling start of wordt bevestigd, volgens de gekozen betaalmethode. De knop maakt duidelijk dat u een betalingsverplichting aangaat.',
        'We kunnen een bestelling weigeren of ontbinden bij fraudevermoeden, onjuiste gegevens of als levering redelijkerwijs niet mogelijk is. U wordt daarvan op de hoogte gesteld.',
      ],
    },
    {
      id: 'betaling',
      title: 'Betaling',
      paragraphs: [
        'Betaling verloopt via de aangeboden methoden (via Mollie, wanneer actief). De bestelling gaat in behandeling na een geslaagde of volgens de methode geautoriseerde betaling, tenzij anders overeengekomen voor zakelijke klanten.',
      ],
    },
    {
      id: 'levering',
      title: 'Levering',
      paragraphs: [
        'We leveren op het opgegeven afleveradres in Nederland en België, tenzij een product of offerte uitdrukkelijk anders vermeldt. Er is geen standaard showroom of afhaalpunt.',
        'De standaard levertijd voor verkoopbare producten is 1 tot 3 werkdagen. We beloven geen next-day levering voor het hele assortiment.',
        'Zie de pagina Bezorgen voor gratis verzending, deelzendingen, grote artikelen en wat te doen bij beschadiging of niet thuis.',
      ],
    },
    {
      id: 'levertijden',
      title: 'Levertijden',
      paragraphs: [
        'De vermelde standaard levertijd (1 tot 3 werkdagen) is een indicatie voor de gebruikelijke afhandeling. Het is geen resultaatsverplichting tot een vaste kalenderdag, tenzij uitdrukkelijk schriftelijk anders overeengekomen. Feitelijke planning kan afhangen van order- en productlogistiek waar dat operationeel of wettelijk nodig is.',
        'Als levering aanzienlijk later dreigt dan aangegeven, informeren we u. Consumenten houden hun wettelijke rechten bij te late levering.',
      ],
    },
    {
      id: 'voorraad',
      title: 'Voorraad bij leveranciers',
      paragraphs: [
        'Voorraad kan bij een leverancier liggen. Een product kan “op voorraad” of “op nabestelling” staan. Wijzigt de beschikbaarheid na bestelling, dan nemen we contact op over een oplossing, annulering of terugbetaling van het niet-leverbare deel.',
      ],
    },
    {
      id: 'deelzendingen',
      title: 'Deelzendingen',
      paragraphs: [
        'Een bestelling mag in meerdere zendingen aankomen, bijvoorbeeld als artikelen van verschillende leveranciers komen. Dat verandert niets aan de totaalprijs die u bij checkout zag, tenzij we een wijziging met u afstemmen.',
      ],
    },
    {
      id: 'eigendom',
      title: 'Eigendom',
      paragraphs: [
        'Geleverde zaken blijven ons eigendom tot het verschuldigde is voldaan. Dit eigendomsvoorbehoud beperkt niet de wettelijke rechten van consumenten, waaronder herroeping en conformiteit.',
      ],
    },
    {
      id: 'herroeping',
      title: 'Herroepingsrecht consument',
      paragraphs: [
        'Bent u consument, dan mag u de overeenkomst in beginsel binnen 14 dagen herroepen, zonder opgave van redenen, volgens de wet. De termijn begint zoals de wet dat voorschrijft, in de regel na ontvangst van de zaak of de laatste zending bij een samengestelde levering.',
        'U kunt herroepen via de functie Overeenkomst herroepen op deze website (zonder account), via het modelformulier, of met een andere ondubbelzinnige verklaring.',
        'Wettelijke uitzonderingen kunnen gelden, bijvoorbeeld bij volgens specificatie vervaardigde zaken of verzegelde goederen die om gezondheidsbescherming niet geschikt zijn om terug te zenden na verbreking van de verzegeling. Die uitzonderingen passen we niet ruimer toe dan de wet toelaat.',
        'Na herroeping volgt terugbetaling volgens de wettelijke regels, inclusief de standaard verzendkosten van de heenzending waar de wet dat voorschrijft. Kosten van terugzending kunnen voor uw rekening komen als dat vooraf duidelijk is gemaakt; zolang dat beleid niet definitief is vastgesteld, communiceren we de kosten vóór aankoop op product of in checkout.',
      ],
    },
    {
      id: 'retouren',
      title: 'Retouren',
      paragraphs: [
        'Naast herroeping kunt u contact opnemen bij een verkeerde of beschadigde levering. Grote meubels of apparatuur kunnen een andere retourlogistiek vragen. Zie de pagina Retourneren.',
      ],
    },
    {
      id: 'uitzonderingen',
      title: 'Uitzonderingen',
      paragraphs: [
        'Waar de wet herroeping uitsluit, vermelden we dat zo duidelijk mogelijk bij het product. We sluiten herroeping niet uit voor gewone verkoop van ongebruikte, onbeschadigde consumentengoederen waar de wet dat recht toekent.',
      ],
    },
    {
      id: 'maatwerk',
      title: 'Maatwerk',
      paragraphs: [
        'Producten die volgens uw specificaties worden gemaakt, kunnen van herroeping zijn uitgesloten voor zover de wet dat toestaat. Dat staat dan bij het product. Standaard voorraadartikelen zijn geen maatwerk alleen omdat u een kleur of maat uit een bestaande reeks kiest, tenzij de wet of de productinformatie dat anders duidt.',
      ],
    },
    {
      id: 'garantie',
      title: 'Garantie en conformiteit',
      paragraphs: [
        'Consumenten hebben recht op een deugdelijk product dat aan de overeenkomst beantwoordt. Wettelijke conformiteit kunnen we niet uitsluiten of inkorten.',
        'Een eventuele extra fabrieksgarantie komt bovenop wettelijke rechten en vervangt die niet. Zie Garantie en klachten.',
      ],
    },
    {
      id: 'klachten',
      title: 'Klachten',
      paragraphs: [
        `Meld gebreken of klachten zo spoedig als redelijkerwijs van u kan worden gevergd, via ${COMPANY.supportEmail} of Contact. We reageren binnen een redelijke termijn.`,
        'Consumenten hoeven een gebrek niet binnen een onredelijk korte “meldtermijn” te verliezen; dwingend consumentenrecht prevaleert.',
      ],
    },
    {
      id: 'aansprakelijkheid',
      title: 'Aansprakelijkheid',
      paragraphs: [
        'We zijn aansprakelijk volgens de wet. We sluiten aansprakelijkheid niet uit voor schade die wettelijk niet mag worden uitgesloten, zoals schade door opzet of bewuste roekeloosheid, of productaansprakelijkheid waar die dwingend geldt.',
        'Voor het overige beperken we aansprakelijkheid tot wat in de gegeven omstandigheden redelijk en wettelijk toelaatbaar is. Deze zin is geen vrijbrief om consumentenrechten uit te hollen.',
      ],
    },
    {
      id: 'overmacht',
      title: 'Overmacht',
      paragraphs: [
        'Bij overmacht (omstandigheden buiten onze redelijke invloed, zoals langdurige storing bij een vervoerder of overheidsmaatregel) kunnen verplichtingen worden opgeschort zolang de overmacht duurt. Consumenten houden hun wettelijke beëindigings- en restitutierechten waar die van toepassing zijn.',
      ],
    },
    {
      id: 'zakelijk',
      title: 'Zakelijke klanten',
      paragraphs: [
        'Koopt u in de uitoefening van beroep of bedrijf, dan kunnen andere afspraken gelden (offerte, levertijd, betalingstermijn). Dat staat in de zakelijke voorwaarden of de offerte.',
        'Een enkele checkbox “zakelijk” in de webshop zet wettelijke consumentenbescherming niet uit. Of u consument bent, hangt af van de feiten.',
      ],
    },
    {
      id: 'ie',
      title: 'Intellectuele eigendom',
      paragraphs: [
        'Teksten, foto’s, merken en vormgeving van de webshop zijn beschermd. U mag die niet kopiëren of hergebruiken zonder toestemming, behalve waar de wet dat toestaat.',
      ],
    },
    {
      id: 'privacy',
      title: 'Privacy',
      paragraphs: ['Verwerking van persoonsgegevens staat in de privacyverklaring.'],
    },
    {
      id: 'recht',
      title: 'Toepasselijk recht',
      paragraphs: [
        'Op de overeenkomst is Nederlands recht van toepassing. Bent u consument en woont u in de EU, dan behoudt u de bescherming van dwingende bepalingen van het recht van uw woonplaats, voor zover de wet dat voorschrijft.',
        'Geschillen worden voorgelegd aan de bevoegde Nederlandse rechter, onverminderd het recht van de consument om te procederen bij de rechter van zijn woonplaats waar de wet dat toestaat.',
      ],
    },
  ],
}
