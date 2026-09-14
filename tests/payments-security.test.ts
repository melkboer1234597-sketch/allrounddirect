import { describe, expect, it } from 'vitest'
import { allowedOrderTransitions, canTransitionOrder } from '../shared/order-machine'
import { ORDER_STATUSES } from '../shared/order-status'
import {
  canRetryPayment,
  mapOrderPaymentStatus,
  orderEmailEventKey,
  paymentUiState,
  shouldEmitPaymentConfirmed,
  shouldRecordFailedPaymentAttempt,
} from '../shared/payment-ui'
import { formatOrderNumber, parseOrderNumber } from '../shared/order-numbers'
import { canAccessOrderDetail } from '../shared/order-access'
import { mapMollieStatus, assertMollieAllowed, MollieConfigError } from '../worker/services/mollie'
import { hasPermission } from '../shared/rbac'

describe('Mollie status mapping', () => {
  it('maps Mollie statuses including cancelled spelling', () => {
    expect(mapMollieStatus('paid')).toBe('paid')
    expect(mapMollieStatus('authorized')).toBe('authorized')
    expect(mapMollieStatus('pending')).toBe('pending')
    expect(mapMollieStatus('failed')).toBe('failed')
    expect(mapMollieStatus('canceled')).toBe('canceled')
    expect(mapMollieStatus('cancelled')).toBe('canceled')
    expect(mapMollieStatus('expired')).toBe('expired')
    expect(mapMollieStatus('refunded')).toBe('refunded')
    expect(mapMollieStatus('open')).toBe('open')
    expect(mapMollieStatus('weird')).toBe('open')
  })

  it('preserves canceled/expired on order payment status (no collapse to failed)', () => {
    expect(mapOrderPaymentStatus('canceled')).toBe('canceled')
    expect(mapOrderPaymentStatus('expired')).toBe('expired')
    expect(mapOrderPaymentStatus('failed')).toBe('failed')
    expect(mapOrderPaymentStatus('paid')).toBe('paid')
    expect(mapOrderPaymentStatus('authorized')).toBe('authorized')
  })

  it('maps UI states for return page', () => {
    expect(paymentUiState('paid')).toBe('PAID')
    expect(paymentUiState('pending')).toBe('PENDING')
    expect(paymentUiState('failed')).toBe('FAILED')
    expect(paymentUiState('canceled')).toBe('CANCELED')
    expect(paymentUiState('expired')).toBe('EXPIRED')
    expect(paymentUiState('authorized')).toBe('PENDING')
  })

  it('blocks live keys in test mode', () => {
    expect(() =>
      assertMollieAllowed({
        MOLLIE_MODE: 'test',
        MOLLIE_API_KEY: 'live_secret',
      } as never),
    ).toThrow(MollieConfigError)
  })
})

describe('duplicate webhook / payment transitions', () => {
  it('emits payment confirmed only on first paid transition', () => {
    expect(shouldEmitPaymentConfirmed('pending', 'paid')).toBe(true)
    expect(shouldEmitPaymentConfirmed('paid', 'paid')).toBe(false)
    expect(shouldEmitPaymentConfirmed('failed', 'paid')).toBe(true)
  })

  it('records failed/canceled/expired only when status changes', () => {
    expect(shouldRecordFailedPaymentAttempt('pending', 'failed', 'pending_payment')).toBe(true)
    expect(shouldRecordFailedPaymentAttempt('failed', 'failed', 'pending_payment')).toBe(false)
    expect(shouldRecordFailedPaymentAttempt('pending', 'canceled', 'pending_payment')).toBe(true)
    expect(shouldRecordFailedPaymentAttempt('canceled', 'canceled', 'pending_payment')).toBe(false)
    expect(shouldRecordFailedPaymentAttempt('pending', 'expired', 'pending_payment')).toBe(true)
    expect(shouldRecordFailedPaymentAttempt('pending', 'failed', 'payment_received')).toBe(false)
  })

  it('builds idempotent email event keys', () => {
    expect(orderEmailEventKey('ord_1', 'payment-confirmed')).toBe('order:ord_1:payment-confirmed')
    expect(orderEmailEventKey('ord_1', 'payment-failed:pay_2')).toBe(
      'order:ord_1:payment-failed:pay_2',
    )
  })
})

describe('payment retries', () => {
  it('allows retry only for failed/canceled/expired unpaid pending orders', () => {
    expect(canRetryPayment({ orderStatus: 'pending_payment', paymentStatus: 'failed' })).toBe(true)
    expect(canRetryPayment({ orderStatus: 'pending_payment', paymentStatus: 'canceled' })).toBe(true)
    expect(canRetryPayment({ orderStatus: 'pending_payment', paymentStatus: 'expired' })).toBe(true)
    expect(canRetryPayment({ orderStatus: 'pending_payment', paymentStatus: 'pending' })).toBe(false)
    expect(canRetryPayment({ orderStatus: 'pending_payment', paymentStatus: 'paid' })).toBe(false)
    expect(canRetryPayment({ orderStatus: 'payment_received', paymentStatus: 'failed' })).toBe(false)
  })
})

describe('order state transitions', () => {
  it('rejects illegal jumps', () => {
    expect(canTransitionOrder('pending_payment', 'delivered')).toBe(false)
    expect(canTransitionOrder('delivered', 'pending_payment')).toBe(false)
    expect(canTransitionOrder('cancelled', 'processing')).toBe(false)
  })

  it('allows paid fulfillment path and refunds from paid states', () => {
    expect(canTransitionOrder('pending_payment', 'payment_received')).toBe(true)
    expect(canTransitionOrder('payment_received', 'processing')).toBe(true)
    expect(canTransitionOrder('payment_received', 'refunded')).toBe(true)
    expect(canTransitionOrder('delivered', 'refunded')).toBe(true)
  })

  it('covers every known status with an allow-list', () => {
    for (const status of ORDER_STATUSES) {
      expect(Array.isArray(allowedOrderTransitions(status))).toBe(true)
    }
  })
})

describe('order number generation', () => {
  it('formats ARD-YEAR-SEQ', () => {
    expect(formatOrderNumber(2026, 1)).toBe('ARD-2026-000001')
    expect(formatOrderNumber(2026, 42)).toBe('ARD-2026-000042')
    expect(parseOrderNumber('ARD-2026-000042')).toEqual({ year: 2026, sequence: 42 })
    expect(parseOrderNumber('ORD-1')).toBeNull()
  })
})

describe('IDOR / guest access', () => {
  const order = {
    orderUserId: 'user_a',
    orderGuestEmail: 'a@example.com',
    orderConfirmationToken: 'tok_secure_uuid_value',
  }

  it('denies order number alone / wrong token / wrong email / other user', () => {
    expect(canAccessOrderDetail({ ...order })).toBe(false)
    expect(
      canAccessOrderDetail({ ...order, confirmationToken: 'tok_other_person' }),
    ).toBe(false)
    expect(canAccessOrderDetail({ ...order, requesterEmail: 'b@example.com' })).toBe(false)
    expect(canAccessOrderDetail({ ...order, requesterUserId: 'user_b' })).toBe(false)
  })

  it('allows owner, matching email, or secure token', () => {
    expect(canAccessOrderDetail({ ...order, requesterUserId: 'user_a' })).toBe(true)
    expect(canAccessOrderDetail({ ...order, requesterEmail: 'A@example.com' })).toBe(true)
    expect(
      canAccessOrderDetail({ ...order, confirmationToken: 'tok_secure_uuid_value' }),
    ).toBe(true)
  })

  it('rejects short tokens', () => {
    expect(
      canAccessOrderDetail({
        ...order,
        orderConfirmationToken: 'short',
        confirmationToken: 'short',
      }),
    ).toBe(false)
  })
})

describe('admin RBAC', () => {
  it('denies customers refund/order-write permissions', () => {
    expect(hasPermission('customer', 'orders.write')).toBe(false)
    expect(hasPermission('customer', 'orders.read')).toBe(false)
    expect(hasPermission('customer', 'admin.access')).toBe(false)
  })

  it('allows order_manager refund capability via orders.write', () => {
    expect(hasPermission('order_manager', 'orders.write')).toBe(true)
    expect(hasPermission('support', 'orders.write')).toBe(false)
    expect(hasPermission('support', 'orders.read')).toBe(true)
  })
})

describe('email idempotency claim pattern', () => {
  it('dedupes identical event keys in-memory (mirrors DB unique constraint)', () => {
    const claimed = new Set<string>()
    function claim(key: string) {
      if (claimed.has(key)) return false
      claimed.add(key)
      return true
    }
    const key = orderEmailEventKey('ord_1', 'payment-confirmed')
    expect(claim(key)).toBe(true)
    expect(claim(key)).toBe(false)
    expect(claim(orderEmailEventKey('ord_1', 'payment-failed:pay_a'))).toBe(true)
    expect(claim(orderEmailEventKey('ord_1', 'payment-failed:pay_a'))).toBe(false)
  })
})

describe('return page without payment', () => {
  it('does not treat open/pending as success', () => {
    expect(paymentUiState('open')).not.toBe('PAID')
    expect(paymentUiState('pending')).not.toBe('PAID')
    expect(paymentUiState('')).not.toBe('PAID')
  })
})
