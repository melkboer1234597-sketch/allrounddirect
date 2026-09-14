import type { EmailTemplateId } from '../../shared/email-templates'
import { escapeHtml, textFromHtml, transactionalLayout } from './layout'

export type EmailContent = {
  subject: string
  html: string
  text: string
  actionUrl?: string
}

const COPY: Record<EmailTemplateId, { subject: string; title: string; intro: string }> = {
  email_verification: {
    subject: 'Bevestig uw e-mailadres bij AllRound Direct',
    title: 'Bevestig uw e-mailadres',
    intro: 'Bevestig uw e-mailadres om uw account te activeren. De link is beperkt geldig.',
  },
  password_reset: {
    subject: 'Wachtwoord opnieuw instellen bij AllRound Direct',
    title: 'Nieuw wachtwoord instellen',
    intro: 'U heeft gevraagd om uw wachtwoord opnieuw in te stellen. De link is beperkt geldig.',
  },
  deletion_notice: {
    subject: 'Accountverwijdering bij AllRound Direct',
    title: 'Verwijderverzoek ontvangen',
    intro:
      'We hebben uw verzoek om het account te sluiten ontvangen. Ordergegevens blijven bewaard waar dat wettelijk nodig is.',
  },
  withdrawal_confirmation: {
    subject: 'Bevestiging herroeping',
    title: 'Herroeping ontvangen',
    intro: 'We hebben uw herroepingsverzoek vastgelegd.',
  },
  contact_ack: {
    subject: 'We hebben uw bericht ontvangen',
    title: 'Bericht ontvangen',
    intro: 'Bedankt voor uw bericht. We nemen contact op via dit e-mailadres.',
  },
  order_received: {
    subject: 'We hebben uw bestelling ontvangen',
    title: 'Bestelling ontvangen',
    intro: 'Uw bestelling is aangemaakt. De betaling wordt nog bevestigd bij onze betaaldienst.',
  },
  payment_confirmed: {
    subject: 'Betaling ontvangen',
    title: 'Betaling bevestigd',
    intro: 'We hebben de betaling van uw bestelling bevestigd. We zetten de order in behandeling.',
  },
  order_processing: {
    subject: 'Uw bestelling is in behandeling',
    title: 'In behandeling',
    intro: 'We bereiden uw bestelling voor. Artikelen kunnen via verschillende leveranciers komen.',
  },
  shipment_sent: {
    subject: 'Uw zending is onderweg',
    title: 'Zending verzonden',
    intro: 'Een zending van uw bestelling is verzonden.',
  },
  partial_shipment: {
    subject: 'Een deel van uw bestelling is verzonden',
    title: 'Deellevering verzonden',
    intro: 'Een deel van uw bestelling is onderweg. Andere artikelen volgen in een aparte zending.',
  },
  order_delivered: {
    subject: 'Uw bestelling is bezorgd',
    title: 'Bezorgd',
    intro: 'Volgens de vervoerder is de last openstaande zending bezorgd.',
  },
  order_cancelled: {
    subject: 'Uw bestelling is geannuleerd',
    title: 'Bestelling geannuleerd',
    intro:
      'De bestelling is geannuleerd. Als er is betaald, volgt de terugbetaling volgens de betaalmethode.',
  },
  return_requested: {
    subject: 'Retouraanvraag ontvangen',
    title: 'Retour aangevraagd',
    intro: 'We hebben uw retour- of herroepingsverzoek in behandeling genomen.',
  },
  return_received: {
    subject: 'We hebben uw retour ontvangen',
    title: 'Retour ontvangen',
    intro:
      'De retourzending is bij ons of de leverancier binnengekomen. We beoordelen de artikelen.',
  },
  refund_processed: {
    subject: 'Terugbetaling is verwerkt',
    title: 'Terugbetaling verwerkt',
    intro:
      'De terugbetaling is bij de betaaldienst aangeboden. De bijschrijving hangt af van uw bank.',
  },
  business_quote_received: {
    subject: 'Offerteaanvraag ontvangen',
    title: 'Aanvraag ontvangen',
    intro: 'We hebben uw zakelijke aanvraag ontvangen en nemen deze in behandeling.',
  },
  business_quote_ready: {
    subject: 'Uw offerte is gereed',
    title: 'Offerte gereed',
    intro:
      'De offerte voor uw aanvraag is gereed. U ontvangt de details via deze e-mail of via contact.',
  },
}

export function renderEmailTemplate(
  template: EmailTemplateId,
  origin: string,
  data: Record<string, string>,
): EmailContent {
  const copy = COPY[template]
  const extra = extraLines(data)
  const bodyHtml = `<p>${escapeHtml(copy.intro)}</p>${extra}`
  const html = transactionalLayout({
    origin,
    preheader: copy.intro,
    title: copy.title,
    bodyHtml,
    actionUrl: data.actionUrl,
    actionLabel: actionLabel(template),
  })
  const subject = data.orderNumber ? `${copy.subject} (${data.orderNumber})` : copy.subject
  return {
    subject,
    html,
    text: `${copy.title}\n\n${copy.intro}\n\n${textFromHtml(extra)}${data.actionUrl ? `\n\n${data.actionUrl}` : ''}`,
    actionUrl: data.actionUrl,
  }
}

function actionLabel(template: EmailTemplateId): string {
  if (template === 'email_verification') return 'E-mailadres bevestigen'
  if (template === 'password_reset') return 'Nieuw wachtwoord instellen'
  if (
    template.startsWith('order') ||
    template.startsWith('payment') ||
    template.startsWith('shipment')
  ) {
    return 'Bestelling bekijken'
  }
  return 'Openen'
}

function extraLines(data: Record<string, string>): string {
  const rows: Array<[string, string]> = [
    ['Bestelling', data.orderNumber],
    ['Referentie', data.confirmationCode],
    ['Zending', data.shipmentLabel],
    ['Track & trace', data.trackingCode],
    ['Bedrag', data.amountLabel],
    ['Vastgelegd', data.recordedAtLabel],
    ['Omvang', data.itemsLabel],
  ]
  const present = rows.filter(([, value]) => Boolean(value))
  if (present.length === 0) return ''
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:16px;font-size:14px">${present
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#626a76">${escapeHtml(label)}</td><td style="padding:4px 0">${escapeHtml(value)}</td></tr>`,
    )
    .join('')}</table>`
}
