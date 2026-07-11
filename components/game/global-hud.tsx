import { Coins, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { HealthBar } from './health-bar'

interface GlobalHUDProps {
  characterName: string
  level: number
  xpCurrent: number
  xpRequired: number
  skillPoints: number
  gold: number
  variant?: 'full' | 'compact'
  state?: 'default' | 'loading' | 'error'
  className?: string
}

/** Semantic header region showing core progression stats. */
export function GlobalHUD({
  characterName,
  level,
  xpCurrent,
  xpRequired,
  skillPoints,
  gold,
  variant = 'full',
  state = 'default',
  className,
}: GlobalHUDProps) {
  if (state === 'loading') {
    return (
      <div
        className={cn('animate-pulse rounded-lg border border-border bg-card p-4', className)}
        aria-busy="true"
      >
        <div className="h-4 w-1/2 rounded bg-muted" />
        <div className="mt-3 h-2.5 w-full rounded bg-muted" />
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div
        role="alert"
        className={cn(
          'rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive',
          className,
        )}
      >
        Unable to load character stats.
      </div>
    )
  }

  return (
    <header
      className={cn(
        'rounded-lg border border-border bg-card p-4 text-card-foreground',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-display text-base font-semibold tracking-wide">
            {characterName}
          </p>
          <p className="text-xs text-muted-foreground">Level {level}</p>
        </div>
        <div className="flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-primary">
          <Coins className="size-4" aria-hidden="true" />
          <span className="text-sm font-semibold tabular-nums" aria-label={`${gold} gold`}>
            {gold.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="mt-3">
        <HealthBar label="Experience" value={xpCurrent} max={xpRequired} tone="xp" />
      </div>

      {variant === 'full' ? (
        <div className="mt-3 flex items-center gap-1.5 text-sm text-secondary">
          <Sparkles className="size-4" aria-hidden="true" />
          <span className="font-semibold">{skillPoints}</span>
          <span className="text-muted-foreground">
            skill point{skillPoints === 1 ? '' : 's'} available
          </span>
        </div>
      ) : null}
    </header>
  )
}
