import { eq } from 'drizzle-orm'
import type { AppEnv } from '../types'
import { createDb } from '../db'
import { orderItems, orderStatusHistory, orders, payments, products } from '../db/schema'
import { getSiteOrigin, newId } from '../lib/request'
import { createPaymentsService } from './mollie'
import { nextOrderNumber } from './order-numbers'
import { emitOrderEvent } from './order-events'

export type CheckoutAddress = {
  name: string
  street: string
  houseNumber: string
  postalCode: string
  city: string
  country: string
  company?: string
}

export type CheckoutLineInput = {
  productId?: string
  slug?: string
  quantity: number
}

export type PlaceOrderInput = {
  email: string
  userId?: string | null
  customerType: 'consumer' | 'business'
  billing: CheckoutAddress
  shipping: CheckoutAddress
  lines: CheckoutLineInput[]
  shippingCents?: number
}

function lineVat(unitInclCents: number, qty: number, vatPercent: number) {
  const lineTotal = unitInclCents * qty
  const vatCents = Math.round(lineTotal - lineTotal / (1 + vatPercent / 100))
  return { lineTotal, vatCents }
}

export async function placePendingOrder(env: AppEnv['Bindings'], input: PlaceOrderInput) {
  if (input.lines.length === 0) throw new Error('Winkelwagen is leeg.')
  const db = createDb(env)
  const snapshots = []
  for (const line of input.lines) {
    if (line.quantity < 1) throw new Error('Ongeldig aantal.')
    if (line.slug?.startsWith('fixture-') || line.productId?.startsWith('fixture-')) {
      const unit = 12900
      const vatRate = 21
      const { lineTotal, vatCents } = lineVat(unit, line.quantity, vatRate)
      snapshots.push({
        name: 'Development testartikel',
        sku: 'FIX-DEV-001',
        productId: 'fixture-dev',
        productSlug: 'fixture-dev',
        variantName: null as string | null,
        imageRef: '/media/categories/category-meubels.png',
        quantity: line.quantity,
        unitPriceCents: unit,
        vatRate,
        vatCents,
        lineTotalCents: lineTotal,
        snapshotJson: JSON.stringify({
          name: 'Development testartikel',
          sku: 'FIX-DEV-001',
          source: 'fixture',
        }),
      })
      continue
    }
    const found = line.productId
      ? (await db.select().from(products).where(eq(products.id, line.productId)).limit(1))[0]
      : line.slug
        ? (await db.select().from(products).where(eq(products.slug, line.slug)).limit(1))[0]
        : null
    if (!found || found.status !== 'active' || !found.priceInclCents) {
      throw new Error('Een artikel is niet beschikbaar of heeft geen prijs.')
    }
    const { lineTotal, vatCents } = lineVat(found.priceInclCents, line.quantity, found.vatPercent)
    snapshots.push({
      name: found.name,
      sku: found.sku,
      productId: found.id,
      productSlug: found.slug,
      variantName: null as string | null,
      imageRef: null as string | null,
      quantity: line.quantity,
      unitPriceCents: found.priceInclCents,
      vatRate: found.vatPercent,
      vatCents,
      lineTotalCents: lineTotal,
      snapshotJson: JSON.stringify({
        name: found.name,
        sku: found.sku,
        slug: found.slug,
        unitPriceCents: found.priceInclCents,
        vatPercent: found.vatPercent,
        imageRef: null,
      }),
    })
  }

  const subtotalCents = snapshots.reduce((sum, item) => sum + item.lineTotalCents, 0)
  const vatCents = snapshots.reduce((sum, item) => sum + item.vatCents, 0)
  const shippingCents = input.shippingCents ?? 0
  const totalCents = subtotalCents + shippingCents
  const now = new Date()
  const orderId = newId()
  const orderNumber = await nextOrderNumber(env)
  const confirmationToken = newId()

  await db.insert(orders).values({
    id: orderId,
    orderNumber,
    userId: input.userId ?? null,
    guestEmail: input.email.trim().toLowerCase(),
    customerType: input.customerType,
    status: 'pending_payment',
    currency: 'EUR',
    subtotalCents,
    vatCents,
    shippingCents,
    totalCents,
    paymentStatus: 'pending',
    confirmationToken,
    billingSnapshot: JSON.stringify(input.billing),
    shippingSnapshot: JSON.stringify(input.shipping),
    placedAt: now,
    createdAt: now,
    updatedAt: now,
  })

  for (const item of snapshots) {
    await db.insert(orderItems).values({
      id: newId(),
      orderId,
      ...item,
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

  const origin = getSiteOrigin(env)
  const paymentsApi = createPaymentsService(env)
  const provider = await paymentsApi.createPayment({
    amountCents: totalCents,
    currency: 'EUR',
    description: `AllRound Direct ${orderNumber}`,
    redirectUrl: `${origin}/bestelling/bevestiging?order=${encodeURIComponent(orderNumber)}&token=${encodeURIComponent(confirmationToken)}`,
    webhookUrl: `${origin}/api/payments/mollie/webhook`,
    metadata: { orderId, orderNumber },
  })

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
      amountLabel: `€ ${(totalCents / 100).toFixed(2).replace('.', ',')}`,
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
  }
}
