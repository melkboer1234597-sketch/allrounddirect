/**
 * Production shipping rates — env + admin site_content, never invent silently.
 */
import { eq } from 'drizzle-orm'
import type { CheckoutCountry } from '../../shared/checkout'
import { shippingConfig } from '../../shared/commerce'
import { createDb } from '../db'
import { siteContent } from '../db/schema'
import type { AppEnv } from '../types'

export const SHIPPING_RATES_CONTENT_KEY = 'shipping.standardCents'

export type StandardShippingRates = {
  NL: number | null
  BE: number | null
}

export type FutureShippingCategories = {
  largeFreightCents: number | null
  supplierDirectCents: number | null
  palletDeliveryCents: number | null
}

export type ShippingSettings = {
  standard: StandardShippingRates
  future: FutureShippingCategories
  source: 'env' | 'site_content' | 'code_default' | 'mixed'
  configured: boolean
  releaseBlocker: string | null
}

function parseCents(value: unknown): number | null {
  if (value == null || value === '') return null
  const n = typeof value === 'number' ? value : Number(String(value).trim())
  if (!Number.isInteger(n) || n < 0 || n > 1_000_000) return null
  return n
}

function envRates(env: AppEnv['Bindings']): StandardShippingRates {
  return {
    NL: parseCents(env.SHIPPING_STANDARD_NL_CENTS),
    BE: parseCents(env.SHIPPING_STANDARD_BE_CENTS),
  }
}

function mergeRates(
  base: StandardShippingRates,
  overlay: Partial<StandardShippingRates>,
): StandardShippingRates {
  return {
    NL: overlay.NL != null ? overlay.NL : base.NL,
    BE: overlay.BE != null ? overlay.BE : base.BE,
  }
}

export async function loadShippingSettings(env: AppEnv['Bindings']): Promise<ShippingSettings> {
  const fromEnv = envRates(env)
  const fromCode: StandardShippingRates = {
    NL: shippingConfig.standardShippingCents.NL,
    BE: shippingConfig.standardShippingCents.BE,
  }

  let fromContent: Partial<StandardShippingRates> = {}
  let future: FutureShippingCategories = {
    largeFreightCents: null,
    supplierDirectCents: null,
    palletDeliveryCents: null,
  }

  try {
    const db = createDb(env)
    const row = (
      await db
        .select()
        .from(siteContent)
        .where(eq(siteContent.key, SHIPPING_RATES_CONTENT_KEY))
        .limit(1)
    )[0]
    if (row?.valueJson) {
      const parsed = JSON.parse(row.valueJson) as {
        NL?: unknown
        BE?: unknown
        largeFreightCents?: unknown
        supplierDirectCents?: unknown
        palletDeliveryCents?: unknown
      }
      fromContent = {
        NL: parseCents(parsed.NL),
        BE: parseCents(parsed.BE),
      }
      future = {
        largeFreightCents: parseCents(parsed.largeFreightCents),
        supplierDirectCents: parseCents(parsed.supplierDirectCents),
        palletDeliveryCents: parseCents(parsed.palletDeliveryCents),
      }
    }
  } catch {
    /* D1 unavailable — fall back to env/code */
  }

  // Precedence: env > site_content > code defaults (usually null)
  const standard = mergeRates(mergeRates(fromCode, fromContent), fromEnv)
  const configured = standard.NL != null && standard.BE != null
  const sources: Array<'env' | 'site_content' | 'code_default'> = []
  if (fromEnv.NL != null || fromEnv.BE != null) sources.push('env')
  if (fromContent.NL != null || fromContent.BE != null) sources.push('site_content')
  if (fromCode.NL != null || fromCode.BE != null) sources.push('code_default')

  return {
    standard,
    future,
    source: sources.length > 1 ? 'mixed' : (sources[0] ?? 'code_default'),
    configured,
    releaseBlocker: configured
      ? null
      : 'RELEASE BLOCKER: standaard verzendtarieven NL/BE ontbreken. Stel ze in via admin Instellingen of SHIPPING_STANDARD_NL_CENTS / SHIPPING_STANDARD_BE_CENTS.',
  }
}

export function rateForCountry(
  settings: ShippingSettings,
  country: CheckoutCountry,
): number | null {
  return settings.standard[country]
}
