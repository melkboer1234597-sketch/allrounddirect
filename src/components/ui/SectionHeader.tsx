import { cn } from '@/lib/cn'

type SectionHeaderProps = {
  eyebrow?: string
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
  titleAs?: 'h2' | 'h3'
  titleId?: string
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  className,
  titleAs: TitleTag = 'h2',
  titleId,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'mb-6 flex flex-col gap-2 md:mb-8 md:flex-row md:items-end md:justify-between md:gap-6',
        className,
      )}
    >
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="mb-2 text-[12px] font-medium tracking-[0.08em] text-brand uppercase">
            {eyebrow}
          </p>
        ) : null}
        <TitleTag id={titleId} className="heading-section text-ink">
          {title}
        </TitleTag>
        {description ? <p className="text-body mt-2 text-muted">{description}</p> : null}
      </div>
      {action ? <div className="hidden shrink-0 md:block">{action}</div> : null}
    </div>
  )
}
