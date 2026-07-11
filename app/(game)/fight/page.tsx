'use client'

import { useEffect, useRef, useState } from 'react'
import { ScrollText } from 'lucide-react'
import { CombatArena } from '@/components/game/fight/combat-arena'
import { MonsterList } from '@/components/game/fight/monster-list'
import { PageHeading } from '@/components/game/page-heading'
import { Panel, PanelHeader } from '@/components/game/panel'
import { useGame } from '@/lib/game/game-context'
import { monsters } from '@/lib/game/mock-data'

interface LogEntry {
  id: number
  text: string
  tone: 'win' | 'loss' | 'info'
}

export default function FightPage() {
  const { character, combat, selectMonsterLevel, startFight, tickCooldown } =
    useGame()
  const [fighting, setFighting] = useState(false)
  const [log, setLog] = useState<LogEntry[]>([
    { id: 0, text: 'You enter the gateway depths. Foes stir in the dark.', tone: 'info' },
  ])
  const logId = useRef(1)

  const selectedMonster =
    monsters.find((m) => m.level === combat.selectedMonsterLevel) ?? monsters[0]

  // Cooldown timer.
  useEffect(() => {
    if (combat.cooldownSecRemaining <= 0) return
    const t = window.setInterval(() => tickCooldown(), 1000)
    return () => window.clearInterval(t)
  }, [combat.cooldownSecRemaining, tickCooldown])

  function handleFight() {
    setFighting(true)
    window.setTimeout(() => {
      startFight()
      setFighting(false)
    }, 700)
  }

  // Append to log when an outcome resolves.
  const lastOutcomeRef = useRef(combat.lastOutcome)
  const lastCooldownRef = useRef(combat.cooldownSecRemaining)
  useEffect(() => {
    const changed =
      combat.lastOutcome !== lastOutcomeRef.current ||
      (combat.cooldownSecRemaining === 10 && lastCooldownRef.current !== 10)
    if (changed && combat.lastOutcome !== 'none') {
      const entry: LogEntry =
        combat.lastOutcome === 'victory'
          ? {
              id: logId.current++,
              text: `You defeated the ${selectedMonster.name} (+${selectedMonster.xpReward} XP, +${selectedMonster.goldReward} gold).`,
              tone: 'win',
            }
          : {
              id: logId.current++,
              text: `The ${selectedMonster.name} overpowered you. You retreat to recover.`,
              tone: 'loss',
            }
      setLog((l) => [entry, ...l].slice(0, 12))
    }
    lastOutcomeRef.current = combat.lastOutcome
    lastCooldownRef.current = combat.cooldownSecRemaining
  }, [combat.lastOutcome, combat.cooldownSecRemaining, selectedMonster])

  return (
    <div>
      <PageHeading
        title="Combat Arena"
        description="Choose a foe, strike, and grow stronger. Higher levels yield greater rewards."
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)_minmax(0,0.9fr)]">
        {/* Monster list */}
        <Panel>
          <PanelHeader title="Targets" description="Select a monster level." />
          <div className="p-3">
            <MonsterList
              monsters={monsters}
              selectedLevel={combat.selectedMonsterLevel}
              onSelect={selectMonsterLevel}
              playerLevel={character.level}
            />
          </div>
        </Panel>

        {/* Combat arena */}
        <Panel>
          <PanelHeader title="Encounter" description="Resolve the battle." />
          <div className="p-4">
            <CombatArena
              combat={combat}
              monster={selectedMonster}
              characterName={character.name}
              onFight={handleFight}
              fighting={fighting}
            />
          </div>
        </Panel>

        {/* Combat log */}
        <Panel>
          <PanelHeader title="Combat Log" />
          <div className="p-3">
            <ul
              className="flex max-h-[420px] flex-col gap-2 overflow-y-auto"
              aria-live="polite"
              aria-label="Combat log"
            >
              {log.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-start gap-2 rounded-md border border-border bg-background px-2.5 py-2 text-xs leading-relaxed"
                >
                  <ScrollText
                    className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span
                    className={
                      entry.tone === 'win'
                        ? 'text-success'
                        : entry.tone === 'loss'
                          ? 'text-destructive'
                          : 'text-muted-foreground'
                    }
                  >
                    {entry.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Panel>
      </div>
    </div>
  )
}
