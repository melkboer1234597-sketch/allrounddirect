import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'

type CategoryCardProps = {
  href: string
  title: string
  image: string
  imageAlt: string
  cta?: string
  /** Editorial sizes — fixed heights, not huge aspect cards */
  size?: 'large' | 'medium' | 'compact'
  objectPosition?: string
  className?: string
}

const sizeClass = {
  large:
    'min-h-[150px] h-[clamp(150px,38vw,190px)] md:h-[clamp(220px,24vw,280px)] lg:h-[clamp(260px,22vw,310px)]',
  medium:
    'min-h-[150px] h-[clamp(150px,38vw,185px)] md:h-[clamp(190px,22vw,240px)] lg:h-[clamp(200px,18vw,248px)]',
  compact:
    'min-h-[145px] h-[clamp(145px,36vw,175px)] md:h-[clamp(180px,20vw,220px)] lg:h-[clamp(190px,16vw,230px)]',
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
          loading="lazy"
          decoding="async"
          sizes="(min-width: 1024px) 33vw, 50vw"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.025] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          style={{ objectPosition }}
        />
      ) : null}
      <div
        className="absolute inset-0 bg-linear-to-t from-navy/90 via-navy/25 to-transparent"
        aria-hidden
      />
      <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3 lg:p-3.5">
        <h3 className="font-heading text-[15px] leading-tight font-semibold text-white sm:text-[16px] lg:text-[18px]">
          {title}
        </h3>
        {cta ? (
          <p className="mt-0.5 text-[12px] leading-snug text-white/80 sm:text-[13px]">{cta}</p>
        ) : null}
      </div>
    </Link>
  )
}
