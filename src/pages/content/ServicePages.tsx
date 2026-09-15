import { Link } from 'react-router-dom'
import { SeoHead } from '@/components/seo/SeoHead'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { SITE } from '@/config/site'

type ServicePageProps = {
  path: string
  title: string
  description: string
  intro: string
  sections: Array<{ heading: string; body: string; links?: Array<{ href: string; label: string }> }>
}

function ServicePage({ path, title, description, intro, sections }: ServicePageProps) {
  return (
    <main id="main" className="section-space">
      <SeoHead title={`${title} | ${SITE.name}`} description={description} path={path} />
      <Container>
        <article className="mx-auto max-w-[42rem]">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: title }]} />
          <h1 className="heading-page mt-4 text-navy">{title}</h1>
          <p className="text-body mt-4 text-ink">{intro}</p>
          {sections.map((section) => (
            <section key={section.heading} className="mt-8">
              <h2 className="font-heading text-[1.375rem] font-semibold text-navy">
                {section.heading}
              </h2>
              <p className="mt-3 text-[16px] leading-[1.7] text-ink">{section.body}</p>
              {section.links?.length ? (
                <ul className="mt-3 space-y-1">
                  {section.links.map((item) => (
                    <li key={item.href}>
                      <Link to={item.href} className="text-brand hover:underline">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
          <div className="mt-10 flex flex-wrap gap-3">
            <Button to="/contact">Contact</Button>
            <Button to="/assortiment" variant="secondary">
              Assortiment
            </Button>
          </div>
        </article>
      </Container>
    </main>
  )
}

export function AboutPage() {
  return (
    <ServicePage
      path="/over-ons"
      title="Over AllRound Direct"
      description="AllRound Direct is een Nederlandse webshop voor meubels, vloeren, keuken, koeling en horeca. Producten worden geleverd op het afleveradres."
      intro="AllRound Direct verkoopt producten voor wonen, keuken, vloer en professioneel gebruik. We hebben geen standaard showroom en geen afhaalpunt. Bestellingen gaan naar het afleveradres dat u opgeeft."
      sections={[
        {
          heading: 'Wat u van ons kunt verwachten',
          body: 'Het assortiment komt van geselecteerde leveranciers. Standaard levering is binnen 1 tot 3 werkdagen in Nederland en België; gratis verzending vanaf €999. We beloven geen next-day levering voor de hele shop.',
        },
        {
          heading: 'Montage',
          body: 'AllRound Direct levert. Vloerleggen of plaatsing kunt u apart regelen, bijvoorbeeld via AllRoundKlussenbedrijf.',
          links: [
            { href: '/montage', label: 'Montage' },
            { href: '/vloeren', label: 'Vloeren' },
          ],
        },
        {
          heading: 'Zakelijk',
          body: 'Voor horeca, projecten en grotere aantallen kunt u een offerte vragen. Dat is geen webshop-korting-automatisme; we kijken naar de aanvraag.',
          links: [{ href: '/zakelijk/offerte', label: 'Zakelijke offerte' }],
        },
      ]}
    />
  )
}

export function CustomerServicePage() {
  return (
    <ServicePage
      path="/klantenservice"
      title="Klantenservice"
      description="Hulp bij bestellen, levering, retouren en herroeping bij AllRound Direct."
      intro="Hier vindt u de meest gebruikte onderwerpen. Voor een bestaande bestelling gebruikt u het ordernummer en het e-mailadres van de aankoop."
      sections={[
        {
          heading: 'Bestelling',
          body: 'Volg een bestelling zonder account, of via Mijn account als u bent ingelogd.',
          links: [
            { href: '/bestelling-volgen', label: 'Bestelling volgen' },
            { href: '/account', label: 'Account' },
          ],
        },
        {
          heading: 'Levering en retour',
          body: 'Bezorging is op het afleveradres. Retour en herroeping zijn aparte stappen; lees de voorwaarden voordat u terugstuurt.',
          links: [
            { href: '/bezorgen', label: 'Bezorgen' },
            { href: '/retourneren', label: 'Retourneren' },
            { href: '/herroepen', label: 'Overeenkomst herroepen' },
          ],
        },
        {
          heading: 'Betalen en garantie',
          body: 'Betaalmethoden volgen via Mollie wanneer checkout live is. Garantie en klachten staan in een aparte toelichting.',
          links: [
            { href: '/betalen', label: 'Betalen' },
            { href: '/garantie-en-klachten', label: 'Garantie en klachten' },
          ],
        },
      ]}
    />
  )
}

export function FaqPage() {
  return (
    <ServicePage
      path="/veelgestelde-vragen"
      title="Veelgestelde vragen"
      description="Vragen over bestellen, levering, montage en zakelijke inkoop bij AllRound Direct."
      intro="Korte antwoorden. Details staan op de betreffende servicepagina’s; die zijn leidend."
      sections={[
        {
          heading: 'Kan ik ophalen?',
          body: 'Nee, er is geen standaard afhaalwinkel. Levering gaat naar het afleveradres.',
        },
        {
          heading: 'Hoe snel is mijn bestelling er?',
          body: 'Dat verschilt per product en leverancier. Kijk op de productpagina, niet naar een algemene slogan.',
        },
        {
          heading: 'Leggen jullie de vloer?',
          body: 'De webshop levert de vloer. Leggen kan via AllRoundKlussenbedrijf of een eigen vakman.',
          links: [{ href: '/montage', label: 'Montage' }],
        },
        {
          heading: 'Kan ik zakelijk bestellen?',
          body: 'Ja. Voor grotere aantallen of horeca gebruikt u de offerte, niet alleen de winkelwagen.',
          links: [{ href: '/zakelijk/offerte', label: 'Offerte aanvragen' }],
        },
      ]}
    />
  )
}

export function MontagePage() {
  return (
    <ServicePage
      path="/montage"
      title="Montage"
      description="AllRound Direct levert producten. Voor vloerleggen of plaatsing kunt u terecht bij AllRoundKlussenbedrijf."
      intro="Montage zit niet standaard bij een webshopbestelling. Grote meubels, keukens en vloeren vragen vaak een vakman."
      sections={[
        {
          heading: 'Vloeren',
          body: 'Meet het oppervlak, controleer de ondervloer en bestel snijverlies. Daarna kunt u leggen laten uitvoeren.',
          links: [
            { href: '/vloeren', label: 'Vloerassortiment' },
            { href: '/advies/hoeveel-vloer-heb-ik-nodig', label: 'Hoeveel vloer heb ik nodig?' },
          ],
        },
        {
          heading: 'Meubels',
          body: 'Meet de aanvoerroute. Tillen naar een verdieping is niet automatisch inbegrepen.',
          links: [
            { href: '/advies/bank-opmeten-voor-levering', label: 'Bank opmeten voor levering' },
          ],
        },
      ]}
    />
  )
}

export function ProjectsPage() {
  return (
    <ServicePage
      path="/projecten"
      title="Projecten"
      description="Inrichting en inkoop voor zakelijke projecten via AllRound Direct."
      intro="Projectlevering is mogelijk voor horeca, kantoor of woningbouw. We publiceren alleen echte cases wanneer beeld en toestemming er zijn. Deze pagina is de ingang, geen verzonnen portfolio."
      sections={[
        {
          heading: 'Aanvraag',
          body: 'Stuur aantallen, planning en leveradres. We reageren met een offerte of met vragen, geen automatische prijs.',
          links: [{ href: '/zakelijk/offerte', label: 'Offerte voor een project' }],
        },
        {
          heading: 'Assortiment voor projecten',
          body: 'Horeca, koeling, meubels en vloeren zijn de gebruikelijke takken.',
          links: [
            { href: '/horeca', label: 'Horeca' },
            { href: '/zakelijk', label: 'Zakelijk' },
          ],
        },
      ]}
    />
  )
}
