import {
  CONSENT_COOKIE_NAME,
  CONSENT_MAX_AGE_SECONDS,
  CONSENT_OPEN_EVENT,
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
} from '@/config/legal'

export type ConsentCategories = {
  necessary: true
  preferences: boolean
  analytics: boolean
  marketing: boolean
}

export type ConsentRecord = {
  version: number
  timestamp: string
  categories: ConsentCategories
}

export const DEFAULT_OPTIONAL_OFF: ConsentCategories = {
  necessary: true,
  preferences: false,
  analytics: false,
  marketing: false,
}

export const ALL_ACCEPTED: ConsentCategories = {
  necessary: true,
  preferences: true,
  analytics: true,
  marketing: true,
}

export function openCookieSettings(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(CONSENT_OPEN_EVENT))
}

export function necessaryOnly(): ConsentCategories {
  return { ...DEFAULT_OPTIONAL_OFF }
}

function isRecord(value: unknown): value is ConsentRecord {
  if (!value || typeof value !== 'object') return false
  const row = value as ConsentRecord
  if (typeof row.version !== 'number' || typeof row.timestamp !== 'string') return false
  const cats = row.categories
  if (!cats || typeof cats !== 'object') return false
  return (
    cats.necessary === true &&
    typeof cats.preferences === 'boolean' &&
    typeof cats.analytics === 'boolean' &&
    typeof cats.marketing === 'boolean'
  )
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

function writeConsentCookie(record: ConsentRecord): void {
  if (typeof document === 'undefined') return
  const payload = encodeURIComponent(JSON.stringify(record))
  document.cookie = `${CONSENT_COOKIE_NAME}=${payload}; Path=/; Max-Age=${CONSENT_MAX_AGE_SECONDS}; SameSite=Lax`
}

export function readStoredConsent(): ConsentRecord | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as unknown
      if (isRecord(parsed)) return parsed
    }
  } catch {
    /* beschadigde localStorage negeren */
  }
  try {
    const fromCookie = readCookie(CONSENT_COOKIE_NAME)
    if (!fromCookie) return null
    const parsed = JSON.parse(fromCookie) as unknown
    if (isRecord(parsed)) return parsed
  } catch {
    return null
  }
  return null
}

export function consentIsCurrent(record: ConsentRecord | null): boolean {
  return Boolean(record && record.version === CONSENT_VERSION)
}

export function persistConsent(categories: ConsentCategories): ConsentRecord {
  const record: ConsentRecord = {
    version: CONSENT_VERSION,
    timestamp: new Date().toISOString(),
    categories: {
      necessary: true,
      preferences: categories.preferences,
      analytics: categories.analytics,
      marketing: categories.marketing,
    },
  }
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record))
  }
  writeConsentCookie(record)
  return record
}

export function canLoadAnalytics(record: ConsentRecord | null): boolean {
  return Boolean(record && consentIsCurrent(record) && record.categories.analytics)
}

export function canLoadMarketing(record: ConsentRecord | null): boolean {
  return Boolean(record && consentIsCurrent(record) && record.categories.marketing)
}
