import { COMPANY } from '@/config/legal'
import type { LegalDoc } from './types'

export const returnsDoc: LegalDoc = {
  path: '/retourneren',
  title: 'Retourneren',
  description:
    'Hoe u als consument of zakelijke klant een aankoop bij AllRound Direct terugstuurt.',
  intro:
    'U kunt een overeenkomst herroepen of een product retourneren volgens de wet en deze uitleg. We beloven geen gratis retourneren zolang dat niet is vastgesteld. Retourkosten hangen af van product en voorwaarden en moeten vóór aankoop duidelijk zijn.',
  sections: [
    {
      id: 'consument',
      title: 'Herroepen als consument',
      paragraphs: [
        'Als consument mag u de aankoop in beginsel binnen 14 dagen herroepen. Gebruik Overeenkomst herroepen (geen account nodig) of het modelformulier. Dat is de officiële melding; daarna volgt instructie voor terugzending waar dat aan de orde is.',
      ],
    },
    {
      id: 'kosten',
      title: 'Retourkosten',
      paragraphs: [
        'Of retourneren gratis is, is nog niet vastgelegd. Kosten kunnen per product verschillen, bijvoorbeeld bij grote meubels. Zodra tarieven bekend zijn, tonen we die bij het product of in checkout, vóór u koopt.',
        'Wettelijke regels over terugbetaling van de heenzendkosten bij herroeping blijven van toepassing.',
      ],
    },
    {
      id: 'grote-artikelen',
      title: 'Grote meubels en apparatuur',
      paragraphs: [
        'Deze artikelen pasten vaak niet in een brievenbus. We kunnen een ophaalrit of andere logistiek inzetten. Neem contact op na uw herroepingsmelding; stuur grote stukken niet op eigen houtje als pakket tenzij wij dat vragen.',
      ],
    },
    {
      id: 'staat',
      title: 'Staat van het product',
      paragraphs: [
        'U mag het product uitpakken en beoordelen zoals in een winkel, maar niet verder in gebruik nemen dan nodig is om vast te stellen of het past. Waardevermindering door extra gebruik kan volgens de wet voor uw rekening komen.',
        'Dit is geen uitsluiting van herroeping.',
      ],
    },
    {
      id: 'zakelijk',
      title: 'Zakelijke retouren',
      paragraphs: [
        'Voor aankopen in beroep of bedrijf gelden andere regels, tenzij de wet of de offerte anders bepaalt. Neem contact op; we behandelen verzoeken inhoudelijk en zetten niet automatisch alle consumentenrechten uit vanwege een zakelijk vinkje.',
      ],
    },
    {
      id: 'contact',
      title: 'Hulp',
      paragraphs: [
        `Vragen: ${COMPANY.supportEmail} of de pagina Contact. Herroepen start u op Overeenkomst herroepen.`,
      ],
    },
  ],
}

export const warrantyDoc: LegalDoc = {
  path: '/garantie-en-klachten',
  title: 'Garantie en klachten',
  description: 'Wettelijke conformiteit, eventuele fabrieksgarantie en hoe u een klacht indient.',
  intro:
    'Producten moeten deugdelijk zijn en aan de overeenkomst beantwoorden. Extra fabrieksgarantie, als die er is, komt bovenop de wet en vervangt die niet.',
  sections: [
    {
      id: 'conformiteit',
      title: 'Conformiteit',
      paragraphs: [
        'Als consument heeft u recht op een product dat geschikt is voor normaal gebruik en klopt met de beschrijving. Bij een gebrek kijken we naar herstel, vervanging of een passende prijsvermindering of ontbinding, volgens de wet.',
      ],
    },
    {
      id: 'fabriek',
      title: 'Fabrieksgarantie',
      paragraphs: [
        'Sommige merken geven eigen garantie. Die loopt via de voorwaarden van de fabrikant. We helpen u op weg, maar de wettelijke route naar AllRound Direct blijft bestaan.',
      ],
    },
    {
      id: 'klacht',
      title: 'Klacht indienen',
      paragraphs: [
        `Beschrijf het probleem, het ordernummer en voeg foto’s toe als dat helpt. Mail ${COMPANY.supportEmail} of gebruik Contact.`,
        'We reageren binnen een redelijke termijn. Een onredelijk korte “uiterste klaagtermijn” hanteren we niet jegens consumenten.',
      ],
    },
    {
      id: 'geschil',
      title: 'Geschil',
      paragraphs: [
        'Komt u er met ons niet uit, dan kunt u een geschil voorleggen aan de bevoegde rechter. Consumenten in de EU kunnen ook informatie vinden over buitengerechtelijke geschillenbeslechting via de Europese Commissie, voor zover van toepassing.',
      ],
    },
  ],
}

export const paymentDoc: LegalDoc = {
  path: '/betalen',
  title: 'Betalen',
  description:
    'Hoe betalen bij AllRound Direct werkt, inclusief btw en betaaldienstverlener Mollie.',
  intro:
    'U ziet vóór de definitieve aankoop welke producten, aantallen, totaalprijs, btw, verzendkosten en betaalmethode gelden. De bestelknop maakt de betalingsverplichting duidelijk.',
  sections: [
    {
      id: 'methoden',
      title: 'Betaalmethoden',
      paragraphs: [
        'Betalingen zijn voorbereid via Mollie. Welke methoden (bijvoorbeeld iDEAL of overboeking) daadwerkelijk aanstaan, ziet u in checkout wanneer die live is. We beloven hier geen methode die nog niet is geactiveerd.',
      ],
    },
    {
      id: 'btw',
      title: 'BTW',
      paragraphs: [
        'Consumentenprijzen zijn in de regel inclusief btw. Zakelijke weergave exclusief btw kan later. Het te betalen bedrag in checkout is leidend.',
      ],
    },
    {
      id: 'beveiliging',
      title: 'Beveiliging',
      paragraphs: [
        'U vult betaalgegevens in bij Mollie. AllRound Direct slaat geen volledige kaartnummers op.',
      ],
    },
    {
      id: 'mislukt',
      title: 'Mislukte betaling',
      paragraphs: [
        'Mislukt de betaling, dan wordt de bestelling niet afgerond. U kunt het opnieuw proberen of contact opnemen.',
      ],
    },
  ],
}

export const disclaimerDoc: LegalDoc = {
  path: '/disclaimer',
  title: 'Disclaimer',
  description: 'Aansprakelijkheid voor website-informatie van AllRound Direct.',
  intro:
    'We stellen de site met zorg samen. Toch kunnen prijzen, voorraad of specificaties wijzigen. Deze disclaimer beperkt geen rechten die de wet u dwingend toekent.',
  sections: [
    {
      id: 'inhoud',
      title: 'Inhoud van de website',
      paragraphs: [
        'Productinformatie komt deels van leveranciers. Controleer essentiële maten en specificaties vóór aankoop als die voor u beslissend zijn. Kennelijke fouten mogen we corrigeren.',
      ],
    },
    {
      id: 'links',
      title: 'Links',
      paragraphs: [
        'Links naar derden (vervoerders, Mollie, AllRoundKlussenbedrijf) vallen onder hun eigen voorwaarden.',
      ],
    },
    {
      id: 'beschikbaarheid',
      title: 'Beschikbaarheid',
      paragraphs: [
        'De site kan tijdelijk niet bereikbaar zijn wegens onderhoud of storing. Dat ontslaat ons niet van verplichtingen uit een al gesloten koop.',
      ],
    },
  ],
}

export const businessTermsDoc: LegalDoc = {
  path: '/zakelijk/voorwaarden',
  title: 'Zakelijke voorwaarden',
  description: 'Aanvullende afspraken voor ondernemers die bij AllRound Direct inkopen.',
  intro:
    'Deze aanvulling geldt als u handelt in de uitoefening van beroep of bedrijf. Consumenten vallen onder de algemene voorwaarden en dwingend consumentenrecht. Een webshop-keuze “zakelijk” is geen automatische afstand van consumentenrechten.',
  sections: [
    {
      id: 'scope',
      title: 'Wanneer deze voorwaarden gelden',
      paragraphs: [
        'Bij offertes, projecten, horeca-inkoop en bestellingen waarbij u als ondernemer optreedt. Twijfel over de hoedanigheid? We toetsen de feiten, niet alleen een vinkje.',
      ],
    },
    {
      id: 'offerte',
      title: 'Offerte',
      paragraphs: [
        'Een offerte is vrijblijvend tot de daarin genoemde termijn, tenzij anders vermeld. Prijzen kunnen exclusief btw zijn. Levertijden in een offerte zijn afgestemd op het project, niet op een algemene webshop-belofte.',
      ],
    },
    {
      id: 'betaling-b2b',
      title: 'Betaling',
      paragraphs: [
        'Tenzij de offerte een betalingstermijn noemt, geldt vooruitbetaling of de methode in checkout. Eigendom gaat over na volledige betaling, onverminderd wettelijke regels.',
      ],
    },
    {
      id: 'herroeping-b2b',
      title: 'Geen consumentenherroeping',
      paragraphs: [
        'Het wettelijke herroepingsrecht is een consumentenrecht. Koopt u aantoonbaar als ondernemer, dan geldt dat recht niet automatisch. We beoordelen dat per overeenkomst. Misbruik van een consumentenroute bij duidelijke bedrijfsinkoop kunnen we weigeren, met motivering.',
      ],
    },
    {
      id: 'av',
      title: 'Verhouding tot de algemene voorwaarden',
      paragraphs: [
        'De algemene voorwaarden blijven van toepassing. Bij strijd voor een zuiver zakelijke koop prevaleert deze pagina plus de offerte, voor zover de wet dat toelaat.',
      ],
    },
  ],
}
