/** Centrale order- en zendingstatussen. Checkout koppelt hier later op. */

export const ORDER_STATUSES = [
  'pending_payment',
  'payment_received',
  'processing',
  'on_order_with_supplier',
  'ready_to_ship',
  'shipped',
  'partially_shipped',
  'delivered',
  'cancelled',
  'return_requested',
  'refunded',
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: 'Wacht op betaling',
  payment_received: 'Betaling ontvangen',
  processing: 'In behandeling',
  on_order_with_supplier: 'In bestelling bij leverancier',
  ready_to_ship: 'Gereed voor verzending',
  shipped: 'Verzonden',
  partially_shipped: 'Gedeeltelijk verzonden',
  delivered: 'Geleverd',
  cancelled: 'Geannuleerd',
  return_requested: 'Retour aangevraagd',
  refunded: 'Terugbetaald',
}

export const SHIPMENT_STATUSES = [
  'pending',
  'processing',
  'ready_to_ship',
  'shipped',
  'delivered',
  'cancelled',
] as const

export type ShipmentStatus = (typeof SHIPMENT_STATUSES)[number]

export const SHIPMENT_STATUS_LABELS: Record<ShipmentStatus, string> = {
  pending: 'In voorbereiding',
  processing: 'In verwerking',
  ready_to_ship: 'Gereed voor verzending',
  shipped: 'Verzonden',
  delivered: 'Geleverd',
  cancelled: 'Geannuleerd',
}

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value)
}

export function isShipmentStatus(value: string): value is ShipmentStatus {
  return (SHIPMENT_STATUSES as readonly string[]).includes(value)
}
