import { useId, useMemo, useState } from 'react'
import { formatMoney } from '@/lib/money'
import type { Money } from '@/types/catalog'

type FlooringPackCalculatorProps = {
  packCoverageM2: number
  unitPrice: Money | null
  onPacksChange?: (packs: number) => void
}

export function FlooringPackCalculator({
  packCoverageM2,
  unitPrice,
  onPacksChange,
}: FlooringPackCalculatorProps) {
  const id = useId()
  const [area, setArea] = useState('')
  const areaM2 = Number(String(area).replace(',', '.'))
  const packs = useMemo(() => {
    if (!Number.isFinite(areaM2) || areaM2 <= 0) return 0
    return Math.max(1, Math.ceil(areaM2 / packCoverageM2))
  }, [areaM2, packCoverageM2])

  const total =
    packs > 0 && unitPrice
      ? { amount: unitPrice.amount * packs, currency: unitPrice.currency }
      : null

  return (
    <div className="mt-5 rounded-[8px] border border-line px-4 py-4">
      <p className="text-[14px] font-medium text-ink">Hoeveel pakken heb ik nodig?</p>
      <p className="mt-1 text-[13px] text-muted">
        Pakinhoud: {packCoverageM2.toLocaleString('nl-NL', { maximumFractionDigits: 3 })} m²
      </p>
      <label htmlFor={id} className="mt-3 block text-[13px] text-muted">
        Oppervlakte van de ruimte (m²)
      </label>
      <div className="mt-1.5 flex flex-wrap items-center gap-3">
        <input
          id={id}
          type="number"
          min={0.1}
          step={0.1}
          inputMode="decimal"
          value={area}
          onChange={(event) => {
            setArea(event.target.value)
            const next = Number(String(event.target.value).replace(',', '.'))
            if (Number.isFinite(next) && next > 0) {
              onPacksChange?.(Math.max(1, Math.ceil(next / packCoverageM2)))
            }
          }}
          className="h-11 w-28 rounded-[4px] border border-line px-3 text-[15px]"
          placeholder="bijv. 24"
        />
        {packs > 0 ? (
          <p className="text-[14px] text-ink">
            <span className="font-semibold">{packs}</span> pak{packs === 1 ? '' : 'ken'}
            {total ? (
              <>
                {' '}
                · indicatie {formatMoney(total)}
              </>
            ) : null}
          </p>
        ) : null}
      </div>
      <p className="mt-2 text-[12px] text-muted">
        Reken op snijverlies; dit is een indicatie op basis van de bekende pakinhoud.
      </p>
    </div>
  )
}
