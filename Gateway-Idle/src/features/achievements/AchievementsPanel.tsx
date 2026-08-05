import * as Dialog from '@radix-ui/react-dialog'
import { Award, X } from 'lucide-react'
import { useGameStore } from '../../store/useGameStore'

export function AchievementsPanel() {
  const unlockedIds = useGameStore((state) => state.achievements.unlockedIds)
  const currentStage = useGameStore((state) => state.progression.currentStage)
  const trainingUnlocked = useGameStore((state) => state.progression.trainingUnlocked)
  const rebirthUnlocked = useGameStore((state) => state.progression.rebirthUnlocked)
  const gatewayUnlocked = useGameStore((state) => state.progression.gatewayUnlocked)

  const systemMilestones = [
    { id: 'stage-1', label: 'Stage 1 Reached', achieved: currentStage >= 1 },
    { id: 'training-unlocked', label: 'Training Unlocked', achieved: trainingUnlocked },
    { id: 'rebirth-unlocked', label: 'Rebirth Unlocked', achieved: rebirthUnlocked },
    { id: 'gateway-unlocked', label: 'Gateway Unlocked', achieved: gatewayUnlocked },
  ]

  const totalUnlocked = unlockedIds.length + systemMilestones.filter((item) => item.achieved).length

  return (
    <article className="rounded-2xl border border-stone-700/40 bg-stone-900/70 p-4 text-stone-200" aria-label="Achievements panel">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <Award className="h-5 w-5 text-amber-300" aria-hidden="true" />
        Achievements
      </h2>

      <p className="mt-3 text-sm text-stone-300">Unlocked: <span className="font-semibold text-stone-100">{totalUnlocked}</span></p>

      <Dialog.Root>
        <Dialog.Trigger asChild>
          <button
            type="button"
            className="mt-4 rounded-xl border border-amber-400/50 bg-amber-300/90 px-4 py-2 font-medium text-stone-950 transition hover:bg-amber-200"
          >
            View Achievement Catalog
          </button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-[min(92vw,32rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-stone-700/60 bg-stone-900 p-5 text-stone-100 shadow-2xl">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-lg font-semibold">Achievement Catalog</Dialog.Title>
              <Dialog.Close asChild>
                <button type="button" className="rounded-lg p-1 text-stone-400 transition hover:bg-stone-800 hover:text-stone-100" aria-label="Close achievement catalog">
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </Dialog.Close>
            </div>

            <div className="mt-4 space-y-2">
              {systemMilestones.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between rounded-lg border border-stone-700/50 bg-stone-950/60 px-3 py-2 text-sm">
                  <span>{entry.label}</span>
                  <span className="font-semibold">{entry.achieved ? 'Unlocked' : 'Locked'}</span>
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs text-stone-400">
              Full achievement rewards and typed payloads are scheduled for Milestone 5.
            </p>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </article>
  )
}
