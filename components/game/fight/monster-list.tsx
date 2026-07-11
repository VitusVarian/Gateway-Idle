'use client'

import { Coins, Skull } from 'lucide-react'
import type { Monster } from '@/lib/game/types'
import { cn } from '@/lib/utils'

interface MonsterListProps {
  monsters: Monster[]
  selectedLevel: number
  onSelect: (level: number) => void
  playerLevel: number
}

export function MonsterList({
  monsters,
  selectedLevel,
  onSelect,
  playerLevel,
}: MonsterListProps) {
  if (monsters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-muted-foreground">
        <Skull className="size-6" aria-hidden="true" />
        <p className="text-sm">No monsters available in this region.</p>
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-1.5" role="listbox" aria-label="Select a monster">
      {monsters.map((monster) => {
        const selected = monster.level === selectedLevel
        const risky = monster.level > playerLevel
        return (
          <li key={monster.id}>
            <button
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => onSelect(monster.level)}
              className={cn(
                'w-full rounded-md border px-3 py-2.5 text-left outline-none transition-colors',
                'focus-visible:ring-2 focus-visible:ring-ring',
                selected
                  ? 'border-primary/50 bg-primary/10'
                  : 'border-border bg-background hover:border-muted-foreground/50 hover:bg-muted',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-foreground">{monster.name}</span>
                <span
                  className={cn(
                    'rounded px-1.5 py-0.5 text-xs font-semibold',
                    risky
                      ? 'bg-destructive/15 text-destructive'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  Lv {monster.level}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="tabular-nums">{monster.maxHp} HP</span>
                <span className="tabular-nums">{monster.xpReward} XP</span>
                <span className="flex items-center gap-1 tabular-nums text-primary">
                  <Coins className="size-3" aria-hidden="true" />
                  {monster.goldReward}
                </span>
              </div>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
