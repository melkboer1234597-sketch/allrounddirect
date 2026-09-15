import { eq } from 'drizzle-orm'
import type { EmailTemplateId } from '../../shared/email-templates'
import type { AppEnv } from '../types'
import { createDb } from '../db'
import {
  devEmailOutbox,
  emailEvents,
  emailLogs,
  orderItems,
  orders,
  payments,
  shipments,
} from '../db/schema'
import { getSiteOrigin, isDevelopment, newId, redactEmail } from '../lib/request'
import { mediaPublicPath } from '../../shared/media'
import { renderEmailTemplate, fixtureOrderEmailData, type OrderEmailData } from '../email/templates'

export type AuthEmailType = 'verification' | 'password_reset' | 'deletion_notice'
export type TransactionalEmailType = AuthEmailType | 'withdrawal_confirmation' | 'contact_ack'

export type SendEmailInput = {
  template: EmailTemplateId
  to: string
  data?: Record<string, string>
  order?: OrderEmailData
  related?: { type: string; id: string }
  /** Unique key — duplicate webhook/event must not send twice. */
  eventKey?: string
  orderId?: string
}

export type EmailService = {
  send: (input: SendEmailInput) => Promise<{ sent: boolean; skipped?: boolean }>
  sendAuthEmail: (input: {
    to: string
    subject: string
    text: string
    html: string
    type: TransactionalEmailType
    actionUrl?: string
  }) => Promise<void>
  sendOrderConfirmation: (orderId: string) => Promise<void>
  sendPaymentFailed: (orderId: string, paymentId?: string) => Promise<void>
  sendOrderReceivedPending: (orderId: string) => Promise<void>
  sendShipmentNotification: (input: {
    orderId: string
    shipmentId: string
    partial?: boolean
  }) => Promise<void>
  sendDeliveryConfirmation: (orderId: string) => Promise<void>
  sendRefundConfirmation: (
    orderId: string,
    refundAmountCents?: number,
    refundId?: string,
  ) => Promise<void>
  sendCancelled: (orderId: string, refundAmountCents?: number) => Promise<void>
  sendReturnRequested: (orderId: string) => Promise<void>
  sendReturnReceived: (orderId: string) => Promise<void>
  sendQuoteReceived: (input: { to: string; quoteId: string }) => Promise<void>
  sendPasswordReset: (to: string, actionUrl: string) => Promise<void>
  sendEmailVerification: (to: string, actionUrl: string) => Promise<void>
  /** Re-send a previously failed email event (new attempt; never duplicates a successful send). */
  retryFailedEvent: (eventId: string) => Promise<{ sent: boolean; skipped?: boolean; error?: string }>
  preview: (template: EmailTemplateId) => { subject: string; html: string; text: string }
}

const AUTH_TEMPLATE: Record<TransactionalEmailType, EmailTemplateId> = {
  verification: 'email_verification',
  password_reset: 'password_reset',
  deletion_notice: 'deletion_notice',
  withdrawal_confirmation: 'withdrawal_confirmation',
  contact_ack: 'contact_ack',
}

function formatAddress(snapshotJson: string): string {
  try {
    const a = JSON.parse(snapshotJson) as Record<string, string>
    const name = a.name || `${a.firstName ?? ''} ${a.lastName ?? ''}`.trim()
    const line2 = `${a.street ?? ''} ${a.houseNumber ?? ''}${a.houseAddition ? ` ${a.houseAddition}` : ''}`.trim()
    const line3 = `${a.postalCode ?? ''} ${a.city ?? ''}`.trim()
    const country = a.country === 'BE' ? 'België' : a.country === 'NL' ? 'Nederland' : a.country
    return [name, a.company, line2, line3, country].filter(Boolean).join('\n')
  } catch {
    return ''
  }
}

function formatDateNl(date: Date): string {
  return new Intl.DateTimeFormat('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function absoluteUrl(origin: string, path: string): string {
  if (path.startsWith('http')) return path
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`
}

function paymentMethodLabel(method?: string | null): string | undefined {
  if (!method) return undefined
  const labels: Record<string, string> = {
    ideal: 'iDEAL',
    bancontact: 'Bancontact',
    creditcard: 'Creditcard',
    paypal: 'PayPal',
    banktransfer: 'Overboeking',
    kbc: 'KBC/CBC',
    belfius: 'Belfius',
    applepay: 'Apple Pay',
    klarna: 'Klarna',
    in3: 'in3',
  }
  return labels[method.toLowerCase()] ?? method
}

function defaultFromAddress(env: AppEnv['Bindings']): string {
  return (
    env.EMAIL_FROM?.trim() ||
    'AllRound Direct <bestellingen@allrounddirect.com>'
  )
}

export function verificationEmail(origin: string, url: string) {
  const content = renderEmailTemplate('email_verification', origin, { actionUrl: url })
  return { ...content, type: 'verification' as const }
}

export function passwordResetEmail(origin: string, url: string) {
  const content = renderEmailTemplate('password_reset', origin, { actionUrl: url })
  return { ...content, type: 'password_reset' as const }
}

export function withdrawalConfirmationEmail(input: {
  confirmationCode: string
  orderNumber: string
  recordedAtLabel: string
  itemsLabel: string
}) {
  return {
    type: 'withdrawal_confirmation' as const,
    data: input,
  }
}

export function createEmailService(env: AppEnv['Bindings']): EmailService {
  const origin = getSiteOrigin(env)

  async function claimEventKey(input: {
    eventKey: string
    template: EmailTemplateId
    recipient: string
    orderId?: string
  }): Promise<{ id: string } | null> {
    const db = createDb(env)
    const id = newId()
    try {
      await db.insert(emailEvents).values({
        id,
        eventKey: input.eventKey,
        template: input.template,
        orderId: input.orderId ?? null,
        recipient: input.recipient.trim().toLowerCase(),
        status: 'queued',
        providerMessageId: null,
        errorCode: null,
        createdAt: new Date(),
        sentAt: null,
      })
      return { id }
    } catch {
      return null
    }
  }

  async function send(input: SendEmailInput): Promise<{ sent: boolean; skipped?: boolean }> {
    const recipient = input.to.trim().toLowerCase()
    const eventKey = input.eventKey
    let eventId: string | null = null

    if (eventKey) {
      const claimed = await claimEventKey({
        eventKey,
        template: input.template,
        recipient,
        orderId: input.orderId,
      })
      if (!claimed) {
        console.info(
          `[EMAIL DEV] skip duplicate event_key=${eventKey} template=${input.template} recipient=${redactEmail(recipient)}`,
        )
        return { sent: false, skipped: true }
      }
      eventId = claimed.id
    }

    const content = renderEmailTemplate(input.template, origin, input.data ?? {}, input.order)
    const from = defaultFromAddress(env)
    const replyTo = env.EMAIL_REPLY_TO?.trim() || 'support@allrounddirect.com'
    const resendKey = env.RESEND_API_KEY?.trim()
    const logId = newId()
    const db = createDb(env)

    await db.insert(emailLogs).values({
      id: logId,
      template: input.template,
      recipient,
      relatedEntityType: input.related?.type ?? null,
      relatedEntityId: input.related?.id ?? null,
      eventKey: eventKey ?? null,
      status: 'queued',
      providerMessageId: null,
      errorCode: null,
      sentAt: null,
      createdAt: new Date(),
    })

    if (resendKey) {
      try {
        const payload: Record<string, unknown> = {
          from,
          to: [recipient],
          subject: content.subject,
          html: content.html,
          text: content.text,
        }
        if (replyTo) payload.reply_to = replyTo
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })
        const body = (await response.json().catch(() => null)) as { id?: string } | null
        if (!response.ok) {
          await db
            .update(emailLogs)
            .set({ status: 'failed', errorCode: `resend_${response.status}` })
            .where(eq(emailLogs.id, logId))
          if (eventId) {
            await db
              .update(emailEvents)
              .set({ status: 'failed', errorCode: `resend_${response.status}` })
              .where(eq(emailEvents.id, eventId))
          }
          console.error('[email] Resend request failed', response.status)
          // Never block checkout/webhooks on email provider errors.
          return { sent: false }
        }
        const providerId = body?.id ?? null
        await db
          .update(emailLogs)
          .set({ status: 'sent', providerMessageId: providerId, sentAt: new Date() })
          .where(eq(emailLogs.id, logId))
        if (eventId) {
          await db
            .update(emailEvents)
            .set({ status: 'sent', providerMessageId: providerId, sentAt: new Date() })
            .where(eq(emailEvents.id, eventId))
        }
        return { sent: true }
      } catch (error) {
        await db
          .update(emailLogs)
          .set({ status: 'failed', errorCode: 'resend_error' })
          .where(eq(emailLogs.id, logId))
        if (eventId) {
          await db
            .update(emailEvents)
            .set({ status: 'failed', errorCode: 'resend_error' })
            .where(eq(emailEvents.id, eventId))
        }
        console.error('[email] Resend error', error instanceof Error ? error.message : 'unknown')
        return { sent: false }
      }
    }

    // No API key: development outbox, or soft-fail in production without blocking callers.
    if (!isDevelopment(env)) {
      await db
        .update(emailLogs)
        .set({ status: 'failed', errorCode: 'missing_resend_key' })
        .where(eq(emailLogs.id, logId))
      if (eventId) {
        await db
          .update(emailEvents)
          .set({ status: 'failed', errorCode: 'missing_resend_key' })
          .where(eq(emailEvents.id, eventId))
      }
      console.error('[email] RESEND_API_KEY ontbreekt — e-mail overgeslagen (geen checkout-blokkade).')
      return { sent: false }
    }

    await db.insert(devEmailOutbox).values({
      id: newId(),
      toEmail: recipient,
      subject: content.subject,
      type: input.template,
      actionUrl: content.actionUrl ?? null,
      createdAt: new Date(),
    })
    await db
      .update(emailLogs)
      .set({ status: 'sent', providerMessageId: 'dev-outbox', sentAt: new Date() })
      .where(eq(emailLogs.id, logId))
    if (eventId) {
      await db
        .update(emailEvents)
        .set({ status: 'sent', providerMessageId: 'dev-outbox', sentAt: new Date() })
        .where(eq(emailEvents.id, eventId))
    }
    console.info(
      `[EMAIL DEV]\ntemplate: ${input.template}\nrecipient: ${redactEmail(recipient)}\norder: ${input.order?.orderNumber ?? input.data?.orderNumber ?? '—'}`,
    )
    return { sent: true }
  }

  async function loadOrderEmailData(orderId: string): Promise<{
    to: string
    order: typeof orders.$inferSelect
    data: OrderEmailData
  } | null> {
    const db = createDb(env)
    const order = (await db.select().from(orders).where(eq(orders.id, orderId)).limit(1))[0]
    if (!order) return null
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id))
    const payment = (
      await db.select().from(payments).where(eq(payments.orderId, order.id)).limit(1)
    )[0]
    const shipping = formatAddress(order.shippingSnapshot)
    let firstName = ''
    try {
      const snap = JSON.parse(order.shippingSnapshot) as { firstName?: string; name?: string }
      firstName = snap.firstName || snap.name?.split(' ')[0] || ''
    } catch {
      firstName = ''
    }

    const trackUrl = order.userId
      ? `${origin}/account/bestellingen/${encodeURIComponent(order.orderNumber)}`
      : `${origin}/bestelling/bevestiging?order=${encodeURIComponent(order.orderNumber)}&token=${encodeURIComponent(order.confirmationToken)}`

    return {
      to: order.guestEmail,
      order,
      data: {
        firstName,
        orderNumber: order.orderNumber,
        orderDateLabel: formatDateNl(order.placedAt),
        statusText: order.paymentStatus === 'paid' ? 'Betaling ontvangen' : order.status,
        paymentMethod: paymentMethodLabel(order.paymentMethod || payment?.method),
        shippingAddress: shipping,
        subtotalCents: order.subtotalCents,
        shippingCents: order.shippingCents,
        shippingLabel: order.shippingCents > 0 ? undefined : 'Gratis',
        vatCents: order.vatCents,
        totalCents: order.totalCents,
        actionUrl: trackUrl,
        items: items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          lineTotalCents: item.lineTotalCents,
          imageUrl: item.imageRef
            ? absoluteUrl(
                origin,
                item.imageRef.startsWith('http') || item.imageRef.startsWith('/')
                  ? item.imageRef
                  : mediaPublicPath(item.imageRef),
              )
            : null,
        })),
      },
    }
  }

  async function sendOrderMail(
    orderId: string,
    template: EmailTemplateId,
    eventSuffix: string,
    patch?: (data: OrderEmailData) => OrderEmailData,
  ) {
    const loaded = await loadOrderEmailData(orderId)
    if (!loaded) return
    const data = patch ? patch(loaded.data) : loaded.data
    await send({
      template,
      to: loaded.to,
      order: data,
      orderId,
      eventKey: `order:${orderId}:${eventSuffix}`,
      related: { type: 'order', id: orderId },
      data: { orderNumber: loaded.order.orderNumber, firstName: data.firstName ?? '' },
    })
  }

  return {
    send,
    async sendAuthEmail(input) {
      await send({
        template: AUTH_TEMPLATE[input.type],
        to: input.to,
        data: { actionUrl: input.actionUrl ?? '' },
        eventKey: `auth:${AUTH_TEMPLATE[input.type]}:${input.to.trim().toLowerCase()}:${input.actionUrl ?? 'none'}`,
      })
    },
    async sendOrderConfirmation(orderId) {
      await sendOrderMail(orderId, 'order_confirmation', 'payment-confirmed', (data) => ({
        ...data,
        statusText: 'Betaling ontvangen',
      }))
    },
    async sendPaymentFailed(orderId, paymentId) {
      const suffix = paymentId ? `payment-failed:${paymentId}` : 'payment-failed'
      await sendOrderMail(orderId, 'payment_failed', suffix, (data) => {
        const loadedAction = data.actionUrl
        return {
          ...data,
          statusText: 'Betaling niet afgerond',
          actionUrl: loadedAction?.includes('bevestiging')
            ? loadedAction
            : data.actionUrl,
        }
      })
    },
    async sendOrderReceivedPending(orderId) {
      await sendOrderMail(orderId, 'order_received', 'order-received-pending', (data) => ({
        ...data,
        statusText: 'Wacht op betaling',
      }))
    },
    async sendShipmentNotification(input) {
      const db = createDb(env)
      const shipment = (
        await db.select().from(shipments).where(eq(shipments.id, input.shipmentId)).limit(1)
      )[0]
      await sendOrderMail(
        input.orderId,
        input.partial ? 'partial_shipment' : 'shipment_sent',
        `shipment:${input.shipmentId}`,
        (data) => ({
          ...data,
          statusText: input.partial ? 'Deellevering verzonden' : 'Zending verzonden',
          carrier: shipment?.carrier ?? undefined,
          trackingCode: shipment?.trackingCode ?? undefined,
          trackingUrl: shipment?.trackingUrl || data.actionUrl,
          actionUrl: shipment?.trackingUrl || data.actionUrl,
          shipmentItemsLabel: shipment?.publicLabel,
        }),
      )
    },
    async sendDeliveryConfirmation(orderId) {
      await sendOrderMail(orderId, 'order_delivered', 'delivered', (data) => ({
        ...data,
        statusText: 'Geleverd',
      }))
    },
    async sendRefundConfirmation(orderId: string, refundAmountCents?: number, refundId?: string) {
      const suffix = refundId ? `refund:${refundId}` : 'refund-completed'
      await sendOrderMail(orderId, 'refund_processed', suffix, (data) => ({
        ...data,
        statusText: 'Terugbetaling verwerkt',
        refundAmountCents,
      }))
    },
    async sendCancelled(orderId, refundAmountCents) {
      await sendOrderMail(orderId, 'order_cancelled', 'cancelled', (data) => ({
        ...data,
        statusText: 'Geannuleerd',
        refundAmountCents,
      }))
    },
    async sendReturnRequested(orderId) {
      await sendOrderMail(orderId, 'return_requested', 'return-requested')
    },
    async sendReturnReceived(orderId) {
      await sendOrderMail(orderId, 'return_received', 'return-received')
    },
    async sendQuoteReceived(input) {
      await send({
        template: 'business_quote_received',
        to: input.to,
        eventKey: `quote:${input.quoteId}:received`,
        related: { type: 'quote', id: input.quoteId },
        data: { actionUrl: `${origin}/zakelijk/offerte` },
      })
    },
    async sendPasswordReset(to, actionUrl) {
      await send({
        template: 'password_reset',
        to,
        data: { actionUrl },
        eventKey: `auth:password_reset:${to.trim().toLowerCase()}:${actionUrl}`,
      })
    },
    async sendEmailVerification(to, actionUrl) {
      await send({
        template: 'email_verification',
        to,
        data: { actionUrl },
        eventKey: `auth:email_verification:${to.trim().toLowerCase()}:${actionUrl}`,
      })
    },
    async retryFailedEvent(eventId) {
      const db = createDb(env)
      const row = (
        await db.select().from(emailEvents).where(eq(emailEvents.id, eventId)).limit(1)
      )[0]
      if (!row) return { sent: false, error: 'E-mail event niet gevonden.' }
      if (row.status === 'sent') {
        return { sent: false, skipped: true, error: 'Dit event is al verzonden.' }
      }
      if (!row.orderId) {
        return { sent: false, error: 'Alleen order-e-mails kunnen opnieuw worden verzonden.' }
      }

      // Allow a fresh attempt: clear the failed row's uniqueness by renaming the key,
      // then send with a retry-suffixed key so successful originals stay unique.
      const retryKey = `${row.eventKey}:retry:${Date.now()}`
      const template = row.template as EmailTemplateId
      const loaded = await loadOrderEmailData(row.orderId)
      if (!loaded) return { sent: false, error: 'Order niet gevonden.' }

      // Mark old failed event as superseded (keep audit trail).
      await db
        .update(emailEvents)
        .set({ status: 'superseded', errorCode: row.errorCode ?? 'retry_requested' })
        .where(eq(emailEvents.id, eventId))

      return send({
        template,
        to: row.recipient,
        order: loaded.data,
        orderId: row.orderId,
        eventKey: retryKey,
        related: { type: 'order', id: row.orderId },
        data: { orderNumber: loaded.order.orderNumber, firstName: loaded.data.firstName ?? '' },
      })
    },
    preview(template) {
      const order = fixtureOrderEmailData(origin)
      if (template === 'payment_failed') {
        order.statusText = 'Betaling niet afgerond'
        order.actionUrl = `${origin}/bestelling/bevestiging?order=${order.orderNumber}&token=demo`
      }
      if (template === 'shipment_sent' || template === 'partial_shipment') {
        order.carrier = 'PostNL'
        order.trackingCode = '3SDEMODEMO'
        order.statusText = template === 'partial_shipment' ? 'Deellevering' : 'Onderweg'
      }
      if (template === 'refund_processed') order.refundAmountCents = 5799
      return renderEmailTemplate(template, origin, { firstName: 'Sara' }, order)
    },
  }
}

export async function getLatestDevEmail(env: AppEnv['Bindings'], to: string) {
  if (!isDevelopment(env)) return null
  const db = createDb(env)
  const rows = await db
    .select()
    .from(devEmailOutbox)
    .where(eq(devEmailOutbox.toEmail, to.trim().toLowerCase()))
  return rows.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0] ?? null
}
