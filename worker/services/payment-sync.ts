import { eq } from 'drizzle-orm'
import { canTransitionOrder } from '../../shared/order-machine'
import type { AppEnv } from '../types'
import { createDb } from '../db'
import { orderStatusHistory, orders, payments, processedWebhooks } from '../db/schema'
import { newId } from '../lib/request'
import { createPaymentsService, mapMollieStatus } from './mollie'
import { emitOrderEvent } from './order-events'

function orderPaymentStatus(mapped: ReturnType<typeof mapMollieStatus>): string {
  if (mapped === 'paid') return 'paid'
  if (mapped === 'refunded') return 'refunded'
  if (mapped === 'failed' || mapped === 'canceled' || mapped === 'expired') return 'failed'
  return 'pending'
}

export async function syncProviderPayment(
  env: AppEnv['Bindings'],
  providerPaymentId: string,
): Promise<{ duplicate: boolean; status: string; orderId: string | null }> {
  const remote = await createPaymentsService(env).getPayment(providerPaymentId)
  const mapped = mapMollieStatus(remote.status)
  const db = createDb(env)
  const payment = (
    await db.select().from(payments).where(eq(payments.providerPaymentId, remote.id)).limit(1)
  )[0]
  if (!payment) {
    return { duplicate: false, status: mapped, orderId: null }
  }

  const alreadySame = payment.status === mapped
  const now = new Date()
  try {
    await db.insert(processedWebhooks).values({
      externalKey: `mollie:${remote.id}:${mapped}`,
      provider: 'mollie',
      createdAt: now,
    })
  } catch {
    /* dezelfde providerstatus is al gezien; we reconcilen hieronder nog idempotent */
  }

  if (!alreadySame) {
    await db
      .update(payments)
      .set({
        status: mapped,
        method: remote.method,
        updatedAt: now,
        paidAt: mapped === 'paid' ? now : payment.paidAt,
      })
      .where(eq(payments.id, payment.id))
  }

  const order = (await db.select().from(orders).where(eq(orders.id, payment.orderId)).limit(1))[0]
  if (!order) return { duplicate: alreadySame, status: mapped, orderId: payment.orderId }

  if (mapped === 'paid') {
    if (order.paymentStatus !== 'paid') {
      const nextStatus = canTransitionOrder(order.status, 'payment_received')
        ? 'payment_received'
        : order.status
      await db
        .update(orders)
        .set({
          status: nextStatus,
          paymentStatus: 'paid',
          paymentMethod: remote.method,
          molliePaymentId: remote.id,
          paidAt: now,
          inventoryAdjustedAt: order.inventoryAdjustedAt ?? now,
          updatedAt: now,
        })
        .where(eq(orders.id, order.id))
      await db.insert(orderStatusHistory).values({
        id: newId(),
        orderId: order.id,
        fromStatus: order.status,
        toStatus: nextStatus,
        source: 'webhook',
        actorUserId: null,
        note: 'Betaling bevestigd via geverifieerde Mollie-status',
        createdAt: now,
      })
    }
    await emitOrderEvent(env, {
      type: 'PAYMENT_CONFIRMED',
      orderId: order.id,
      entityType: 'order',
      entityId: order.id,
    })
  } else {
    const nextPaymentStatus = orderPaymentStatus(mapped)
    if (nextPaymentStatus !== order.paymentStatus) {
      await db
        .update(orders)
        .set({ paymentStatus: nextPaymentStatus, updatedAt: now })
        .where(eq(orders.id, order.id))
    }
    if (
      (mapped === 'canceled' || mapped === 'expired' || mapped === 'failed') &&
      order.status === 'pending_payment' &&
      canTransitionOrder(order.status, 'cancelled')
    ) {
      await db
        .update(orders)
        .set({ status: 'cancelled', paymentStatus: nextPaymentStatus, updatedAt: now })
        .where(eq(orders.id, order.id))
      await db.insert(orderStatusHistory).values({
        id: newId(),
        orderId: order.id,
        fromStatus: order.status,
        toStatus: 'cancelled',
        source: 'webhook',
        actorUserId: null,
        note: `Betaling ${mapped}`,
        createdAt: now,
      })
      await emitOrderEvent(env, {
        type: 'ORDER_CANCELLED',
        orderId: order.id,
        entityType: 'order',
        entityId: order.id,
      })
    }
  }

  return { duplicate: alreadySame, status: mapped, orderId: order.id }
}
