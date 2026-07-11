'use client'

import { Coins, Sparkles } from 'lucide-react'
import { ActionButton } from '@/components/game/action-button'
import { InfoCallout } from '@/components/game/info-callout'
import { StatusBadge } from '@/components/game/status-badge'
import type { SkillNodeData } from '@/lib/game/types'

interface SkillDetailPanelProps {
  node: SkillNodeData | null
  allocated: boolean
  connected: boolean
  availablePoints: number
  onAllocate: () => void
  loading?: boolean
}

export function SkillDetailPanel({
  node,
  allocated,
  connected,
  availablePoints,
  onAllocate,
  loading = false,
}: SkillDetailPanelProps) {
  if (!node) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-muted-foreground">
        <Sparkles className="size-6" aria-hidden="true" />
        <p className="text-sm">Select a node to view its details.</p>
      </div>
    )
  }

  const affordable = availablePoints >= node.cost
  const canAllocate = !allocated && connected && affordable

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-lg font-semibold">{node.title}</h3>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {node.type} node
          </p>
        </div>
        {allocated ? (
          <StatusBadge tone="success">Allocated</StatusBadge>
        ) : connected ? (
          <StatusBadge tone="info">Available</StatusBadge>
        ) : (
          <StatusBadge tone="neutral">Locked</StatusBadge>
        )}
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">
        {node.description}
      </p>

      <div className="flex items-center gap-1.5 text-sm">
        <Coins className="size-4 text-primary" aria-hidden="true" />
        <span className="font-semibold text-primary tabular-nums">
          {node.cost}
        </span>
        <span className="text-muted-foreground">
          skill point{node.cost === 1 ? '' : 's'}
        </span>
      </div>

      {allocated ? (
        <InfoCallout tone="success">This skill is already active.</InfoCallout>
      ) : !connected ? (
        <InfoCallout tone="info">
          Allocate a connected prerequisite node first.
        </InfoCallout>
      ) : !affordable ? (
        <InfoCallout tone="error">
          Not enough skill points. Level up to earn more.
        </InfoCallout>
      ) : null}

      <ActionButton
        fullWidth
        disabled={!canAllocate}
        loading={loading}
        onClick={onAllocate}
      >
        {allocated ? 'Allocated' : 'Allocate skill'}
      </ActionButton>
    </div>
  )
}
