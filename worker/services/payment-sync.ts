import { eq } from 'drizzle-orm'
import { canTransitionOrder } from '../../shared/order-machine'
import {
  mapOrderPaymentStatus,
  shouldEmitPaymentConfirmed,
  shouldRecordFailedPaymentAttempt,
} from '../../shared/payment-ui'
import type { AppEnv } from '../types'
import { createDb } from '../db'
import { orderStatusHistory, orders, payments, processedWebhooks } from '../db/schema'
import { newId } from '../lib/request'
import { createPaymentsService, mapMollieStatus } from './mollie'
import { emitOrderEvent } from './order-events'

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
  let webhookSeenBefore = false
  try {
    await db.insert(processedWebhooks).values({
      externalKey: `mollie:${remote.id}:${mapped}`,
      provider: 'mollie',
      createdAt: now,
    })
  } catch {
    webhookSeenBefore = true
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
  if (!order) {
    return { duplicate: alreadySame || webhookSeenBefore, status: mapped, orderId: payment.orderId }
  }

  if (mapped === 'paid') {
    const firstPaid = shouldEmitPaymentConfirmed(order.paymentStatus, mapped)
    if (firstPaid) {
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
      await emitOrderEvent(env, {
        type: 'PAYMENT_CONFIRMED',
        orderId: order.id,
        entityType: 'order',
        entityId: order.id,
      })
    }
  } else if (
    shouldRecordFailedPaymentAttempt(order.paymentStatus, mapped, order.status)
  ) {
    const nextPaymentStatus = mapOrderPaymentStatus(mapped)
    await db
      .update(orders)
      .set({ paymentStatus: nextPaymentStatus, updatedAt: now })
      .where(eq(orders.id, order.id))
    // Keep order pending_payment so the customer can retry without duplicating the order.
    await db.insert(orderStatusHistory).values({
      id: newId(),
      orderId: order.id,
      fromStatus: order.status,
      toStatus: order.status,
      source: 'webhook',
      actorUserId: null,
      note: `Betaling ${mapped} — opnieuw betalen mogelijk`,
      createdAt: now,
    })
    await emitOrderEvent(env, {
      type: 'PAYMENT_FAILED',
      orderId: order.id,
      entityType: 'order',
      entityId: order.id,
      data: {
        paymentId: payment.id,
        mapped,
      },
    })
  }

  return {
    duplicate: alreadySame || webhookSeenBefore,
    status: mapped,
    orderId: order.id,
  }
}
