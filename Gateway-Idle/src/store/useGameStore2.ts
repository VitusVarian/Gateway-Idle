import BigNumber from 'bignumber.js'
import { create } from 'zustand'
import {
  calculateMonsterHitPoints,
  calculateTrainingMilestoneReward,
  TRAINING_UPGRADE_DEFINITIONS,
  isBossStage,
} from '../engine/progression'
import { ACHIEVEMENTS } from '../features/achievements/achievements'

interface UpgradeLevels {
  strengthGrowth: number
  experienceModifier: number
  monsterSoulModifier: number
}

interface AchievementState {
  unlockedIds: string[]
}

interface GameState {
  monsterSouls: BigNumber
  trainingPoints: BigNumber
  dps: BigNumber
  level: number
  strength: number
  strengthGrowth: number
  experience: number
  currentStage: number
  maxUnlockedStage: number
  trainingUnlocked: boolean
  trainingResetCount: number
  totalTrainingPointsEarned: number
  trainingCycleMs: number
  upgrades: UpgradeLevels
  achievements: AchievementState
  isBossStage: boolean
  monsterHp: number
  gainMonsterSouls: (amount: BigNumber) => void
  advanceStage: () => void
  startTrainingReset: () => void
  buyTrainingUpgrade: (key: keyof UpgradeLevels) => void
  unlockAchievement: (id: string) => void
  setStage: (stage: number) => void
  tick: (elapsedMs: number) => void
}

const DEFAULT_UPGRADE_LEVELS: UpgradeLevels = {
  strengthGrowth: 0,
  experienceModifier: 0,
  monsterSoulModifier: 0,
}

const baseStrength = 1
const baseExperienceRate = 1

export const useGameStore = create<GameState>((set, get) => ({
  monsterSouls: new BigNumber(0),
  trainingPoints: new BigNumber(0),
  dps: new BigNumber(1),
  level: 1,
  strength: 1,
  strengthGrowth: 1,
  experience: 0,
  currentStage: 1,
  maxUnlockedStage: 1,
  trainingUnlocked: false,
  trainingResetCount: 0,
  totalTrainingPointsEarned: 0,
  trainingCycleMs: 0,
  upgrades: DEFAULT_UPGRADE_LEVELS,
  achievements: { unlockedIds: [] },
  isBossStage: false,
  monsterHp: calculateMonsterHitPoints(1),
  gainMonsterSouls: (amount) => {
    set((state) => ({ monsterSouls: state.monsterSouls.plus(amount) }))
  },
  advanceStage: () => {
    get().setStage(get().currentStage + 1)
  },
  startTrainingReset: () => {
    const stage = get().level
    const awarded = calculateTrainingMilestoneReward(stage)
    const nextTrainingPoints = get().trainingPoints.plus(awarded)
    const nextTrainingResetCount = get().trainingResetCount + 1

    set((state) => ({
      level: 1,
      strength: baseStrength,
      strengthGrowth: 1 + state.upgrades.strengthGrowth,
      experience: 0,
      currentStage: 1,
      maxUnlockedStage: 1,
      monsterSouls: new BigNumber(0),
      trainingPoints: nextTrainingPoints,
      trainingResetCount: nextTrainingResetCount,
      totalTrainingPointsEarned: state.totalTrainingPointsEarned + awarded,
      trainingUnlocked: true,
      trainingCycleMs: 0,
      dps: new BigNumber(1 + state.upgrades.experienceModifier),
      isBossStage: isBossStage(1),
      monsterHp: calculateMonsterHitPoints(1),
      achievements: {
        unlockedIds: state.achievements.unlockedIds.includes('training-reset')
          ? state.achievements.unlockedIds
          : [...state.achievements.unlockedIds, 'training-reset'],
      },
    }))
  },
  buyTrainingUpgrade: (key) => {
    const definition = TRAINING_UPGRADE_DEFINITIONS.find((item) => item.key === key)
    if (!definition) return

    const level = get().upgrades[key]
    const requiredCost = new BigNumber(definition.baseCost * Math.pow(definition.costGrowth, level))
    if (get().trainingPoints.lt(requiredCost)) return

    set((state) => ({
      trainingPoints: state.trainingPoints.minus(requiredCost),
      upgrades: {
        ...state.upgrades,
        [key]: state.upgrades[key] + 1,
      },
      strengthGrowth:
        key === 'strengthGrowth' ? 1 + state.upgrades.strengthGrowth + 1 : state.strengthGrowth,
      dps: new BigNumber(
        1 + state.upgrades.experienceModifier + (key === 'experienceModifier' ? 1 : 0),
      ),
    }))
  },
  unlockAchievement: (id) => {
    set((state) => {
      if (state.achievements.unlockedIds.includes(id)) return state
      return {
        ...state,
        achievements: {
          ...state.achievements,
          unlockedIds: [...state.achievements.unlockedIds, id],
        },
      }
    })
  },
  setStage: (stage) => {
    const normalizedStage = Math.max(1, stage)
    const bossStage = isBossStage(normalizedStage)

    set((state) => ({
      currentStage: normalizedStage,
      maxUnlockedStage: Math.max(state.maxUnlockedStage, normalizedStage),
      isBossStage: bossStage,
      monsterHp: calculateMonsterHitPoints(normalizedStage),
    }))

    if (normalizedStage >= 10 && !get().trainingUnlocked) {
      set({ trainingUnlocked: true })
    }
    if (normalizedStage >= 10) {
      get().unlockAchievement('stage-10-boss')
    }
    if (normalizedStage >= 100) {
      get().unlockAchievement('stage-100-boss')
    }
  },
  tick: (elapsedMs) => {
    if (elapsedMs <= 0) return

    set((state) => {
      const experienceGain =
        (elapsedMs / 1000) * baseExperienceRate * (1 + state.upgrades.experienceModifier * 0.2)
      const strengthGain = (elapsedMs / 1000) * (state.strengthGrowth * 0.2)
      const monsterSoulGain = (elapsedMs / 1000) * (0.1 + state.upgrades.monsterSoulModifier * 0.05)
      const nextExperience = state.experience + experienceGain
      const levelFromExp = Math.floor(nextExperience / 10) + 1

      return {
        experience: nextExperience,
        level: Math.max(state.level, levelFromExp),
        strength: Math.max(state.strength, Math.floor(baseStrength + strengthGain)),
        monsterSouls: state.monsterSouls.plus(monsterSoulGain),
        trainingCycleMs: state.trainingCycleMs + elapsedMs,
        dps: new BigNumber(
          Math.max(1, 1 + state.strengthGrowth + state.upgrades.experienceModifier * 0.25),
        ),
      }
    })
  },
}))

export function getTrainingUpgradeCost(key: keyof UpgradeLevels): BigNumber {
  const definition = TRAINING_UPGRADE_DEFINITIONS.find((item) => item.key === key)
  if (!definition) return new BigNumber(0)
  const level = useGameStore.getState().upgrades[key]
  return new BigNumber(definition.baseCost * Math.pow(definition.costGrowth, level))
}

export function getAchievementProgress(achievements: AchievementState): string[] {
  return ACHIEVEMENTS.map((achievement) => achievement.id).filter((id) =>
    achievements.unlockedIds.includes(id),
  )
}
