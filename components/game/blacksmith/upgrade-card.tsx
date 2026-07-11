'use client'

import { ArrowRight, Coins } from 'lucide-react'
import { ActionButton } from '@/components/game/action-button'
import { LockBadge, StatusBadge } from '@/components/game/status-badge'
import { Panel, PanelHeader } from '@/components/game/panel'
import type { UpgradeTier } from '@/lib/game/mock-data'
import { cn } from '@/lib/utils'

interface UpgradeCardProps {
  variant: 'weapon' | 'armor'
  title: string
  icon: React.ReactNode
  tiers: UpgradeTier[]
  currentTier: number
  gold: number
  onUpgrade: () => void
  loading?: boolean
}

/** Displays the full upgrade ladder plus the next purchasable upgrade. */
export function UpgradeCard({
  title,
  icon,
  tiers,
  currentTier,
  gold,
  onUpgrade,
  loading = false,
}: UpgradeCardProps) {
  const current = tiers[currentTier]
  const next = tiers[currentTier + 1]
  const maxed = !next
  const affordable = next ? gold >= next.cost : false

  return (
    <Panel as="section">
      <PanelHeader
        title={title}
        action={
          maxed ? (
            <StatusBadge tone="success">Maxed</StatusBadge>
          ) : (
            <StatusBadge tone="info">
              Tier {currentTier + 1}/{tiers.length}
            </StatusBadge>
          )
        }
      />
      <div className="p-4">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-md border border-border bg-background text-primary">
            {icon}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Current</p>
            <p className="font-display text-lg font-semibold">{current.label}</p>
            <p className="text-sm text-secondary">{current.value}</p>
          </div>
        </div>

        {/* Next upgrade row */}
        {maxed ? (
          <div className="rounded-md border border-success/40 bg-success/10 px-3 py-3 text-sm text-success">
            Fully upgraded. No further improvements available.
          </div>
        ) : (
          <UpgradeRow
            label={next.label}
            currentValue={current.value}
            nextValue={next.value}
            cost={next.cost}
            affordable={affordable}
            locked={false}
            loading={loading}
            onUpgrade={onUpgrade}
          />
        )}

        {/* Ladder overview */}
        <ol className="mt-4 space-y-1.5">
          {tiers.map((tier, i) => {
            const owned = i <= currentTier
            const isNext = i === currentTier + 1
            return (
              <li
                key={tier.label}
                className={cn(
                  'flex items-center justify-between rounded px-2 py-1 text-xs',
                  owned
                    ? 'text-foreground'
                    : isNext
                      ? 'text-secondary'
                      : 'text-muted-foreground',
                )}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      'size-1.5 rounded-full',
                      owned ? 'bg-primary' : isNext ? 'bg-secondary' : 'bg-border',
                    )}
                    aria-hidden="true"
                  />
                  {tier.label}
                </span>
                <span className="tabular-nums">{tier.value}</span>
              </li>
            )
          })}
        </ol>
      </div>
    </Panel>
  )
}

interface UpgradeRowProps {
  label: string
  currentValue: string
  nextValue: string
  cost: number
  affordable: boolean
  locked: boolean
  loading?: boolean
  onUpgrade: () => void
}

export function UpgradeRow({
  label,
  currentValue,
  nextValue,
  cost,
  affordable,
  locked,
  loading = false,
  onUpgrade,
}: UpgradeRowProps) {
  const disabled = locked || !affordable
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>{currentValue}</span>
            <ArrowRight className="size-3" aria-hidden="true" />
            <span className="font-semibold text-secondary">{nextValue}</span>
          </p>
        </div>
        {locked ? <LockBadge reason="Reach a higher level to unlock." /> : null}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="flex items-center gap-1 text-sm font-semibold text-primary tabular-nums">
          <Coins className="size-4" aria-hidden="true" />
          {cost.toLocaleString()}
        </span>
        <ActionButton
          onClick={onUpgrade}
          disabled={disabled}
          loading={loading}
          aria-label={`Upgrade to ${label} for ${cost} gold`}
        >
          {!affordable && !locked ? 'Not enough gold' : 'Upgrade'}
        </ActionButton>
      </div>
    </div>
  )
}
