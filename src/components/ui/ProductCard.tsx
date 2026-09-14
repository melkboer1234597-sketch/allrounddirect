import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import type { DemoProduct } from '@/types/catalog'

function formatPrice(product: DemoProduct): string {
  if (product.priceLabel) return product.priceLabel
  if (!product.price) return 'Prijs op aanvraag'

  const formatted = new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: product.price.currency,
    minimumFractionDigits: product.price.amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(product.price.amount)

  if (product.price.per === 'm2') return `${formatted} per m²`
  return formatted
}

type ProductCardProps = {
  product: DemoProduct
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const href = '/assortiment'

  return (
    <article className={cn('group flex h-full flex-col', className)}>
      <div className="relative overflow-hidden rounded-[12px] bg-surface">
        <Link to={href} className="block aspect-[4/3] overflow-hidden" aria-label={product.name}>
          <img
            src={product.image}
            alt={product.imageAlt}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        </Link>
        <Link
          to="/favorieten"
          aria-label={`${product.name} opslaan in favorieten`}
          className="absolute top-2 right-2 inline-flex h-11 w-11 items-center justify-center rounded-[4px] bg-white/95 text-ink ring-1 ring-line transition-colors duration-150 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <Heart className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </Link>
      </div>
      <div className="flex flex-1 flex-col pt-3">
        <Link
          to={product.categoryHref}
          className="text-[12px] font-medium tracking-wide text-muted uppercase"
        >
          {product.category}
        </Link>
        <h3 className="mt-1 min-h-[2.6em] font-heading text-[15px] leading-snug font-semibold text-ink md:text-[16px]">
          <Link to={href} className="line-clamp-2 hover:text-brand">
            {product.name}
          </Link>
        </h3>
        <p className="mt-2 text-[16px] font-semibold tracking-tight text-ink">
          {formatPrice(product)}
        </p>
        <div className="mt-auto pt-3">
          <Button to={href} variant="secondary" className="w-full">
            Bekijken
          </Button>
        </div>
      </div>
    </article>
  )
}
