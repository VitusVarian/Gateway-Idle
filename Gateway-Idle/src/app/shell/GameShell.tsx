import { useMemo } from 'react'
import { BattlePanel } from '../../features/battle/BattlePanel'
import { useGameStore } from '../../store/useGameStore'
import {
  selectMilestoneSummary,
  selectRateDisplays,
  selectStageLockState,
  selectTrainingUpgradeAffordability,
} from '../../store/selectors/gameSelectors'
import { formatNumber } from '../../shared/lib/formatting/formatNumber'
import { BottomPanelHost } from './BottomPanelHost'

export function GameShell() {
  const currentStage = useGameStore((state) => state.currentStage)
  const maxUnlockedStage = useGameStore((state) => state.maxUnlockedStage)
  const trainingPoints = useGameStore((state) => state.trainingPoints)
  const trainingUpgrades = useGameStore((state) => state.upgrades)
  const trainingUnlocked = useGameStore((state) => state.trainingUnlocked)
  const dps = useGameStore((state) => state.dps)

  const stageLockState = useMemo(
    () => selectStageLockState(useGameStore.getState()),
    [maxUnlockedStage, trainingUnlocked],
  )
  const milestoneSummary = useMemo(
    () => selectMilestoneSummary(useGameStore.getState()),
    [currentStage, maxUnlockedStage, trainingUnlocked],
  )
  const rateDisplays = useMemo(
    () => selectRateDisplays(useGameStore.getState()),
    [dps, trainingUpgrades.strengthGrowth],
  )
  const affordability = useMemo(
    () => selectTrainingUpgradeAffordability(useGameStore.getState(), 'strengthGrowth'),
    [trainingPoints, trainingUpgrades.strengthGrowth],
  )

  return (
    <div className="flex min-h-screen flex-col bg-stone-950 text-stone-100">
      <header className="border-b border-stone-800/80 bg-stone-950/90 px-4 py-4 shadow-lg shadow-black/20">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-amber-300/80">
              Gateway of Darkness
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-stone-100">Idle Prototype Scaffold</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-stone-300">
            <span>
              Stage {currentStage} / {maxUnlockedStage}
            </span>
            <span>TP {formatNumber(trainingPoints)}</span>
            <span>DPS {formatNumber(rateDisplays.dps)}</span>
            <span>Milestone {milestoneSummary.highestStageReached}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 px-4 py-4 lg:px-6">
        <section className="rounded-2xl border border-stone-800 bg-stone-900/80 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-stone-300">
              Training unlock: {stageLockState.trainingLocked ? 'locked' : 'available'} | Rebirth:{' '}
              {stageLockState.rebirthLocked ? 'locked' : 'available'} | Gateway:{' '}
              {stageLockState.gatewayLocked ? 'locked' : 'available'}
            </p>
            <p className="text-sm text-stone-300">
              Current milestone reward: {formatNumber(milestoneSummary.rewardForCurrentCycle)} |
              Affordability: {affordability.canAfford ? 'yes' : 'no'}
            </p>
          </div>
        </section>

        <section className="flex flex-1 flex-col gap-4">
          <div className="min-h-[16rem] rounded-2xl border border-stone-800 bg-stone-900/80 p-4">
            <BattlePanel />
          </div>

          <div className="flex min-h-[18rem] flex-1 flex-col rounded-2xl border border-stone-800 bg-stone-900/80 p-4">
            <BottomPanelHost />
          </div>
        </section>
      </main>
    </div>
  )
}
