import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

type StatusTone =
  | 'neutral'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'cooldown'

const toneStyles: Record<StatusTone, string> = {
  neutral: 'border-border bg-muted text-muted-foreground',
  success: 'border-success/40 bg-success/15 text-success',
  warning: 'border-warning/40 bg-warning/15 text-warning',
  error: 'border-destructive/40 bg-destructive/15 text-destructive',
  info: 'border-secondary/40 bg-secondary/15 text-secondary',
  cooldown: 'border-warning/40 bg-warning/10 text-warning',
}

interface StatusBadgeProps {
  children: React.ReactNode
  tone?: StatusTone
  className?: string
}

export function StatusBadge({ children, tone = 'neutral', className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold',
        toneStyles[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function LockBadge({ reason }: { reason?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground"
      title={reason}
    >
      <Lock className="size-3" aria-hidden="true" />
      Locked
    </span>
  )
}
