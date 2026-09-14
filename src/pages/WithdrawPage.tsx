import { useCallback, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { SeoHead } from '@/components/seo/SeoHead'
import { TextField } from '@/components/account/Fields'
import { TurnstileField } from '@/components/account/TurnstileField'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { CONCEPT_NOTICE } from '@/config/legal'
import { formatCents, formatDateTime } from '@/lib/account-api'
import { ApiError } from '@/lib/api'
import {
  confirmWithdrawal,
  lookupWithdrawal,
  type WithdrawalConfirmation,
  type WithdrawalLookup,
} from '@/lib/legal-api'

type Step = 'lookup' | 'select' | 'confirm' | 'done'

export function WithdrawPage() {
  const [step, setStep] = useState<Step>('lookup')
  const [orderNumber, setOrderNumber] = useState('')
  const [email, setEmail] = useState('')
  const [turnstile, setTurnstile] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [lookup, setLookup] = useState<WithdrawalLookup | null>(null)
  const [fullContract, setFullContract] = useState(true)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [result, setResult] = useState<WithdrawalConfirmation | null>(null)
  const onToken = useCallback((token: string) => setTurnstile(token), [])

  const selectedItems = useMemo(() => {
    if (!lookup) return []
    if (fullContract) return lookup.order.items
    return lookup.order.items.filter((item) => selectedIds.includes(item.id))
  }, [lookup, fullContract, selectedIds])

  async function onLookup(event: FormEvent) {
    event.preventDefault()
    setError('')
    setPending(true)
    try {
      const data = await lookupWithdrawal(orderNumber, email, turnstile || undefined)
      setLookup(data)
      setFullContract(true)
      setSelectedIds(data.order.items.map((item) => item.id))
      setStep('select')
    } catch (err) {
      setLookup(null)
      setError(err instanceof ApiError ? err.message : 'Opzoeken is niet gelukt.')
    } finally {
      setPending(false)
    }
  }

  async function onConfirm() {
    if (!lookup) return
    setError('')
    setPending(true)
    try {
      const data = await confirmWithdrawal({
        orderNumber,
        email,
        turnstileToken: turnstile || undefined,
        fullContract,
        itemIds: fullContract ? undefined : selectedIds,
        customerNote: note || undefined,
      })
      setResult(data)
      setStep('done')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Herroepen is niet gelukt.')
    } finally {
      setPending(false)
    }
  }

  return (
    <main id="main" className="section-space">
      <SeoHead
        title="Overeenkomst herroepen | AllRound Direct"
        description="Herroep een consumentenaankoop bij AllRound Direct met ordernummer en e-mail, zonder account."
        path="/herroepen"
      />
      <Container>
        <div className="mx-auto max-w-[42rem]">
          <h1 className="heading-display text-navy">Overeenkomst herroepen</h1>
          <p className="text-body mt-4 text-ink">
            Als consument kunt u de koop in beginsel binnen 14 dagen herroepen, zonder opgave van
            reden. Een account is niet nodig. Vul het ordernummer en het e-mailadres van de
            bestelling in. Daarna ziet u de order, kiest u de omvang en bevestigt u. Wij registreren
            de exacte datum en tijd.
          </p>
          <p className="mt-3 text-[15px] text-ink">
            Liever een pdf of uitprintbaar model? Gebruik het{' '}
            <Link to="/herroepingsformulier" className="text-brand underline">
              modelformulier herroeping
            </Link>
            .
          </p>
          <p className="mt-4 rounded-[8px] bg-surface px-4 py-3 text-[13px] text-muted">
            {CONCEPT_NOTICE}
          </p>

          {step === 'lookup' ? (
            <form className="mt-8 space-y-4" onSubmit={onLookup}>
              <TextField
                label="Ordernummer"
                name="order-number"
                required
                autoComplete="off"
                value={orderNumber}
                onChange={(event) => setOrderNumber(event.target.value)}
              />
              <TextField
                label="E-mailadres van de bestelling"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <TurnstileField onToken={onToken} />
              {error ? (
                <p className="text-[14px] text-red-700" role="alert">
                  {error}
                </p>
              ) : null}
              <Button type="submit" disabled={pending}>
                {pending ? 'Zoeken…' : 'Bestelling opzoeken'}
              </Button>
            </form>
          ) : null}

          {step === 'select' && lookup ? (
            <div className="mt-8 space-y-5">
              <section className="rounded-[12px] p-5 ring-1 ring-line">
                <h2 className="font-heading text-[20px] font-semibold text-navy">
                  Bestelling {lookup.order.orderNumber}
                </h2>
                <p className="mt-1 text-[14px] text-muted">
                  {formatDateTime(lookup.order.placedAt)} · {lookup.order.statusLabel}
                </p>
                <p className="mt-2 text-[15px]">
                  Totaal {formatCents(lookup.order.totalCents, lookup.order.currency)}
                </p>
              </section>

              {lookup.notices.length > 0 ? (
                <ul className="list-disc space-y-1 pl-5 text-[14px] text-muted">
                  {lookup.notices.map((notice) => (
                    <li key={notice}>{notice}</li>
                  ))}
                </ul>
              ) : null}

              {lookup.previousWithdrawals.length > 0 ? (
                <p className="text-[14px] text-ink">
                  Eerder verzoek:{' '}
                  {lookup.previousWithdrawals
                    .map((row) => `${row.confirmationCode} (${row.status})`)
                    .join(', ')}
                  .
                </p>
              ) : null}

              <fieldset className="rounded-[12px] p-5 ring-1 ring-line">
                <legend className="font-heading text-[18px] font-semibold text-navy">
                  Wat wilt u herroepen?
                </legend>
                <label className="mt-3 flex min-h-11 items-start gap-2 text-[15px]">
                  <input
                    type="radio"
                    name="scope"
                    checked={fullContract}
                    onChange={() => setFullContract(true)}
                    className="mt-1"
                  />
                  Gehele overeenkomst
                </label>
                <label className="flex min-h-11 items-start gap-2 text-[15px]">
                  <input
                    type="radio"
                    name="scope"
                    checked={!fullContract}
                    onChange={() => setFullContract(false)}
                    className="mt-1"
                  />
                  Geselecteerde artikelen
                </label>
                <ul className="mt-3 divide-y divide-line">
                  {lookup.order.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-start justify-between gap-3 py-3 text-[14px]"
                    >
                      <label className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          className="mt-1"
                          disabled={fullContract}
                          checked={fullContract || selectedIds.includes(item.id)}
                          onChange={(event) => {
                            setSelectedIds((prev) =>
                              event.target.checked
                                ? [...prev, item.id]
                                : prev.filter((id) => id !== item.id),
                            )
                          }}
                        />
                        <span>
                          {item.name}
                          <span className="block text-muted">
                            {item.quantity} ×{' '}
                            {formatCents(item.unitPriceCents, lookup.order.currency)}
                          </span>
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </fieldset>

              <div className="space-y-1.5">
                <label htmlFor="withdraw-note" className="text-[14px] font-medium">
                  Toelichting (niet verplicht)
                </label>
                <textarea
                  id="withdraw-note"
                  rows={3}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  className="w-full rounded-[4px] border border-line px-3 py-2 text-[15px]"
                />
              </div>

              {error ? (
                <p className="text-[14px] text-red-700" role="alert">
                  {error}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  disabled={selectedItems.length === 0}
                  onClick={() => setStep('confirm')}
                >
                  Naar bevestiging
                </Button>
                <Button type="button" variant="secondary" onClick={() => setStep('lookup')}>
                  Andere bestelling
                </Button>
              </div>
            </div>
          ) : null}

          {step === 'confirm' && lookup ? (
            <div className="mt-8 space-y-4">
              <h2 className="font-heading text-[22px] font-semibold text-navy">Bevestigen</h2>
              <p className="text-[15px] text-ink">
                U staat op het punt de herroeping definitief te maken voor bestelling{' '}
                {lookup.order.orderNumber}. Dit legt het moment van herroeping vast.
              </p>
              <ul className="list-disc pl-5 text-[15px]">
                {selectedItems.map((item) => (
                  <li key={item.id}>
                    {item.name} × {item.quantity}
                  </li>
                ))}
              </ul>
              {error ? (
                <p className="text-[14px] text-red-700" role="alert">
                  {error}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <Button type="button" disabled={pending} onClick={() => void onConfirm()}>
                  {pending ? 'Bezig…' : 'Definitief herroepen'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => setStep('select')}>
                  Terug
                </Button>
              </div>
            </div>
          ) : null}

          {step === 'done' && result ? (
            <div className="mt-8 rounded-[12px] bg-surface p-5" role="status">
              <h2 className="font-heading text-[22px] font-semibold text-navy">
                Herroeping ontvangen
              </h2>
              <p className="mt-3 text-[15px]">
                Referentie: <strong>{result.confirmationCode}</strong>
              </p>
              <p className="mt-1 text-[15px]">Vastgelegd: {result.recordedAtLabel}</p>
              <p className="mt-1 text-[15px]">Bestelling: {result.orderNumber}</p>
              <ul className="mt-3 list-disc pl-5 text-[15px]">
                {result.items.map((item) => (
                  <li key={item.id}>
                    {item.name} × {item.quantity}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[14px] text-muted">
                Een automatische bevestigingsmail via Resend volgt wanneer e-mailproductie is
                ingeschakeld. In development kan het bericht in de lokale outbox staan. Bewaar de
                referentie.
              </p>
              <p className="mt-4 text-[14px]">
                <Link to="/retourneren" className="text-brand underline">
                  Retourinformatie
                </Link>
              </p>
            </div>
          ) : null}
        </div>
      </Container>
    </main>
  )
}
