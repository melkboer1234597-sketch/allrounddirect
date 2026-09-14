import type { OrderDetail } from '@/lib/account-api'

type OrderShipmentsProps = {
  shipments: OrderDetail['shipments']
}

export function OrderShipments({ shipments }: OrderShipmentsProps) {
  if (!shipments.length) {
    return <p className="text-[14px] text-muted">Nog geen zendingen aangemaakt.</p>
  }
  return (
    <ol className="space-y-4">
      {shipments.map((shipment, index) => (
        <li key={shipment.id} className="rounded-[8px] border border-line px-4 py-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-medium text-ink">
              {shipment.label || `Zending ${index + 1}`}
            </p>
            <p className="text-[13px] text-muted">{shipment.statusLabel}</p>
          </div>
          {(shipment.carrier || shipment.trackingCode) && (
            <p className="mt-1 text-[13px] text-muted">
              {[shipment.carrier, shipment.trackingCode].filter(Boolean).join(' · ')}
            </p>
          )}
          {shipment.supplierName ? (
            <p className="mt-1 text-[13px] text-muted">{shipment.supplierName}</p>
          ) : null}
          {shipment.items.length ? (
            <ul className="mt-2 space-y-0.5 text-[13px] text-ink">
              {shipment.items.map((item) => (
                <li key={`${shipment.id}-${item.name}`}>
                  {item.name} × {item.quantity}
                </li>
              ))}
            </ul>
          ) : null}
          {shipment.trackingUrl ? (
            <a
              className="mt-2 inline-block text-[14px] text-brand hover:underline"
              href={shipment.trackingUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              Zending volgen
            </a>
          ) : null}
        </li>
      ))}
    </ol>
  )
}
