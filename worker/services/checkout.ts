import { and, desc, eq } from 'drizzle-orm'
import type { CheckoutCountry, MollieLocale } from '../../shared/checkout'
import { checkoutLocale, isCheckoutCountry, normalizePostalCode } from '../../shared/checkout'
import { addCents } from '../../shared/money'
import { assertValidCheckoutQuantity, lineVatFromIncl } from '../../shared/vat'
import type { AppEnv } from '../types'
import { createDb } from '../db'
import {
  orderItems,
  orderStatusHistory,
  orders,
  payments,
  productImages,
  products,
} from '../db/schema'
import { mediaPublicPath } from '../../shared/media'
import { getSiteOrigin, newId } from '../lib/request'
import { resolveShippingCents } from './delivery'
import { createPaymentsService } from './mollie'
import { nextOrderNumber } from './order-numbers'
import { emitOrderEvent } from './order-events'

export type CheckoutAddress = {
  firstName: string
  lastName: string
  street: string
  houseNumber: string
  houseAddition?: string
  postalCode: string
  city: string
  country: CheckoutCountry
  company?: string
  phone?: string
}

export type CheckoutLineInput = {
  productId?: string
  slug?: string
  quantity: number
}

export type PlaceOrderInput = {
  email: string
  phone?: string
  userId?: string | null
  customerType: 'consumer' | 'business'
  billing: CheckoutAddress
  shipping: CheckoutAddress
  lines: CheckoutLineInput[]
  deliveryMethodId?: string
  paymentMethod?: string
  locale?: MollieLocale
  idempotencyKey?: string
}

export type QuoteLine = {
  slug: string
  productId: string
  name: string
  sku: string | null
  quantity: number
  unitPriceCents: number
  vatRate: number
  vatCents: number
  lineTotalCents: number
  imageRef: string | null
}

function lineVat(unitInclCents: number, qty: number, vatPercent: number) {
  const { lineTotalCents, vatCents } = lineVatFromIncl(unitInclCents, qty, vatPercent)
  return { lineTotal: lineTotalCents, vatCents }
}

function addressName(address: CheckoutAddress) {
  return `${address.firstName} ${address.lastName}`.trim()
}

function snapshotAddress(address: CheckoutAddress) {
  return {
    name: addressName(address),
    firstName: address.firstName,
    lastName: address.lastName,
    street: address.street,
    houseNumber: address.houseNumber,
    houseAddition: address.houseAddition ?? '',
    postalCode: normalizePostalCode(address.country, address.postalCode),
    city: address.city,
    country: address.country,
    company: address.company ?? '',
    phone: address.phone ?? '',
  }
}

function mollieAddress(address: CheckoutAddress, email: string) {
  const addition = address.houseAddition ? ` ${address.houseAddition}` : ''
  return {
    givenName: address.firstName,
    familyName: address.lastName,
    email,
    streetAndNumber: `${address.street} ${address.houseNumber}${addition}`.trim(),
    postalCode: normalizePostalCode(address.country, address.postalCode),
    city: address.city,
    country: address.country,
  }
}

async function resolveCartLines(env: AppEnv['Bindings'], lines: CheckoutLineInput[]): Promise<QuoteLine[]> {
  if (lines.length === 0) throw new Error('Winkelwagen is leeg.')
  const db = createDb(env)
  const snapshots: QuoteLine[] = []

  for (const line of lines) {
    assertValidCheckoutQuantity(line.quantity)
    if (line.slug?.startsWith('fixture-') || line.productId?.startsWith('fixture-')) {
      const unit = 12900
      const vatRate = 21
      const { lineTotal, vatCents } = lineVat(unit, line.quantity, vatRate)
      snapshots.push({
        name: 'Development testartikel',
        sku: 'FIX-DEV-001',
        productId: 'fixture-dev',
        slug: 'fixture-dev',
        quantity: line.quantity,
        unitPriceCents: unit,
        vatRate,
        vatCents,
        lineTotalCents: lineTotal,
        imageRef: '/media/categories/category-meubels.png',
      })
      continue
    }

    const found = line.productId
      ? (await db.select().from(products).where(eq(products.id, line.productId)).limit(1))[0]
      : line.slug
        ? (await db.select().from(products).where(eq(products.slug, line.slug)).limit(1))[0]
        : null

    if (!found || found.status !== 'active') {
      throw new Error('Een artikel is niet beschikbaar.')
    }
    if (found.priceOnRequest || found.priceInclCents == null) {
      throw new Error(`“${found.name}” heeft geen vaste prijs en kan niet online worden afgerekend.`)
    }
    if (found.isBusinessOnly) {
      throw new Error(`“${found.name}” is alleen beschikbaar via zakelijke offerte.`)
    }

    const image = (
      await db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, found.id))
        .limit(1)
    )[0]

    const { lineTotal, vatCents } = lineVat(found.priceInclCents, line.quantity, found.vatPercent)
    snapshots.push({
      name: found.name,
      sku: found.sku,
      productId: found.id,
      slug: found.slug,
      quantity: line.quantity,
      unitPriceCents: found.priceInclCents,
      vatRate: found.vatPercent,
      vatCents,
      lineTotalCents: lineTotal,
      imageRef: image?.r2Key ? mediaPublicPath(image.r2Key) : image?.url ?? null,
    })
  }

  return snapshots
}

export async function quoteCheckout(
  env: AppEnv['Bindings'],
  input: {
    lines: CheckoutLineInput[]
    country: CheckoutCountry
    deliveryMethodId?: string
  },
) {
  if (!isCheckoutCountry(input.country)) {
    throw new Error('We leveren momenteel alleen in Nederland en België.')
  }
  const items = await resolveCartLines(env, input.lines)
  const subtotalCents = items.reduce((sum, item) => sum + item.lineTotalCents, 0)
  const vatCents = items.reduce((sum, item) => sum + item.vatCents, 0)
  const delivery = resolveShippingCents(
    input.deliveryMethodId,
    input.country,
    subtotalCents,
  )
  const discountCents = 0
  const totalCents = addCents(subtotalCents, delivery.shippingCents, -discountCents)
  return {
    items,
    subtotalCents,
    vatCents,
    shippingCents: delivery.shippingCents,
    discountCents,
    totalCents,
    shippingPriceKnown: delivery.priceKnown,
    freeShipping: delivery.freeShipping,
    deliveryMethod: {
      id: delivery.method.id,
      label: delivery.method.label,
      description: delivery.method.description,
    },
    currency: 'EUR' as const,
  }
}

async function createMollieForOrder(
  env: AppEnv['Bindings'],
  input: {
    orderId: string
    orderNumber: string
    confirmationToken: string
    totalCents: number
    email: string
    shipping: CheckoutAddress
    billing: CheckoutAddress
    paymentMethod?: string
    locale: MollieLocale
  },
) {
  const origin = getSiteOrigin(env)
  const paymentsApi = createPaymentsService(env)
  const provider = await paymentsApi.createPayment({
    amountCents: input.totalCents,
    currency: 'EUR',
    description: `AllRound Direct bestelling ${input.orderNumber}`,
    redirectUrl: `${origin}/bestelling/bevestiging?order=${encodeURIComponent(input.orderNumber)}&token=${encodeURIComponent(input.confirmationToken)}`,
    webhookUrl: `${origin}/api/payments/mollie/webhook`,
    metadata: { orderId: input.orderId, orderNumber: input.orderNumber },
    locale: input.locale,
    method: input.paymentMethod,
    restrictPaymentMethodsToCountry: input.shipping.country,
    billingAddress: mollieAddress(input.billing, input.email),
    shippingAddress: mollieAddress(input.shipping, input.email),
  })
  return { provider, paymentsApi }
}

export async function placePendingOrder(env: AppEnv['Bindings'], input: PlaceOrderInput) {
  if (!isCheckoutCountry(input.shipping.country) || !isCheckoutCountry(input.billing.country)) {
    throw new Error('We leveren momenteel alleen in Nederland en België.')
  }

  const db = createDb(env)

  if (input.idempotencyKey) {
    const existing = (
      await db.select().from(orders).where(eq(orders.idempotencyKey, input.idempotencyKey)).limit(1)
    )[0]
    if (existing) {
      const payment = (
        await db.select().from(payments).where(eq(payments.orderId, existing.id)).limit(1)
      )[0]
      return {
        orderId: existing.id,
        orderNumber: existing.orderNumber,
        confirmationToken: existing.confirmationToken,
        checkoutUrl: payment?.checkoutUrl ?? null,
        paymentId: payment?.providerPaymentId ?? null,
        mock: createPaymentsService(env).isMock,
        mode: createPaymentsService(env).mode,
        reused: true as const,
      }
    }
  }

  const quote = await quoteCheckout(env, {
    lines: input.lines,
    country: input.shipping.country,
    deliveryMethodId: input.deliveryMethodId,
  })

  const now = new Date()
  const orderId = newId()
  const orderNumber = await nextOrderNumber(env)
  const confirmationToken = newId()
  const locale = input.locale ?? checkoutLocale(input.shipping.country)

  await db.insert(orders).values({
    id: orderId,
    orderNumber,
    userId: input.userId ?? null,
    guestEmail: input.email.trim().toLowerCase(),
    guestPhone: input.phone?.trim() || input.shipping.phone?.trim() || null,
    customerType: input.customerType,
    status: 'pending_payment',
    currency: 'EUR',
    subtotalCents: quote.subtotalCents,
    vatCents: quote.vatCents,
    shippingCents: quote.shippingCents,
    discountCents: quote.discountCents,
    totalCents: quote.totalCents,
    shippingCountry: input.shipping.country,
    paymentStatus: 'pending',
    paymentMethod: input.paymentMethod ?? null,
    confirmationToken,
    idempotencyKey: input.idempotencyKey ?? null,
    billingSnapshot: JSON.stringify(snapshotAddress(input.billing)),
    shippingSnapshot: JSON.stringify(snapshotAddress(input.shipping)),
    placedAt: now,
    createdAt: now,
    updatedAt: now,
  })

  for (const item of quote.items) {
    await db.insert(orderItems).values({
      id: newId(),
      orderId,
      name: item.name,
      sku: item.sku,
      productId: item.productId,
      productSlug: item.slug,
      variantName: null,
      imageRef: item.imageRef,
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
      vatRate: item.vatRate,
      vatCents: item.vatCents,
      lineTotalCents: item.lineTotalCents,
      snapshotJson: JSON.stringify({
        name: item.name,
        sku: item.sku,
        slug: item.slug,
        unitPriceCents: item.unitPriceCents,
        vatPercent: item.vatRate,
        imageRef: item.imageRef,
        quantity: item.quantity,
      }),
    })
  }

  await db.insert(orderStatusHistory).values({
    id: newId(),
    orderId,
    fromStatus: null,
    toStatus: 'pending_payment',
    source: 'checkout',
    actorUserId: null,
    note: 'Order aangemaakt, wacht op Mollie',
    createdAt: now,
  })

  let provider
  let paymentsApi
  try {
    ;({ provider, paymentsApi } = await createMollieForOrder(env, {
      orderId,
      orderNumber,
      confirmationToken,
      totalCents: quote.totalCents,
      email: input.email,
      shipping: input.shipping,
      billing: input.billing,
      paymentMethod: input.paymentMethod,
      locale,
    }))
  } catch (error) {
    await db
      .update(orders)
      .set({
        paymentStatus: 'failed',
        internalNotes: `Mollie payment init failed: ${error instanceof Error ? error.message : 'unknown'}`,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))
    throw error
  }

  await db.insert(payments).values({
    id: newId(),
    orderId,
    provider: 'mollie',
    providerPaymentId: provider.id,
    status: provider.status,
    amountCents: provider.amountCents,
    currency: provider.currency,
    checkoutUrl: provider.checkoutUrl,
    method: provider.method,
    mode: provider.mode,
    metadataJson: JSON.stringify(provider.metadata),
    createdAt: now,
    updatedAt: now,
  })

  await db
    .update(orders)
    .set({ molliePaymentId: provider.id, updatedAt: now })
    .where(eq(orders.id, orderId))

  await emitOrderEvent(env, {
    type: 'ORDER_CREATED',
    orderId,
    entityType: 'order',
    entityId: orderId,
    data: {
      email: input.email,
      amountLabel: `€ ${(quote.totalCents / 100).toFixed(2).replace('.', ',')}`,
      // Alleen pending methods (bijv. overboeking) krijgen een “wacht op betaling”-mail.
      awaitingPayment: input.paymentMethod === 'banktransfer' ? 'true' : 'false',
    },
  })

  return {
    orderId,
    orderNumber,
    confirmationToken,
    checkoutUrl: provider.checkoutUrl,
    paymentId: provider.id,
    mock: paymentsApi.isMock,
    mode: paymentsApi.mode,
    reused: false as const,
  }
}

/** New Mollie payment for an unpaid order — does not duplicate the order or items. */
export async function retryOrderPayment(
  env: AppEnv['Bindings'],
  input: { orderNumber: string; confirmationToken: string; paymentMethod?: string },
) {
  const db = createDb(env)
  const order = (
    await db.select().from(orders).where(eq(orders.orderNumber, input.orderNumber)).limit(1)
  )[0]
  if (!order || order.confirmationToken !== input.confirmationToken) {
    throw new Error('Bestelling niet gevonden.')
  }
  if (order.paymentStatus === 'paid' || order.paymentStatus === 'refunded') {
    throw new Error('Deze bestelling is al betaald.')
  }
  if (order.status === 'cancelled' || order.status === 'refunded') {
    throw new Error('Deze bestelling kan niet opnieuw worden betaald.')
  }

  const retryableStatuses = new Set(['failed', 'canceled', 'cancelled', 'expired'])
  if (!retryableStatuses.has(order.paymentStatus.toLowerCase())) {
    throw new Error(
      'Opnieuw betalen is alleen mogelijk na een mislukte, geannuleerde of verlopen betaling.',
    )
  }

  const latestPayment = (
    await db
      .select()
      .from(payments)
      .where(eq(payments.orderId, order.id))
      .orderBy(desc(payments.createdAt))
      .limit(1)
  )[0]

  // Soft idempotency: reuse a very recent open checkout instead of creating duplicates.
  if (
    latestPayment?.checkoutUrl &&
    ['open', 'pending'].includes(latestPayment.status) &&
    Date.now() - new Date(latestPayment.createdAt).getTime() < 2 * 60 * 1000
  ) {
    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      confirmationToken: order.confirmationToken,
      checkoutUrl: latestPayment.checkoutUrl,
      paymentId: latestPayment.providerPaymentId,
      mock: false,
      mode: latestPayment.mode as 'test' | 'live',
      reused: true as const,
    }
  }

  const shipping = JSON.parse(order.shippingSnapshot) as CheckoutAddress & { name?: string }
  const billing = JSON.parse(order.billingSnapshot) as CheckoutAddress & { name?: string }
  if (!shipping.firstName && shipping.name) {
    const [firstName, ...rest] = shipping.name.split(' ')
    shipping.firstName = firstName
    shipping.lastName = rest.join(' ') || firstName
  }
  if (!billing.firstName && billing.name) {
    const [firstName, ...rest] = billing.name.split(' ')
    billing.firstName = firstName
    billing.lastName = rest.join(' ') || firstName
  }

  const country = (order.shippingCountry || shipping.country || 'NL') as CheckoutCountry
  const locale = checkoutLocale(isCheckoutCountry(country) ? country : 'NL')

  const { provider, paymentsApi } = await createMollieForOrder(env, {
    orderId: order.id,
    orderNumber: order.orderNumber,
    confirmationToken: order.confirmationToken,
    totalCents: order.totalCents,
    email: order.guestEmail,
    shipping: { ...shipping, country: isCheckoutCountry(shipping.country) ? shipping.country : 'NL' },
    billing: { ...billing, country: isCheckoutCountry(billing.country) ? billing.country : 'NL' },
    paymentMethod: input.paymentMethod ?? order.paymentMethod ?? undefined,
    locale,
  })

  const now = new Date()
  await db.insert(payments).values({
    id: newId(),
    orderId: order.id,
    provider: 'mollie',
    providerPaymentId: provider.id,
    status: provider.status,
    amountCents: provider.amountCents,
    currency: provider.currency,
    checkoutUrl: provider.checkoutUrl,
    method: provider.method,
    mode: provider.mode,
    metadataJson: JSON.stringify(provider.metadata),
    createdAt: now,
    updatedAt: now,
  })

  await db
    .update(orders)
    .set({
      status: 'pending_payment',
      paymentStatus: 'pending',
      molliePaymentId: provider.id,
      paymentMethod: input.paymentMethod ?? order.paymentMethod,
      updatedAt: now,
    })
    .where(eq(orders.id, order.id))

  await db.insert(orderStatusHistory).values({
    id: newId(),
    orderId: order.id,
    fromStatus: order.status,
    toStatus: 'pending_payment',
    source: 'checkout',
    actorUserId: null,
    note: 'Nieuwe betaalpoging gestart',
    createdAt: now,
  })

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    confirmationToken: order.confirmationToken,
    checkoutUrl: provider.checkoutUrl,
    paymentId: provider.id,
    mock: paymentsApi.isMock,
    mode: paymentsApi.mode,
    reused: false as const,
  }
}

export async function findPaymentCheckoutUrl(env: AppEnv['Bindings'], orderId: string) {
  const db = createDb(env)
  const payment = (
    await db
      .select()
      .from(payments)
      .where(and(eq(payments.orderId, orderId)))
      .limit(1)
  )[0]
  return payment?.checkoutUrl ?? null
}
