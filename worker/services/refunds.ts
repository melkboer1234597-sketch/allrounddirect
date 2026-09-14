/**
 * Admin Mollie refunds — server-validated amounts, idempotent, TEST-safe defaults.
 * Never trust a frontend amount for “full” refunds; never log API secrets.
 */
import { and, desc, eq, ne } from 'drizzle-orm'
import { canTransitionOrder } from '../../shared/order-machine'
import type { StaffContext } from '../auth/rbac-guard'
import { createDb } from '../db'
import {
  orderStatusHistory,
  orders,
  payments,
  refunds,
} from '../db/schema'
import { writeAudit } from '../lib/audit'
import { newId } from '../lib/request'
import type { AppEnv } from '../types'
import { createPaymentsService, MollieConfigError, resolveMollieMode } from './mollie'
import { emitOrderEvent } from './order-events'

const REFUNDABLE_ORDER_STATUSES = [
  'payment_received',
  'processing',
  'on_order_with_supplier',
  'ready_to_ship',
  'shipped',
  'partially_shipped',
  'delivered',
  'return_requested',
] as const

const COUNTED_REFUND_STATUSES = ['pending', 'processing', 'queued', 'refunded', 'completed'] as const

export type RefundMode = 'full' | 'partial'

export class RefundValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RefundValidationError'
  }
}

export type RefundContext = {
  orderId: string
  orderNumber: string
  customerEmail: string
  orderStatus: string
  paymentStatus: string
  paidAmountCents: number
  currency: string
  previousRefunds: Array<{
    id: string
    amountCents: number
    status: string
    reason: string | null
    createdAt: Date | string
    providerRefundId: string | null
  }>
  refundedCents: number
  remainingCents: number
  refundable: boolean
  paymentId: string | null
  providerPaymentId: string | null
  paymentMode: string | null
  mollieMode: string
}

function isCountedRefund(status: string) {
  return (COUNTED_REFUND_STATUSES as readonly string[]).includes(status.toLowerCase())
}

/** Block live refunds outside deliberate production; honor explicit CI block. */
export function assertRefundEnvironment(
  env: AppEnv['Bindings'],
  paymentMode: string | null,
): { mode: 'test' | 'live' } {
  const mode = resolveMollieMode(env)

  if (env.MOLLIE_BLOCK_LIVE_REFUNDS === 'true' && (mode === 'live' || paymentMode === 'live')) {
    throw new MollieConfigError(
      'Live terugbetalingen zijn geblokkeerd (MOLLIE_BLOCK_LIVE_REFUNDS).',
    )
  }

  if (mode === 'live') {
    if (env.MOLLIE_ALLOW_LIVE !== 'true') {
      throw new MollieConfigError('Live Mollie-refunds vereisen MOLLIE_ALLOW_LIVE=true.')
    }
    if (env.ENVIRONMENT !== 'production') {
      throw new MollieConfigError('Live terugbetalingen zijn alleen toegestaan in production.')
    }
  }

  if (paymentMode === 'live' && mode !== 'live') {
    throw new MollieConfigError(
      'Deze betaling is live; MOLLIE_MODE moet live zijn om te kunnen terugbetalen.',
    )
  }

  if (paymentMode === 'live' && env.ENVIRONMENT !== 'production') {
    throw new MollieConfigError('Live payment-refunds zijn geblokkeerd buiten production.')
  }

  return { mode }
}

export async function getRefundContext(
  env: AppEnv['Bindings'],
  orderIdOrNumber: string,
): Promise<RefundContext | null> {
  const db = createDb(env)
  const order = (
    await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderIdOrNumber))
      .limit(1)
  )[0]
  const resolved =
    order ??
    (
      await db
        .select()
        .from(orders)
        .where(eq(orders.orderNumber, orderIdOrNumber))
        .limit(1)
    )[0]
  if (!resolved) return null

  const paidPayment = (
    await db
      .select()
      .from(payments)
      .where(and(eq(payments.orderId, resolved.id), eq(payments.status, 'paid')))
      .orderBy(desc(payments.paidAt), desc(payments.createdAt))
      .limit(1)
  )[0]

  const refundRows = await db
    .select()
    .from(refunds)
    .where(eq(refunds.orderId, resolved.id))
    .orderBy(desc(refunds.createdAt))

  const refundedCents = refundRows
    .filter((row) => isCountedRefund(row.status) && row.status !== 'failed')
    .reduce((sum, row) => sum + row.amountCents, 0)

  const paidAmountCents = paidPayment?.amountCents ?? (resolved.paymentStatus === 'paid' ? resolved.totalCents : 0)
  const remainingCents = Math.max(0, paidAmountCents - refundedCents)
  const orderOk = (REFUNDABLE_ORDER_STATUSES as readonly string[]).includes(resolved.status)
  const refundable =
    Boolean(paidPayment) &&
    orderOk &&
    remainingCents > 0 &&
    (resolved.paymentStatus === 'paid' || resolved.paymentStatus === 'refunded')

  return {
    orderId: resolved.id,
    orderNumber: resolved.orderNumber,
    customerEmail: resolved.guestEmail,
    orderStatus: resolved.status,
    paymentStatus: resolved.paymentStatus,
    paidAmountCents,
    currency: resolved.currency,
    previousRefunds: refundRows.map((row) => ({
      id: row.id,
      amountCents: row.amountCents,
      status: row.status,
      reason: row.reason,
      createdAt: row.createdAt,
      providerRefundId: row.providerRefundId,
    })),
    refundedCents,
    remainingCents,
    refundable,
    paymentId: paidPayment?.id ?? null,
    providerPaymentId: paidPayment?.providerPaymentId ?? null,
    paymentMode: paidPayment?.mode ?? null,
    mollieMode: resolveMollieMode(env),
  }
}

export async function processAdminRefund(
  env: AppEnv['Bindings'],
  input: {
    orderId: string
    mode: RefundMode
    /** Only used for partial; full amount is always computed server-side. */
    amountCents?: number
    reason?: string
    idempotencyKey: string
    staff: StaffContext
    /** Must be true — deliberate confirmation from admin UI. */
    confirmed: boolean
  },
) {
  if (!input.confirmed) {
    throw new RefundValidationError('Bevestiging ontbreekt. Terugbetaling is niet uitgevoerd.')
  }
  const key = input.idempotencyKey.trim()
  if (key.length < 16 || key.length > 120) {
    throw new RefundValidationError('Ongeldige idempotency-sleutel.')
  }

  const db = createDb(env)
  const existing = (
    await db.select().from(refunds).where(eq(refunds.idempotencyKey, key)).limit(1)
  )[0]
  if (existing) {
    return {
      refund: existing,
      reused: true as const,
      remainingCents: null as number | null,
    }
  }

  const context = await getRefundContext(env, input.orderId)
  if (!context) throw new RefundValidationError('Bestelling niet gevonden.')
  if (!context.refundable || !context.paymentId || !context.providerPaymentId) {
    throw new RefundValidationError('Deze bestelling kan niet (verder) worden terugbetaald.')
  }

  assertRefundEnvironment(env, context.paymentMode)

  let amountCents: number
  if (input.mode === 'full') {
    amountCents = context.remainingCents
  } else {
    const requested = input.amountCents
    if (!requested || !Number.isInteger(requested) || requested <= 0) {
      throw new RefundValidationError('Voer een geldig deelbedrag in (centen, geheel getal).')
    }
    if (requested > context.remainingCents) {
      throw new RefundValidationError(
        `Bedrag overschrijdt het resterende terugbetaalbare bedrag (${context.remainingCents} cent).`,
      )
    }
    amountCents = requested
  }

  if (amountCents <= 0) {
    throw new RefundValidationError('Geen terugbetaalbaar bedrag meer.')
  }

  const now = new Date()
  const refundId = newId()

  try {
    await db.insert(refunds).values({
      id: refundId,
      orderId: context.orderId,
      paymentId: context.paymentId,
      providerRefundId: null,
      amountCents,
      reason: input.reason?.trim() || null,
      status: 'processing',
      requestedByAdmin: input.staff.userId,
      idempotencyKey: key,
      createdAt: now,
      completedAt: null,
    })
  } catch {
    const raced = (
      await db.select().from(refunds).where(eq(refunds.idempotencyKey, key)).limit(1)
    )[0]
    if (raced) {
      return { refund: raced, reused: true as const, remainingCents: null as number | null }
    }
    throw new RefundValidationError('Kon terugbetaling niet starten (conflict).')
  }

  // Re-check after claim so concurrent requests cannot exceed the paid amount.
  const claimedTotal = await sumRefundedCents(env, context.orderId)
  if (claimedTotal > context.paidAmountCents) {
    await db.update(refunds).set({ status: 'failed' }).where(eq(refunds.id, refundId))
    throw new RefundValidationError(
      'Concurrente terugbetaling gedetecteerd. Opnieuw proberen met actueel restbedrag.',
    )
  }

  await writeAudit(db, input.staff, {
    action: 'order.refund.requested',
    entity: 'order',
    entityId: context.orderId,
    summary: `Refund ${input.mode} ${amountCents}c order=${context.orderNumber} by=${input.staff.email}`,
  })

  let providerRefundId: string
  let providerStatus: string
  try {
    const paymentsApi = createPaymentsService(env)
    if (paymentsApi.mode === 'live' && env.ENVIRONMENT !== 'production') {
      throw new MollieConfigError('Live refunds geblokkeerd buiten production.')
    }
    const result = await paymentsApi.refundPayment({
      paymentId: context.providerPaymentId,
      amountCents,
      description: input.reason?.trim() || `Terugbetaling ${context.orderNumber}`,
    })
    providerRefundId = result.id
    providerStatus = result.status
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Mollie-refund mislukt.'
    await db
      .update(refunds)
      .set({ status: 'failed' })
      .where(eq(refunds.id, refundId))
    await writeAudit(db, input.staff, {
      action: 'order.refund.failed',
      entity: 'order',
      entityId: context.orderId,
      summary: `Refund failed ${amountCents}c order=${context.orderNumber}: ${message.slice(0, 200)}`,
    })
    throw error instanceof MollieConfigError || error instanceof RefundValidationError
      ? error
      : new RefundValidationError(message)
  }

  const completedAt = new Date()
  const normalizedStatus =
    providerStatus === 'refunded' || providerStatus === 'paid' ? 'completed' : providerStatus

  try {
    await db
      .update(refunds)
      .set({
        providerRefundId,
        status: normalizedStatus === 'pending' ? 'completed' : normalizedStatus,
        completedAt,
      })
      .where(eq(refunds.id, refundId))
  } catch {
    // Unique provider refund id — treat as success if already stored
    const byProvider = (
      await db
        .select()
        .from(refunds)
        .where(eq(refunds.providerRefundId, providerRefundId))
        .limit(1)
    )[0]
    if (byProvider) {
      return {
        refund: byProvider,
        reused: true as const,
        remainingCents: Math.max(0, context.remainingCents - amountCents),
      }
    }
    throw new RefundValidationError('Refund bij Mollie aangemaakt maar lokaal opslaan mislukt.')
  }

  const remainingAfter = Math.max(0, context.remainingCents - amountCents)
  const order = (
    await db.select().from(orders).where(eq(orders.id, context.orderId)).limit(1)
  )[0]

  if (order) {
    const nextPaymentStatus = remainingAfter === 0 ? 'refunded' : order.paymentStatus
    const nextOrderStatus =
      remainingAfter === 0 && canTransitionOrder(order.status, 'refunded')
        ? 'refunded'
        : remainingAfter === 0 && order.status !== 'refunded'
          ? 'refunded'
          : order.status

    await db
      .update(orders)
      .set({
        paymentStatus: nextPaymentStatus,
        status: nextOrderStatus,
        updatedAt: completedAt,
      })
      .where(eq(orders.id, order.id))

    await db.insert(orderStatusHistory).values({
      id: newId(),
      orderId: order.id,
      fromStatus: order.status,
      toStatus: nextOrderStatus,
      source: 'admin_refund',
      actorUserId: input.staff.userId,
      note: `Terugbetaling ${amountCents} cent (${input.mode})`,
      createdAt: completedAt,
    })
  }

  await writeAudit(db, input.staff, {
    action: 'order.refund.completed',
    entity: 'refund',
    entityId: refundId,
    summary: `Refund ok ${amountCents}c order=${context.orderNumber} provider=${providerRefundId}`,
  })

  await emitOrderEvent(env, {
    type: 'REFUND_COMPLETED',
    orderId: context.orderId,
    entityType: 'refund',
    entityId: refundId,
    data: {
      refundAmountCents: String(amountCents),
      refundId,
    },
  })

  const updated = (
    await db.select().from(refunds).where(eq(refunds.id, refundId)).limit(1)
  )[0]

  return {
    refund: updated!,
    reused: false as const,
    remainingCents: remainingAfter,
  }
}

/** Sum of non-failed refunds for an order (for tests/helpers). */
export async function sumRefundedCents(env: AppEnv['Bindings'], orderId: string) {
  const db = createDb(env)
  const rows = await db
    .select({ amountCents: refunds.amountCents, status: refunds.status })
    .from(refunds)
    .where(and(eq(refunds.orderId, orderId), ne(refunds.status, 'failed')))
  return rows.filter((r) => isCountedRefund(r.status)).reduce((s, r) => s + r.amountCents, 0)
}
