import { apiFetch } from '@/lib/api'
import type { OrderDetail } from '@/lib/account-api'

export type WithdrawalLookup = {
  order: OrderDetail
  previousWithdrawals: Array<{
    confirmationCode: string
    recordedAt: string | Date
    scope: string
    status: string
  }>
  notices: string[]
}

export type WithdrawalConfirmation = {
  confirmationCode: string
  recordedAt: string
  recordedAtLabel: string
  scope: string
  status: string
  orderNumber: string
  items: Array<{ id: string; name: string; quantity: number }>
  emailQueued: boolean
}

export function lookupWithdrawal(orderNumber: string, email: string, turnstileToken?: string) {
  return apiFetch<WithdrawalLookup>('/withdrawals/lookup', {
    method: 'POST',
    body: JSON.stringify({ orderNumber, email, turnstileToken }),
  })
}

export function confirmWithdrawal(input: {
  orderNumber: string
  email: string
  turnstileToken?: string
  fullContract: boolean
  itemIds?: string[]
  customerNote?: string
}) {
  return apiFetch<WithdrawalConfirmation>('/withdrawals/confirm', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function sendContactMessage(input: {
  name: string
  email: string
  subject: string
  message: string
  turnstileToken?: string
}) {
  return apiFetch<{ ok: boolean; message: string }>('/contact', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}
