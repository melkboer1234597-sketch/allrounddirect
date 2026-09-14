import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { SeoHead } from '@/components/seo/SeoHead'
import { TextField } from '@/components/account/Fields'
import { Button } from '@/components/ui/Button'
import { adminFetch, adminUpload, formatCents } from '@/lib/admin-api'
import { deliveryLabelFull, deliveryLabelShort } from '../../../shared/commerce'

const TABS = [
  'Algemeen',
  'Prijzen',
  'Media',
  'Voorraad & levering',
  'Varianten',
  'Specificaties',
  'SEO',
  'Bron',
  'Leverancier',
  'Zakelijk',
] as const

type ProductPayload = {
  product: {
    id: string
    name: string
    slug: string
    description: string | null
    shortDescription: string | null
    sku: string | null
    ean: string | null
    status: string
    priceInclCents: number | null
    vatPercent: number
    compareAtInclCents: number | null
    costPriceCents: number | null
    priceExclCents: number | null
    marginCents: number | null
    marginPercent: number | null
    supplierId: string | null
    supplierSku: string | null
    stockStatus: string
    stockQuantity: number | null
    leadTimeMinDays: number | null
    leadTimeMaxDays: number | null
    deliveryType: string | null
    isOutlet: boolean
    isFeatured?: boolean
    isBusinessOnly: boolean
    specificationsJson: string | null
    seoTitle: string | null
    seoDescription: string | null
    canonicalOverride: string | null
    robots: string
    ogImage: string | null
    categoryId: string | null
    subcategoryId: string | null
    brandId: string | null
    sourceName: string | null
    sourceUrl: string | null
    sourceProductId: string | null
    sourceRightsStatus: string | null
  }
  images: Array<{
    id: string
    url: string
    alt: string | null
    isPrimary?: boolean
    sortOrder?: number
    imageStatus?: string | null
  }>
  variants: Array<{ id: string; name: string; sku: string | null; priceInclCents: number | null }>
}

export function AdminProductEditorPage() {
  const { id } = useParams()
  const isNew = id === 'new' || !id
  const navigate = useNavigate()
  const client = useQueryClient()
  const [tab, setTab] = useState<(typeof TABS)[number]>('Algemeen')
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    shortDescription: '',
    sku: '',
    ean: '',
    status: 'draft',
    priceInclCents: '',
    vatPercent: '21',
    compareAtInclCents: '',
    costPriceCents: '',
    supplierSku: '',
    stockStatus: 'unknown',
    stockQuantity: '',
    leadTimeMinDays: '',
    leadTimeMaxDays: '',
    deliveryType: '',
    isOutlet: false,
    isFeatured: false,
    isBusinessOnly: false,
    specificationsJson: '{}',
    seoTitle: '',
    seoDescription: '',
    canonicalOverride: '',
    robots: 'index,follow',
    ogImage: '',
    categoryId: '',
    sourceName: '',
    sourceUrl: '',
    sourceProductId: '',
    sourceRightsStatus: 'needs_review',
  })
  const [variantName, setVariantName] = useState('')

  const detail = useQuery({
    queryKey: ['admin', 'product', id],
    queryFn: () => adminFetch<ProductPayload>(`/products/${id}`),
    enabled: !isNew,
  })

  useEffect(() => {
    const product = detail.data?.product
    if (!product) return
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description ?? '',
      shortDescription: product.shortDescription ?? '',
      sku: product.sku ?? '',
      ean: product.ean ?? '',
      status: product.status,
      priceInclCents: product.priceInclCents != null ? String(product.priceInclCents / 100) : '',
      vatPercent: String(product.vatPercent),
      compareAtInclCents:
        product.compareAtInclCents != null ? String(product.compareAtInclCents / 100) : '',
      costPriceCents: product.costPriceCents != null ? String(product.costPriceCents / 100) : '',
      supplierSku: product.supplierSku ?? '',
      stockStatus: product.stockStatus,
      stockQuantity: product.stockQuantity != null ? String(product.stockQuantity) : '',
      leadTimeMinDays: product.leadTimeMinDays != null ? String(product.leadTimeMinDays) : '',
      leadTimeMaxDays: product.leadTimeMaxDays != null ? String(product.leadTimeMaxDays) : '',
      deliveryType: product.deliveryType ?? '',
      isOutlet: product.isOutlet,
      isFeatured: Boolean(product.isFeatured),
      isBusinessOnly: product.isBusinessOnly,
      specificationsJson: product.specificationsJson ?? '{}',
      seoTitle: product.seoTitle ?? '',
      seoDescription: product.seoDescription ?? '',
      canonicalOverride: product.canonicalOverride ?? '',
      robots: product.robots,
      ogImage: product.ogImage ?? '',
      categoryId: product.subcategoryId ?? product.categoryId ?? '',
      sourceName: product.sourceName ?? '',
      sourceUrl: product.sourceUrl ?? '',
      sourceProductId: product.sourceProductId ?? '',
      sourceRightsStatus: product.sourceRightsStatus ?? 'needs_review',
    })
  }, [detail.data])

  function eurosToCents(value: string) {
    if (!value.trim()) return null
    return Math.round(Number(value.replace(',', '.')) * 100)
  }

  const body = () => ({
    name: form.name,
    slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: form.description || null,
    shortDescription: form.shortDescription || null,
    sku: form.sku || null,
    ean: form.ean || null,
    status: form.status,
    priceInclCents: eurosToCents(form.priceInclCents),
    vatPercent: Number(form.vatPercent) || 21,
    compareAtInclCents: eurosToCents(form.compareAtInclCents),
    costPriceCents: eurosToCents(form.costPriceCents),
    supplierSku: form.supplierSku || null,
    stockStatus: form.stockStatus,
    stockQuantity: form.stockQuantity ? Number(form.stockQuantity) : null,
    leadTimeMinDays: form.leadTimeMinDays ? Number(form.leadTimeMinDays) : null,
    leadTimeMaxDays: form.leadTimeMaxDays ? Number(form.leadTimeMaxDays) : null,
    deliveryType: form.deliveryType || null,
    isOutlet: form.isOutlet,
    isFeatured: form.isFeatured,
    isBusinessOnly: form.isBusinessOnly,
    specificationsJson: form.specificationsJson || null,
    seoTitle: form.seoTitle || null,
    seoDescription: form.seoDescription || null,
    canonicalOverride: form.canonicalOverride || null,
    robots: form.robots,
    ogImage: form.ogImage || null,
    subcategoryId: form.categoryId || null,
    sourceName: form.sourceName || null,
    sourceUrl: form.sourceUrl || null,
    sourceProductId: form.sourceProductId || null,
    sourceRightsStatus: form.sourceRightsStatus || 'needs_review',
  })

  const save = useMutation({
    mutationFn: async () => {
      if (isNew) {
        const created = await adminFetch<{ id: string }>('/products', {
          method: 'POST',
          body: JSON.stringify(body()),
        })
        navigate(`/scotdejewish/products/${created.id}`)
        return
      }
      await adminFetch(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(body()) })
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['admin', 'product', id] }),
  })

  const vat = Number(form.vatPercent) || 21
  const incl = eurosToCents(form.priceInclCents)
  const excl = incl != null ? Math.round(incl / (1 + vat / 100)) : null
  const cost = eurosToCents(form.costPriceCents)
  const margin = excl != null && cost != null ? excl - cost : null
  const marginPct = excl && margin != null ? Math.round((margin / excl) * 1000) / 10 : null

  return (
    <>
      <SeoHead
        title="Product | Beheer"
        description="Producteditor."
        path={`/scotdejewish/products/${id}`}
        robots="noindex,nofollow"
      />
      <h1 className="font-heading text-[24px] font-semibold text-navy">
        {isNew ? 'Nieuw product' : form.name || 'Product'}
      </h1>
      <div className="mt-4 flex flex-wrap gap-1">
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            className={`min-h-10 rounded-[4px] px-3 text-[13px] ${tab === item ? 'bg-navy text-white' : 'bg-white ring-1 ring-line'}`}
            onClick={() => setTab(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <form
        className="mt-4 max-w-3xl space-y-3 rounded-[8px] bg-white p-4 ring-1 ring-line"
        onSubmit={(event) => {
          event.preventDefault()
          save.mutate()
        }}
      >
        {tab === 'Algemeen' ? (
          <>
            <TextField
              label="Naam"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <TextField
              label="Slug"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
            <TextField
              label="Korte omschrijving"
              value={form.shortDescription}
              onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
            />
            <label className="block text-[14px] font-medium">
              Omschrijving
              <textarea
                className="mt-1 min-h-28 w-full rounded-[4px] border border-line p-3 text-[15px]"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </label>
            <TextField
              label="SKU"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
            />
            <TextField
              label="EAN (optioneel)"
              value={form.ean}
              onChange={(e) => setForm({ ...form, ean: e.target.value })}
            />
            <TextField
              label="Categorie-ID"
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              hint="UUID van catalog_categories (subcategorie)."
            />
            <label className="block text-[14px] font-medium">
              Status
              <select
                className="mt-1 h-11 w-full rounded-[4px] border border-line px-3"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="draft">Concept</option>
                <option value="active">Actief</option>
                <option value="archived">Gearchiveerd</option>
              </select>
            </label>
          </>
        ) : null}
        {tab === 'Prijzen' ? (
          <>
            <TextField
              label="Prijs incl. btw (€)"
              value={form.priceInclCents}
              onChange={(e) => setForm({ ...form, priceInclCents: e.target.value })}
            />
            <TextField
              label="BTW %"
              value={form.vatPercent}
              onChange={(e) => setForm({ ...form, vatPercent: e.target.value })}
            />
            <p className="text-[14px]">Prijs excl. btw: {formatCents(excl)}</p>
            <TextField
              label="Vergelijkprijs incl. btw (alleen indien echt)"
              value={form.compareAtInclCents}
              onChange={(e) => setForm({ ...form, compareAtInclCents: e.target.value })}
            />
            <TextField
              label="Inkoopprijs excl. btw (€, intern)"
              value={form.costPriceCents}
              onChange={(e) => setForm({ ...form, costPriceCents: e.target.value })}
            />
            <div className="rounded-[4px] bg-surface p-3 text-[14px]">
              <p>Verkoop excl. btw: {formatCents(excl)}</p>
              <p>Inkoop: {formatCents(cost)}</p>
              <p>Brutomarge: {formatCents(margin)}</p>
              <p>Brutomarge %: {marginPct == null ? 'n.v.t.' : `${marginPct}%`}</p>
              <p className="mt-1 text-[12px] text-muted">Alleen zichtbaar in beheer.</p>
            </div>
          </>
        ) : null}
        {tab === 'Media' ? (
          <>
            {!isNew ? (
              <>
                <ul className="space-y-2">
                  {(detail.data?.images ?? []).map((image, index) => (
                    <li key={image.id} className="flex items-center gap-3">
                      <img src={image.url} alt="" className="h-12 w-12 object-cover" />
                      <span className="text-[12px] text-muted">
                        #{index + 1}
                        {image.isPrimary ? ' primair' : ''}
                        {image.imageStatus && image.imageStatus !== 'ok'
                          ? ` · ${image.imageStatus}`
                          : ''}
                      </span>
                      <button
                        type="button"
                        className="text-brand"
                        onClick={() =>
                          adminFetch(`/products/${id}/images`, {
                            method: 'PATCH',
                            body: JSON.stringify({
                              items: (detail.data?.images ?? []).map((item, itemIndex) => ({
                                id: item.id,
                                sortOrder: itemIndex,
                                isPrimary: item.id === image.id,
                                imageStatus: 'ok',
                              })),
                            }),
                          }).then(() =>
                            client.invalidateQueries({ queryKey: ['admin', 'product', id] }),
                          )
                        }
                      >
                        Primair
                      </button>
                      <button
                        type="button"
                        className="text-brand"
                        onClick={() =>
                          adminFetch(`/products/${id}/images`, {
                            method: 'PATCH',
                            body: JSON.stringify({
                              items: (detail.data?.images ?? []).map((item, itemIndex) => ({
                                id: item.id,
                                sortOrder: itemIndex,
                                isPrimary: item.isPrimary,
                                imageStatus: item.id === image.id ? 'excluded' : item.imageStatus,
                              })),
                            }),
                          }).then(() =>
                            client.invalidateQueries({ queryKey: ['admin', 'product', id] }),
                          )
                        }
                      >
                        Uitsluiten
                      </button>
                      <button
                        type="button"
                        className="text-brand"
                        onClick={() =>
                          adminFetch(`/products/${id}/images`, {
                            method: 'PATCH',
                            body: JSON.stringify({
                              items: (detail.data?.images ?? []).map((item, itemIndex) => ({
                                id: item.id,
                                sortOrder: itemIndex,
                                isPrimary: item.isPrimary,
                                imageStatus: item.id === image.id ? 'ok' : item.imageStatus,
                              })),
                            }),
                          }).then(() =>
                            client.invalidateQueries({ queryKey: ['admin', 'product', id] }),
                          )
                        }
                      >
                        Goedkeuren beeld
                      </button>
                      <button
                        type="button"
                        className="text-brand"
                        onClick={() =>
                          adminFetch(`/products/${id}/images/${image.id}`, {
                            method: 'DELETE',
                          }).then(() =>
                            client.invalidateQueries({ queryKey: ['admin', 'product', id] }),
                          )
                        }
                      >
                        Verwijderen
                      </button>
                    </li>
                  ))}
                </ul>
                <label className="block text-[14px] font-medium">
                  Nieuwe foto (R2)
                  <input
                    type="file"
                    accept="image/*"
                    className="mt-1 block"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (!file || !id) return
                      const form = new FormData()
                      form.append('file', file)
                      void adminUpload(`/products/${id}/images`, form).then(() =>
                        client.invalidateQueries({ queryKey: ['admin', 'product', id] }),
                      )
                    }}
                  />
                </label>
              </>
            ) : (
              <p className="text-[14px] text-muted">
                Sla het product eerst op om media toe te voegen.
              </p>
            )}
          </>
        ) : null}
        {tab === 'Voorraad & levering' ? (
          <>
            <label className="block text-[14px] font-medium">
              Voorraadstatus
              <select
                className="mt-1 h-11 w-full rounded-[4px] border border-line px-3"
                value={form.stockStatus}
                onChange={(e) => setForm({ ...form, stockStatus: e.target.value })}
              >
                <option value="unknown">Onbekend</option>
                <option value="in_stock">Op voorraad</option>
                <option value="low">Laag</option>
                <option value="out_of_stock">Niet op voorraad</option>
                <option value="backorder">Nalevering</option>
              </select>
            </label>
            <TextField
              label="Voorraadantal"
              value={form.stockQuantity}
              onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
            />
            <div className="rounded-[8px] bg-surface px-4 py-3 text-[13px] text-ink">
              <p className="font-medium">Effectief op de webshop</p>
              <p className="mt-1 text-muted">
                Standaard levering: {deliveryLabelShort()} ({deliveryLabelFull()}).
                Productvelden hieronder zijn bron-/auditmetadata en overrulen de
                storefront-policy niet, tenzij later een expliciete override wordt
                geactiveerd.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="Bron levertijd min (dagen)"
                value={form.leadTimeMinDays}
                onChange={(e) => setForm({ ...form, leadTimeMinDays: e.target.value })}
              />
              <TextField
                label="Bron levertijd max (dagen)"
                value={form.leadTimeMaxDays}
                onChange={(e) => setForm({ ...form, leadTimeMaxDays: e.target.value })}
              />
            </div>
            <TextField
              label="Levertype"
              value={form.deliveryType}
              onChange={(e) => setForm({ ...form, deliveryType: e.target.value })}
            />
          </>
        ) : null}
        {tab === 'Varianten' ? (
          <>
            {!isNew ? (
              <>
                <ul className="text-[14px]">
                  {(detail.data?.variants ?? []).map((variant) => (
                    <li key={variant.id} className="flex justify-between border-b border-line py-2">
                      <span>
                        {variant.name} · {variant.sku ?? 'geen SKU'}
                      </span>
                      <button
                        type="button"
                        className="text-brand"
                        onClick={() =>
                          adminFetch(`/products/${id}/variants/${variant.id}`, {
                            method: 'DELETE',
                          }).then(() =>
                            client.invalidateQueries({ queryKey: ['admin', 'product', id] }),
                          )
                        }
                      >
                        Verwijderen
                      </button>
                    </li>
                  ))}
                </ul>
                <TextField
                  label="Variantnaam"
                  value={variantName}
                  onChange={(e) => setVariantName(e.target.value)}
                  hint="Bijvoorbeeld Antraciet / Links / 160 cm"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    adminFetch(`/products/${id}/variants`, {
                      method: 'POST',
                      body: JSON.stringify({ name: variantName, optionsJson: '{}' }),
                    }).then(() => {
                      setVariantName('')
                      void client.invalidateQueries({ queryKey: ['admin', 'product', id] })
                    })
                  }
                >
                  Variant toevoegen
                </Button>
              </>
            ) : (
              <p className="text-[14px] text-muted">Sla eerst op om varianten toe te voegen.</p>
            )}
          </>
        ) : null}
        {tab === 'Specificaties' ? (
          <label className="block text-[14px] font-medium">
            Specificaties (JSON)
            <textarea
              className="mt-1 min-h-32 w-full rounded-[4px] border border-line p-3 font-mono text-[13px]"
              value={form.specificationsJson}
              onChange={(e) => setForm({ ...form, specificationsJson: e.target.value })}
            />
          </label>
        ) : null}
        {tab === 'Bron' ? (
          <>
            <p className="text-[13px] text-muted">Alleen intern. Niet zichtbaar in de webshop.</p>
            <TextField
              label="Bronnaam"
              value={form.sourceName}
              onChange={(e) => setForm({ ...form, sourceName: e.target.value })}
            />
            <TextField
              label="Bron-URL"
              value={form.sourceUrl}
              onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
            />
            <TextField
              label="Bron product-ID"
              value={form.sourceProductId}
              onChange={(e) => setForm({ ...form, sourceProductId: e.target.value })}
            />
            <label className="block text-[14px] font-medium">
              Rechtenstatus
              <select
                className="mt-1 h-11 w-full rounded-[4px] border border-line px-3"
                value={form.sourceRightsStatus}
                onChange={(e) => setForm({ ...form, sourceRightsStatus: e.target.value })}
              >
                <option value="needs_review">Needs review</option>
                <option value="unknown">Onbekend</option>
                <option value="cleared">Goedgekeurd</option>
                <option value="blocked">Geblokkeerd</option>
              </select>
            </label>
          </>
        ) : null}
        {tab === 'SEO' ? (
          <>
            <p className="text-[13px] text-muted">
              Leeg laten gebruikt defaults: titel = productnaam, description = korte omschrijving.
            </p>
            <TextField
              label="SEO-titel"
              value={form.seoTitle}
              onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
            />
            <TextField
              label="Meta description"
              value={form.seoDescription}
              onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
            />
            <TextField
              label="Canonical override (advanced)"
              value={form.canonicalOverride}
              onChange={(e) => setForm({ ...form, canonicalOverride: e.target.value })}
            />
            <TextField
              label="Robots"
              value={form.robots}
              onChange={(e) => setForm({ ...form, robots: e.target.value })}
            />
            <TextField
              label="OG-afbeelding URL"
              value={form.ogImage}
              onChange={(e) => setForm({ ...form, ogImage: e.target.value })}
            />
          </>
        ) : null}
        {tab === 'Leverancier' ? (
          <>
            <TextField
              label="Leverancier-SKU"
              value={form.supplierSku}
              onChange={(e) => setForm({ ...form, supplierSku: e.target.value })}
            />
            <p className="text-[13px] text-muted">
              Koppel een leverancier via de leverancierslijst (supplier_id).
            </p>
          </>
        ) : null}
        {tab === 'Zakelijk' ? (
          <>
            <label className="flex gap-2 text-[14px]">
              <input
                type="checkbox"
                checked={form.isOutlet}
                onChange={(e) => setForm({ ...form, isOutlet: e.target.checked })}
              />
              Outlet
            </label>
            <label className="flex gap-2 text-[14px]">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
              />
              Uitgelicht op homepage
            </label>
            <label className="flex gap-2 text-[14px]">
              <input
                type="checkbox"
                checked={form.isBusinessOnly}
                onChange={(e) => setForm({ ...form, isBusinessOnly: e.target.checked })}
              />
              Alleen zakelijk
            </label>
          </>
        ) : null}
        <Button type="submit" disabled={save.isPending}>
          Opslaan
        </Button>
      </form>
    </>
  )
}
