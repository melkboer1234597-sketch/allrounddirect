import { useCallback, useEffect, useId, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { ProductImage } from '@/types/catalog'

type ProductGalleryProps = {
  images: ProductImage[]
  productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [index, setIndex] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const labelId = useId()
  const current = images[index] ?? images[0]

  const go = useCallback(
    (next: number) => {
      if (!images.length) return
      setIndex((next + images.length) % images.length)
    },
    [images.length],
  )

  useEffect(() => {
    if (!lightbox) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setLightbox(false)
      if (event.key === 'ArrowLeft') go(index - 1)
      if (event.key === 'ArrowRight') go(index + 1)
    }
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [lightbox, go, index])

  if (!current) {
    return <div className="aspect-square max-h-[640px] rounded-[12px] bg-surface lg:aspect-[4/3]" />
  }

  const fit = current.fit === 'cover' ? 'object-cover' : 'object-contain'

  return (
    <>
      <div className="flex gap-3 lg:gap-4">
        {images.length > 1 ? (
          <ul className="hidden w-[80px] shrink-0 flex-col gap-2 overflow-y-auto lg:flex lg:max-h-[640px]">
            {images.map((image, imageIndex) => (
              <li key={`${image.src}-${imageIndex}`}>
                <button
                  type="button"
                  aria-label={`Afbeelding ${imageIndex + 1}`}
                  aria-current={imageIndex === index ? 'true' : undefined}
                  onClick={() => setIndex(imageIndex)}
                  className={cn(
                    'h-20 w-20 overflow-hidden rounded-[8px] bg-surface ring-1 ring-line focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
                    imageIndex === index && 'ring-2 ring-brand',
                  )}
                >
                  <img
                    src={image.cardSrc ?? image.src}
                    alt=""
                    width={80}
                    height={80}
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

        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => setLightbox(true)}
            aria-label="Vergroot afbeelding"
            className="block w-full overflow-hidden rounded-[12px] bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <img
              src={current.src}
              alt={current.alt || productName}
              width={current.width ?? 1200}
              height={current.height ?? 900}
              sizes="(min-width: 1024px) 48vw, 100vw"
              decoding="async"
              className={cn(
                'mx-auto max-h-[min(62vw,360px)] w-full object-contain p-4 sm:max-h-[420px] lg:max-h-[560px] lg:min-h-[420px]',
                fit,
              )}
            />
          </button>

          {images.length > 1 ? (
            <ul className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {images.map((image, imageIndex) => (
                <li key={`m-${image.src}-${imageIndex}`} className="shrink-0">
                  <button
                    type="button"
                    aria-label={`Afbeelding ${imageIndex + 1}`}
                    onClick={() => setIndex(imageIndex)}
                    className={cn(
                      'h-[72px] w-[72px] overflow-hidden rounded-[8px] bg-surface ring-1 ring-line',
                      imageIndex === index && 'ring-2 ring-brand',
                    )}
                  >
                    <img
                      src={image.cardSrc ?? image.src}
                      alt=""
                      width={72}
                      height={72}
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
              {index + 1} / {images.length}
            </p>
            <button
              type="button"
              aria-label="Sluiten"
              onClick={() => setLightbox(false)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-[4px] hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-4">
            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  aria-label="Vorige afbeelding"
                  onClick={() => go(index - 1)}
                  className="absolute left-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-ink"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  aria-label="Volgende afbeelding"
                  onClick={() => go(index + 1)}
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
