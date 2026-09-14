import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { SeoHead } from '@/components/seo/SeoHead'
import { TextField } from '@/components/account/Fields'
import { Button } from '@/components/ui/Button'
import { useAccount } from '@/hooks/useAccount'
import { updateProfile } from '@/lib/account-api'

export function ProfilePage() {
  const { user, refetch } = useAccount()
  const [firstName, setFirstName] = useState(user.firstName)
  const [lastName, setLastName] = useState(user.lastName)
  const [phone, setPhone] = useState(user.phone ?? '')
  const [companyName, setCompanyName] = useState(user.companyName ?? '')
  const [kvk, setKvk] = useState(user.kvk ?? '')
  const [vatNumber, setVatNumber] = useState(user.vatNumber ?? '')
  const [message, setMessage] = useState('')

  useEffect(() => {
    setFirstName(user.firstName)
    setLastName(user.lastName)
    setPhone(user.phone ?? '')
    setCompanyName(user.companyName ?? '')
    setKvk(user.kvk ?? '')
    setVatNumber(user.vatNumber ?? '')
  }, [user])

  const save = useMutation({
    mutationFn: () =>
      updateProfile({
        firstName,
        lastName,
        phone: phone || null,
        companyName: companyName || null,
        kvk: kvk || null,
        vatNumber: vatNumber || null,
      }),
    onSuccess: async () => {
      await refetch()
      setMessage('Gegevens opgeslagen.')
    },
  })

  return (
    <>
      <SeoHead
        title="Mijn gegevens | AllRound Direct"
        description="Beheer uw accountgegevens."
        path="/account/gegevens"
        robots="noindex,nofollow"
      />
      <h1 className="font-heading text-[26px] font-semibold text-navy">Mijn gegevens</h1>
      <form
        className="mt-4 max-w-xl space-y-3 rounded-[12px] bg-white p-5 ring-1 ring-line"
        onSubmit={(event) => {
          event.preventDefault()
          setMessage('')
          save.mutate()
        }}
      >
        <TextField label="E-mailadres" value={user.email} disabled autoComplete="email" />
        <div className="grid gap-3 md:grid-cols-2">
          <TextField
            label="Voornaam"
            autoComplete="given-name"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <TextField
            label="Achternaam"
            autoComplete="family-name"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <TextField
          label="Telefoonnummer (optioneel)"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <p className="text-[13px] text-muted">
          Zakelijke velden zijn optioneel en later uitbreidbaar.
        </p>
        <TextField
          label="Bedrijfsnaam"
          autoComplete="organization"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />
        <TextField label="KVK (optioneel)" value={kvk} onChange={(e) => setKvk(e.target.value)} />
        <TextField
          label="BTW-nummer (optioneel)"
          value={vatNumber}
          onChange={(e) => setVatNumber(e.target.value)}
        />
        {message ? <p className="text-[14px] text-ink">{message}</p> : null}
        <Button type="submit" disabled={save.isPending}>
          Opslaan
        </Button>
      </form>
    </>
  )
}
