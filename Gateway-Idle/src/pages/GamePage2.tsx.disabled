import { useEffect } from 'react'
import { BattlePanel } from '../features/battle/BattlePanel2'
import { TrainingPanel } from '../features/training/TrainingPanel2'
import { AchievementsPanel } from '../features/achievements/AchievementsPanel2'
import { useGameStore } from '../store/useGameStore'

export function GamePage() {
  const monsterSouls = useGameStore((state) => state.monsterSouls)
  const dps = useGameStore((state) => state.dps)
  const level = useGameStore((state) => state.level)
  const strength = useGameStore((state) => state.strength)
  const currentStage = useGameStore((state) => state.currentStage)
  const tick = useGameStore((state) => state.tick)

  useEffect(() => {
    const interval = window.setInterval(() => {
      tick(1000)
    }, 1000)

    return () => window.clearInterval(interval)
  }, [tick])

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="rounded-2xl border border-stone-700/30 bg-stone-950/60 p-6 shadow-2xl backdrop-blur-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-amber-300/80">Gateway of Darkness</p>
        <h1 className="mt-3 text-3xl font-semibold text-stone-100 sm:text-4xl">
          Idle Prototype Scaffold
        </h1>
        <p className="mt-3 text-stone-300/85">
          Level {level} | Strength {strength} | Stage {currentStage} | Monster Souls{' '}
          {monsterSouls.toFixed(1)} | DPS {dps.toFixed(1)}
        </p>
      </header>

      <section
        className="mt-6 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]"
        aria-label="Core combat panels"
      >
        <BattlePanel />
        <TrainingPanel />
      </section>

      <section
        className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]"
        aria-label="Progression panels"
      >
        <article className="rounded-2xl border border-stone-700/30 bg-stone-900/70 p-6 text-stone-200 shadow-2xl backdrop-blur-sm">
          <h2 className="text-xl font-semibold">Progression</h2>
          <p className="mt-3 text-sm text-stone-300">
            Stage progression, boss gates at stages 10, 100, and 1000, and training resets are wired
            into the game state.
          </p>
        </article>
        <AchievementsPanel />
      </section>
    </main>
  )
}
