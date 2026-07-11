import { cn } from '@/lib/utils'

type BarTone = 'health' | 'enemy' | 'xp' | 'gold'

const toneStyles: Record<BarTone, string> = {
  health: 'bg-success',
  enemy: 'bg-destructive',
  xp: 'bg-secondary',
  gold: 'bg-primary',
}

interface HealthBarProps {
  label: string
  value: number
  max: number
  tone?: BarTone
  /** Hide the numeric readout (e.g. compact HUD). */
  hideValue?: boolean
  className?: string
}

/**
 * Accessible progress bar used for HP, XP and other meters.
 * Exposes aria-valuenow / aria-valuemax per the spec.
 */
export function HealthBar({
  label,
  value,
  max,
  tone = 'health',
  hideValue = false,
  className,
}: HealthBarProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0
  return (
    <div className={cn('w-full', className)}>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-muted-foreground">{label}</span>
        {!hideValue ? (
          <span className="font-semibold tabular-nums text-foreground">
            {Math.round(value).toLocaleString()} / {max.toLocaleString()}
          </span>
        ) : null}
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={max}
        className="h-2.5 w-full overflow-hidden rounded-full border border-border bg-background"
      >
        <div
          className={cn('h-full rounded-full transition-all duration-500', toneStyles[tone])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
