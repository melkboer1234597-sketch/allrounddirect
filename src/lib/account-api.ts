import { apiFetch } from '@/lib/api'

export type AccountMe = {
  user: {
    id: string
    email: string
    emailVerified: boolean
    firstName: string
    lastName: string
    name: string
    marketingOptIn: boolean
    phone: string | null
    companyName: string | null
    kvk: string | null
    vatNumber: string | null
    accountStatus: string
    twoFactorEnabled: boolean
  }
  session: { id: string; expiresAt: string | Date }
}

export type AccountAddress = {
  id: string
  label: string | null
  firstName: string
  lastName: string
  companyName: string | null
  street: string
  houseNumber: string
  addition: string | null
  postalCode: string
  city: string
  country: string
  phone: string | null
  isDefaultShipping: boolean
  isDefaultBilling: boolean
}

export type OrderListItem = {
  orderNumber: string
  placedAt: string | Date
  totalCents: number
  currency: string
  status: string
  statusLabel: string
  itemCount: number
}

export type OrderDetail = {
  orderNumber: string
  placedAt: string | Date
  status: string
  statusLabel: string
  paymentStatus?: string
  paymentMethod: string | null
  email?: string
  currency: string
  subtotalCents: number
  vatCents: number
  shippingCents: number
  totalCents: number
  billing: Record<string, string>
  shipping: Record<string, string>
  timeline?: Array<{
    id: string
    label: string
    reached: boolean
    at?: string | null
  }>
  items: Array<{
    id: string
    name: string
    sku: string | null
    quantity: number
    unitPriceCents: number
    lineTotalCents?: number
    vatRate: number
    imageRef?: string | null
  }>
  shipments: Array<{
    id: string
    label: string
    status: string
    statusLabel: string
    supplierName: string | null
    carrier: string | null
    trackingCode: string | null
    trackingUrl: string | null
    shippedAt: string | Date | null
    deliveredAt: string | Date | null
    items: Array<{ name: string; quantity: number }>
  }>
}

export function getAccountMe() {
  return apiFetch<AccountMe>('/account/me')
}

export function updateProfile(body: Record<string, unknown>) {
  return apiFetch<{ ok: boolean }>('/account/profile', {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export function updatePrivacy(marketingOptIn: boolean) {
  return apiFetch<{ ok: boolean }>('/account/privacy', {
    method: 'PATCH',
    body: JSON.stringify({ marketingOptIn }),
  })
}

export function requestAccountDeletion() {
  return apiFetch<{ ok: boolean; message: string }>('/account/deletion-request', {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

export function getAddresses() {
  return apiFetch<{ addresses: AccountAddress[] }>('/account/addresses')
}

export function createAddress(body: Record<string, unknown>) {
  return apiFetch<{ ok: boolean; id: string }>('/account/addresses', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function updateAddress(id: string, body: Record<string, unknown>) {
  return apiFetch<{ ok: boolean }>(`/account/addresses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export function deleteAddress(id: string) {
  return apiFetch<{ ok: boolean }>(`/account/addresses/${id}`, { method: 'DELETE' })
}

export function getWishlist() {
  return apiFetch<{ items: Array<{ productSlug: string }> }>('/account/wishlist')
}

export function addWishlistItem(productSlug: string) {
  return apiFetch<{ ok: boolean }>('/account/wishlist', {
    method: 'POST',
    body: JSON.stringify({ productSlug }),
  })
}

export function removeWishlistItem(productSlug: string) {
  return apiFetch<{ ok: boolean }>(`/account/wishlist/${encodeURIComponent(productSlug)}`, {
    method: 'DELETE',
  })
}

export function getOrders() {
  return apiFetch<{ orders: OrderListItem[] }>('/account/orders')
}

export function getOrder(orderNumber: string) {
  return apiFetch<OrderDetail>(`/account/orders/${encodeURIComponent(orderNumber)}`)
}

export function lookupGuestOrder(orderNumber: string, email: string, turnstileToken?: string) {
  return apiFetch<OrderDetail>('/guest-orders/lookup', {
    method: 'POST',
    body: JSON.stringify({ orderNumber, email, turnstileToken }),
  })
}

export function accessGuestOrder(orderNumber: string, token: string) {
  return apiFetch<OrderDetail>(
    `/guest-orders/access?order=${encodeURIComponent(orderNumber)}&token=${encodeURIComponent(token)}`,
  )
}

export function getDevEmail(to: string) {
  return apiFetch<{
    email: { subject: string; type: string; actionUrl: string | null; createdAt: string } | null
  }>(`/dev/emails?to=${encodeURIComponent(to)}`)
}

export function formatCents(cents: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency,
  }).format(cents / 100)
}

export function formatDateTime(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat('nl-NL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}
