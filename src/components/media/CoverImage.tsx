import { cn } from '@/lib/cn'

type CoverImageProps = {
  src?: string | null
  alt: string
  className?: string
  width?: number
  height?: number
  loading?: 'lazy' | 'eager'
  fetchPriority?: 'high' | 'low' | 'auto'
}

export function CoverImage({
  src,
  alt,
  className,
  width,
  height,
  loading = 'lazy',
  fetchPriority,
}: CoverImageProps) {
  if (!src) return null
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      fetchPriority={fetchPriority}
      decoding="async"
      className={cn('w-full object-cover', className)}
    />
  )
}
