/** Alleen interne paden. Blokkeert //host, protocol-relatieve en externe URL’s. */
export function safeInternalPath(value: string | null | undefined, fallback: string): string {
  if (!value) return fallback
  const trimmed = value.trim()
  if (!trimmed.startsWith('/')) return fallback
  if (trimmed.startsWith('//') || trimmed.startsWith('/\\')) return fallback
  if (trimmed.includes('://') || trimmed.includes('\\')) return fallback
  if (/^[a-zA-Z][a-zA-Z+\-.]*:/.test(trimmed.slice(1))) return fallback
  return trimmed
}
