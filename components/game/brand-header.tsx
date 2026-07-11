import { Swords } from 'lucide-react'

export function BrandHeader({
  title = 'Gateway Incremental',
  subtitle,
}: {
  title?: string
  subtitle?: string
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-3 flex size-12 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 text-primary">
        <Swords className="size-6" aria-hidden="true" />
      </div>
      <h1 className="font-display text-3xl font-bold tracking-wide text-foreground text-balance">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground text-pretty">
          {subtitle}
        </p>
      ) : null}
    </div>
  )
}
