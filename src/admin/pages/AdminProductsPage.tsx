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
  stockStatus: string
  leadTime: string | null
  updatedAt: string
  image: string | null
  sourceName: string | null
  sourceRightsStatus: string | null
}

export function AdminProductsPage() {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [source, setSource] = useState('')
  const [missingPrice, setMissingPrice] = useState(false)
  const [missingImage, setMissingImage] = useState(false)
  const [rightsReview, setRightsReview] = useState(false)
  const [bulkCategory, setBulkCategory] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const client = useQueryClient()
  const { data: categories } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () =>
      adminFetch<{ items: Array<{ id: string; name: string; slug: string }> }>('/categories'),
  })
  const { data, isPending } = useQuery({
    queryKey: [
      'admin',
      'products',
      q,
      status,
      categoryId,
      source,
      missingPrice,
      missingImage,
      rightsReview,
    ],
    queryFn: () => {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (status) params.set('status', status)
      if (categoryId) params.set('categoryId', categoryId)
      if (source) params.set('source', source)
      if (missingPrice) params.set('missingPrice', '1')
      if (missingImage) params.set('missingImage', '1')
      if (rightsReview) params.set('rightsReview', '1')
      return adminFetch<{ products: Row[] }>(`/products?${params.toString()}`)
    },
  })
  const bulk = useMutation({
    mutationFn: (payload: { action: 'activate' | 'draft' | 'set_category'; categoryId?: string }) =>
      adminFetch('/products/bulk', {
        method: 'POST',
        body: JSON.stringify({ ids: selected, ...payload }),
      }),
    onSuccess: () => {
      setSelected([])
      void client.invalidateQueries({ queryKey: ['admin', 'products'] })
    },
  })

  const rows = data?.products ?? []

  return (
    <>
      <SeoHead
        title="Producten | Beheer"
        description="Productbeheer."
        path="/scotdejewish/products"
        robots="noindex,nofollow"
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-[24px] font-semibold text-navy">Producten</h1>
        <Button to="/scotdejewish/products/new">Nieuw product</Button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <input
          className="h-11 rounded-[4px] border border-line px-3 text-[14px]"
          placeholder="Zoek naam of SKU"
          value={q}
          onChange={(event) => setQ(event.target.value)}
        />
        <select
          className="h-11 rounded-[4px] border border-line px-3 text-[14px]"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="">Alle statussen</option>
          <option value="draft">Concept</option>
          <option value="active">Actief</option>
          <option value="archived">Gearchiveerd</option>
        </select>
        <select
          className="h-11 rounded-[4px] border border-line px-3 text-[14px]"
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
        >
          <option value="">Alle categorieën</option>
          {(categories?.items ?? []).map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <input
          className="h-11 rounded-[4px] border border-line px-3 text-[14px]"
          placeholder="Bron"
          value={source}
          onChange={(event) => setSource(event.target.value)}
        />
        <label className="flex items-center gap-2 text-[13px]">
          <input
            type="checkbox"
            checked={missingPrice}
            onChange={(e) => setMissingPrice(e.target.checked)}
          />
          Mist prijs
        </label>
        <label className="flex items-center gap-2 text-[13px]">
          <input
            type="checkbox"
            checked={missingImage}
            onChange={(e) => setMissingImage(e.target.checked)}
          />
          Mist afbeelding
        </label>
        <label className="flex items-center gap-2 text-[13px]">
          <input
            type="checkbox"
            checked={rightsReview}
            onChange={(e) => setRightsReview(e.target.checked)}
          />
          Needs rights review
        </label>
      </div>
      {selected.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => bulk.mutate({ action: 'activate' })}
          >
            Publiceren
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => bulk.mutate({ action: 'draft' })}
          >
            Terug naar concept
          </Button>
          <select
            className="h-11 rounded-[4px] border border-line px-3 text-[14px]"
            value={bulkCategory}
            onChange={(event) => setBulkCategory(event.target.value)}
          >
            <option value="">Categorie voor selectie</option>
            {(categories?.items ?? []).map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="secondary"
            disabled={!bulkCategory}
            onClick={() => bulk.mutate({ action: 'set_category', categoryId: bulkCategory })}
          >
            Categorie aanpassen
          </Button>
        </div>
      ) : null}
      <div className="mt-4 overflow-x-auto rounded-[8px] bg-white ring-1 ring-line">
        {isPending ? (
          <p className="p-4 text-muted">Laden…</p>
        ) : (
          <table className="w-full min-w-[1100px] text-left text-[13px]">
            <thead className="border-b border-line bg-surface text-muted">
              <tr>
                <th className="px-3 py-2">
                  <input
                    type="checkbox"
                    aria-label="Alles selecteren"
                    checked={rows.length > 0 && selected.length === rows.length}
                    onChange={(event) =>
                      setSelected(event.target.checked ? rows.map((row) => row.id) : [])
                    }
                  />
                </th>
                <th className="px-3 py-2">Afbeelding</th>
                <th className="px-3 py-2">Naam</th>
                <th className="px-3 py-2">SKU</th>
                <th className="px-3 py-2">Categorie</th>
                <th className="px-3 py-2">Prijs</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Bron</th>
                <th className="px-3 py-2">Laatst gewijzigd</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td className="px-3 py-4 text-muted" colSpan={9}>
                    0 producten
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-b border-line">
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selected.includes(row.id)}
                        onChange={(event) =>
                          setSelected((current) =>
                            event.target.checked
                              ? [...current, row.id]
                              : current.filter((item) => item !== row.id),
                          )
                        }
                      />
                    </td>
                    <td className="px-3 py-2">
                      {row.image ? (
                        <img src={row.image} alt="" className="h-10 w-10 rounded object-cover" />
                      ) : (
                        <span className="text-[12px] text-muted">geen beeld</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        to={`/scotdejewish/products/${row.id}`}
                        className="text-brand hover:underline"
                      >
                        {row.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{row.sku ?? 'n.v.t.'}</td>
                    <td className="px-3 py-2">{row.category ?? 'n.v.t.'}</td>
                    <td className="px-3 py-2">{formatCents(row.priceInclCents)}</td>
                    <td className="px-3 py-2">{row.status}</td>
                    <td className="px-3 py-2">{row.sourceName ?? 'n.v.t.'}</td>
                    <td className="px-3 py-2">
                      {new Date(row.updatedAt).toLocaleDateString('nl-NL')}
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
