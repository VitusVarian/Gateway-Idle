'use client'

import { Check, Circle, Star, Zap } from 'lucide-react'
import type { SkillNodeType } from '@/lib/game/types'
import { cn } from '@/lib/utils'

interface SkillNodeProps {
  title: string
  type: SkillNodeType
  allocated: boolean
  connected: boolean
  selected: boolean
  onSelect: () => void
}

const typeIcon: Record<SkillNodeType, typeof Circle> = {
  start: Star,
  travel: Circle,
  notable: Zap,
}

export function SkillNode({
  title,
  type,
  allocated,
  connected,
  selected,
  onSelect,
}: SkillNodeProps) {
  const Icon = allocated ? Check : typeIcon[type]
  const isNotable = type === 'notable'

  return (
    <button
      type="button"
      aria-pressed={allocated}
      aria-label={`${title}${allocated ? ', allocated' : connected ? ', available' : ', locked'}`}
      onClick={onSelect}
      className={cn(
        'group flex flex-col items-center gap-1 outline-none',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded-lg',
      )}
    >
      <span
        className={cn(
          'flex items-center justify-center rounded-full border-2 transition-all',
          isNotable ? 'size-12' : 'size-10',
          allocated
            ? 'border-primary bg-primary text-primary-foreground'
            : connected
              ? 'border-secondary bg-secondary/15 text-secondary group-hover:bg-secondary/25'
              : 'border-border bg-background text-muted-foreground',
          selected && 'ring-2 ring-ring ring-offset-2 ring-offset-surface',
        )}
      >
        <Icon className={isNotable ? 'size-5' : 'size-4'} aria-hidden="true" />
      </span>
      <span
        className={cn(
          'max-w-[80px] truncate text-[11px] font-medium',
          allocated
            ? 'text-foreground'
            : connected
              ? 'text-secondary'
              : 'text-muted-foreground',
        )}
      >
        {title}
      </span>
    </button>
  )
}
