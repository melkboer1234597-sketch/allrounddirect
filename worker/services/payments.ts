/**
 * Mollie payment client – uitsluitend server-side (Worker).
 * Niet importeren vanuit de frontend. Gebruik createPaymentsService.
 */
export { createPaymentsService, assertMollieAllowed } from './mollie'
