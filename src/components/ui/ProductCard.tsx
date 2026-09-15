import { Link } from 'react-router-dom'
import { Truck } from 'lucide-react'
import { WishlistButton } from '@/components/account/WishlistButton'
import { cn } from '@/lib/cn'
import { formatMoney, formatProductPrice } from '@/lib/money'
import { productPath } from '@/services/catalog'
import type { CatalogProduct } from '@/types/catalog'
import {
  deliveryLabelShort,
  qualifiesForFreeShipping,
} from '../../../shared/commerce'
import { eurosToCents } from '../../../shared/money'
import { resolveCardImageFit } from '../../../shared/product-presentation'

type ProductCardProps = {
  product: CatalogProduct
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const href = productPath(product)
  const image = product.images[0]
  const fit = resolveCardImageFit({
    fit: image?.fit,
    categorySlug: product.categorySlug,
    subcategorySlug: product.subcategorySlug,
    alt: image?.alt,
    name: product.name,
    width: image?.width,
    height: image?.height,
  })
  const showPrice = Boolean(product.price) && product.priceLabel !== 'Prijs op aanvraag'
  const delivery = deliveryLabelShort()
  const productCents = showPrice && product.price ? eurosToCents(product.price.amount) : 0
  const showFreeShipping = qualifiesForFreeShipping(productCents)
  const brandOrType = product.brand?.trim() || product.category
  const typeLine =
    product.subcategoryName &&
    product.subcategoryName !== brandOrType &&
    product.subcategoryName !== product.category
      ? product.subcategoryName
      : null

  return (
    <article className={cn('group relative flex h-full flex-col', className)}>
      <div className="relative overflow-hidden rounded-[10px] bg-[#F7F8FA]">
        <Link
          to={href}
          className="block aspect-[4/3] overflow-hidden"
          tabIndex={-1}
          aria-hidden
        >
          {image ? (
            <img
              src={image.cardSrc ?? image.src}
              alt=""
              width={image.width ?? 800}
              height={image.height ?? 600}
              sizes="(min-width: 1280px) 20vw, (min-width: 768px) 25vw, 55vw"
              loading="lazy"
              decoding="async"
              className={cn(
                'h-full w-full transition-transform duration-300 ease-out group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100',
                fit === 'contain' ? 'object-contain p-4 sm:p-5' : 'object-cover',
              )}
            />
          ) : (
            <div className="h-full w-full bg-[#F7F8FA]" />
          )}
        </Link>
        {product.isOutlet ? (
          <span className="absolute top-2 left-2 rounded-[4px] bg-navy px-2 py-1 text-[11px] font-medium text-white">
            Outlet
          </span>
        ) : null}
        <WishlistButton slug={product.slug} name={product.name} />
      </div>

      <div className="flex flex-1 flex-col pt-2.5">
        <p className="text-[12px] leading-tight text-muted transition-colors group-hover:text-ink">
          {brandOrType}
        </p>
        <h3 className="mt-0.5 min-h-[2.5rem] font-heading text-[15px] leading-snug font-semibold text-ink md:min-h-[2.625rem] md:text-[16px]">
          <Link
            to={href}
            className="line-clamp-2 after:absolute after:inset-0 hover:text-brand focus-visible:text-brand"
          >
            {product.name}
          </Link>
        </h3>
        {typeLine ? (
          <p className="mt-1 line-clamp-1 text-[12px] leading-tight text-muted md:text-[13px]">
            {typeLine}
          </p>
        ) : null}
        <div className="mt-auto pt-2">
          <p className="text-[16px] leading-none font-semibold tracking-tight text-ink md:text-[17px]">
            {showPrice && product.price ? formatMoney(product.price) : formatProductPrice(product)}
            {showPrice && product.compareAtPrice ? (
              <span className="ml-2 text-[13px] font-normal text-muted line-through">
                {formatMoney(product.compareAtPrice)}
              </span>
            ) : null}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="inline-flex items-center gap-1 text-[12px] leading-tight text-muted">
              <Truck className="h-3.5 w-3.5 shrink-0 opacity-70" strokeWidth={1.75} aria-hidden />
              <span>{delivery}</span>
            </p>
            {showFreeShipping ? (
              <p className="text-[12px] leading-tight text-muted">Gratis verzending</p>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col" aria-hidden>
      <div className="aspect-[4/3] rounded-[12px] bg-[#F7F8FA]" />
      <div className="mt-2.5 h-3 w-1/3 rounded bg-surface" />
      <div className="mt-2 h-4 w-full rounded bg-surface" />
      <div className="mt-1.5 h-4 w-2/3 rounded bg-surface" />
      <div className="mt-3 h-4 w-1/2 rounded bg-surface" />
    </div>
  )
}
