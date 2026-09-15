import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'

type CategoryCardProps = {
  href: string
  title: string
  image: string
  imageAlt: string
  cta?: string
  size?: 'large' | 'medium' | 'compact'
  objectPosition?: string
  className?: string
}

const sizeClass = {
  large: 'aspect-[16/10] min-h-[148px] lg:aspect-auto lg:h-[min(300px,28vw)] lg:min-h-[260px]',
  medium: 'aspect-[4/3] min-h-[132px] lg:aspect-auto lg:h-[min(232px,20vw)] lg:min-h-[200px]',
  compact: 'aspect-[4/3] min-h-[120px] lg:aspect-auto lg:h-[min(200px,17vw)] lg:min-h-[176px]',
} as const

export function CategoryCard({
  href,
  title,
  image,
  imageAlt,
  cta,
  size = 'medium',
  objectPosition = 'center',
  className,
}: CategoryCardProps) {
  return (
    <Link
      to={href}
      className={cn(
        'group relative block overflow-hidden rounded-[10px] bg-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
        sizeClass[size],
        className,
      )}
    >
      {image ? (
        <img
          src={image}
          alt={imageAlt}
          width={1200}
          height={800}
          loading="eager"
          decoding="async"
          sizes="(min-width: 1024px) 33vw, 50vw"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          style={{ objectPosition }}
        />
      ) : null}
      {/* Gradient only near text, not a heavy full-card wash */}
      <div
        className="absolute inset-x-0 bottom-0 h-[58%] bg-linear-to-t from-navy/88 via-navy/35 to-transparent"
        aria-hidden
      />
      <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3 lg:p-3.5">
        <h3 className="font-heading text-[14px] leading-tight font-semibold text-white min-[380px]:text-[15px] sm:text-[16px] lg:text-[17px]">
          {title}
        </h3>
        {cta ? (
          <p className="mt-0.5 text-[11px] leading-snug text-white/75 min-[380px]:text-[12px] sm:text-[13px]">
            {cta}
          </p>
        ) : null}
      </div>
    </Link>
  )
}
