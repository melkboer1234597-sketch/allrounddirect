import { COMPANY, CONCEPT_NOTICE } from '@/config/legal'
import { SeoHead } from '@/components/seo/SeoHead'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Link } from 'react-router-dom'

export function WithdrawalFormPage() {
  return (
    <main id="main" className="section-space">
      <SeoHead
        title="Modelformulier herroeping | AllRound Direct"
        description="Modelformulier voor herroeping van een consumentenovereenkomst bij AllRound Direct."
        path="/herroepingsformulier"
      />
      <Container>
        <article className="mx-auto max-w-[42rem] print:max-w-none">
          <h1 className="heading-page text-navy">Modelformulier herroeping</h1>
          <p className="text-body mt-4 text-ink">
            Dit is het modelformulier voor herroeping. U mag het printen, invullen en sturen. De
            snelste route is de digitale functie{' '}
            <Link to="/herroepen" className="text-brand underline">
              Overeenkomst herroepen
            </Link>
            , die datum en tijd vastlegt zonder account.
          </p>
          <p className="mt-4 rounded-[8px] bg-surface px-4 py-3 text-[13px] text-muted print:hidden">
            {CONCEPT_NOTICE}
          </p>
          <p className="mt-4 print:hidden">
            <Button type="button" variant="secondary" onClick={() => window.print()}>
              Printen of opslaan als pdf
            </Button>
          </p>

          <section className="mt-10 rounded-[12px] p-5 ring-1 ring-line print:ring-0">
            <p className="text-[14px] text-muted">
              Aan: {COMPANY.legalName}, handelend onder {COMPANY.tradingName}
              <br />
              {COMPANY.addressLine}, {COMPANY.postalCodeCity}
              <br />
              {COMPANY.supportEmail}
            </p>
            <p className="mt-6 text-[16px] leading-relaxed">
              Ik/Wij* deel/delen* u hierbij mede dat ik/wij* onze overeenkomst betreffende de
              verkoop van de volgende goederen/levering van de volgende dienst* herroep/herroepen*.
            </p>
            <dl className="mt-6 space-y-4 text-[15px]">
              <div>
                <dt className="font-medium">Besteld op / ontvangen op*</dt>
                <dd className="mt-1 min-h-10 border-b border-line" />
              </div>
              <div>
                <dt className="font-medium">Naam/namen consument(en)</dt>
                <dd className="mt-1 min-h-10 border-b border-line" />
              </div>
              <div>
                <dt className="font-medium">Adres consument(en)</dt>
                <dd className="mt-1 min-h-16 border-b border-line" />
              </div>
              <div>
                <dt className="font-medium">Ordernummer (indien bekend)</dt>
                <dd className="mt-1 min-h-10 border-b border-line" />
              </div>
              <div>
                <dt className="font-medium">Omschrijving van de goederen of dienst</dt>
                <dd className="mt-1 min-h-20 border-b border-line" />
              </div>
              <div>
                <dt className="font-medium">
                  Handtekening consument(en) (alleen bij papieren formulier)
                </dt>
                <dd className="mt-1 min-h-16 border-b border-line" />
              </div>
              <div>
                <dt className="font-medium">Datum</dt>
                <dd className="mt-1 min-h-10 border-b border-line" />
              </div>
            </dl>
            <p className="mt-6 text-[13px] text-muted">* Doorhalen wat niet van toepassing is.</p>
          </section>
        </article>
      </Container>
    </main>
  )
}
