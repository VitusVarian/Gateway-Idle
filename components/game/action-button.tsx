'use client'

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type ActionTone = 'primary' | 'secondary' | 'danger' | 'muted'

const toneStyles: Record<ActionTone, string> = {
  primary:
    'bg-primary text-primary-foreground hover:bg-primary/85 focus-visible:ring-ring',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-secondary/85 focus-visible:ring-ring',
  danger:
    'bg-destructive text-destructive-foreground hover:bg-destructive/85 focus-visible:ring-ring',
  muted:
    'border border-border bg-muted text-foreground hover:bg-muted/70 focus-visible:ring-ring',
}

interface ActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: ActionTone
  loading?: boolean
  fullWidth?: boolean
  icon?: React.ReactNode
}

/**
 * Primary interactive control with default/hover/focus/disabled/loading states.
 */
export function ActionButton({
  tone = 'primary',
  loading = false,
  fullWidth = false,
  icon,
  children,
  className,
  disabled,
  ...props
}: ActionButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-all outline-none',
        'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'active:translate-y-px disabled:pointer-events-none disabled:opacity-45',
        toneStyles[tone],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        icon
      )}
      {children}
    </button>
  )
}
