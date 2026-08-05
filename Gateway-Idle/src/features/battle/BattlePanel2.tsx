import { useGameStore } from '../../store/useGameStore'

export function BattlePanel() {
  const currentStage = useGameStore((state) => state.currentStage)
  const monsterHp = useGameStore((state) => state.monsterHp)
  const isBossStage = useGameStore((state) => state.isBossStage)
  const advanceStage = useGameStore((state) => state.advanceStage)
  const setStage = useGameStore((state) => state.retreatStage)

  return (
    <article className="rounded-2xl border border-stone-700/30 bg-stone-900/70 p-6 text-stone-200 shadow-2xl backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-amber-300/80">Battle</p>
          <h2 className="mt-2 text-xl font-semibold">Stage {currentStage}</h2>
        </div>
        <div className="text-right text-sm text-stone-400">
          {isBossStage ? 'Boss Encounter' : 'Standard Encounter'}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-stone-700/40 bg-stone-950/70 p-4">
        <div className="flex items-center justify-between text-sm text-stone-300">
          <span>Monster HP</span>
          <span>{monsterHp.toFixed(0)}</span>
        </div>
        <div className="mt-3 h-3 rounded-full bg-stone-800">
          <div className="h-3 rounded-full bg-amber-400" style={{ width: '76%' }} />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={() => setStage()}
          className="rounded-xl border border-stone-600 px-3 py-2 text-sm text-stone-200"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={advanceStage}
          className="rounded-xl border border-amber-400/50 bg-amber-300/90 px-3 py-2 text-sm font-medium text-stone-950"
        >
          Advance Stage
        </button>
      </div>
    </article>
  )
}
