const NAVY = '#071F3F'
const BRAND = '#087CEB'
const MUTED = '#626a76'
const INK = '#151a21'
const LINE = '#e3e7ec'

export function transactionalLayout(input: {
  origin: string
  preheader: string
  title: string
  bodyHtml: string
  actionUrl?: string
  actionLabel?: string
}): string {
  const logo = `${input.origin}/media/branding/allround-direct-logo-white.png`
  const button = input.actionUrl
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 8px"><tr><td style="border-radius:8px;background:${BRAND}"><a href="${escapeHtml(input.actionUrl)}" style="display:inline-block;padding:14px 22px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none">${escapeHtml(input.actionLabel ?? 'Openen')}</a></td></tr></table>`
    : ''

  return `<!doctype html>
<html lang="nl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${escapeHtml(input.title)}</title>
</head>
<body style="margin:0;padding:0;background:#f6f8fa;color:${INK};font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(input.preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f8fa;padding:20px 10px">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:10px;overflow:hidden">
          <tr>
            <td style="background:${NAVY};padding:18px 20px">
              <img src="${logo}" alt="AllRound Direct" width="168" style="display:block;max-width:168px;width:100%;height:auto;border:0" />
            </td>
          </tr>
          <tr>
            <td style="padding:24px 20px 4px">
              <h1 style="margin:0;font-size:20px;line-height:1.3;color:${NAVY};font-weight:700">${escapeHtml(input.title)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 20px 28px;font-size:15px;line-height:1.55;color:${INK}">
              ${input.bodyHtml}
              ${button}
            </td>
          </tr>
          <tr>
            <td style="background:${NAVY};padding:16px 20px;font-size:12px;line-height:1.5;color:#c9d3e0">
              AllRound Direct<br />
              Wonen, keuken, vloer, horeca en zakelijk.<br />
              <a href="${escapeHtml(input.origin)}" style="color:#ffffff;text-decoration:underline">allrounddirect.com</a>
            </td>
          </tr>
        </table>
        <p style="margin:14px 0 0;font-size:11px;color:${MUTED};max-width:560px">
          Dit is een transactionele e-mail over uw bestelling of account.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export function textFromHtml(html: string): string {
  return html
    .replaceAll(/<br\s*\/?>/gi, '\n')
    .replaceAll(/<\/p>/gi, '\n\n')
    .replaceAll(/<\/tr>/gi, '\n')
    .replaceAll(/<[^>]+>/g, '')
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll(/[ \t]+\n/g, '\n')
    .replaceAll(/\n{3,}/g, '\n\n')
    .trim()
}

export function formatCentsEmail(cents: number): string {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}

export type EmailLineItem = {
  name: string
  quantity: number
  lineTotalCents: number
  imageUrl?: string | null
}

export function renderOrderItemsTable(items: EmailLineItem[]): string {
  if (!items.length) return ''
  const rows = items
    .map((item) => {
      const img = item.imageUrl
        ? `<img src="${escapeHtml(item.imageUrl)}" alt="" width="48" height="48" style="display:block;width:48px;height:48px;object-fit:cover;border-radius:6px;border:0" />`
        : `<div style="width:48px;height:48px;background:#f6f8fa;border-radius:6px"></div>`
      return `<tr>
        <td style="padding:10px 0;border-bottom:1px solid ${LINE};vertical-align:top;width:56px">${img}</td>
        <td style="padding:10px 8px;border-bottom:1px solid ${LINE};vertical-align:top;font-size:14px;color:${INK}">
          ${escapeHtml(item.name)}<br /><span style="color:${MUTED};font-size:13px">Aantal ${item.quantity}</span>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid ${LINE};vertical-align:top;text-align:right;font-size:14px;white-space:nowrap">${escapeHtml(formatCentsEmail(item.lineTotalCents))}</td>
      </tr>`
    })
    .join('')
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0 8px;border-collapse:collapse">${rows}</table>`
}

export function renderTotalsBlock(input: {
  subtotalCents: number
  shippingCents: number
  shippingLabel?: string
  totalCents: number
  vatCents?: number
}): string {
  const shipping =
    input.shippingLabel ??
    (input.shippingCents > 0 ? formatCentsEmail(input.shippingCents) : 'Gratis')
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:12px 0 0;font-size:14px">
    <tr><td style="padding:4px 0;color:${MUTED}">Subtotaal</td><td style="padding:4px 0;text-align:right">${escapeHtml(formatCentsEmail(input.subtotalCents))}</td></tr>
    <tr><td style="padding:4px 0;color:${MUTED}">Bezorging</td><td style="padding:4px 0;text-align:right">${escapeHtml(shipping)}</td></tr>
    ${
      input.vatCents != null
        ? `<tr><td style="padding:4px 0;color:${MUTED}">Waarvan btw</td><td style="padding:4px 0;text-align:right">${escapeHtml(formatCentsEmail(input.vatCents))}</td></tr>`
        : ''
    }
    <tr><td style="padding:10px 0 0;font-weight:700;color:${NAVY};font-size:16px;border-top:1px solid ${LINE}">Totaal</td><td style="padding:10px 0 0;text-align:right;font-weight:700;color:${NAVY};font-size:16px;border-top:1px solid ${LINE}">${escapeHtml(formatCentsEmail(input.totalCents))}</td></tr>
  </table>`
}

export function renderKeyValueRows(rows: Array<[string, string]>): string {
  const present = rows.filter(([, value]) => Boolean(value?.trim()))
  if (!present.length) return ''
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:16px;font-size:14px">${present
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:${MUTED};vertical-align:top">${escapeHtml(label)}</td><td style="padding:4px 0;color:${INK};vertical-align:top">${escapeHtml(value)}</td></tr>`,
    )
    .join('')}</table>`
}
