import { useGameStore, getTrainingUpgradeCost } from '../../store/useGameStore'

export function TrainingPanel() {
  const trainingPoints = useGameStore((state) => state.trainingPoints)
  const trainingUnlocked = useGameStore((state) => state.trainingUnlocked)
  const trainingResetCount = useGameStore((state) => state.trainingResetCount)
  const totalTrainingPointsEarned = useGameStore((state) => state.totalTrainingPointsEarned)
  const upgrades = useGameStore((state) => state.upgrades)
  const startTrainingReset = useGameStore((state) => state.startTrainingReset)
  const buyTrainingUpgrade = useGameStore((state) => state.buyTrainingUpgrade)

  return (
    <article className="rounded-2xl border border-stone-700/30 bg-stone-900/70 p-6 text-stone-200 shadow-2xl backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-amber-300/80">Training</p>
          <h2 className="mt-2 text-xl font-semibold">Prestige Progress</h2>
        </div>
        <div className="text-right text-sm text-stone-400">
          {trainingUnlocked ? 'Unlocked' : 'Locked'}
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-stone-700/40 bg-stone-950/70 p-4 text-sm text-stone-300">
        <p>Training Points: {trainingPoints.toFixed(1)}</p>
        <p>Resets: {trainingResetCount}</p>
        <p>Total earned: {totalTrainingPointsEarned}</p>
      </div>

      <button
        type="button"
        onClick={startTrainingReset}
        className="mt-6 w-full rounded-xl border border-amber-400/50 bg-amber-300/90 px-3 py-2 text-sm font-medium text-stone-950"
      >
        Start Training Reset
      </button>

      <div className="mt-6 space-y-3">
        {Object.entries(upgrades).map(([key, level]) => (
          <div key={key} className="flex items-center justify-between rounded-xl border border-stone-700/40 bg-stone-950/70 px-3 py-3">
            <div>
              <p className="text-sm font-medium text-stone-100">{key}</p>
              <p className="text-xs text-stone-400">Level {level}</p>
            </div>
            <button
              type="button"
              onClick={() => buyTrainingUpgrade(key as keyof typeof upgrades)}
              className="rounded-lg border border-stone-600 px-3 py-2 text-xs text-stone-200"
            >
              Buy {getTrainingUpgradeCost(key as keyof typeof upgrades).toFixed(0)}
            </button>
          </div>
        ))}
      </div>
    </article>
  )
}
