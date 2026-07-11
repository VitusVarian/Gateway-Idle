'use client'

import { useId } from 'react'
import { cn } from '@/lib/utils'

interface ToggleSwitchProps {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export function ToggleSwitch({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: ToggleSwitchProps) {
  const descId = useId()
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-border bg-background px-3 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description ? (
          <p id={descId} className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        aria-describedby={description ? descId : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors outline-none',
          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card',
          checked ? 'border-primary bg-primary' : 'border-border bg-muted',
          disabled && 'opacity-45',
        )}
      >
        <span
          className={cn(
            'inline-block size-4 rounded-full bg-background transition-transform',
            checked ? 'translate-x-6' : 'translate-x-1',
          )}
        />
      </button>
    </div>
  )
}
