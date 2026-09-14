import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'

type CategoryCardProps = {
  href: string
  title: string
  image: string
  imageAlt: string
  size?: 'large' | 'regular'
  objectPosition?: string
  className?: string
}

export function CategoryCard({
  href,
  title,
  image,
  imageAlt,
  size = 'regular',
  objectPosition = 'center',
  className,
}: CategoryCardProps) {
  return (
    <Link
      to={href}
      className={cn(
        'group relative block overflow-hidden rounded-[12px] bg-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
        size === 'large' ? 'aspect-[16/10] lg:aspect-[21/10]' : 'aspect-[4/3]',
        className,
      )}
    >
      <img
        src={image}
        alt={imageAlt}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        style={{ objectPosition }}
      />
      <div className="absolute inset-0 bg-linear-to-t from-navy/80 via-navy/15 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-3.5 md:p-5">
        <h3 className="font-heading text-[17px] font-semibold text-white md:text-[20px]">
          {title}
        </h3>
        <p className="mt-0.5 text-[13px] text-white/80">Bekijken</p>
      </div>
    </Link>
  )
}
