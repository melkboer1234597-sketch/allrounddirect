type VariantSlot = {
  slot: string
  label: string
  values: string[]
}

type ProductVariantSelectorsProps = {
  slots: VariantSlot[]
  selected: Record<string, string>
  onChange: (slot: string, value: string) => void
}

/**
 * Renders sofa/furniture option slots only when real multi-value variant data exists.
 */
export function ProductVariantSelectors({
  slots,
  selected,
  onChange,
}: ProductVariantSelectorsProps) {
  if (!slots.length) return null
  return (
    <div className="mt-5 space-y-4 border-t border-line pt-5">
      {slots.map((slot) => (
        <fieldset key={slot.slot}>
          <legend className="text-[13px] font-medium text-ink">{slot.label}</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {slot.values.map((value) => {
              const active = selected[slot.slot] === value
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onChange(slot.slot, value)}
                  className={
                    active
                      ? 'rounded-[4px] border border-brand bg-brand/5 px-3 py-2 text-[13px] text-ink'
                      : 'rounded-[4px] border border-line px-3 py-2 text-[13px] text-ink hover:border-brand/40'
                  }
                >
                  {value}
                </button>
              )
            })}
          </div>
        </fieldset>
      ))}
    </div>
  )
}
