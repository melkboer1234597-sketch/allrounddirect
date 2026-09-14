export type MappedMollieStatus =
  | 'open'
  | 'pending'
  | 'authorized'
  | 'paid'
  | 'failed'
  | 'canceled'
  | 'expired'
  | 'refunded'

export type PaymentUiState = 'CHECKING' | 'PAID' | 'PENDING' | 'FAILED' | 'CANCELED' | 'EXPIRED'

/** Map Mollie-mapped status → order.payment_status (preserve cancel/expire). */
export function mapOrderPaymentStatus(mapped: MappedMollieStatus | string): string {
  if (mapped === 'paid') return 'paid'
  if (mapped === 'refunded') return 'refunded'
  if (mapped === 'failed') return 'failed'
  if (mapped === 'canceled' || mapped === 'cancelled') return 'canceled'
  if (mapped === 'expired') return 'expired'
  if (mapped === 'authorized') return 'authorized'
  return 'pending'
}

export function paymentUiState(paymentStatus: string): Exclude<PaymentUiState, 'CHECKING'> {
  const status = paymentStatus.toLowerCase()
  if (status === 'paid') return 'PAID'
  if (status === 'failed') return 'FAILED'
  if (status === 'canceled' || status === 'cancelled') return 'CANCELED'
  if (status === 'expired') return 'EXPIRED'
  return 'PENDING'
}

const RETRYABLE = new Set(['failed', 'canceled', 'cancelled', 'expired'])

export function canRetryPayment(input: {
  orderStatus: string
  paymentStatus: string
}): boolean {
  if (input.orderStatus !== 'pending_payment') return false
  if (input.paymentStatus === 'paid' || input.paymentStatus === 'refunded') return false
  return RETRYABLE.has(input.paymentStatus.toLowerCase())
}

/** Duplicate webhook: only emit confirmation when payment newly becomes paid. */
export function shouldEmitPaymentConfirmed(previousPaymentStatus: string, mapped: string): boolean {
  return mapped === 'paid' && previousPaymentStatus !== 'paid'
}

export function shouldRecordFailedPaymentAttempt(
  previousPaymentStatus: string,
  mapped: string,
  orderStatus: string,
): boolean {
  if (orderStatus !== 'pending_payment') return false
  if (mapped !== 'failed' && mapped !== 'canceled' && mapped !== 'expired') return false
  const next = mapOrderPaymentStatus(mapped)
  return next !== previousPaymentStatus
}

export function orderEmailEventKey(orderId: string, suffix: string): string {
  return `order:${orderId}:${suffix}`
}
