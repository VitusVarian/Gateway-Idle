import BigNumber from 'bignumber.js'
import { formatNumber } from '../shared/lib/formatting/formatNumber'
import { useGameStore } from '../store/useGameStore'

export function GamePage() {
  const monsterSouls = useGameStore((state) => state.monsterSouls)
  const dps = useGameStore((state) => state.dps)

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="rounded-2xl border border-stone-700/30 bg-stone-950/60 p-6 shadow-2xl backdrop-blur-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-amber-300/80">Gateway of Darkness</p>
        <h1 className="mt-3 text-3xl font-semibold text-stone-100 sm:text-4xl">Idle Prototype Scaffold</h1>
        <p className="mt-3 text-stone-300/85">
          Monster Souls: {formatNumber(monsterSouls)} | DPS: {formatNumber(dps)}
        </p>
      </header>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Core game panels">
        <article className="rounded-2xl border border-stone-700/30 bg-stone-900/70 p-4 text-stone-200">
          <h2 className="text-lg font-medium">Battle</h2>
          <p className="mt-2 text-sm text-stone-300">Persistent combat viewport placeholder.</p>
        </article>

        <article className="rounded-2xl border border-stone-700/30 bg-stone-900/70 p-4 text-stone-200">
          <h2 className="text-lg font-medium">Training</h2>
          <p className="mt-2 text-sm text-stone-300">Upgrade and allocation panel placeholder.</p>
        </article>

        <article className="rounded-2xl border border-stone-700/30 bg-stone-900/70 p-4 text-stone-200">
          <h2 className="text-lg font-medium">Progression</h2>
          <p className="mt-2 text-sm text-stone-300">Stage and prestige panel placeholder.</p>
        </article>
      </section>

      <button
        type="button"
        onClick={() => useGameStore.getState().gainMonsterSouls(new BigNumber(10))}
        className="mt-6 rounded-xl border border-amber-400/50 bg-amber-300/90 px-4 py-2 font-medium text-stone-950 transition hover:bg-amber-200"
      >
        Gain 10 Monster Souls (temporary scaffold action)
      </button>
    </main>
  )
}
