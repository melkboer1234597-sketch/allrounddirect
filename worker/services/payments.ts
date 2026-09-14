/**
 * Mollie payment client – uitsluitend server-side (Worker).
 * Niet importeren vanuit de frontend.
 */
import createMollieClient from '@mollie/api-client'

export function createPaymentsClient(apiKey: string) {
  return createMollieClient({ apiKey })
}
