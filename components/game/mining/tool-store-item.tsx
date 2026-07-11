'use client'

import { Check, Coins, Pickaxe } from 'lucide-react'
import { ActionButton } from '@/components/game/action-button'
import { StatusBadge } from '@/components/game/status-badge'
import { cn } from '@/lib/utils'

interface ToolStoreItemProps {
  name: string
  bonusPercent: number
  cost: number
  owned: boolean
  affordable: boolean
  loading?: boolean
  onPurchase: () => void
}

export function ToolStoreItem({
  name,
  bonusPercent,
  cost,
  owned,
  affordable,
  loading = false,
  onPurchase,
}: ToolStoreItemProps) {
  return (
    <div
      className={cn(
        'rounded-md border p-3',
        owned ? 'border-success/40 bg-success/5' : 'border-border bg-background',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-md border border-border bg-card text-primary">
            <Pickaxe className="size-4" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{name}</p>
            <p className="text-xs text-secondary">+{bonusPercent}% gold per mine</p>
          </div>
        </div>
        {owned ? (
          <StatusBadge tone="success">
            <Check className="size-3" aria-hidden="true" />
            Owned
          </StatusBadge>
        ) : null}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="flex items-center gap-1 text-sm font-semibold text-primary tabular-nums">
          <Coins className="size-4" aria-hidden="true" />
          {cost.toLocaleString()}
        </span>
        {owned ? (
          <span className="text-xs font-medium text-muted-foreground">Purchased</span>
        ) : (
          <ActionButton
            onClick={onPurchase}
            disabled={!affordable}
            loading={loading}
            aria-label={`Buy ${name} for ${cost} gold`}
          >
            {affordable ? 'Buy tool' : 'Not enough gold'}
          </ActionButton>
        )}
      </div>
    </div>
  )
}
