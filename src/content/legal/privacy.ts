import { AP_URL, COMPANY } from '@/config/legal'
import type { LegalDoc } from './types'

export const privacyDoc: LegalDoc = {
  path: '/privacy',
  title: 'Privacyverklaring',
  description: 'Welke persoonsgegevens AllRound Direct verwerkt, waarom, en welke rechten u heeft.',
  intro:
    'AllRound Direct verwerkt persoonsgegevens om bestellingen te kunnen uitvoeren, de webshop te beveiligen en contact te onderhouden. Hieronder leest u wie verantwoordelijk is, welke gegevens we verwerken en hoe u uw rechten kunt uitoefenen.',
  sections: [
    {
      id: 'verantwoordelijke',
      title: 'Wie is verantwoordelijk?',
      paragraphs: [
        `Verwerkingsverantwoordelijke is ${COMPANY.legalName}, handelend onder ${COMPANY.tradingName}.`,
        `Adres: ${COMPANY.addressLine}, ${COMPANY.postalCodeCity}, ${COMPANY.country}.`,
        `KVK: ${COMPANY.kvk}. BTW: ${COMPANY.vatId}.`,
        `Contact over privacy: ${COMPANY.privacyEmail}. Klantenservice: ${COMPANY.supportEmail}. Telefoon: ${COMPANY.phone}.`,
        'Deze bedrijfsgegevens zijn placeholders totdat de definitieve ondernemingsgegevens zijn ingevuld.',
      ],
    },
    {
      id: 'welke-gegevens',
      title: 'Welke gegevens verwerken we?',
      paragraphs: [
        'We verwerken alleen gegevens die nodig zijn voor de hieronder genoemde doelen, of die u zelf aan ons verstrekt. We vragen niet om meer dan nodig is voor de betreffende handeling.',
      ],
    },
    {
      id: 'accountgegevens',
      title: 'Accountgegevens',
      paragraphs: [
        'Als u een account aanmaakt: naam, e-mailadres, wachtwoord (versleuteld, niet voor ons leesbaar), optioneel telefoonnummer, bedrijfsnaam, KVK- en btw-nummer, en marketingvoorkeur.',
        'Inlogsessies worden via beveiligde cookies bijgehouden. We gebruiken geen fingerprinting om u te herkennen.',
      ],
    },
    {
      id: 'bestelgegevens',
      title: 'Bestelgegevens',
      paragraphs: [
        'Bij een bestelling: aflever- en factuuradres, bestelde artikelen, aantallen, prijzen, levervoorkeuren, ordernummer en status van zendingen.',
        'Gastbestellingen koppelen we aan het e-mailadres van de bestelling, zodat u zonder account kunt volgen of herroepen.',
      ],
    },
    {
      id: 'betaalgegevens',
      title: 'Betaalgegevens',
      paragraphs: [
        'Betalingen lopen via een betaaldienstverlener (Mollie). Wij ontvangen statusinformatie (betaald, mislukt, terugbetaald) en een transactiereferentie.',
        'Volledige kaart- of bankgegevens vult u in bij Mollie. AllRound Direct slaat die kaartgegevens niet zelf op.',
      ],
    },
    {
      id: 'contact',
      title: 'Contact',
      paragraphs: [
        'Berichten via het contactformulier of e-mail: naam, e-mailadres, onderwerp en inhoud van het bericht. We gebruiken dit om te reageren en de vraag af te handelen.',
      ],
    },
    {
      id: 'websitegebruik',
      title: 'Websitegebruik',
      paragraphs: [
        'Technische gegevens die nodig zijn om de site te tonen en te beveiligen, bijvoorbeeld via Cloudflare (onder meer IP-adres op infrastructuurniveau, beveiligingslogs).',
        'Optionele meet- of marketinggegevens worden alleen verwerkt na toestemming via de cookiebanner. Zonder die toestemming laden we geen analytics- of marketingsscripts.',
      ],
    },
    {
      id: 'doeleinden',
      title: 'Doeleinden',
      paragraphs: [
        'We gebruiken gegevens om: de overeenkomst uit te voeren (bestellen, betalen, leveren, retourneren, herroepen); de webshop en accounts te beveiligen; wettelijke verplichtingen na te komen (onder meer administratie); vragen te beantwoorden; en, alleen met toestemming, nieuws of aanbiedingen te sturen.',
      ],
    },
    {
      id: 'grondslagen',
      title: 'Grondslagen',
      paragraphs: [
        'Afhankelijk van het doel: uitvoering van de overeenkomst, wettelijke verplichting, gerechtvaardigd belang (bijvoorbeeld beveiliging van de webshop, fraudepreventie) of toestemming (cookies die niet noodzakelijk zijn, en e-mailnieuws als u dat heeft aangevinkt).',
        'Toestemming kunt u intrekken. Dat is even eenvoudig als het geven van toestemming, via Cookie-instellingen of de afmeldmogelijkheid in e-mail.',
      ],
    },
    {
      id: 'bewaartermijnen',
      title: 'Bewaartermijnen',
      paragraphs: [
        'Concrete bewaartermijnen per gegevenscategorie zijn nog niet definitief vastgesteld. We bewaren gegevens niet langer dan nodig is voor het doel waarvoor ze zijn verzameld, of dan wettelijk verplicht is (bijvoorbeeld fiscale bewaarplicht voor facturen en orders).',
        'Zodra termijnen intern zijn vastgesteld, worden ze in deze verklaring opgenomen na juridische controle. Tot die tijd hanteren we het uitgangspunt: zo kort als mogelijk, zo lang als nodig of verplicht.',
      ],
    },
    {
      id: 'verwerkers',
      title: 'Dienstverleners en verwerkers',
      paragraphs: [
        'We schakelen partijen in die ons helpen de webshop te draaien. Zij mogen gegevens alleen verwerken in opdracht van ons, voor de afgesproken doelen.',
      ],
    },
    {
      id: 'mollie',
      title: 'Mollie',
      paragraphs: [
        'Mollie B.V. verwerkt betalingen. Mollie is verwerkingsverantwoordelijke of verwerker volgens hun eigen voorwaarden, afhankelijk van de dienst. Zie de privacyverklaring van Mollie voor hun verwerking.',
      ],
    },
    {
      id: 'cloudflare',
      title: 'Cloudflare',
      paragraphs: [
        'Cloudflare, Inc. levert hosting, DNS, beveiliging (onder meer Turnstile) en netwerkbescherming. Verkeer naar de site kan via Cloudflare lopen.',
      ],
    },
    {
      id: 'resend',
      title: 'Resend (later)',
      paragraphs: [
        'Transactionele e-mail (orderbevestiging, herroepingsbevestiging, wachtwoordreset) is voorbereid via Resend. Zolang Resend niet is geactiveerd, worden berichten in development lokaal vastgelegd en in productie niet verstuurd tot de koppeling rond is.',
      ],
    },
    {
      id: 'cookies',
      title: 'Cookies',
      paragraphs: [
        'Noodzakelijke cookies zijn nodig voor de werking van de webshop. Optionele cookies (voorkeuren, analytics, marketing) zetten we alleen na toestemming.',
        'Details staan in de cookieverklaring. U kunt uw keuze altijd wijzigen via Cookie-instellingen in de footer.',
      ],
    },
    {
      id: 'beveiliging',
      title: 'Beveiliging',
      paragraphs: [
        'We treffen passende technische en organisatorische maatregelen, zoals versleutelde verbindingen, beveiligde sessiecookies, toegangsbeheer tot het interne systeem en rate limiting op gevoelige formulieren.',
        'Geen systeem is volledig zonder risico. Meld een vermoeden van misbruik via het privacy-e-mailadres.',
      ],
    },
    {
      id: 'rechten',
      title: 'Uw rechten',
      paragraphs: [
        'U heeft, binnen de grenzen van de AVG, recht op inzage, rectificatie, verwijdering, beperking, dataportabiliteit en het recht om bezwaar te maken tegen verwerking op basis van gerechtvaardigd belang.',
        'Waar de verwerking op toestemming berust, mag u die toestemming intrekken zonder dat eerdere rechtmatige verwerking ongeldig wordt.',
      ],
    },
    {
      id: 'verzoeken',
      title: 'Verwijder- en inzageverzoeken',
      paragraphs: [
        `Stuur een verzoek naar ${COMPANY.privacyEmail} of gebruik de accountfunctie voor een verwijderverzoek als u bent ingelogd.`,
        'We vragen om een redelijke identificatie, zodat we gegevens niet aan de verkeerde persoon verstrekken. Wettelijk te bewaren order- en factuurgegevens blijven in de administratie, ook als een account wordt gesloten.',
      ],
    },
    {
      id: 'ap',
      title: 'Klacht bij de Autoriteit Persoonsgegevens',
      paragraphs: [
        `Als u vindt dat we niet zorgvuldig met uw gegevens omgaan, kunt u een klacht indienen bij de Autoriteit Persoonsgegevens: ${AP_URL}`,
        'We stellen het op prijs als u ons eerst laat weten wat er misgaat, zodat we het kunnen herstellen.',
      ],
    },
    {
      id: 'wijzigingen',
      title: 'Wijzigingen',
      paragraphs: [
        'Deze verklaring kan wijzigen, bijvoorbeeld bij nieuwe diensten of wetgeving. Een wezenlijke wijziging van de cookiepolicy krijgt een nieuwe consentversie, zodat we zo nodig opnieuw om toestemming vragen.',
      ],
    },
  ],
}
