import { ApiError } from '@/lib/api'

const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

export async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const method = (init?.method ?? 'GET').toUpperCase()
  const mutating = method !== 'GET' && method !== 'HEAD'
  const response = await fetch(`${API_BASE}/admin${path.startsWith('/') ? path : `/${path}`}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(mutating ? { 'x-admin-intent': '1' } : {}),
      ...init?.headers,
    },
  })
  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'error' in payload
        ? String((payload as { error: unknown }).error)
        : `Fout ${response.status}`
    throw new ApiError(message, response.status, payload)
  }
  return payload as T
}

export async function adminUpload<T>(path: string, form: FormData): Promise<T> {
  const response = await fetch(`${API_BASE}/admin${path.startsWith('/') ? path : `/${path}`}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'x-admin-intent': '1' },
    body: form,
  })
  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'error' in payload
        ? String((payload as { error: unknown }).error)
        : `Fout ${response.status}`
    throw new ApiError(message, response.status, payload)
  }
  return payload as T
}

export function formatCents(cents: number | null | undefined) {
  if (cents == null) return 'n.v.t.'
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}
