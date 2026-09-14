import { useId, useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/cn'

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  hint?: ReactNode
}

export function TextField({ label, error, hint, className, id, ...rest }: FieldProps) {
  const generated = useId()
  const fieldId = id ?? generated
  const errorId = `${fieldId}-error`
  const hintId = `${fieldId}-hint`
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined

  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId} className="block text-[14px] font-medium text-ink">
        {label}
      </label>
      <input
        id={fieldId}
        className={cn(
          'h-11 w-full rounded-[4px] border border-line bg-white px-3 text-[15px] text-ink outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/20',
          error && 'border-red-600',
          className,
        )}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...rest}
      />
      {hint ? (
        <p id={hintId} className="text-[13px] text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-[13px] text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function PasswordField({ label, error, hint, ...rest }: FieldProps) {
  const [visible, setVisible] = useState(false)
  const generated = useId()
  const fieldId = rest.id ?? generated
  const errorId = `${fieldId}-error`
  const hintId = `${fieldId}-hint`
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined

  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId} className="block text-[14px] font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          {...rest}
          id={fieldId}
          type={visible ? 'text' : 'password'}
          className={cn(
            'h-11 w-full rounded-[4px] border border-line bg-white px-3 pr-12 text-[15px] text-ink outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/20',
            error && 'border-red-600',
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
        />
        <button
          type="button"
          className="absolute top-0 right-0 inline-flex h-11 w-11 items-center justify-center text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          onClick={() => setVisible((value) => !value)}
          aria-pressed={visible}
          aria-label={visible ? 'Wachtwoord verbergen' : 'Wachtwoord tonen'}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {hint ? (
        <p id={hintId} className="text-[13px] text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-[13px] text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

type CheckProps = {
  label: ReactNode
  checked: boolean
  onChange: (checked: boolean) => void
  error?: string
  name?: string
  required?: boolean
}

export function CheckField({ label, checked, onChange, error, name, required }: CheckProps) {
  const id = useId()
  const errorId = `${id}-error`
  return (
    <div>
      <label htmlFor={id} className="flex gap-3 text-[14px] text-ink">
        <input
          id={id}
          name={name}
          type="checkbox"
          className="mt-1 h-4 w-4 rounded-[3px] border-line text-brand focus-visible:ring-brand"
          checked={checked}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span>{label}</span>
      </label>
      {error ? (
        <p id={errorId} className="mt-1 text-[13px] text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
