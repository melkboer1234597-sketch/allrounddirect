import { useCallback, useEffect, useId, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { resolveCardImageFit } from '../../../shared/product-presentation'
import type { ProductImage } from '@/types/catalog'

type ProductGalleryProps = {
  images: ProductImage[]
  productName: string
  categorySlug?: string
  subcategorySlug?: string
}

function isPublicImage(image: ProductImage): boolean {
  const status = image.imageStatus
  return !status || status === 'ok'
}

export function ProductGallery({
  images,
  productName,
  categorySlug,
  subcategorySlug,
}: ProductGalleryProps) {
  const galleryImages = useMemo(() => images.filter(isPublicImage), [images])
  const [index, setIndex] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const labelId = useId()
  const safeIndex = galleryImages.length ? Math.min(index, galleryImages.length - 1) : 0
  const current = galleryImages[safeIndex]

  useEffect(() => {
    setIndex(0)
  }, [productName, galleryImages.length])

  const go = useCallback(
    (next: number) => {
      if (!galleryImages.length) return
      setIndex((next + galleryImages.length) % galleryImages.length)
    },
    [galleryImages.length],
  )

  useBodyScrollLock(lightbox)

  useEffect(() => {
    if (!lightbox) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setLightbox(false)
      if (event.key === 'ArrowLeft') go(safeIndex - 1)
      if (event.key === 'ArrowRight') go(safeIndex + 1)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [lightbox, go, safeIndex])

  if (!current) {
    return (
      <div className="h-[320px] rounded-[12px] bg-surface ring-1 ring-line sm:h-[420px] lg:h-[560px]" />
    )
  }

  const fit = resolveCardImageFit({
    fit: current.fit,
    categorySlug,
    subcategorySlug,
    alt: current.alt,
    name: productName,
    width: current.width,
    height: current.height,
  })

  return (
    <>
      <div className="flex gap-3 lg:gap-4">
        {galleryImages.length > 1 ? (
          <ul className="hide-scrollbar hidden w-[72px] shrink-0 flex-col gap-2 overflow-y-auto lg:flex lg:max-h-[560px] xl:w-[80px] xl:max-h-[620px]">
            {galleryImages.map((image, imageIndex) => (
              <li key={`${image.src}-${imageIndex}`}>
                <button
                  type="button"
                  aria-label={`Afbeelding ${imageIndex + 1}`}
                  aria-current={imageIndex === safeIndex ? 'true' : undefined}
                  onClick={() => setIndex(imageIndex)}
                  className={cn(
                    'h-[72px] w-[72px] overflow-hidden rounded-[8px] bg-white ring-1 ring-line transition-shadow xl:h-20 xl:w-20',
                    imageIndex === safeIndex && 'ring-2 ring-brand',
                  )}
                >
                  <img
                    src={image.cardSrc ?? image.src}
                    alt=""
                    width={80}
                    height={80}
                    loading="lazy"
                    className="h-full w-full object-contain p-1.5"
                    onError={(event) => {
                      event.currentTarget.src = image.src
                    }}
                  />
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => setLightbox(true)}
            aria-label="Vergroot afbeelding"
            className="block w-full overflow-hidden rounded-[12px] bg-[#F7F8FA] ring-1 ring-line focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <span
              className={cn(
                'relative flex w-full items-center justify-center',
                'h-[min(70vw,340px)] sm:h-[420px] lg:h-[560px] xl:h-[600px]',
                'max-h-[650px]',
              )}
            >
              <img
                src={current.src}
                alt={current.alt || productName}
                width={current.width ?? 1200}
                height={current.height ?? 900}
                sizes="(min-width: 1024px) 50vw, 100vw"
                decoding="async"
                className={cn(
                  fit === 'cover'
                    ? 'h-full w-full object-cover'
                    : 'max-h-full max-w-full object-contain p-5 sm:p-7 lg:p-8',
                )}
              />
            </span>
          </button>

          {galleryImages.length > 1 ? (
            <ul className="hide-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {galleryImages.map((image, imageIndex) => (
                <li key={`m-${image.src}-${imageIndex}`} className="shrink-0">
                  <button
                    type="button"
                    aria-label={`Afbeelding ${imageIndex + 1}`}
                    onClick={() => setIndex(imageIndex)}
                    className={cn(
                      'h-16 w-16 overflow-hidden rounded-[8px] bg-white ring-1 ring-line',
                      imageIndex === safeIndex && 'ring-2 ring-brand',
                    )}
                  >
                    <img
                      src={image.cardSrc ?? image.src}
                      alt=""
                      width={64}
                      height={64}
                      loading="lazy"
                      className="h-full w-full object-contain p-1"
                      onError={(event) => {
                        event.currentTarget.src = image.src
                      }}
                    />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      {lightbox ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelId}
          className="fixed inset-0 z-50 flex flex-col bg-navy/92"
        >
          <div className="flex items-center justify-between px-4 py-3 text-white">
            <p id={labelId} className="text-[14px]">
              {safeIndex + 1} / {galleryImages.length}
            </p>
            <button
              type="button"
              aria-label="Sluiten"
              onClick={() => setLightbox(false)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-[8px] hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-4">
            {galleryImages.length > 1 ? (
              <>
                <button
                  type="button"
                  aria-label="Vorige afbeelding"
                  onClick={() => go(safeIndex - 1)}
                  className="absolute left-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-ink"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  aria-label="Volgende afbeelding"
                  onClick={() => go(safeIndex + 1)}
                  className="absolute right-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-ink"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            ) : null}
            <img
              src={current.src}
              alt={current.alt || productName}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        </div>
      ) : null}
    </>
  )
}
