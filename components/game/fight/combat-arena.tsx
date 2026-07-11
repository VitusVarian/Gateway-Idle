'use client'

import { Shield, Skull, Swords, Timer } from 'lucide-react'
import { ActionButton } from '@/components/game/action-button'
import { HealthBar } from '@/components/game/health-bar'
import { StatusBadge } from '@/components/game/status-badge'
import type { CombatState, Monster } from '@/lib/game/types'

interface CombatArenaProps {
  combat: CombatState
  monster: Monster
  characterName: string
  onFight: () => void
  fighting: boolean
}

export function CombatArena({
  combat,
  monster,
  characterName,
  onFight,
  fighting,
}: CombatArenaProps) {
  const onCooldown = combat.cooldownSecRemaining > 0

  return (
    <div className="flex flex-col gap-4">
      {/* Combatants */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-border bg-background p-3">
          <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
            <Shield className="size-4 text-secondary" aria-hidden="true" />
            <span className="truncate">{characterName}</span>
          </div>
          <HealthBar
            label="HP"
            value={combat.playerHp}
            max={combat.playerMaxHp}
            tone="health"
          />
        </div>

        <div className="rounded-lg border border-border bg-background p-3">
          <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
            <Skull className="size-4 text-destructive" aria-hidden="true" />
            <span className="truncate">{monster.name}</span>
          </div>
          <HealthBar
            label="HP"
            value={combat.lastOutcome === 'victory' ? 0 : combat.enemyHp || monster.maxHp}
            max={monster.maxHp}
            tone="enemy"
          />
        </div>
      </div>

      {/* Outcome / status */}
      <div className="flex min-h-9 items-center justify-center rounded-md border border-border bg-surface px-3 py-2">
        {combat.lastOutcome === 'victory' ? (
          <StatusBadge tone="success">Victory — spoils claimed</StatusBadge>
        ) : combat.lastOutcome === 'defeat' ? (
          <StatusBadge tone="error">Defeat — you were driven back</StatusBadge>
        ) : (
          <span className="text-sm text-muted-foreground">
            Select a target and begin the encounter.
          </span>
        )}
      </div>

      {/* Action */}
      <div aria-live="polite">
        {onCooldown ? (
          <ActionButton
            tone="muted"
            fullWidth
            disabled
            icon={<Timer className="size-4" aria-hidden="true" />}
          >
            Cooldown — {combat.cooldownSecRemaining}s
          </ActionButton>
        ) : (
          <ActionButton
            tone="danger"
            fullWidth
            loading={fighting}
            onClick={onFight}
            icon={<Swords className="size-4" aria-hidden="true" />}
          >
            Fight {monster.name}
          </ActionButton>
        )}
      </div>
    </div>
  )
}
