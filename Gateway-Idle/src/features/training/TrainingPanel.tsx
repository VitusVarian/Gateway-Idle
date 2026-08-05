import { Dumbbell } from 'lucide-react'
import { formatNumber } from '../../shared/lib/formatting/formatNumber'
import { useGameStore } from '../../store/useGameStore'

const TRAINING_KEYS = [
  { id: 'strengthGrowth', label: 'Strength Growth' },
  { id: 'levelingDifficulty', label: 'Leveling Efficiency' },
  { id: 'experienceModifier', label: 'Experience Gain' },
  { id: 'monsterSoulModifier', label: 'Monster Souls Gain' },
] as const

export function TrainingPanel() {
  const trainingUnlocked = useGameStore((state) => state.progression.trainingUnlocked)
  const trainingPoints = useGameStore((state) => state.resources.trainingPoints)
  const trainingUpgrades = useGameStore((state) => state.upgrades.training)

  return (
    <article className="rounded-2xl border border-stone-700/40 bg-stone-900/70 p-4 text-stone-200" aria-label="Training panel">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <Dumbbell className="h-5 w-5 text-amber-300" aria-hidden="true" />
        Training
      </h2>

      <p className="mt-3 text-sm text-stone-300">
        Training Points: <span className="font-semibold text-stone-100">{formatNumber(trainingPoints)}</span>
      </p>

      {!trainingUnlocked ? (
        <p className="mt-3 rounded-xl border border-stone-700/50 bg-stone-950/60 p-3 text-sm text-stone-300">
          Training is locked. This panel is scaffolded for Milestone 5 reset system work.
        </p>
      ) : null}

      <div className="mt-3 space-y-2">
        {TRAINING_KEYS.map((entry) => (
          <div key={entry.id} className="flex items-center justify-between rounded-lg border border-stone-700/50 bg-stone-950/50 px-3 py-2">
            <span className="text-sm text-stone-300">{entry.label}</span>
            <span className="text-sm font-semibold text-stone-100">Lv {trainingUpgrades[entry.id] ?? 0}</span>
          </div>
        ))}
      </div>
    </article>
  )
}
