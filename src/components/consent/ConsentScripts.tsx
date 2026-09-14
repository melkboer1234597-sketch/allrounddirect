import { useEffect } from 'react'
import { canLoadAnalytics, canLoadMarketing, type ConsentRecord } from '@/lib/consent'

/**
 * Laadt analytics/marketing pas na geldige toestemming.
 * Er zijn nu geen third-party scripts gekoppeld; dit voorkomt stille injectie.
 */
export function ConsentScripts({ record }: { record: ConsentRecord | null }) {
  useEffect(() => {
    if (!canLoadAnalytics(record)) return
    /* later: analytics-loader, alleen hier */
  }, [record])

  useEffect(() => {
    if (!canLoadMarketing(record)) return
    /* later: marketingpixels, alleen hier */
  }, [record])

  return null
}
