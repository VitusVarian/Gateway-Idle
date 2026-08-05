import BigNumber from 'bignumber.js'
import { create } from 'zustand'

type TrainingUpgradeKey = 'strengthGrowth' | 'experienceModifier' | 'monsterSoulModifier'

type AchievementRewardType = 'none' | 'trainingPoints'

interface TrainingUpgradeState {
  strengthGrowth: number
  experienceModifier: number
  monsterSoulModifier: number
}

interface AchievementDefinition {
  id: string
  title: string
  description: string
  rewardType: AchievementRewardType
  rewardValue?: number
}

const BOSS_STAGES = [10, 100, 1000] as const
const FIRST_MILESTONE_STAGE = 10
const MILESTONE_SPACING = 1.6
const TRAINING_BASE_REWARD = 1
const TRAINING_REWARD_COEFFICIENT = 2
const TRAINING_UPGRADE_BASE_COST = 1
const TRAINING_UPGRADE_COST_RATE = 1.1
const MAX_ELAPSED_MS_PER_TICK = 5_000

export const ACHIEVEMENT_CATALOG: AchievementDefinition[] = [
  {
    id: 'first-training-reset',
    title: 'First Training Reset',
    description: 'Complete your first Training reset.',
    rewardType: 'none',
  },
  {
    id: 'stage-10-boss',
    title: 'First Boss Broken',
    description: 'Reach stage 10 and unlock Training.',
    rewardType: 'trainingPoints',
    rewardValue: 1,
  },
  {
    id: 'stage-100-boss',
    title: 'Second Gate Opened',
    description: 'Reach stage 100 and reveal Rebirth.',
    rewardType: 'none',
  },
  {
    id: 'stage-1000-boss',
    title: 'Gateway Witness',
    description: 'Reach stage 1000 and reveal Gateway.',
    rewardType: 'none',
  },
]

function isBossStage(stage: number): boolean {
  return BOSS_STAGES.includes(stage as (typeof BOSS_STAGES)[number])
}

function calculateMonsterHitPoints(stage: number): BigNumber {
  const bossThresholdsReached = BOSS_STAGES.filter((bossStage) => stage >= bossStage).length
  const tierMultiplier = new BigNumber(2).pow(bossThresholdsReached)
    gainMonsterSouls: (amount) => {
      set((state) => ({
        monsterSouls: state.monsterSouls.plus(amount),
      }))
    },
    tick: (elapsedMs) => {
      if (!Number.isFinite(elapsedMs) || elapsedMs <= 0) {
        return
      }
      const boundedElapsedMs = Math.min(elapsedMs, MAX_ELAPSED_MS_PER_TICK)
      set((state) => {
        const simulationState = toSimulationState(state)
        const advanced = advanceSimulation(simulationState, boundedElapsedMs)
        return applySimulationDelta(state, advanced, boundedElapsedMs)
      })
    },
  strengthGrowth: number
  experience: BigNumber
  currentStage: number
  maxUnlockedStage: number
  highestStageReachedThisCycle: number
  trainingUnlocked: boolean
  rebirthUnlocked: boolean
  gatewayUnlocked: boolean
  trainingResetCount: number
  totalTrainingPointsEarned: BigNumber
  trainingCycleMs: number
  rebirthCycleMs: number
  gatewayCycleMs: number
  firstTrainingMs: number | null
  firstRebirthMs: number | null
  firstGatewayMs: number | null
  upgrades: TrainingUpgradeState
  weaponLevel: number
  unlockedAchievementIds: string[]
  isBossStage: boolean
  monsterHp: BigNumber
  totalPlayMs: number
  gainMonsterSouls: (amount: BigNumber) => void
  tick: (elapsedMs: number) => void
  advanceStage: () => void
  retreatStage: () => void
  startTrainingReset: () => void
  buyTrainingUpgrade: (upgradeKey: TrainingUpgradeKey) => void
  purchaseWeaponUpgrade: () => void
  manualAttack: () => void
}

function unlockAchievement(state: GameState, achievementId: string): Partial<GameState> {
  if (!achievementId || state.unlockedAchievementIds.includes(achievementId)) {
    return {}
  }

  const achievement = ACHIEVEMENT_CATALOG.find((item) => item.id === achievementId)
  if (!achievement) {
    return {}
  }

  const rewardTrainingPoints =
    achievement.rewardType === 'trainingPoints' ? (achievement.rewardValue ?? 0) : 0

  return {
    unlockedAchievementIds: [...state.unlockedAchievementIds, achievementId],
    trainingPoints: state.trainingPoints.plus(rewardTrainingPoints),
    totalTrainingPointsEarned: state.totalTrainingPointsEarned.plus(rewardTrainingPoints),
  }
}

export const useGameStore = create<GameState>((set) => ({
  monsterSouls: new BigNumber(0),
  trainingPoints: new BigNumber(0),
  dps: new BigNumber(1),
  level: 1,
  strength: 1,
  strengthGrowth: 1,
  experience: new BigNumber(0),
  currentStage: 1,
  maxUnlockedStage: 1,
  highestStageReachedThisCycle: 1,
  trainingUnlocked: false,
  rebirthUnlocked: false,
  gatewayUnlocked: false,
  trainingResetCount: 0,
  totalTrainingPointsEarned: new BigNumber(0),
  trainingCycleMs: 0,
  rebirthCycleMs: 0,
  gatewayCycleMs: 0,
  firstTrainingMs: null,
  firstRebirthMs: null,
  firstGatewayMs: null,
  upgrades: {
    strengthGrowth: 0,
    experienceModifier: 0,
    monsterSoulModifier: 0,
  },
  weaponLevel: 0,
  unlockedAchievementIds: [],
  isBossStage: false,
  monsterHp: calculateMonsterHitPoints(1),
  totalPlayMs: 0,
  gainMonsterSouls: (amount) => {
    set((state) => ({
      monsterSouls: state.monsterSouls.plus(amount),
    }))
  },
  tick: (elapsedMs) => {
    if (!Number.isFinite(elapsedMs) || elapsedMs <= 0) {
      return
    }

    const boundedElapsedMs = Math.min(elapsedMs, MAX_ELAPSED_MS_PER_TICK)

    set((state) => {
      const nextTrainingUnlocked = state.trainingUnlocked || state.maxUnlockedStage >= 10
      const nextRebirthUnlocked = state.rebirthUnlocked || state.maxUnlockedStage >= 100
      const nextGatewayUnlocked = state.gatewayUnlocked || state.maxUnlockedStage >= 1000
      const nextState = {
        experience: state.experience.plus(new BigNumber(boundedElapsedMs).dividedBy(1000)),
        dps: new BigNumber(state.strength + state.upgrades.strengthGrowth + 1),
        totalPlayMs: state.totalPlayMs + boundedElapsedMs,
        trainingCycleMs: state.trainingCycleMs + boundedElapsedMs,
        rebirthCycleMs: state.rebirthCycleMs + boundedElapsedMs,
        gatewayCycleMs: state.gatewayCycleMs + boundedElapsedMs,
        trainingUnlocked: nextTrainingUnlocked,
        rebirthUnlocked: nextRebirthUnlocked,
        gatewayUnlocked: nextGatewayUnlocked,
      }

      return {
        ...nextState,
        ...unlockAchievement(
          {
            ...state,
            ...nextState,
          } as GameState,
          state.maxUnlockedStage >= 1000
            ? 'stage-1000-boss'
            : state.maxUnlockedStage >= 100
              ? 'stage-100-boss'
              : state.maxUnlockedStage >= 10
                ? 'stage-10-boss'
                : '',
        ),
      }
    })
  },
  advanceStage: () => {
    set((state) => {
      const nextStage = state.currentStage + 1
      const nextMaxUnlockedStage = Math.max(state.maxUnlockedStage, nextStage)
      const nextState = {
        currentStage: nextStage,
        maxUnlockedStage: nextMaxUnlockedStage,
        highestStageReachedThisCycle: Math.max(state.highestStageReachedThisCycle, nextStage),
        isBossStage: isBossStage(nextStage),
        monsterHp: calculateMonsterHitPoints(nextStage),
        trainingUnlocked: state.trainingUnlocked || nextStage >= 10,
        rebirthUnlocked: state.rebirthUnlocked || nextStage >= 100,
        gatewayUnlocked: state.gatewayUnlocked || nextStage >= 1000,
      }

      return {
        ...nextState,
        ...unlockAchievement(
          {
            ...state,
            ...nextState,
          } as GameState,
          nextStage >= 1000
            ? 'stage-1000-boss'
            : nextStage >= 100
              ? 'stage-100-boss'
              : nextStage >= 10
                ? 'stage-10-boss'
                : '',
        ),
      }
    })
  },
  retreatStage: () => {
    set((state) => {
      const nextStage = Math.max(1, state.currentStage - 1)
      return {
        currentStage: nextStage,
        isBossStage: isBossStage(nextStage),
        monsterHp: calculateMonsterHitPoints(nextStage),
      }
    })
  },
  startTrainingReset: () => {
    set((state) => {
      const trainingReward = calculateTrainingMilestoneReward(state.highestStageReachedThisCycle)
      const baseState = {
        monsterSouls: new BigNumber(0),
        trainingPoints: state.trainingPoints.plus(trainingReward),
        dps: new BigNumber(1 + state.upgrades.strengthGrowth),
        level: 1,
        strength: 1,
        strengthGrowth: 1 + state.upgrades.strengthGrowth,
        experience: new BigNumber(0),
        currentStage: 1,
        maxUnlockedStage: 1,
        highestStageReachedThisCycle: 1,
        trainingUnlocked: true,
        trainingResetCount: state.trainingResetCount + 1,
        totalTrainingPointsEarned: state.totalTrainingPointsEarned.plus(trainingReward),
        trainingCycleMs: 0,
        firstTrainingMs: state.firstTrainingMs ?? state.trainingCycleMs,
        isBossStage: false,
        monsterHp: calculateMonsterHitPoints(1),
      }

      return {
        ...baseState,
        ...unlockAchievement(
          {
            ...state,
            ...baseState,
          } as GameState,
          'first-training-reset',
        ),
      }
    })
  },
  buyTrainingUpgrade: (upgradeKey) => {
    set((state) => {
      const currentLevel = state.upgrades[upgradeKey]
      const cost = getTrainingUpgradeCost(currentLevel)
      if (state.trainingPoints.isLessThan(cost)) {
        return {}
      }

      const nextUpgrades = {
        ...state.upgrades,
        [upgradeKey]: currentLevel + 1,
      }

      return {
        trainingPoints: state.trainingPoints.minus(cost),
        upgrades: nextUpgrades,
        strengthGrowth: 1 + nextUpgrades.strengthGrowth,
        dps: new BigNumber(state.strength + nextUpgrades.strengthGrowth + 1),
      }
    })
  },
  purchaseWeaponUpgrade: () => {
    set((state) => {
      const cost = new BigNumber(1)
        .multipliedBy(new BigNumber(1.5).pow(state.weaponLevel))
        .integerValue(BigNumber.ROUND_FLOOR)
      if (state.monsterSouls.isLessThan(cost)) {
        return {}
      }
      return {
        monsterSouls: state.monsterSouls.minus(cost),
        weaponLevel: state.weaponLevel + 1,
        dps: state.dps.multipliedBy(1.1),
      }
    })
  },
  manualAttack: () => {
    set((state) => ({
      experience: state.experience.plus(state.dps),
      monsterSouls: state.monsterSouls.plus(
        state.dps.dividedBy(10).integerValue(BigNumber.ROUND_FLOOR),
      ),
    }))
  },
}))
