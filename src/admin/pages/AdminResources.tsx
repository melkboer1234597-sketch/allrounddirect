import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { SeoHead } from '@/components/seo/SeoHead'
import { TextField } from '@/components/account/Fields'
import { Button } from '@/components/ui/Button'
import { adminFetch, formatCents } from '@/lib/admin-api'
import { ORDER_STATUS_LABELS, type OrderStatus } from '../../../shared/order-status'

function Head({ title, path }: { title: string; path: string }) {
  return (
    <SeoHead
      title={`${title} | Beheer`}
      description={title}
      path={path}
      robots="noindex,nofollow"
    />
  )
}

export function AdminOrdersPage() {
  const { data } = useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: () =>
      adminFetch<{
        orders: Array<{
          id: string
          orderNumber: string
          customer: string
          placedAt: string
          paymentStatus: string
          statusLabel: string
          totalCents: number
        }>
      }>('/orders'),
  })
  return (
    <>
      <Head title="Bestellingen" path="/scotdejewish/orders" />
      <h1 className="font-heading text-[24px] font-semibold text-navy">Bestellingen</h1>
      <div className="mt-4 overflow-x-auto rounded-[8px] bg-white ring-1 ring-line">
        <table className="w-full min-w-[720px] text-left text-[13px]">
          <thead className="bg-surface text-muted">
            <tr>
              <th className="px-3 py-2">Nummer</th>
              <th className="px-3 py-2">Klant</th>
              <th className="px-3 py-2">Datum</th>
              <th className="px-3 py-2">Betaling</th>
              <th className="px-3 py-2">Fulfilment</th>
              <th className="px-3 py-2">Totaal</th>
            </tr>
          </thead>
          <tbody>
            {(data?.orders ?? []).length === 0 ? (
              <tr>
                <td className="px-3 py-4" colSpan={6}>
                  0
                </td>
              </tr>
            ) : (
              data?.orders.map((order) => (
                <tr key={order.id} className="border-t border-line">
                  <td className="px-3 py-2">
                    <Link
                      className="text-brand hover:underline"
                      to={`/scotdejewish/orders/${order.id}`}
                    >
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-3 py-2">{order.customer}</td>
                  <td className="px-3 py-2">{new Date(order.placedAt).toLocaleString('nl-NL')}</td>
                  <td className="px-3 py-2">{order.paymentStatus}</td>
                  <td className="px-3 py-2">{order.statusLabel}</td>
                  <td className="px-3 py-2">{formatCents(order.totalCents)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

export function AdminOrderDetailPage() {
  const { id = '' } = useParams()
  const client = useQueryClient()
  const { data } = useQuery({
    queryKey: ['admin', 'order', id],
    queryFn: () => adminFetch<Record<string, unknown>>(`/orders/${id}`),
    enabled: Boolean(id),
  })
  const order = data?.order as
    | {
        id: string
        orderNumber: string
        status: string
        statusLabel: string
        paymentStatus: string
        molliePaymentId: string | null
        guestEmail: string
        billing: Record<string, string>
        shipping: Record<string, string>
        totalCents: number
      }
    | undefined
  const transitions = (data?.allowedTransitions as OrderStatus[]) ?? []

  return (
    <>
      <Head title="Order" path={`/scotdejewish/orders/${id}`} />
      {!order ? (
        <p>Laden of niet gevonden.</p>
      ) : (
        <div className="space-y-4">
          <h1 className="font-heading text-[24px] font-semibold text-navy">{order.orderNumber}</h1>
          <p className="text-[14px]">
            {order.guestEmail} · {order.statusLabel} · betaling {order.paymentStatus}
            {order.molliePaymentId ? ` · Mollie ${order.molliePaymentId}` : ''}
          </p>
          <div className="flex flex-wrap gap-2">
            {transitions.map((status) => (
              <Button
                key={status}
                type="button"
                variant="secondary"
                onClick={() =>
                  adminFetch(`/orders/${order.id}/status`, {
                    method: 'PATCH',
                    body: JSON.stringify({ status }),
                  }).then(() => client.invalidateQueries({ queryKey: ['admin', 'order', id] }))
                }
              >
                {ORDER_STATUS_LABELS[status]}
              </Button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

function SimpleFormList({
  title,
  path,
  fetchPath,
  fields,
}: {
  title: string
  path: string
  fetchPath: string
  fields: Array<{ key: string; label: string }>
}) {
  const client = useQueryClient()
  const { data } = useQuery({
    queryKey: ['admin', fetchPath],
    queryFn: () => adminFetch<{ items: Array<Record<string, unknown>> }>(fetchPath),
  })
  const [form, setForm] = useState<Record<string, string>>({})
  return (
    <>
      <Head title={title} path={path} />
      <h1 className="font-heading text-[24px] font-semibold text-navy">{title}</h1>
      <ul className="mt-4 divide-y divide-line rounded-[8px] bg-white ring-1 ring-line">
        {(data?.items ?? []).length === 0 ? <li className="p-4 text-muted">0</li> : null}
        {(data?.items ?? []).map((item) => (
          <li key={String(item.id)} className="p-3 text-[14px]">
            {String(
              item.name ?? item.code ?? item.companyName ?? item.filename ?? item.email ?? item.id,
            )}
          </li>
        ))}
      </ul>
      <form
        className="mt-4 max-w-lg space-y-3 rounded-[8px] bg-white p-4 ring-1 ring-line"
        onSubmit={(event) => {
          event.preventDefault()
          adminFetch(fetchPath, { method: 'POST', body: JSON.stringify(form) }).then(() => {
            setForm({})
            void client.invalidateQueries({ queryKey: ['admin', fetchPath] })
          })
        }}
      >
        {fields.map((field) => (
          <TextField
            key={field.key}
            label={field.label}
            value={form[field.key] ?? ''}
            onChange={(event) => setForm({ ...form, [field.key]: event.target.value })}
          />
        ))}
        <Button type="submit">Opslaan</Button>
      </form>
    </>
  )
}

export function AdminCategoriesPage() {
  return (
    <SimpleFormList
      title="Categorieën"
      path="/scotdejewish/categories"
      fetchPath="/categories"
      fields={[
        { key: 'name', label: 'Naam' },
        { key: 'slug', label: 'Slug' },
      ]}
    />
  )
}

export function AdminBrandsPage() {
  return (
    <SimpleFormList
      title="Merken"
      path="/scotdejewish/brands"
      fetchPath="/brands"
      fields={[
        { key: 'name', label: 'Naam' },
        { key: 'slug', label: 'Slug' },
      ]}
    />
  )
}

export function AdminSuppliersPage() {
  return (
    <SimpleFormList
      title="Leveranciers"
      path="/scotdejewish/suppliers"
      fetchPath="/suppliers"
      fields={[
        { key: 'name', label: 'Naam' },
        { key: 'internalCode', label: 'Interne code' },
        { key: 'contactName', label: 'Contactpersoon' },
        { key: 'email', label: 'E-mail' },
        { key: 'phone', label: 'Telefoon' },
        { key: 'website', label: 'Website' },
        { key: 'orderEmail', label: 'Order e-mail' },
        { key: 'notes', label: 'Notities' },
        { key: 'defaultLeadTime', label: 'Standaard levertijd' },
      ]}
    />
  )
}

export function AdminCustomersPage() {
  const { data } = useQuery({
    queryKey: ['admin', 'customers'],
    queryFn: () =>
      adminFetch<{
        customers: Array<{ id: string; email: string; name: string; createdAt: string }>
      }>('/customers'),
  })
  return (
    <>
      <Head title="Klanten" path="/scotdejewish/customers" />
      <h1 className="font-heading text-[24px] font-semibold text-navy">Klanten</h1>
      <ul className="mt-4 rounded-[8px] bg-white ring-1 ring-line">
        {(data?.customers ?? []).length === 0 ? <li className="p-4">0</li> : null}
        {(data?.customers ?? []).map((customer) => (
          <li key={customer.id} className="border-b border-line p-3 text-[14px]">
            <Link
              className="text-brand hover:underline"
              to={`/scotdejewish/customers/${customer.id}`}
            >
              {customer.name}
            </Link>
            <span className="ml-2 text-muted">{customer.email}</span>
          </li>
        ))}
      </ul>
    </>
  )
}

export function AdminCustomerDetailPage() {
  const { id = '' } = useParams()
  const { data } = useQuery({
    queryKey: ['admin', 'customer', id],
    queryFn: () => adminFetch<Record<string, unknown>>(`/customers/${id}`),
  })
  const customer = data?.customer as { name?: string; email?: string } | undefined
  return (
    <>
      <Head title="Klant" path={`/scotdejewish/customers/${id}`} />
      <h1 className="font-heading text-[24px] font-semibold text-navy">{customer?.name}</h1>
      <p className="text-[14px]">{customer?.email}</p>
    </>
  )
}

export function AdminReturnsPage() {
  const { data } = useQuery({
    queryKey: ['admin', 'returns'],
    queryFn: () =>
      adminFetch<{ items: Array<{ id: string; status: string; reason: string | null }> }>(
        '/returns',
      ),
  })
  return (
    <>
      <Head title="Retouren" path="/scotdejewish/returns" />
      <h1 className="font-heading text-[24px] font-semibold text-navy">Retouren</h1>
      <ul className="mt-4 rounded-[8px] bg-white p-4 ring-1 ring-line">
        {(data?.items ?? []).length === 0
          ? '0'
          : data?.items.map((item) => <li key={item.id}>{item.status}</li>)}
      </ul>
    </>
  )
}

export function AdminQuotesPage() {
  const { data } = useQuery({
    queryKey: ['admin', 'quotes'],
    queryFn: () =>
      adminFetch<{
        items: Array<{
          id: string
          companyName: string
          contactName: string
          status: string
          products: unknown[]
        }>
      }>('/quotes'),
  })
  return (
    <>
      <Head title="Offertes" path="/scotdejewish/quotes" />
      <h1 className="font-heading text-[24px] font-semibold text-navy">Offertes</h1>
      <p className="text-[13px] text-muted">PDF-generatie volgt later.</p>
      <ul className="mt-4 rounded-[8px] bg-white p-4 ring-1 ring-line">
        {(data?.items ?? []).length === 0
          ? '0'
          : data?.items.map((item) => (
              <li key={item.id}>
                {item.companyName} · {item.contactName} · {item.status}
              </li>
            ))}
      </ul>
    </>
  )
}

export function AdminCouponsPage() {
  return (
    <SimpleFormList
      title="Kortingscodes"
      path="/scotdejewish/coupons"
      fetchPath="/coupons"
      fields={[
        { key: 'code', label: 'Code' },
        { key: 'type', label: 'Type (percent of fixed)' },
      ]}
    />
  )
}

export function AdminContentPage() {
  const client = useQueryClient()
  const { data } = useQuery({
    queryKey: ['admin', 'content'],
    queryFn: () => adminFetch<{ content: Record<string, string> }>('/content'),
  })
  const [form, setForm] = useState<Record<string, string>>({})
  const content = { ...data?.content, ...form }
  return (
    <>
      <Head title="Content" path="/scotdejewish/content" />
      <h1 className="font-heading text-[24px] font-semibold text-navy">Content</h1>
      <form
        className="mt-4 max-w-xl space-y-3"
        onSubmit={(event) => {
          event.preventDefault()
          adminFetch('/content', { method: 'PUT', body: JSON.stringify(content) }).then(() =>
            client.invalidateQueries({ queryKey: ['admin', 'content'] }),
          )
        }}
      >
        {['heroText', 'announcementBar', 'businessSection', 'outletSection'].map((key) => (
          <TextField
            key={key}
            label={key}
            value={String(content[key] ?? '')}
            onChange={(event) => setForm({ ...form, [key]: event.target.value })}
          />
        ))}
        <Button type="submit">Opslaan</Button>
      </form>
    </>
  )
}

export function AdminSeoPage() {
  const [entityType, setEntityType] = useState('page')
  const [entityId, setEntityId] = useState('/')
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  return (
    <>
      <Head title="SEO" path="/scotdejewish/seo" />
      <h1 className="font-heading text-[24px] font-semibold text-navy">SEO</h1>
      <p className="text-[13px] text-muted">
        Defaults: product gebruikt naam en korte omschrijving tot u iets overschrijft.
      </p>
      <form
        className="mt-4 max-w-xl space-y-3"
        onSubmit={(event) => {
          event.preventDefault()
          void adminFetch('/seo', {
            method: 'PUT',
            body: JSON.stringify({ entityType, entityId, seoTitle, seoDescription }),
          })
        }}
      >
        <label className="block text-[14px]">
          Type
          <select
            className="mt-1 h-11 w-full rounded-[4px] border border-line px-3"
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
          >
            <option value="page">Pagina</option>
            <option value="product">Product</option>
            <option value="category">Categorie</option>
          </select>
        </label>
        <TextField
          label="Entity id / pad"
          value={entityId}
          onChange={(e) => setEntityId(e.target.value)}
        />
        <TextField
          label="SEO-titel"
          value={seoTitle}
          onChange={(e) => setSeoTitle(e.target.value)}
        />
        <TextField
          label="Meta description"
          value={seoDescription}
          onChange={(e) => setSeoDescription(e.target.value)}
        />
        <Button type="submit">Opslaan</Button>
      </form>
    </>
  )
}

export function AdminMediaPage() {
  return (
    <SimpleFormList
      title="Media"
      path="/scotdejewish/media"
      fetchPath="/media"
      fields={[
        { key: 'url', label: 'URL' },
        { key: 'filename', label: 'Bestandsnaam' },
        { key: 'alt', label: 'Alt' },
      ]}
    />
  )
}

export function AdminImportsPage() {
  const [filename, setFilename] = useState('feed.csv')
  const [csv, setCsv] = useState('name,sku,price\n')
  const [job, setJob] = useState<{
    id: string
    headers: string[]
    preview: string[][]
    rowCount: number
  } | null>(null)
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [report, setReport] = useState<string>('')
  return (
    <>
      <Head title="Importeren" path="/scotdejewish/imports" />
      <h1 className="font-heading text-[24px] font-semibold text-navy">Importcenter</h1>
      <ol className="mt-2 list-decimal pl-5 text-[14px] text-muted">
        <li>Bestand uploaden</li>
        <li>Kolommen detecteren en mappen</li>
        <li>Validatie</li>
        <li>Dry-run</li>
        <li>Bevestigen</li>
      </ol>
      <textarea
        className="mt-4 min-h-32 w-full max-w-3xl rounded-[8px] border border-line p-3 font-mono text-[13px]"
        value={csv}
        onChange={(e) => setCsv(e.target.value)}
      />
      <div className="mt-2 flex gap-2">
        <TextField
          label="Bestandsnaam"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
        />
      </div>
      <Button
        className="mt-3"
        type="button"
        onClick={() =>
          adminFetch<{ id: string; headers: string[]; preview: string[][]; rowCount: number }>(
            '/imports',
            {
              method: 'POST',
              body: JSON.stringify({ filename, csv }),
            },
          ).then(setJob)
        }
      >
        Uploaden en kolommen detecteren
      </Button>
      {job ? (
        <div className="mt-4 space-y-3">
          <p className="text-[14px]">{job.rowCount} rijen. Preview max. 25.</p>
          <table className="text-[12px]">
            <thead>
              <tr>
                {job.headers.map((header) => (
                  <th key={header} className="px-2">
                    {header}
                    <select
                      className="ml-1 border"
                      onChange={(event) => setMapping({ ...mapping, [header]: event.target.value })}
                    >
                      <option value="">negeren</option>
                      <option value="name">naam</option>
                      <option value="sku">sku</option>
                      <option value="slug">slug</option>
                      <option value="price">prijs</option>
                    </select>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {job.preview.slice(0, 5).map((row, index) => (
                <tr key={index}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-2">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              adminFetch<{ errors: string[] }>(`/imports/${job.id}/validate`, {
                method: 'POST',
                body: JSON.stringify({ mapping }),
              }).then((result) =>
                setReport(result.errors.join(' ') || 'Validatie ok. Voer dry-run uit.'),
              )
            }
          >
            Valideren
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              adminFetch<{ message: string }>(`/imports/${job.id}/dry-run`, {
                method: 'POST',
                body: '{}',
              }).then((result) => setReport(result.message))
            }
          >
            Dry-run
          </Button>
          <Button
            type="button"
            onClick={() =>
              adminFetch<{ note: string }>(`/imports/${job.id}/confirm`, {
                method: 'POST',
                body: '{}',
              }).then((result) => setReport(result.note))
            }
          >
            Bevestigen
          </Button>
          {report ? <p className="text-[14px]">{report}</p> : null}
        </div>
      ) : null}
    </>
  )
}

export function AdminUsersPage() {
  const client = useQueryClient()
  const { data, error } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () =>
      adminFetch<{ users: Array<{ id: string; email: string; name: string; role: string }> }>(
        '/users',
      ),
    retry: false,
  })
  if (error) return <p>Geen toegang tot gebruikersbeheer.</p>
  return (
    <>
      <Head title="Gebruikers" path="/scotdejewish/users" />
      <h1 className="font-heading text-[24px] font-semibold text-navy">Gebruikers</h1>
      <ul className="mt-4 rounded-[8px] bg-white ring-1 ring-line">
        {(data?.users ?? []).map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between border-b border-line p-3 text-[14px]"
          >
            <span>
              {item.email} · {item.role}
            </span>
            <select
              className="h-10 rounded border px-2"
              value={item.role}
              onChange={(event) =>
                adminFetch(`/users/${item.id}/role`, {
                  method: 'PATCH',
                  body: JSON.stringify({ role: event.target.value }),
                }).then(() => client.invalidateQueries({ queryKey: ['admin', 'users'] }))
              }
            >
              {[
                'customer',
                'support',
                'catalog_manager',
                'order_manager',
                'admin',
                'super_admin',
              ].map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </li>
        ))}
      </ul>
    </>
  )
}

export function AdminAuditPage() {
  const { data } = useQuery({
    queryKey: ['admin', 'audit'],
    queryFn: () =>
      adminFetch<{
        items: Array<{
          id: string
          actorEmail: string
          action: string
          summary: string
          createdAt: string
        }>
      }>('/audit-log'),
    retry: false,
  })
  return (
    <>
      <Head title="Auditlog" path="/scotdejewish/audit-log" />
      <h1 className="font-heading text-[24px] font-semibold text-navy">Auditlog</h1>
      <ul className="mt-4 rounded-[8px] bg-white p-4 text-[13px] ring-1 ring-line">
        {(data?.items ?? []).length === 0
          ? '0'
          : data?.items.map((item) => (
              <li key={item.id} className="border-b border-line py-2">
                {item.actorEmail} · {item.action} · {item.summary}
              </li>
            ))}
      </ul>
    </>
  )
}

export function AdminSettingsPage() {
  const { data } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: () =>
      adminFetch<{ settings: { twoFactor: { enabled: boolean; note: string } } }>('/settings'),
    retry: false,
  })
  return (
    <>
      <Head title="Instellingen" path="/scotdejewish/settings" />
      <h1 className="font-heading text-[24px] font-semibold text-navy">Instellingen</h1>
      <p className="mt-3 max-w-xl text-[14px]">{data?.settings.twoFactor.note}</p>
    </>
  )
}

export function AdminIndexRedirect() {
  return <Navigate to="/scotdejewish/dashboard" replace />
}
