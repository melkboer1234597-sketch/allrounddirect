import type { OrderEventType } from '../../shared/order-events'
import type { AppEnv } from '../types'
import { createEmailService } from './email'

export type OrderEvent = {
  type: OrderEventType
  orderId?: string
  entityType: string
  entityId: string
  data?: Record<string, string>
}

/**
 * Event → e-mail.
 *
 * Bevestigingsbeleid (iDEAL/Bancontact):
 * - Geen aparte “order ontvangen” + “betaling bevestigd” voor instant methods.
 * - ORDER_CREATED stuurt alleen mail bij openstaande betaling (bijv. overboeking).
 * - PAYMENT_CONFIRMED stuurt de rijke orderbevestiging (één mail).
 *
 * E-mailfouten blokkeren checkout/webhooks nooit.
 */
export async function emitOrderEvent(env: AppEnv['Bindings'], event: OrderEvent): Promise<void> {
  const email = createEmailService(env)
  const orderId = event.orderId ?? (event.entityType === 'order' ? event.entityId : undefined)

  try {
    switch (event.type) {
      case 'ORDER_CREATED': {
        // Pending methods only (bank transfer / open payment). Instant methods wait for PAYMENT_CONFIRMED.
        if (event.data?.awaitingPayment === 'true' && orderId) {
          await email.sendOrderReceivedPending(orderId)
        }
        return
      }
      case 'PAYMENT_CONFIRMED': {
        if (orderId) await email.sendOrderConfirmation(orderId)
        return
      }
      case 'PAYMENT_FAILED': {
        if (orderId) {
          const paymentId = event.data?.paymentId
          await email.sendPaymentFailed(orderId, paymentId)
        }
        return
      }
      case 'ORDER_PROCESSING':
        // Covered by confirmation for most flows; avoid duplicate noise.
        return
      case 'SHIPMENT_SENT': {
        if (orderId) {
          await email.sendShipmentNotification({
            orderId,
            shipmentId: event.entityId,
            partial: event.data?.partial === 'true',
          })
        }
        return
      }
      case 'ORDER_DELIVERED': {
        if (orderId) await email.sendDeliveryConfirmation(orderId)
        return
      }
      case 'ORDER_CANCELLED': {
        if (orderId) {
          const refundCents = event.data?.refundAmountCents
            ? Number(event.data.refundAmountCents)
            : undefined
          await email.sendCancelled(
            orderId,
            Number.isFinite(refundCents) ? refundCents : undefined,
          )
        }
        return
      }
      case 'RETURN_REQUESTED': {
        if (orderId) await email.sendReturnRequested(orderId)
        return
      }
      case 'RETURN_RECEIVED': {
        if (orderId) await email.sendReturnReceived(orderId)
        return
      }
      case 'REFUND_COMPLETED': {
        if (orderId) {
          const refundCents = event.data?.refundAmountCents
            ? Number(event.data.refundAmountCents)
            : undefined
          await email.sendRefundConfirmation(
            orderId,
            Number.isFinite(refundCents) ? refundCents : undefined,
            event.data?.refundId,
          )
        }
        return
      }
      case 'BUSINESS_QUOTE_RECEIVED': {
        if (event.data?.email) {
          await email.sendQuoteReceived({
            to: event.data.email,
            quoteId: event.entityId,
          })
        }
        return
      }
      case 'BUSINESS_QUOTE_READY': {
        if (event.data?.email) {
          await email.send({
            template: 'business_quote_ready',
            to: event.data.email,
            eventKey: `quote:${event.entityId}:ready`,
            related: { type: 'quote', id: event.entityId },
            data: event.data,
          })
        }
        return
      }
      default:
        return
    }
  } catch (error) {
    console.error('[events] e-mail voor', event.type, 'mislukt (niet-blokkerend)')
  }
}
