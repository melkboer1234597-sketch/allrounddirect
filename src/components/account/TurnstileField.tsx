import { useEffect, useRef, useState } from 'react'

type TurnstileProps = {
  onToken: (token: string) => void
  id?: string
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        options: { sitekey: string; callback: (token: string) => void; appearance?: string },
      ) => string
      remove: (id: string) => void
    }
  }
}

export function TurnstileField({ onToken, id = 'turnstile' }: TurnstileProps) {
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined
  const ref = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(Boolean(siteKey))

  useEffect(() => {
    if (!siteKey) {
      setReady(false)
      return
    }
    const existing = document.querySelector('script[data-turnstile="true"]')
    if (existing) {
      setReady(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.dataset.turnstile = 'true'
    script.onload = () => setReady(true)
    document.head.appendChild(script)
  }, [siteKey])

  useEffect(() => {
    if (!ready || !siteKey || !ref.current || !window.turnstile) return
    const widgetId = window.turnstile.render(ref.current, {
      sitekey: siteKey,
      callback: onToken,
    })
    return () => {
      try {
        window.turnstile?.remove(widgetId)
      } catch {
        /* widget already gone */
      }
    }
  }, [ready, siteKey, onToken])

  if (!siteKey) {
    return (
      <p className="text-[13px] text-muted" id={`${id}-fallback`}>
        Lokale development: Turnstile-siteverify heeft een fallback omdat er geen site key is
        ingesteld. In productie is Siteverify verplicht.
      </p>
    )
  }

  return <div ref={ref} id={id} className="min-h-[65px]" />
}
