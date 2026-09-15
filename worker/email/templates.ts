import type { EmailTemplateId } from '../../shared/email-templates'
import {
  escapeHtml,
  renderKeyValueRows,
  renderOrderItemsTable,
  renderTotalsBlock,
  textFromHtml,
  transactionalLayout,
  type EmailLineItem,
} from './layout'

export type EmailContent = {
  subject: string
  html: string
  text: string
  actionUrl?: string
}

export type OrderEmailData = {
  firstName?: string
  orderNumber: string
  orderDateLabel?: string
  statusText?: string
  paymentMethod?: string
  shippingAddress?: string
  billingAddress?: string
  subtotalCents: number
  shippingCents: number
  shippingLabel?: string
  vatCents?: number
  totalCents: number
  items: EmailLineItem[]
  actionUrl?: string
  refundAmountCents?: number
  carrier?: string
  trackingCode?: string
  trackingUrl?: string
  shipmentItemsLabel?: string
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
    intro:
      'Uw bestelling is aangemaakt. We wachten nog op bevestiging van de betaling. U ontvangt een aparte bevestiging zodra de betaling rond is.',
  },
  order_confirmation: {
    subject: 'Bedankt voor uw bestelling bij AllRound Direct',
    title: 'Bedankt voor uw bestelling',
    intro: 'We hebben uw betaling ontvangen en zetten uw bestelling in behandeling.',
  },
  payment_confirmed: {
    subject: 'Bedankt voor uw bestelling bij AllRound Direct',
    title: 'Bedankt voor uw bestelling',
    intro: 'We hebben uw betaling ontvangen en zetten uw bestelling in behandeling.',
  },
  payment_failed: {
    subject: 'Betaling voor bestelling niet afgerond',
    title: 'Betaling niet afgerond',
    intro:
      'De betaling voor deze bestelling is niet afgerond. U kunt de betaling opnieuw starten zonder een nieuwe bestelling te plaatsen.',
  },
  order_processing: {
    subject: 'Uw bestelling is in behandeling',
    title: 'In behandeling',
    intro: 'We bereiden uw bestelling voor. Artikelen kunnen via verschillende leveranciers komen.',
  },
  shipment_sent: {
    subject: 'Uw bestelling is onderweg',
    title: 'Uw bestelling is onderweg',
    intro: 'Een zending van uw bestelling is verzonden.',
  },
  partial_shipment: {
    subject: 'Een deel van uw bestelling is onderweg',
    title: 'Deellevering onderweg',
    intro: 'Een deel van uw bestelling is verzonden. Andere artikelen volgen in een aparte zending.',
  },
  order_delivered: {
    subject: 'Uw bestelling is geleverd',
    title: 'Uw bestelling is geleverd',
    intro: 'Volgens de vervoerder is uw zending bezorgd.',
  },
  order_cancelled: {
    subject: 'Uw bestelling is geannuleerd',
    title: 'Bestelling geannuleerd',
    intro: 'De bestelling is geannuleerd.',
  },
  return_requested: {
    subject: 'Retouraanvraag ontvangen',
    title: 'Retouraanvraag ontvangen',
    intro: 'We hebben uw retouraanvraag ontvangen en nemen deze in behandeling.',
  },
  return_received: {
    subject: 'Retour ontvangen',
    title: 'Retour ontvangen',
    intro: 'De retourzending is binnengekomen. We beoordelen de artikelen.',
  },
  refund_processed: {
    subject: 'Terugbetaling verwerkt',
    title: 'Terugbetaling verwerkt',
    intro:
      'De terugbetaling is bij de betaaldienst aangeboden. Wanneer het bedrag zichtbaar is op uw rekening hangt af van uw bank.',
  },
  business_quote_received: {
    subject: 'Offerteaanvraag ontvangen',
    title: 'Aanvraag ontvangen',
    intro: 'We hebben uw zakelijke aanvraag ontvangen en nemen deze in behandeling.',
  },
  business_quote_ready: {
    subject: 'Uw offerte is gereed',
    title: 'Offerte gereed',
    intro: 'De offerte voor uw aanvraag is gereed.',
  },
}

function greeting(firstName?: string): string {
  const name = firstName?.trim()
  return name ? `Beste ${escapeHtml(name)},` : 'Beste klant,'
}

function actionLabel(template: EmailTemplateId): string {
  if (template === 'email_verification') return 'E-mailadres bevestigen'
  if (template === 'password_reset') return 'Nieuw wachtwoord instellen'
  if (template === 'payment_failed') return 'Betaling opnieuw proberen'
  if (template === 'order_confirmation' || template === 'payment_confirmed') {
    return 'Bekijk uw bestelling'
  }
  if (template.startsWith('shipment') || template === 'partial_shipment') return 'Volg zending'
  if (template.startsWith('order') || template.startsWith('payment') || template.startsWith('refund')) {
    return 'Bekijk uw bestelling'
  }
  return 'Openen'
}

export function renderEmailTemplate(
  template: EmailTemplateId,
  origin: string,
  data: Record<string, string> = {},
  order?: OrderEmailData,
): EmailContent {
  const copy = COPY[template]
  const subject =
    template === 'payment_failed' && order?.orderNumber
      ? `Betaling voor bestelling ${order.orderNumber} niet afgerond`
      : order?.orderNumber && (template === 'order_confirmation' || template === 'payment_confirmed')
        ? copy.subject
        : data.orderNumber
          ? `${copy.subject} (${data.orderNumber})`
          : copy.subject

  let bodyHtml = ''
  if (order && isRichOrderTemplate(template)) {
    bodyHtml = renderRichOrderBody(template, copy.intro, order)
  } else {
    bodyHtml = `<p>${greeting(data.firstName)}</p><p>${escapeHtml(copy.intro)}</p>${extraLines(data)}`
  }

  const actionUrl = order?.actionUrl || data.actionUrl || order?.trackingUrl
  const html = transactionalLayout({
    origin,
    preheader: copy.intro,
    title: copy.title,
    bodyHtml,
    actionUrl,
    actionLabel: actionLabel(template),
  })

  return {
    subject,
    html,
    text: `${copy.title}\n\n${copy.intro}\n\n${textFromHtml(bodyHtml)}${actionUrl ? `\n\n${actionUrl}` : ''}`,
    actionUrl,
  }
}

function isRichOrderTemplate(template: EmailTemplateId): boolean {
  return [
    'order_received',
    'order_confirmation',
    'payment_confirmed',
    'payment_failed',
    'order_processing',
    'shipment_sent',
    'partial_shipment',
    'order_delivered',
    'order_cancelled',
    'return_requested',
    'return_received',
    'refund_processed',
  ].includes(template)
}

function renderRichOrderBody(template: EmailTemplateId, intro: string, order: OrderEmailData): string {
  const parts: string[] = [
    `<p>${greeting(order.firstName)}</p>`,
    `<p>${escapeHtml(intro)}</p>`,
  ]

  if (template === 'order_cancelled' && order.refundAmountCents == null) {
    parts.push(
      `<p style="font-size:14px;color:#626a76">Als er geen betaling is ontvangen, volgt er geen terugbetaling.</p>`,
    )
  }
  if (template === 'order_cancelled' && order.refundAmountCents != null) {
    parts.push(
      `<p>Een terugbetaling van ${escapeHtml(new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(order.refundAmountCents / 100))} is of wordt verwerkt via de oorspronkelijke betaalmethode.</p>`,
    )
  }

  parts.push(
    renderKeyValueRows([
      ['Bestelling', order.orderNumber],
      ['Datum', order.orderDateLabel ?? ''],
      ['Status', order.statusText ?? ''],
      ['Betaalmethode', order.paymentMethod ?? ''],
      ['Vervoerder', order.carrier ?? ''],
      ['Track & trace', order.trackingCode ?? ''],
    ]),
  )

  if (order.items?.length) {
    parts.push(renderOrderItemsTable(order.items))
    if (template !== 'payment_failed') {
      parts.push(
        renderTotalsBlock({
          subtotalCents: order.subtotalCents,
          shippingCents: order.shippingCents,
          shippingLabel: order.shippingLabel,
          vatCents: order.vatCents,
          totalCents: order.totalCents,
        }),
      )
    }
  }

  if (order.refundAmountCents != null && template === 'refund_processed') {
    parts.push(
      renderKeyValueRows([
        [
          'Terugbetaling',
          new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(
            order.refundAmountCents / 100,
          ),
        ],
      ]),
    )
  }

  if (order.shippingAddress) {
    parts.push(
      `<p style="margin:18px 0 0;font-size:14px"><strong>Afleveradres</strong><br />${escapeHtml(order.shippingAddress).replaceAll('\n', '<br />')}</p>`,
    )
  }

  if (order.shipmentItemsLabel) {
    parts.push(
      `<p style="margin:12px 0 0;font-size:14px"><strong>In deze zending</strong><br />${escapeHtml(order.shipmentItemsLabel)}</p>`,
    )
  }

  return parts.join('')
}

function extraLines(data: Record<string, string>): string {
  return renderKeyValueRows([
    ['Bestelling', data.orderNumber],
    ['Referentie', data.confirmationCode],
    ['Zending', data.shipmentLabel],
    ['Track & trace', data.trackingCode],
    ['Bedrag', data.amountLabel],
    ['Vastgelegd', data.recordedAtLabel],
    ['Omvang', data.itemsLabel],
  ])
}

/** Fixture data for admin/dev HTML preview. */
export function fixtureOrderEmailData(origin: string): OrderEmailData {
  return {
    firstName: 'Sara',
    orderNumber: 'ARD-2026-000123',
    orderDateLabel: '14 september 2026',
    statusText: 'Betaling ontvangen',
    paymentMethod: 'iDEAL',
    shippingAddress: 'Sara Jansen\nVoorbeeldstraat 12\n1234 AB Amsterdam\nNederland',
    subtotalCents: 18789,
    shippingCents: 0,
    shippingLabel: 'Gratis',
    vatCents: 3260,
    totalCents: 18789,
    actionUrl: `${origin}/bestelling/bevestiging?order=ARD-2026-000123&token=demo`,
    items: [
      {
        name: 'Wicanders kurkvloer om te klikken',
        quantity: 2,
        lineTotalCents: 12990,
        imageUrl: `${origin}/media/categories/category-vloeren.png`,
      },
      {
        name: 'Salontafel Countryside',
        quantity: 1,
        lineTotalCents: 5799,
        imageUrl: `${origin}/media/categories/category-meubels.png`,
      },
    ],
  }
}
