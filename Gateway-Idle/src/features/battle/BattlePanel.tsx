import { useGameStore } from '../../store/useGameStore'
import { formatNumber } from '../../shared/lib/formatting/formatNumber'
import { Swords, Gauge, Skull } from 'lucide-react'

function ResourceRow({ label, value, rate }: { label: string; value: string; rate: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <span className="text-sm text-stone-300">{label}</span>
      <div className="text-right">
        <span className="font-mono text-sm text-stone-100">{value}</span>
        <span className="ml-2 text-xs text-amber-300/70">(+{rate}/s)</span>
      </div>
    </div>
  )
}

export function BattlePanel() {
  const experience = useGameStore((s) => s.experience)
  const monsterSouls = useGameStore((s) => s.monsterSouls)
  const trainingPoints = useGameStore((s) => s.trainingPoints)
  const dps = useGameStore((s) => s.dps)
  const currentStage = useGameStore((s) => s.currentStage)
  const maxUnlockedStage = useGameStore((s) => s.maxUnlockedStage)
  const manualAttack = useGameStore((s) => s.manualAttack)

  return (
    <article
      className="flex flex-col gap-4 rounded-2xl border border-amber-300/30 bg-stone-900/80 p-5 text-stone-200 shadow-xl"
      aria-label="Battle panel"
    >
      <header className="flex items-center justify-between gap-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Swords className="h-5 w-5 text-amber-300" aria-hidden="true" />
          Battle
        </h2>
        <p className="text-xs uppercase tracking-[0.16em] text-amber-300/90">Always Active</p>
      </header>

      <div className="grid gap-2 rounded-xl border border-stone-700/50 bg-stone-950/50 p-3 sm:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-stone-400">Stage</p>
          <p className="mt-1 text-sm font-semibold text-stone-100">
            {currentStage} / {maxUnlockedStage}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-stone-400">Damage Per Second</p>
          <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-stone-100">
            <Gauge className="h-4 w-4 text-amber-300" aria-hidden="true" />
            {formatNumber(dps)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-stone-400">Training Points</p>
          <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-stone-100">
            <Skull className="h-4 w-4 text-amber-300" aria-hidden="true" />
            {formatNumber(trainingPoints)}
          </p>
        </div>
      </div>

      <div className="divide-y divide-stone-700/30">
        <ResourceRow label="Experience" value={formatNumber(experience)} rate={formatNumber(dps)} />
        <ResourceRow
          label="Monster Souls"
          value={formatNumber(monsterSouls)}
          rate={formatNumber(dps)}
        />
      </div>

      <button
        type="button"
        onClick={manualAttack}
        className="mt-auto rounded-xl border border-amber-400/50 bg-amber-300/90 px-4 py-2 font-medium text-stone-950 transition hover:bg-amber-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"
        aria-label="Manual attack to gain 1 second of resources instantly"
      >
        Attack (A)
      </button>
    </article>
  )
}
