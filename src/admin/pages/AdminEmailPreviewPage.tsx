import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { SeoHead } from '@/components/seo/SeoHead'
import { adminFetch } from '@/lib/admin-api'
import { SITE } from '@/config/site'

type PreviewResponse = {
  template: string
  subject: string
  html: string
  text: string
  templates: string[]
  note: string
}

const DEFAULTS = [
  'order_confirmation',
  'payment_failed',
  'shipment_sent',
  'partial_shipment',
  'order_delivered',
  'order_cancelled',
  'refund_processed',
  'return_requested',
  'business_quote_received',
] as const

export function AdminEmailPreviewPage() {
  const [template, setTemplate] = useState<string>('order_confirmation')
  const { data, error, isLoading } = useQuery({
    queryKey: ['admin', 'email-preview', template],
    queryFn: () =>
      adminFetch<PreviewResponse>(`/email-preview?template=${encodeURIComponent(template)}`),
  })

  return (
    <>
      <SeoHead
        title={`E-mail preview | ${SITE.name}`}
        description="Development e-mailtemplate preview."
        path="/scotdejewish/email-preview"
        robots="noindex,nofollow"
      />
      <div className="space-y-4">
        <div>
          <h1 className="font-heading text-[24px] font-semibold text-navy">E-mail preview</h1>
          <p className="mt-1 text-[14px] text-muted">
            Alleen development/test. Fixture-data · er wordt niets verzonden.
          </p>
        </div>

        <label className="block max-w-md text-[13px] text-muted">
          Template
          <select
            className="mt-1 h-11 w-full rounded-[8px] border border-line px-3 text-[15px] text-ink"
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
          >
            {(data?.templates ?? DEFAULTS).map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </label>

        {isLoading ? <p className="text-[14px] text-muted">Laden…</p> : null}
        {error ? (
          <p className="text-[14px] text-red-700" role="alert">
            Preview niet beschikbaar (alleen buiten production, of niet ingelogd als beheerder).
          </p>
        ) : null}

        {data ? (
          <div className="space-y-3">
            <p className="text-[14px]">
              <span className="text-muted">Onderwerp:</span> {data.subject}
            </p>
            <p className="text-[12px] text-muted">{data.note}</p>
            <div className="overflow-hidden rounded-[10px] ring-1 ring-line">
              <iframe
                title="E-mail HTML preview"
                srcDoc={data.html}
                className="h-[720px] w-full bg-white"
                sandbox=""
              />
            </div>
            <details className="rounded-[8px] bg-surface p-3 text-[13px]">
              <summary className="cursor-pointer font-medium text-ink">Tekstversie</summary>
              <pre className="mt-2 whitespace-pre-wrap text-muted">{data.text}</pre>
            </details>
          </div>
        ) : null}
      </div>
    </>
  )
}
