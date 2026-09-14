import type { OrderStatus } from './order-status'
import { isOrderStatus } from './order-status'

/** Toegestane orderstatus-overgangen. Geen vrije sprongen. */
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ['payment_received', 'cancelled'],
  payment_received: ['processing', 'cancelled', 'refunded'],
  processing: ['on_order_with_supplier', 'ready_to_ship', 'cancelled', 'refunded'],
  on_order_with_supplier: ['processing', 'ready_to_ship', 'cancelled', 'refunded'],
  ready_to_ship: ['shipped', 'partially_shipped', 'cancelled', 'refunded'],
  shipped: ['delivered', 'partially_shipped', 'return_requested', 'refunded'],
  partially_shipped: ['shipped', 'delivered', 'return_requested', 'refunded'],
  delivered: ['return_requested', 'refunded'],
  cancelled: [],
  return_requested: ['refunded'],
  refunded: [],
}

export function allowedOrderTransitions(from: OrderStatus): OrderStatus[] {
  return TRANSITIONS[from]
}

export function canTransitionOrder(from: string, to: string): boolean {
  if (!isOrderStatus(from) || !isOrderStatus(to)) return false
  if (from === to) return true
  return TRANSITIONS[from].includes(to)
}

export const PAYMENT_STATUSES = [
  'pending',
  'open',
  'paid',
  'failed',
  'canceled',
  'expired',
  'refunded',
  'charged_back',
] as const
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]

export function isPaymentStatus(value: string): value is PaymentStatus {
  return (PAYMENT_STATUSES as readonly string[]).includes(value)
}
