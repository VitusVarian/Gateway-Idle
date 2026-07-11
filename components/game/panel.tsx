import { cn } from '@/lib/utils'

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: 'div' | 'section' | 'aside'
}

/** Base surface card used across the app. */
export function Panel({ className, as = 'div', ...props }: PanelProps) {
  const Comp = as
  return (
    <Comp
      className={cn(
        'rounded-lg border border-border bg-card text-card-foreground shadow-[var(--shadow-rpg-sm)]',
        className,
      )}
      {...props}
    />
  )
}

export function PanelHeader({
  title,
  description,
  action,
  className,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-3 border-b border-border px-4 py-3',
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="font-display text-lg font-semibold tracking-wide text-foreground text-pretty">
          {title}
        </h2>
        {description ? (
          <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground text-pretty">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
