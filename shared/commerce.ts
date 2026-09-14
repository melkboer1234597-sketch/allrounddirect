/**
 * Official AllRound Direct commerce policy (server-safe, shared).
 *
 * Free shipping threshold uses eligible merchandise subtotal AFTER product
 * discounts and BEFORE shipping. Shipping itself is never counted toward the
 * threshold. Future coupons: use the discounted eligible merchandise subtotal
 * unless business rules explicitly change.
 *
 * Storefront delivery timing is this policy by default. Product DB lead-time
 * fields are audit/source metadata and must not override customer-facing copy
 * unless an explicit future override flag is introduced.
 */
import { CHECKOUT_COUNTRIES, type CheckoutCountry } from './checkout'
import { formatCentsNl } from './money'

export const commerceConfig = {
  standardDeliveryMinBusinessDays: 1,
  standardDeliveryMaxBusinessDays: 3,
  /** Eligible merchandise subtotal (cents) for free standard shipping. */
  freeShippingThresholdCents: 99_900,
  supportedCountries: CHECKOUT_COUNTRIES,
} as const

export type CommerceConfig = typeof commerceConfig

export function isSupportedShippingCountry(value: string): value is CheckoutCountry {
  return (commerceConfig.supportedCountries as readonly string[]).includes(value)
}

/** Full customer-facing delivery sentence. */
export function deliveryLabelFull(
  config: CommerceConfig = commerceConfig,
): string {
  return `Levering binnen ${config.standardDeliveryMinBusinessDays} tot ${config.standardDeliveryMaxBusinessDays} werkdagen`
}

/** Compact label for cards / tight UI. */
export function deliveryLabelShort(
  config: CommerceConfig = commerceConfig,
): string {
  return `${config.standardDeliveryMinBusinessDays}-${config.standardDeliveryMaxBusinessDays} werkdagen`
}

export function freeShippingThresholdLabel(
  config: CommerceConfig = commerceConfig,
): string {
  return `Gratis verzending vanaf ${formatCentsNl(config.freeShippingThresholdCents)}`
}

export function qualifiesForFreeShipping(
  eligibleMerchandiseSubtotalCents: number,
  config: CommerceConfig = commerceConfig,
): boolean {
  return (
    Number.isFinite(eligibleMerchandiseSubtotalCents) &&
    eligibleMerchandiseSubtotalCents >= config.freeShippingThresholdCents
  )
}

export function freeShippingRemainingCents(
  eligibleMerchandiseSubtotalCents: number,
  config: CommerceConfig = commerceConfig,
): number {
  return Math.max(0, config.freeShippingThresholdCents - Math.max(0, eligibleMerchandiseSubtotalCents))
}

export function freeShippingProgress(
  eligibleMerchandiseSubtotalCents: number,
  config: CommerceConfig = commerceConfig,
): {
  reached: boolean
  remainingCents: number
  thresholdCents: number
  progress: number
  message: string
} {
  const remainingCents = freeShippingRemainingCents(eligibleMerchandiseSubtotalCents, config)
  const reached = remainingCents === 0 && eligibleMerchandiseSubtotalCents > 0
    ? qualifiesForFreeShipping(eligibleMerchandiseSubtotalCents, config)
    : qualifiesForFreeShipping(eligibleMerchandiseSubtotalCents, config)
  const progress = Math.min(
    1,
    Math.max(0, eligibleMerchandiseSubtotalCents) / config.freeShippingThresholdCents,
  )
  return {
    reached,
    remainingCents,
    thresholdCents: config.freeShippingThresholdCents,
    progress,
    message: reached
      ? 'U profiteert van gratis verzending'
      : `Nog ${formatCentsNl(remainingCents)} voor gratis verzending`,
  }
}

/**
 * Effective storefront delivery for sellable products.
 * Future: honour explicit per-product override only when `overrideEnabled`.
 */
export function resolveStorefrontDelivery(_input?: {
  overrideEnabled?: boolean
  minBusinessDays?: number | null
  maxBusinessDays?: number | null
}): {
  minBusinessDays: number
  maxBusinessDays: number
  unit: 'business_days'
  labelFull: string
  labelShort: string
} {
  const min = commerceConfig.standardDeliveryMinBusinessDays
  const max = commerceConfig.standardDeliveryMaxBusinessDays
  return {
    minBusinessDays: min,
    maxBusinessDays: max,
    unit: 'business_days',
    labelFull: deliveryLabelFull(),
    labelShort: deliveryLabelShort(),
  }
}
