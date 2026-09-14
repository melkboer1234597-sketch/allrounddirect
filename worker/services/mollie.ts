/**
 * Mollie alleen server-side. API-key wordt nooit gelogd of naar de frontend gestuurd.
 * Live-betalingen vereisen MOLLIE_MODE=live én MOLLIE_ALLOW_LIVE=true én production.
 */
import createMollieClient from '@mollie/api-client'
import { eq } from 'drizzle-orm'
import type { CheckoutCountry, MollieLocale } from '../../shared/checkout'
import { sortPaymentMethods } from '../../shared/checkout'
import { centsToMollieValue, mollieValueToCents } from '../../shared/money'
import type { AppEnv } from '../types'
import { createDb } from '../db'
import { devMolliePayments } from '../db/schema'
import { isDevelopment, newId } from '../lib/request'

export type MollieMode = 'test' | 'live'

export type ProviderPayment = {
  id: string
  status: string
  amountCents: number
  currency: string
  checkoutUrl: string | null
  method: string | null
  mode: MollieMode
  metadata: Record<string, string>
}

export type PaymentMethodInfo = {
  id: string
  description: string
  image: { size1x?: string; size2x?: string; svg?: string }
}

export type CreatePaymentInput = {
  amountCents: number
  currency: string
  description: string
  redirectUrl: string
  webhookUrl: string
  metadata: Record<string, string>
  locale?: MollieLocale
  method?: string
  restrictPaymentMethodsToCountry?: CheckoutCountry
  billingAddress?: {
    givenName?: string
    familyName?: string
    email?: string
    streetAndNumber?: string
    postalCode?: string
    city?: string
    country?: string
  }
  shippingAddress?: {
    givenName?: string
    familyName?: string
    email?: string
    streetAndNumber?: string
    postalCode?: string
    city?: string
    country?: string
  }
}

export type PaymentsService = {
  mode: MollieMode
  isMock: boolean
  listMethods: (input: {
    amountCents: number
    currency?: string
    country: CheckoutCountry
    locale?: MollieLocale
  }) => Promise<PaymentMethodInfo[]>
  createPayment: (input: CreatePaymentInput) => Promise<ProviderPayment>
  getPayment: (id: string) => Promise<ProviderPayment>
  refundPayment: (input: {
    paymentId: string
    amountCents: number
    description?: string
  }) => Promise<{ id: string; status: string }>
}

export class MollieConfigError extends Error {}

export function resolveMollieMode(env: AppEnv['Bindings']): MollieMode {
  const mode = (env.MOLLIE_MODE ?? 'test').trim().toLowerCase()
  if (mode !== 'test' && mode !== 'live') {
    throw new MollieConfigError('MOLLIE_MODE moet test of live zijn.')
  }
  return mode
}

export function assertMollieAllowed(env: AppEnv['Bindings']): {
  mode: MollieMode
  apiKey: string | null
} {
  const mode = resolveMollieMode(env)
  const apiKey = env.MOLLIE_API_KEY?.trim() || null

  if (mode === 'live') {
    if (env.MOLLIE_ALLOW_LIVE !== 'true') {
      throw new MollieConfigError(
        'Live Mollie is geblokkeerd. Zet MOLLIE_ALLOW_LIVE=true alleen bij bewuste livegang.',
      )
    }
    if (env.ENVIRONMENT !== 'production') {
      throw new MollieConfigError('Live Mollie is alleen toegestaan in production.')
    }
    if (!apiKey?.startsWith('live_')) {
      throw new MollieConfigError('Live-modus vereist een live_ API-key.')
    }
    return { mode, apiKey }
  }

  if (apiKey?.startsWith('live_')) {
    throw new MollieConfigError('Een live_ key is geweigerd terwijl MOLLIE_MODE=test.')
  }
  if (apiKey && !apiKey.startsWith('test_')) {
    throw new MollieConfigError('In testmodus wordt alleen een test_ API-key geaccepteerd.')
  }
  return { mode, apiKey }
}

/** Safe label for admin/dev — never expose the key. */
export function mollieEnvironmentLabel(env: AppEnv['Bindings']): {
  mode: MollieMode
  label: string
  configured: boolean
} {
  try {
    const { mode, apiKey } = assertMollieAllowed(env)
    if (!apiKey) {
      return { mode, label: 'Mollie mock (development)', configured: false }
    }
    return {
      mode,
      label: mode === 'live' ? 'Mollie livemodus' : 'Mollie testmodus',
      configured: true,
    }
  } catch {
    return { mode: 'test', label: 'Mollie niet geconfigureerd', configured: false }
  }
}

function mapPayment(input: {
  id: string
  status: string
  amountValue: string
  currency: string
  checkoutUrl?: string | null
  method?: string | null
  mode: MollieMode
  metadata?: Record<string, string> | null
}): ProviderPayment {
  return {
    id: input.id,
    status: input.status,
    amountCents: mollieValueToCents(input.amountValue),
    currency: input.currency,
    checkoutUrl: input.checkoutUrl ?? null,
    method: input.method ?? null,
    mode: input.mode,
    metadata: input.metadata ?? {},
  }
}

const MOCK_METHODS: PaymentMethodInfo[] = [
  {
    id: 'ideal',
    description: 'iDEAL',
    image: { svg: 'https://www.mollie.com/external/icons/payment-methods/ideal.svg' },
  },
  {
    id: 'bancontact',
    description: 'Bancontact',
    image: { svg: 'https://www.mollie.com/external/icons/payment-methods/bancontact.svg' },
  },
  {
    id: 'creditcard',
    description: 'Creditcard',
    image: { svg: 'https://www.mollie.com/external/icons/payment-methods/creditcard.svg' },
  },
  {
    id: 'paypal',
    description: 'PayPal',
    image: { svg: 'https://www.mollie.com/external/icons/payment-methods/paypal.svg' },
  },
  {
    id: 'banktransfer',
    description: 'Overboeking',
    image: { svg: 'https://www.mollie.com/external/icons/payment-methods/banktransfer.svg' },
  },
]

function createMockService(env: AppEnv['Bindings']): PaymentsService {
  return {
    mode: 'test',
    isMock: true,
    async listMethods(input) {
      const filtered =
        input.country === 'BE'
          ? MOCK_METHODS.filter((m) => m.id !== 'ideal')
          : MOCK_METHODS.filter((m) => m.id !== 'bancontact')
      return sortPaymentMethods(input.country, filtered)
    },
    async createPayment(input) {
      const db = createDb(env)
      const id = `tr_dev_${newId().replaceAll('-', '').slice(0, 16)}`
      const now = new Date()
      await db.insert(devMolliePayments).values({
        id,
        status: 'open',
        amountCents: input.amountCents,
        currency: input.currency,
        metadataJson: JSON.stringify(input.metadata),
        createdAt: now,
        updatedAt: now,
      })
      return {
        id,
        status: 'open',
        amountCents: input.amountCents,
        currency: input.currency,
        checkoutUrl: `${input.redirectUrl}${input.redirectUrl.includes('?') ? '&' : '?'}devPayment=${id}`,
        method: input.method ?? null,
        mode: 'test',
        metadata: input.metadata,
      }
    },
    async getPayment(id) {
      const db = createDb(env)
      const row = (
        await db.select().from(devMolliePayments).where(eq(devMolliePayments.id, id)).limit(1)
      )[0]
      if (!row) throw new Error('Development-betaling niet gevonden.')
      return {
        id: row.id,
        status: row.status,
        amountCents: row.amountCents,
        currency: row.currency,
        checkoutUrl: null,
        method: 'dev',
        mode: 'test',
        metadata: JSON.parse(row.metadataJson) as Record<string, string>,
      }
    },
    async refundPayment(_input) {
      return { id: `re_dev_${newId().slice(0, 8)}`, status: 'refunded' }
    },
  }
}

export function createPaymentsService(env: AppEnv['Bindings']): PaymentsService {
  const { mode, apiKey } = assertMollieAllowed(env)
  if (!apiKey) {
    if (isDevelopment(env) && mode === 'test') return createMockService(env)
    throw new MollieConfigError('MOLLIE_API_KEY ontbreekt.')
  }

  const client = createMollieClient({ apiKey })
  return {
    mode,
    isMock: false,
    async listMethods(input) {
      const list = (await client.methods.list({
        amount: {
          currency: input.currency ?? 'EUR',
          value: centsToMollieValue(Math.max(input.amountCents, 100)),
        },
        locale: input.locale as never,
        billingCountry: input.country,
      })) as unknown as Array<{
        id: string
        description: string
        image?: { size1x?: string; size2x?: string; svg?: string }
      }>
      const methods = (Array.isArray(list) ? list : []).map((method) => ({
        id: method.id,
        description: method.description,
        image: {
          size1x: method.image?.size1x,
          size2x: method.image?.size2x,
          svg: method.image?.svg,
        },
      }))
      return sortPaymentMethods(input.country, methods)
    },
    async createPayment(input) {
      const payload = {
        amount: { currency: input.currency, value: centsToMollieValue(input.amountCents) },
        description: input.description,
        redirectUrl: input.redirectUrl,
        webhookUrl: input.webhookUrl,
        metadata: input.metadata,
        locale: input.locale as never,
        method: input.method as never,
        restrictPaymentMethodsToCountry: input.restrictPaymentMethodsToCountry,
        billingAddress: input.billingAddress,
        shippingAddress: input.shippingAddress,
      }
      const payment = await client.payments.create(payload as never)
      const links = payment._links as { checkout?: { href?: string } }
      return mapPayment({
        id: payment.id,
        status: payment.status,
        amountValue: payment.amount.value,
        currency: payment.amount.currency,
        checkoutUrl: links.checkout?.href ?? null,
        method: payment.method ?? input.method ?? null,
        mode,
        metadata: (payment.metadata as Record<string, string> | null) ?? input.metadata,
      })
    },
    async getPayment(id) {
      const payment = await client.payments.get(id)
      const links = payment._links as { checkout?: { href?: string } }
      return mapPayment({
        id: payment.id,
        status: payment.status,
        amountValue: payment.amount.value,
        currency: payment.amount.currency,
        checkoutUrl: links.checkout?.href ?? null,
        method: payment.method ?? null,
        mode,
        metadata: (payment.metadata as Record<string, string> | null) ?? {},
      })
    },
    async refundPayment(input) {
      const refund = await client.paymentRefunds.create({
        paymentId: input.paymentId,
        amount: { currency: 'EUR', value: centsToMollieValue(input.amountCents) },
        description: input.description,
      })
      return { id: refund.id, status: refund.status }
    },
  }
}

/** Alleen development: zet een mock-betaling op paid/failed. */
export async function setDevMollieStatus(env: AppEnv['Bindings'], id: string, status: string) {
  if (!isDevelopment(env)) throw new Error('Alleen beschikbaar in development.')
  const db = createDb(env)
  await db
    .update(devMolliePayments)
    .set({ status, updatedAt: new Date() })
    .where(eq(devMolliePayments.id, id))
}

export function mapMollieStatus(
  status: string,
): 'open' | 'pending' | 'authorized' | 'paid' | 'failed' | 'canceled' | 'expired' | 'refunded' {
  if (status === 'paid') return 'paid'
  if (status === 'authorized') return 'authorized'
  if (status === 'pending') return 'pending'
  if (status === 'failed') return 'failed'
  if (status === 'canceled' || status === 'cancelled') return 'canceled'
  if (status === 'expired') return 'expired'
  if (status === 'refunded') return 'refunded'
  return 'open'
}
