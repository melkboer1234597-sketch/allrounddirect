const NAVY = '#071F3F'
const BRAND = '#087CEB'

export function transactionalLayout(input: {
  origin: string
  preheader: string
  title: string
  bodyHtml: string
  actionUrl?: string
  actionLabel?: string
}): string {
  const logo = `${input.origin}/media/branding/allround-direct-logo-horizontal-compact.png`
  const button = input.actionUrl
    ? `<p style="margin:28px 0 8px"><a href="${input.actionUrl}" style="display:inline-block;background:${BRAND};color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:4px;font-size:15px">${input.actionLabel ?? 'Openen'}</a></p>`
    : ''

  return `<!doctype html>
<html lang="nl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(input.title)}</title>
</head>
<body style="margin:0;padding:0;background:#f6f8fa;color:#151a21;font-family:Inter,Arial,sans-serif;">
  <span style="display:none;max-height:0;overflow:hidden">${escapeHtml(input.preheader)}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f8fa;padding:24px 12px">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden">
          <tr>
            <td style="background:${NAVY};padding:20px 24px">
              <img src="${logo}" alt="AllRound Direct" width="180" style="display:block;max-width:180px;height:auto;border:0" />
            </td>
          </tr>
          <tr>
            <td style="padding:28px 24px 8px">
              <h1 style="margin:0;font-size:22px;line-height:1.25;color:${NAVY};font-weight:600">${escapeHtml(input.title)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 24px 32px;font-size:15px;line-height:1.6;color:#151a21">
              ${input.bodyHtml}
              ${button}
              <p style="margin:32px 0 0;font-size:13px;color:#626a76">AllRound Direct<br/>Nederlandse webshop voor wonen, keuken, vloer, horeca en zakelijk.</p>
            </td>
          </tr>
        </table>
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
    .replaceAll(/<[^>]+>/g, '')
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&amp;', '&')
    .trim()
}
