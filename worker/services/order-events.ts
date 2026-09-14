import { eq } from 'drizzle-orm'
import type { EmailTemplateId } from '../../shared/email-templates'
import type { OrderEventType } from '../../shared/order-events'
import type { AppEnv } from '../types'
import { createDb } from '../db'
import { orderEventDeliveries, orders } from '../db/schema'
import { newId } from '../lib/request'
import { createEmailService } from './email'

export type OrderEvent = {
  type: OrderEventType
  orderId?: string
  entityType: string
  entityId: string
  data?: Record<string, string>
}

const EVENT_TEMPLATE: Partial<Record<OrderEventType, EmailTemplateId>> = {
  ORDER_CREATED: 'order_received',
  PAYMENT_CONFIRMED: 'payment_confirmed',
  ORDER_PROCESSING: 'order_processing',
  SHIPMENT_SENT: 'shipment_sent',
  ORDER_DELIVERED: 'order_delivered',
  ORDER_CANCELLED: 'order_cancelled',
  RETURN_REQUESTED: 'return_requested',
  RETURN_RECEIVED: 'return_received',
  REFUND_COMPLETED: 'refund_processed',
  BUSINESS_QUOTE_RECEIVED: 'business_quote_received',
  BUSINESS_QUOTE_READY: 'business_quote_ready',
}

export async function emitOrderEvent(env: AppEnv['Bindings'], event: OrderEvent): Promise<void> {
  const db = createDb(env)
  const channel = 'email'
  try {
    await db.insert(orderEventDeliveries).values({
      id: newId(),
      eventType: event.type,
      entityType: event.entityType,
      entityId: event.entityId,
      channel,
      createdAt: new Date(),
    })
  } catch {
    return
  }

  const template = EVENT_TEMPLATE[event.type]
  if (!template) return

  let to = event.data?.email
  let orderNumber = event.data?.orderNumber
  if (event.orderId) {
    const order = (await db.select().from(orders).where(eq(orders.id, event.orderId)).limit(1))[0]
    if (order) {
      to = to ?? order.guestEmail
      orderNumber = orderNumber ?? order.orderNumber
    }
  }
  if (!to) return

  const email = createEmailService(env)
  try {
    await email.send({
      template:
        event.type === 'SHIPMENT_SENT' && event.data?.partial === 'true'
          ? 'partial_shipment'
          : template,
      to,
      data: { ...event.data, orderNumber: orderNumber ?? '' },
      related: { type: event.entityType, id: event.entityId },
    })
  } catch (error) {
    console.error('[events] e-mail voor', event.type, 'mislukt')
    throw error
  }
}
