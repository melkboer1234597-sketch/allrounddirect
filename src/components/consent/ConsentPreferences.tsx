import { useId, useRef, useState } from 'react'
import { COOKIE_CATEGORY_COPY, type CookieCategory } from '@/config/legal'
import { Button } from '@/components/ui/Button'
import type { ConsentCategories } from '@/lib/consent'
import { useFocusTrap } from '@/lib/a11y'

const OPTIONAL: CookieCategory[] = ['preferences', 'analytics', 'marketing']

function Toggle({
  id,
  checked,
  disabled,
  onChange,
  label,
}: {
  id: string
  checked: boolean
  disabled?: boolean
  onChange: (value: boolean) => void
  label: string
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-60 ${
        checked ? 'bg-brand' : 'bg-line'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-5' : ''
        }`}
      />
    </button>
  )
}

export function ConsentPreferences({
  initial,
  onClose,
  onSave,
  onAcceptAll,
}: {
  initial: ConsentCategories
  onClose: () => void
  onSave: (categories: ConsentCategories) => void
  onAcceptAll: () => void
}) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const [draft, setDraft] = useState<ConsentCategories>(initial)
  useFocusTrap(true, panelRef, onClose)

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-navy/40 p-0 sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={panelRef}
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-[16px] bg-white p-5 shadow-xl sm:rounded-[12px] sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="font-heading text-[22px] font-semibold text-navy">
            Cookievoorkeuren
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 min-w-11 text-[15px] text-muted hover:text-ink"
          >
            Sluiten
          </button>
        </div>
        <p className="mt-2 text-[14px] leading-relaxed text-muted">
          Noodzakelijke cookies blijven aan. Optionele categorieën staan standaard uit tot u ze
          inschakelt. Weigeren kan hier door alles uit te laten en Selectie opslaan, of via Alleen
          noodzakelijk op de banner.
        </p>

        <ul className="mt-5 divide-y divide-line">
          <li className="flex items-start justify-between gap-4 py-4">
            <div>
              <p className="font-medium text-ink">{COOKIE_CATEGORY_COPY.necessary.title}</p>
              <p className="mt-1 text-[14px] text-muted">
                {COOKIE_CATEGORY_COPY.necessary.summary}
              </p>
            </div>
            <Toggle
              id="consent-necessary"
              checked
              disabled
              onChange={() => undefined}
              label="Noodzakelijk, altijd actief"
            />
          </li>
          {OPTIONAL.map((key) => (
            <li key={key} className="flex items-start justify-between gap-4 py-4">
              <div>
                <p className="font-medium text-ink">{COOKIE_CATEGORY_COPY[key].title}</p>
                <p className="mt-1 text-[14px] text-muted">{COOKIE_CATEGORY_COPY[key].summary}</p>
              </div>
              <Toggle
                id={`consent-${key}`}
                checked={draft[key]}
                onChange={(value) => setDraft((prev) => ({ ...prev, [key]: value }))}
                label={COOKIE_CATEGORY_COPY[key].title}
              />
            </li>
          ))}
        </ul>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() => onSave(draft)}
          >
            Selectie opslaan
          </Button>
          <Button type="button" className="w-full" onClick={onAcceptAll}>
            Alles accepteren
          </Button>
        </div>
        <Button
          type="button"
          variant="ghost"
          className="mt-2 w-full"
          onClick={() =>
            onSave({
              necessary: true,
              preferences: false,
              analytics: false,
              marketing: false,
            })
          }
        >
          Alles weigeren (alleen noodzakelijk)
        </Button>
      </div>
    </div>
  )
}
