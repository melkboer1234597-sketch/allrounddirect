import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { SeoHead } from '@/components/seo/SeoHead'
import { CheckField, TextField } from '@/components/account/Fields'
import { Button } from '@/components/ui/Button'
import { createAddress, deleteAddress, getAddresses, type AccountAddress } from '@/lib/account-api'

const empty = {
  firstName: '',
  lastName: '',
  companyName: '',
  street: '',
  houseNumber: '',
  addition: '',
  postalCode: '',
  city: '',
  phone: '',
  label: '',
  isDefaultShipping: true,
  isDefaultBilling: true,
}

export function AddressesPage() {
  const client = useQueryClient()
  const { data, isPending } = useQuery({
    queryKey: ['account', 'addresses'],
    queryFn: getAddresses,
  })
  const [form, setForm] = useState(empty)
  const [error, setError] = useState('')
  const save = useMutation({
    mutationFn: () => createAddress(form),
    onSuccess: async () => {
      setForm(empty)
      await client.invalidateQueries({ queryKey: ['account', 'addresses'] })
    },
    onError: () => setError('Adres kon niet worden opgeslagen.'),
  })
  const remove = useMutation({
    mutationFn: (id: string) => deleteAddress(id),
    onSuccess: () => client.invalidateQueries({ queryKey: ['account', 'addresses'] }),
  })

  function set<K extends keyof typeof empty>(key: K, value: (typeof empty)[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  return (
    <>
      <SeoHead
        title="Adressen | AllRound Direct"
        description="Beheer aflever- en factuuradressen."
        path="/account/adressen"
        robots="noindex,nofollow"
      />
      <h1 className="font-heading text-[26px] font-semibold text-navy">Adressen</h1>
      <div className="mt-4 grid gap-4">
        {isPending ? (
          <p className="text-muted">Laden…</p>
        ) : (
          (data?.addresses ?? []).map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onDelete={() => remove.mutate(address.id)}
            />
          ))
        )}
      </div>
      <form
        className="mt-6 space-y-3 rounded-[12px] bg-white p-5 ring-1 ring-line"
        onSubmit={(event) => {
          event.preventDefault()
          setError('')
          save.mutate()
        }}
      >
        <h2 className="font-heading text-[18px] font-semibold text-navy">Adres toevoegen</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <TextField
            label="Voornaam"
            autoComplete="given-name"
            required
            value={form.firstName}
            onChange={(e) => set('firstName', e.target.value)}
          />
          <TextField
            label="Achternaam"
            autoComplete="family-name"
            required
            value={form.lastName}
            onChange={(e) => set('lastName', e.target.value)}
          />
        </div>
        <TextField
          label="Bedrijfsnaam (optioneel)"
          autoComplete="organization"
          value={form.companyName}
          onChange={(e) => set('companyName', e.target.value)}
        />
        <div className="grid gap-3 md:grid-cols-[1fr_120px_120px]">
          <TextField
            label="Straat"
            autoComplete="address-line1"
            required
            value={form.street}
            onChange={(e) => set('street', e.target.value)}
          />
          <TextField
            label="Huisnr."
            autoComplete="address-line2"
            required
            value={form.houseNumber}
            onChange={(e) => set('houseNumber', e.target.value)}
          />
          <TextField
            label="Toev."
            value={form.addition}
            onChange={(e) => set('addition', e.target.value)}
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <TextField
            label="Postcode"
            autoComplete="postal-code"
            required
            value={form.postalCode}
            onChange={(e) => set('postalCode', e.target.value)}
          />
          <TextField
            label="Plaats"
            autoComplete="address-level2"
            required
            value={form.city}
            onChange={(e) => set('city', e.target.value)}
          />
        </div>
        <TextField
          label="Telefoon (optioneel)"
          autoComplete="tel"
          value={form.phone}
          onChange={(e) => set('phone', e.target.value)}
        />
        <TextField
          label="Label (optioneel)"
          value={form.label}
          onChange={(e) => set('label', e.target.value)}
          hint="Bijvoorbeeld Thuis of Magazijn."
        />
        <CheckField
          label="Standaard afleveradres"
          checked={form.isDefaultShipping}
          onChange={(value) => set('isDefaultShipping', value)}
        />
        <CheckField
          label="Standaard factuuradres"
          checked={form.isDefaultBilling}
          onChange={(value) => set('isDefaultBilling', value)}
        />
        {error ? <p className="text-[14px] text-red-700">{error}</p> : null}
        <Button type="submit" disabled={save.isPending}>
          Adres opslaan
        </Button>
      </form>
    </>
  )
}

function AddressCard({ address, onDelete }: { address: AccountAddress; onDelete: () => void }) {
  return (
    <article className="rounded-[12px] bg-white p-5 ring-1 ring-line">
      <p className="font-medium">
        {address.firstName} {address.lastName}
        {address.label ? (
          <span className="ml-2 text-[13px] text-muted">({address.label})</span>
        ) : null}
      </p>
      {address.companyName ? <p className="text-[14px]">{address.companyName}</p> : null}
      <p className="text-[14px] text-muted">
        {address.street} {address.houseNumber}
        {address.addition} , {address.postalCode} {address.city}
      </p>
      <p className="mt-2 text-[13px] text-muted">
        {address.isDefaultShipping ? 'Standaard afleveradres' : null}
        {address.isDefaultShipping && address.isDefaultBilling ? ' · ' : null}
        {address.isDefaultBilling ? 'Standaard factuuradres' : null}
      </p>
      <button
        type="button"
        className="mt-3 text-[14px] text-brand hover:underline"
        onClick={onDelete}
      >
        Verwijderen
      </button>
    </article>
  )
}
