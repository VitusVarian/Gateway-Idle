import BigNumber from 'bignumber.js'
import { useMemo } from 'react'
import { formatNumber } from '../shared/lib/formatting/formatNumber'
import { useThrottledValue } from '../shared/lib/hooks/useThrottledValue'
import { ACHIEVEMENT_CATALOG, useGameStore } from '../store/useGameStore'

const ACTION_BUTTON_CLASS =
  'rounded-xl border border-stone-600 px-3 py-2 text-sm font-medium text-stone-100 transition hover:border-amber-400/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900'

const PRIMARY_ACTION_BUTTON_CLASS =
  'rounded-xl border border-amber-400/50 bg-amber-300/90 px-4 py-2 font-medium text-stone-950 transition hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900'

function HeaderStats() {
  const monsterSouls = useGameStore((state) => state.monsterSouls)
  const trainingPoints = useGameStore((state) => state.trainingPoints)
  const dps = useGameStore((state) => state.dps)

  const throttledSouls = useThrottledValue(monsterSouls, 150)
  const throttledTrainingPoints = useThrottledValue(trainingPoints, 150)
  const throttledDps = useThrottledValue(dps, 150)

  return (
    <header className="rounded-2xl border border-stone-700/30 bg-stone-950/60 p-6 shadow-2xl backdrop-blur-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-amber-300/80">Gateway of Darkness</p>
      <h1 className="mt-3 text-3xl font-semibold text-stone-100 sm:text-4xl">
        Idle Prototype Scaffold
      </h1>
      <p className="mt-3 text-stone-300/85" aria-live="polite" aria-atomic="true">
        Monster Souls: {formatNumber(throttledSouls)} | Training Points:{' '}
        {formatNumber(throttledTrainingPoints)} | DPS: {formatNumber(throttledDps)}
      </p>
    </header>
  )
}

function BattlePanel() {
  const currentStage = useGameStore((state) => state.currentStage)
  const maxUnlockedStage = useGameStore((state) => state.maxUnlockedStage)
  const isBossStage = useGameStore((state) => state.isBossStage)
  const monsterHp = useGameStore((state) => state.monsterHp)
  const advanceStage = useGameStore((state) => state.advanceStage)
  const retreatStage = useGameStore((state) => state.retreatStage)
  const tick = useGameStore((state) => state.tick)

  return (
    <article className="rounded-2xl border border-stone-700/30 bg-stone-900/70 p-4 text-stone-200">
      <h2 className="text-lg font-medium">Battle</h2>
      <p className="mt-2 text-sm text-stone-300">
        Stage {currentStage} / unlocked to {maxUnlockedStage}
      </p>
      <p className="mt-2 text-sm text-stone-300" aria-live="polite">
        {isBossStage ? 'Boss gate active' : 'Standard stage'} | Monster HP:{' '}
        {formatNumber(monsterHp)}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={retreatStage}
          className={ACTION_BUTTON_CLASS}
          aria-label="Move to previous stage"
        >
          Back Stage
        </button>
        <button
          type="button"
          onClick={advanceStage}
          className={ACTION_BUTTON_CLASS}
          aria-label="Advance to next stage"
        >
          Advance Stage
        </button>
        <button
          type="button"
          onClick={() => tick(5_000)}
          className={ACTION_BUTTON_CLASS}
          aria-label="Simulate five seconds of game time"
        >
          Simulate 5s
        </button>
      </div>
    </article>
  )
}

function TrainingPanel() {
  const trainingPoints = useGameStore((state) => state.trainingPoints)
  const trainingUnlocked = useGameStore((state) => state.trainingUnlocked)
  const trainingResetCount = useGameStore((state) => state.trainingResetCount)
  const totalTrainingPointsEarned = useGameStore((state) => state.totalTrainingPointsEarned)
  const upgrades = useGameStore((state) => state.upgrades)
  const startTrainingReset = useGameStore((state) => state.startTrainingReset)
  const buyTrainingUpgrade = useGameStore((state) => state.buyTrainingUpgrade)

  return (
    <article className="rounded-2xl border border-stone-700/30 bg-stone-900/70 p-4 text-stone-200">
      <h2 className="text-lg font-medium">Training</h2>
      <p className="mt-2 text-sm text-stone-300">
        {trainingUnlocked
          ? 'Training is unlocked. A reset returns you to stage 1 and base stats.'
          : 'Training unlocks at the stage 10 boss.'}
      </p>
      <p className="mt-2 text-sm text-stone-300" aria-live="polite">
        Training Points: {formatNumber(trainingPoints)} | Resets: {trainingResetCount} | Lifetime
        earned: {formatNumber(totalTrainingPointsEarned)}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={startTrainingReset}
          disabled={!trainingUnlocked}
          className={`${ACTION_BUTTON_CLASS} disabled:cursor-not-allowed disabled:opacity-50`}
          aria-disabled={!trainingUnlocked}
        >
          Start Training Reset
        </button>
        <button
          type="button"
          onClick={() => buyTrainingUpgrade('strengthGrowth')}
          className={ACTION_BUTTON_CLASS}
        >
          Strength Growth Lv. {upgrades.strengthGrowth}
        </button>
        <button
          type="button"
          onClick={() => buyTrainingUpgrade('experienceModifier')}
          className={ACTION_BUTTON_CLASS}
        >
          Experience Mod Lv. {upgrades.experienceModifier}
        </button>
        <button
          type="button"
          onClick={() => buyTrainingUpgrade('monsterSoulModifier')}
          className={ACTION_BUTTON_CLASS}
        >
          Soul Mod Lv. {upgrades.monsterSoulModifier}
        </button>
      </div>
    </article>
  )
}

function ProgressionPanel() {
  const rebirthUnlocked = useGameStore((state) => state.rebirthUnlocked)
  const gatewayUnlocked = useGameStore((state) => state.gatewayUnlocked)
  const trainingCycleMs = useGameStore((state) => state.trainingCycleMs)
  const rebirthCycleMs = useGameStore((state) => state.rebirthCycleMs)
  const gatewayCycleMs = useGameStore((state) => state.gatewayCycleMs)

  return (
    <article className="rounded-2xl border border-stone-700/30 bg-stone-900/70 p-4 text-stone-200">
      <h2 className="text-lg font-medium">Progression</h2>
      <p className="mt-2 text-sm text-stone-300">
        Rebirth: {rebirthUnlocked ? 'placeholder unlocked' : 'locked until stage 100'}
      </p>
      <p className="mt-2 text-sm text-stone-300">
        Gateway: {gatewayUnlocked ? 'placeholder unlocked' : 'locked until stage 1000'}
      </p>
      <p className="mt-2 text-sm text-stone-300" aria-live="polite">
        Timers: Training {Math.floor(trainingCycleMs / 1000)}s | Rebirth{' '}
        {Math.floor(rebirthCycleMs / 1000)}s | Gateway {Math.floor(gatewayCycleMs / 1000)}s
      </p>
    </article>
  )
}

function AchievementsPanel() {
  const unlockedAchievementIds = useGameStore((state) => state.unlockedAchievementIds)
  const unlockedSet = useMemo(() => new Set(unlockedAchievementIds), [unlockedAchievementIds])

  return (
    <section
      className="mt-6 rounded-2xl border border-stone-700/30 bg-stone-900/70 p-4 text-stone-200"
      aria-live="polite"
    >
      <h2 className="text-lg font-medium">Achievements</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ACHIEVEMENT_CATALOG.map((achievement) => {
          const unlocked = unlockedSet.has(achievement.id)

          return (
            <article
              key={achievement.id}
              className={`rounded-xl border p-3 ${
                unlocked
                  ? 'border-amber-400/40 bg-amber-300/10'
                  : 'border-stone-700/40 bg-stone-950/40'
              }`}
            >
              <h3 className="text-sm font-semibold text-stone-100">{achievement.title}</h3>
              <p className="mt-2 text-sm text-stone-300">{achievement.description}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-stone-400">
                {unlocked ? 'Unlocked' : 'Locked'} | Reward: {achievement.rewardType}
              </p>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function ScaffoldActions() {
  return (
    <button
      type="button"
      onClick={() => useGameStore.getState().gainMonsterSouls(new BigNumber(10))}
      className={`mt-6 ${PRIMARY_ACTION_BUTTON_CLASS}`}
      aria-label="Gain ten Monster Souls for scaffold testing"
    >
      Gain 10 Monster Souls (temporary scaffold action)
    </button>
  )
}

export function GamePage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <HeaderStats />

      <section
        className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        aria-label="Core game panels"
      >
        <BattlePanel />
        <TrainingPanel />
        <ProgressionPanel />
      </section>

      <AchievementsPanel />

      <ScaffoldActions />
    </main>
  )
}
