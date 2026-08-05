import { Cog } from 'lucide-react'
import { formatDuration } from '../../shared/lib/time/formatDuration'
import { useGameStore } from '../../store/useGameStore'

interface OptionsPanelProps {
  onSaveNow: () => Promise<void>
  onOpenExport: () => Promise<void>
  onOpenImport: () => void
  onOpenReset: () => void
}

export function OptionsPanel({
  onSaveNow,
  onOpenExport,
  onOpenImport,
  onOpenReset,
}: OptionsPanelProps) {
  const totalPlayMs = useGameStore((state) => state.totalPlayMs)

  return (
    <article
      className="rounded-2xl border border-stone-700/40 bg-stone-900/70 p-4 text-stone-200"
      aria-label="Options panel"
    >
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <Cog className="h-5 w-5 text-amber-300" aria-hidden="true" />
        Options
      </h2>

      <p className="mt-3 text-sm text-stone-300">
        Total playtime:{' '}
        <span className="font-semibold text-stone-100">{formatDuration(totalPlayMs / 1000)}</span>
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            void onSaveNow()
          }}
          className="rounded-xl border border-amber-400/50 bg-amber-300/90 px-3 py-2 text-sm font-medium text-stone-950 transition hover:bg-amber-200"
        >
          Save Now (S)
        </button>
        <button
          type="button"
          onClick={() => {
            void onOpenExport()
          }}
          className="rounded-xl border border-amber-400/50 bg-amber-300/90 px-3 py-2 text-sm font-medium text-stone-950 transition hover:bg-amber-200"
        >
          Export (E)
        </button>
        <button
          type="button"
          onClick={onOpenImport}
          className="rounded-xl border border-amber-400/50 bg-amber-300/90 px-3 py-2 text-sm font-medium text-stone-950 transition hover:bg-amber-200"
        >
          Import (I)
        </button>
        <button
          type="button"
          onClick={onOpenReset}
          className="rounded-xl border border-red-500/50 bg-red-400/80 px-3 py-2 text-sm font-medium text-stone-950 transition hover:bg-red-300"
        >
          Full Reset
        </button>
      </div>

      <p className="mt-4 rounded-lg border border-stone-700/50 bg-stone-950/60 p-3 text-xs text-stone-300">
        Keyboard shortcuts: A Attack, S Save, E Export, I Import.
      </p>
    </article>
  )
}
