import { Link } from 'react-router-dom'
import { WishlistButton } from '@/components/account/WishlistButton'
import { cn } from '@/lib/cn'
import { formatProductPrice } from '@/lib/money'
import { productPath } from '@/services/catalog'
import type { CatalogProduct } from '@/types/catalog'

function availabilityLabel(product: CatalogProduct): string | null {
  if (product.leadTime) return product.leadTime
  if (product.stockStatus === 'in_stock') return 'Op voorraad'
  if (product.stockStatus === 'backorder') return 'Nalevering'
  if (product.stockStatus === 'unknown') return 'Op aanvraag'
  return null
}

type ProductCardProps = {
  product: CatalogProduct
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const href = productPath(product)
  const image = product.images[0]
  const fit = image?.fit ?? 'cover'
  const status = availabilityLabel(product)

  return (
    <article className={cn('group relative flex h-full flex-col', className)}>
      <div className="relative overflow-hidden rounded-[12px] bg-surface">
        <Link to={href} className="block aspect-[4/3] overflow-hidden" tabIndex={-1}>
          {image ? (
            <img
              src={image.src}
              alt=""
              width={image.width ?? 800}
              height={image.height ?? 600}
              sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
              loading="lazy"
              decoding="async"
              className={cn(
                'h-full w-full transition-transform duration-300 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100',
                fit === 'contain' ? 'object-contain p-4' : 'object-cover',
              )}
            />
          ) : null}
        </Link>
        {product.isOutlet ? (
          <span className="absolute top-2 left-2 rounded-[4px] bg-navy px-2 py-1 text-[11px] font-medium text-white">
            Outlet
          </span>
        ) : null}
        <WishlistButton slug={product.slug} name={product.name} />
      </div>
      <div className="flex flex-1 flex-col pt-3">
        {product.brand ? <p className="text-[12px] text-muted">{product.brand}</p> : null}
        <h3 className="mt-0.5 min-h-[2.6em] font-heading text-[15px] leading-snug font-semibold text-ink md:text-[16px]">
          <Link to={href} className="line-clamp-2 after:absolute after:inset-0 hover:text-brand">
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 text-[13px] text-muted">{product.subcategoryName}</p>
        <div className="mt-auto pt-2">
          <p className="text-[16px] font-semibold tracking-tight text-ink">
            {formatProductPrice(product)}
            {product.compareAtPrice ? (
              <span className="ml-2 text-[13px] font-normal text-muted line-through">
                {new Intl.NumberFormat('nl-NL', {
                  style: 'currency',
                  currency: product.compareAtPrice.currency,
                  maximumFractionDigits: 0,
                }).format(product.compareAtPrice.amount)}
              </span>
            ) : null}
          </p>
          {status ? <p className="mt-1 text-[12px] text-muted">{status}</p> : null}
        </div>
      </div>
    </article>
  )
}
