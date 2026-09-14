import type { OrderStatus } from './order-status'
import { isOrderStatus } from './order-status'

export type TimelineStepId =
  | 'placed'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export type TimelineStep = {
  id: TimelineStepId
  label: string
  reached: boolean
  at?: string | null
}

const MILESTONE_ORDER: TimelineStepId[] = ['placed', 'paid', 'processing', 'shipped', 'delivered']

/** Map order status → milestones reached (no future fake steps). */
export function milestonesReached(status: string): TimelineStepId[] {
  if (!isOrderStatus(status)) return ['placed']
  switch (status as OrderStatus) {
    case 'pending_payment':
      return ['placed']
    case 'payment_received':
      return ['placed', 'paid']
    case 'processing':
    case 'on_order_with_supplier':
    case 'ready_to_ship':
      return ['placed', 'paid', 'processing']
    case 'partially_shipped':
    case 'shipped':
      return ['placed', 'paid', 'processing', 'shipped']
    case 'delivered':
      return ['placed', 'paid', 'processing', 'shipped', 'delivered']
    case 'cancelled':
      return ['placed', 'cancelled']
    case 'return_requested':
      return ['placed', 'paid', 'processing', 'shipped', 'delivered']
    case 'refunded':
      return ['placed', 'paid', 'refunded']
    default:
      return ['placed']
  }
}

const LABELS: Record<TimelineStepId, string> = {
  placed: 'Bestelling geplaatst',
  paid: 'Betaling ontvangen',
  processing: 'In behandeling',
  shipped: 'Verzonden',
  delivered: 'Geleverd',
  cancelled: 'Geannuleerd',
  refunded: 'Terugbetaald',
}

type HistoryRow = {
  toStatus: string
  createdAt: Date | string
}

function historyTime(
  history: HistoryRow[],
  matcher: (toStatus: string) => boolean,
): string | null {
  const hit = history.find((row) => matcher(row.toStatus))
  if (!hit) return null
  const d = hit.createdAt instanceof Date ? hit.createdAt : new Date(hit.createdAt)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

export function buildOrderTimeline(input: {
  status: string
  placedAt?: Date | string | null
  paidAt?: Date | string | null
  history?: HistoryRow[]
}): TimelineStep[] {
  const reached = new Set(milestonesReached(input.status))
  const history = input.history ?? []

  const times: Partial<Record<TimelineStepId, string | null>> = {
    placed:
      historyTime(history, (s) => s === 'pending_payment') ||
      (input.placedAt
        ? (input.placedAt instanceof Date ? input.placedAt : new Date(input.placedAt)).toISOString()
        : null),
    paid:
      historyTime(history, (s) => s === 'payment_received') ||
      (input.paidAt
        ? (input.paidAt instanceof Date ? input.paidAt : new Date(input.paidAt)).toISOString()
        : null),
    processing: historyTime(
      history,
      (s) => s === 'processing' || s === 'on_order_with_supplier' || s === 'ready_to_ship',
    ),
    shipped: historyTime(history, (s) => s === 'shipped' || s === 'partially_shipped'),
    delivered: historyTime(history, (s) => s === 'delivered'),
    cancelled: historyTime(history, (s) => s === 'cancelled'),
    refunded: historyTime(history, (s) => s === 'refunded'),
  }

  const ids = reached.has('cancelled')
    ? (['placed', 'cancelled'] as TimelineStepId[])
    : reached.has('refunded') && !reached.has('delivered')
      ? (['placed', 'paid', 'refunded'] as TimelineStepId[])
      : MILESTONE_ORDER.filter((id) => reached.has(id))

  return ids.map((id) => ({
    id,
    label: LABELS[id],
    reached: true,
    at: times[id] ?? null,
  }))
}
