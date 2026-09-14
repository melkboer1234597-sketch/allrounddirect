import { formatCentsNl as formatShared } from '../../shared/money'

export function formatCentsNl(cents: number, currency = 'EUR'): string {
  return formatShared(cents, currency)
}
