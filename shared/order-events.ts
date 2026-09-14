export const ORDER_EVENT_TYPES = [
  'ORDER_CREATED',
  'PAYMENT_CONFIRMED',
  'PAYMENT_FAILED',
  'ORDER_PROCESSING',
  'SHIPMENT_CREATED',
  'SHIPMENT_SENT',
  'ORDER_DELIVERED',
  'ORDER_CANCELLED',
  'RETURN_REQUESTED',
  'RETURN_RECEIVED',
  'REFUND_COMPLETED',
  'BUSINESS_QUOTE_RECEIVED',
  'BUSINESS_QUOTE_READY',
] as const

export type OrderEventType = (typeof ORDER_EVENT_TYPES)[number]

export function isOrderEventType(value: string): value is OrderEventType {
  return (ORDER_EVENT_TYPES as readonly string[]).includes(value)
}
