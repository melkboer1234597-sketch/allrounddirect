import { desc, eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { z } from 'zod'
import {
  CHECKOUT_COUNTRIES,
  CHECKOUT_COUNTRY_LABELS,
  checkoutLocale,
  isCheckoutCountry,
  isValidPostalCode,
  preferredPaymentMethodId,
} from '../../shared/checkout'
import { deliveryLabelShort, freeShippingThresholdLabel } from '../../shared/commerce'
import { resolveCheckoutCountry } from '../../shared/geo-country'
import { canRetryPayment, paymentUiState } from '../../shared/payment-ui'
import { getSession } from '../auth/session'
import { createDb } from '../db'
import { addresses, customerProfiles, orders, payments } from '../db/schema'
import { enforceRateLimit } from '../lib/rate-limit'
import { getClientIp, isDevelopment } from '../lib/request'
import { deliveryMethodsForCountry, shippingDiagnostics } from '../services/delivery'
import {
  placePendingOrder,
  quoteCheckout,
  retryOrderPayment,
  type CheckoutAddress,
} from '../services/checkout'
import {
  createPaymentsService,
  MollieConfigError,
  mollieEnvironmentLabel,
} from '../services/mollie'
import { syncProviderPayment } from '../services/payment-sync'
import type { AppEnv } from '../types'

export const checkoutRoutes = new Hono<AppEnv>()

async function loadPaymentMethods(
  env: AppEnv['Bindings'],
  input: { amountCents: number; country: (typeof CHECKOUT_COUNTRIES)[number] },
) {
  const locale = checkoutLocale(input.country)
  const mollie = mollieEnvironmentLabel(env)
  try {
    const service = createPaymentsService(env)
    const methods = await service.listMethods({
      amountCents: Math.max(100, input.amountCents),
      country: input.country,
      locale,
      currency: 'EUR',
    })
    return {
      paymentMethods: methods,
      paymentMethodsError: null as string | null,
      preferredPaymentMethodId: preferredPaymentMethodId(input.country, methods),
      mollie: {
        ...mollie,
        isMock: service.isMock,
      },
    }
  } catch (error) {
    const message =
      error instanceof MollieConfigError
        ? error.message
        : error instanceof Error
          ? error.message
          : 'Betaalmethoden konden niet worden geladen.'
    console.error('[checkout] payment methods failed', {
      country: input.country,
      amountCents: input.amountCents,
      message: message.slice(0, 200),
    })
    return {
      paymentMethods: [] as Array<{
        id: string
        description: string
        image: { size1x?: string; size2x?: string; svg?: string }
      }>,
      paymentMethodsError: message,
      preferredPaymentMethodId: '',
      mollie: {
        ...mollie,
        isMock: false,
      },
    }
  }
}


const addressSchema = z
  .object({
    firstName: z.string().trim().min(1).max(60),
    lastName: z.string().trim().min(1).max(60),
    street: z.string().trim().min(1).max(120),
    houseNumber: z.string().trim().min(1).max(20),
    houseAddition: z.string().trim().max(20).optional(),
    postalCode: z.string().trim().min(4).max(12),
    city: z.string().trim().min(1).max(80),
    country: z.enum(CHECKOUT_COUNTRIES),
    company: z.string().trim().max(120).optional(),
    phone: z.string().trim().max(30).optional(),
  })
  .superRefine((value, ctx) => {
    if (!isValidPostalCode(value.country, value.postalCode)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['postalCode'],
        message:
          value.country === 'NL'
            ? 'Gebruik een Nederlandse postcode (bijv. 1234 AB).'
            : 'Gebruik een Belgische postcode (4 cijfers).',
      })
    }
  })

const linesSchema = z
  .array(
    z
      .object({
        productId: z.string().optional(),
        slug: z.string().optional(),
        quantity: z.number().int().min(1).max(99),
      })
      .strict(),
  )
  .min(1)
  .max(50)

const placeSchema = z.object({
  email: z.string().trim().email(),
  phone: z.string().trim().min(8).max(30).optional(),
  customerType: z.enum(['consumer', 'business']).default('consumer'),
  billing: addressSchema,
  shipping: addressSchema,
  lines: linesSchema,
  deliveryMethodId: z.string().optional(),
  paymentMethod: z.string().trim().min(1).max(40).optional(),
  locale: z.enum(['nl_NL', 'nl_BE', 'fr_BE']).optional(),
  idempotencyKey: z.string().trim().min(8).max(80).optional(),
  acceptedTerms: z.literal(true),
})

const quoteSchema = z.object({
  lines: linesSchema,
  country: z.enum(CHECKOUT_COUNTRIES).default('NL'),
  deliveryMethodId: z.string().optional(),
})

checkoutRoutes.get('/context', async (c) => {
  const cfCountry = (c.req.raw as Request & { cf?: { country?: string } }).cf?.country
  const resolved = resolveCheckoutCountry(cfCountry, c.req.query('country'))
  const suggestedCountry = resolved.suggested
  const country = resolved.country
  const amountCents = Math.max(100, Number(c.req.query('amountCents') ?? '10000') || 10000)
  const locale = checkoutLocale(country)
  const mode = isDevelopment(c.env) ? 'development' : 'production'
  const deliveryMethods = deliveryMethodsForCountry(country, mode).map((method) => ({
    id: method.id,
    label: method.label,
    description: method.description,
    amountCents: method.amountCents,
    priceKnown: method.amountCents != null,
    rateSource: method.rateSource,
    deliveryTime: deliveryLabelShort(),
  }))

  const paymentsResult = await loadPaymentMethods(c.env, { amountCents, country })

  const session = await getSession(c)
  let prefill: {
    email?: string
    firstName?: string
    lastName?: string
    phone?: string
    shipping?: unknown
    billing?: unknown
  } | null = null

  if (session?.user) {
    const db = createDb(c.env)
    const profile = (
      await db
        .select()
        .from(customerProfiles)
        .where(eq(customerProfiles.userId, session.user.id))
        .limit(1)
    )[0]
    const saved = await db
      .select()
      .from(addresses)
      .where(eq(addresses.userId, session.user.id))
    const ship = saved.find((a) => a.isDefaultShipping) ?? saved[0]
    const bill = saved.find((a) => a.isDefaultBilling) ?? ship
    prefill = {
      email: session.user.email,
      firstName: profile?.firstName ?? undefined,
      lastName: profile?.lastName ?? undefined,
      phone: profile?.phone ?? undefined,
      shipping: ship
        ? {
            firstName: ship.firstName,
            lastName: ship.lastName,
            street: ship.street,
            houseNumber: ship.houseNumber,
            houseAddition: ship.addition ?? undefined,
            postalCode: ship.postalCode,
            city: ship.city,
            country: isCheckoutCountry(ship.country) ? ship.country : 'NL',
            company: ship.companyName ?? undefined,
            phone: ship.phone ?? undefined,
          }
        : undefined,
      billing: bill
        ? {
            firstName: bill.firstName,
            lastName: bill.lastName,
            street: bill.street,
            houseNumber: bill.houseNumber,
            houseAddition: bill.addition ?? undefined,
            postalCode: bill.postalCode,
            city: bill.city,
            country: isCheckoutCountry(bill.country) ? bill.country : 'NL',
            company: bill.companyName ?? undefined,
            phone: bill.phone ?? undefined,
          }
        : undefined,
    }
  }

  return c.json({
    suggestedCountry,
    country,
    countries: CHECKOUT_COUNTRIES.map((code) => ({
      code,
      label: CHECKOUT_COUNTRY_LABELS[code],
    })),
    locale,
    deliveryMethods,
    shipping: shippingDiagnostics(mode),
    freeShippingLabel: freeShippingThresholdLabel(),
    paymentMethods: paymentsResult.paymentMethods,
    paymentMethodsError: paymentsResult.paymentMethodsError,
    preferredPaymentMethodId: paymentsResult.preferredPaymentMethodId,
    mollie: paymentsResult.mollie,
    prefill,
    loggedIn: Boolean(session?.user),
  })
})

checkoutRoutes.get('/payment-methods', async (c) => {
  const countryRaw = c.req.query('country') ?? 'NL'
  if (!isCheckoutCountry(countryRaw)) {
    return c.json({ error: 'Ongeldig land.' }, 400)
  }
  const amountCents = Math.max(100, Number(c.req.query('amountCents') ?? '0') || 0)
  if (!amountCents) {
    return c.json({ error: 'Bedrag ontbreekt voor betaalmethoden.' }, 400)
  }
  const result = await loadPaymentMethods(c.env, {
    amountCents,
    country: countryRaw,
  })
  if (result.paymentMethodsError && !result.paymentMethods.length) {
    return c.json(
      {
        error: result.paymentMethodsError,
        paymentMethods: [],
        mollie: result.mollie,
      },
      502,
    )
  }
  return c.json({
    country: countryRaw,
    amountCents,
    locale: checkoutLocale(countryRaw),
    paymentMethods: result.paymentMethods,
    preferredPaymentMethodId: result.preferredPaymentMethodId,
    mollie: result.mollie,
  })
})

checkoutRoutes.post('/quote', async (c) => {
  const parsed = quoteSchema.safeParse(await c.req.json())
  if (!parsed.success) return c.json({ error: 'Controleer de winkelwagen.' }, 400)
  try {
    const quote = await quoteCheckout(c.env, parsed.data)
    return c.json(quote)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Offerte mislukt.'
    return c.json({ error: message }, 400)
  }
})

checkoutRoutes.post('/place', async (c) => {
  const ip = getClientIp(c.req.raw)
  const db = createDb(c.env)
  const limited = await enforceRateLimit(db, `checkout:${ip}`, 8, 15 * 60 * 1000)
  if (!limited.ok) return c.json({ error: 'Te veel verzoeken. Probeer het later opnieuw.' }, 429)

  const parsed = placeSchema.safeParse(await c.req.json())
  if (!parsed.success) {
    return c.json(
      {
        error: 'Controleer de bestelgegevens.',
        details: parsed.error.flatten(),
      },
      400,
    )
  }

  const session = await getSession(c)
  try {
    const result = await placePendingOrder(c.env, {
      ...parsed.data,
      billing: parsed.data.billing as CheckoutAddress,
      shipping: parsed.data.shipping as CheckoutAddress,
      userId: session?.user?.id ?? null,
    })
    return c.json({
      orderId: result.orderId,
      orderNumber: result.orderNumber,
      confirmationToken: result.confirmationToken,
      checkoutUrl: result.checkoutUrl,
      mockPayment: result.mock,
      mode: result.mode,
      reused: result.reused,
    })
  } catch (error) {
    if (error instanceof MollieConfigError) {
      return c.json({ error: error.message }, 503)
    }
    const message = error instanceof Error ? error.message : 'Bestelling kon niet worden gestart.'
    return c.json({ error: message }, 400)
  }
})

checkoutRoutes.post('/retry-payment', async (c) => {
  const ip = getClientIp(c.req.raw)
  const db = createDb(c.env)
  const limited = await enforceRateLimit(db, `checkout-retry:${ip}`, 10, 15 * 60 * 1000)
  if (!limited.ok) return c.json({ error: 'Te veel verzoeken.' }, 429)

  const body = z
    .object({
      orderNumber: z.string().min(3),
      confirmationToken: z.string().min(8),
      paymentMethod: z.string().optional(),
    })
    .safeParse(await c.req.json())
  if (!body.success) return c.json({ error: 'Onvolledige aanvraag.' }, 400)

  try {
    const result = await retryOrderPayment(c.env, body.data)
    return c.json(result)
  } catch (error) {
    if (error instanceof MollieConfigError) {
      return c.json({ error: error.message }, 503)
    }
    const message = error instanceof Error ? error.message : 'Opnieuw betalen mislukt.'
    return c.json({ error: message }, 400)
  }
})

function formatShippingLines(snapshot: Record<string, string>) {
  const street = [snapshot.street, snapshot.houseNumber, snapshot.houseAddition]
    .filter(Boolean)
    .join(' ')
    .trim()
  const cityLine = `${snapshot.postalCode ?? ''} ${snapshot.city ?? ''}`.trim()
  return [snapshot.name, snapshot.company, street, cityLine, snapshot.country].filter(Boolean)
}

checkoutRoutes.get('/status', async (c) => {
  const orderNumber = c.req.query('order')
  const token = c.req.query('token')
  if (!orderNumber || !token) return c.json({ error: 'Onvolledige aanvraag.' }, 400)
  const db = createDb(c.env)
  const order = (
    await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1)
  )[0]
  if (!order || order.confirmationToken !== token) {
    return c.json({ error: 'Bestelling niet gevonden.' }, 404)
  }
  const payment = (
    await db
      .select()
      .from(payments)
      .where(eq(payments.orderId, order.id))
      .orderBy(desc(payments.createdAt))
      .limit(1)
  )[0]
  if (payment) {
    try {
      await syncProviderPayment(c.env, payment.providerPaymentId)
    } catch {
      /* status blijft de laatst bekende serverstatus */
    }
  }
  const fresh = (await db.select().from(orders).where(eq(orders.id, order.id)).limit(1))[0]
  if (!fresh) return c.json({ error: 'Bestelling niet gevonden.' }, 404)

  const paymentStatus = fresh.paymentStatus
  const uiState = paymentUiState(paymentStatus)
  const canRetry = canRetryPayment({
    orderStatus: fresh.status,
    paymentStatus,
  })

  const shipping = JSON.parse(fresh.shippingSnapshot) as Record<string, string>
  const paymentMethod = payment?.method || fresh.paymentMethod

  return c.json({
    orderNumber: fresh.orderNumber,
    status: fresh.status,
    paymentStatus,
    uiState,
    paymentMethod,
    totalCents: fresh.totalCents,
    currency: fresh.currency,
    shippingCountry: fresh.shippingCountry,
    email: fresh.guestEmail,
    shippingAddress: formatShippingLines(shipping),
    estimatedDelivery: null,
    hasAccount: Boolean(fresh.userId),
    canRetry,
    paidAt: fresh.paidAt,
  })
})
