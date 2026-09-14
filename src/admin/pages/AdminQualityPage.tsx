import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { SeoHead } from '@/components/seo/SeoHead'
import { Button } from '@/components/ui/Button'
import { adminFetch, formatCents } from '@/lib/admin-api'

type Row = {
  id: string
  name: string
  sku: string | null
  category: string | null
  status: string
  priceInclCents: number | null
  reviewStatus?: string
  qualityFlags?: string
  image: string | null
}

const FLAGS = [
  { id: '', label: 'Alle meldingen' },
  { id: 'suspicious_images', label: 'Verdachte afbeeldingen' },
  { id: 'missing_image', label: 'Geen afbeelding' },
  { id: 'duplicate_images', label: 'Dubbele afbeeldingen' },
  { id: 'missing_price', label: 'Geen prijs' },
  { id: 'german_text', label: 'Duitse tekst' },
  { id: 'missing_description', label: 'Geen omschrijving' },
  { id: 'ambiguous_category', label: 'Categorie onduidelijk' },
  { id: 'image_mismatch', label: 'Beeld hoort niet bij product' },
  { id: 'needs_review', label: 'Rights review' },
]

export function AdminQualityPage() {
  const [flag, setFlag] = useState('suspicious_images')
  const [missingPrice, setMissingPrice] = useState(false)
  const [missingImage, setMissingImage] = useState(false)
  const [rightsReview, setRightsReview] = useState(false)
  const client = useQueryClient()
  const qualityFlag = flag === 'needs_review' ? '' : flag
  const { data, isPending } = useQuery({
    queryKey: ['admin', 'quality', flag, missingPrice, missingImage, rightsReview],
    queryFn: () => {
      const params = new URLSearchParams()
      params.set('reviewStatus', 'needs_review')
      if (qualityFlag) params.set('qualityFlag', qualityFlag)
      if (missingPrice) params.set('missingPrice', '1')
      if (missingImage) params.set('missingImage', '1')
      if (rightsReview) params.set('rightsReview', '1')
      return adminFetch<{ products: Row[] }>(`/products?${params.toString()}`)
    },
  })
  const approve = useMutation({
    mutationFn: (id: string) =>
      adminFetch(`/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ reviewStatus: 'ok', qualityFlags: '[]' }),
      }),
    onSuccess: () => client.invalidateQueries({ queryKey: ['admin', 'quality'] }),
  })

  const rows = data?.products ?? []

  return (
    <>
      <SeoHead
        title="Cataloguskwaliteit | Beheer"
        description="Reviewwachtrij."
        path="/scotdejewish/quality"
        robots="noindex,nofollow"
      />
      <h1 className="font-heading text-[24px] font-semibold text-navy">Cataloguskwaliteit</h1>
      <p className="mt-2 max-w-3xl text-[14px] text-muted">
        Automatisch herkende problemen. Publiceer of pas titels, categorieën en galerijvolgorde aan
        in het product. Verdachte beelden staan standaard uit in de webshop.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <select
          className="h-11 rounded-[4px] border border-line px-3 text-[14px]"
          value={flag}
          onChange={(event) => setFlag(event.target.value)}
        >
          {FLAGS.map((item) => (
            <option key={item.id || 'all'} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-[13px]">
          <input
            type="checkbox"
            checked={missingPrice}
            onChange={(event) => setMissingPrice(event.target.checked)}
          />
          Mist prijs
        </label>
        <label className="flex items-center gap-2 text-[13px]">
          <input
            type="checkbox"
            checked={missingImage}
            onChange={(event) => setMissingImage(event.target.checked)}
          />
          Mist afbeelding
        </label>
        <label className="flex items-center gap-2 text-[13px]">
          <input
            type="checkbox"
            checked={rightsReview}
            onChange={(event) => setRightsReview(event.target.checked)}
          />
          Rights review
        </label>
      </div>
      <div className="mt-4 overflow-x-auto rounded-[8px] bg-white ring-1 ring-line">
        {isPending ? (
          <p className="p-4 text-muted">Laden…</p>
        ) : (
          <table className="w-full min-w-[900px] text-left text-[13px]">
            <thead className="border-b border-line bg-surface text-muted">
              <tr>
                <th className="px-3 py-2">Beeld</th>
                <th className="px-3 py-2">Product</th>
                <th className="px-3 py-2">Categorie</th>
                <th className="px-3 py-2">Prijs</th>
                <th className="px-3 py-2">Flags</th>
                <th className="px-3 py-2">Actie</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td className="px-3 py-4 text-muted" colSpan={6}>
                    Geen items in deze filter.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-b border-line">
                    <td className="px-3 py-2">
                      {row.image ? (
                        <img src={row.image} alt="" className="h-12 w-12 rounded object-cover" />
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <Link to={`/scotdejewish/products/${row.id}`} className="text-brand hover:underline">
                        {row.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{row.category ?? 'n.v.t.'}</td>
                    <td className="px-3 py-2">{formatCents(row.priceInclCents)}</td>
                    <td className="px-3 py-2 text-[12px]">{row.qualityFlags ?? '[]'}</td>
                    <td className="px-3 py-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => approve.mutate(row.id)}
                      >
                        Goedkeuren
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
