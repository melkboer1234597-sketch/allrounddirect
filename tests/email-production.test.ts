import { describe, expect, it } from 'vitest'
import { renderEmailTemplate } from '../worker/email/templates'
import { orderEmailEventKey } from '../shared/payment-ui'

describe('transactional email production content', () => {
  it('renders order confirmation with apex links and gratis shipping label', () => {
    const origin = 'https://allrounddirect.com'
    const content = renderEmailTemplate(
      'order_confirmation',
      origin,
      { firstName: 'Sara' },
      {
        firstName: 'Sara',
        orderNumber: 'ARD-2026-000999',
        orderDateLabel: '15 september 2026',
        statusText: 'Betaling ontvangen',
        paymentMethod: 'iDEAL',
        shippingAddress: 'Sara Jansen\nStraat 1\n1234 AB Amsterdam\nNederland',
        subtotalCents: 120000,
        shippingCents: 0,
        shippingLabel: 'Gratis',
        vatCents: 20826,
        totalCents: 120000,
        actionUrl: `${origin}/bestelling/bevestiging?order=ARD-2026-000999&token=demo`,
        items: [
          {
            name: 'Testproduct',
            quantity: 1,
            lineTotalCents: 120000,
            imageUrl: `${origin}/media/categories/category-meubels.png`,
          },
        ],
      },
    )
    expect(content.subject).toContain('AllRound Direct')
    expect(content.html).toContain('https://allrounddirect.com')
    expect(content.html).not.toContain('localhost')
    expect(content.html).not.toContain('allrounddirect.nl')
    expect(content.html).toContain('Gratis')
    expect(content.html).toContain('Bekijk uw bestelling')
    expect(content.html).toContain('ARD-2026-000999')
    expect(content.actionUrl).toContain('token=demo')
  })

  it('keeps payment-confirmed event keys stable for idempotency', () => {
    expect(orderEmailEventKey('abc', 'payment-confirmed')).toBe('order:abc:payment-confirmed')
  })
})
