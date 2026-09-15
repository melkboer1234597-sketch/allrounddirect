import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'

export function AboutSection() {
  return (
    <section aria-labelledby="about-heading" className="border-t border-line">
      <Container className="flex flex-col gap-3 py-8 md:flex-row md:items-end md:justify-between md:gap-8 md:py-9 lg:py-10">
        <div className="max-w-xl min-w-0">
          <h2 id="about-heading" className="font-heading text-[20px] font-semibold tracking-tight text-ink md:text-[22px]">
            Over AllRound Direct
          </h2>
          <p className="mt-1.5 text-[14px] leading-relaxed text-muted md:text-[15px]">
            Assortiment voor wonen, verbouwen, horeca en professioneel gebruik. Voor particulier en
            zakelijk in Nederland en België.
          </p>
        </div>
        <Button to="/over-ons" variant="secondary" size="sm" className="shrink-0 self-start md:self-auto">
          Over ons
        </Button>
      </Container>
    </section>
  )
}
