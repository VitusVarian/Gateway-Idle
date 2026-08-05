import BigNumber from 'bignumber.js'
import { getTrainingUpgradeCost } from '../useGameStore'
import type { GameState } from '../useGameStore'

const FIRST_MILESTONE_STAGE = 10
const MILESTONE_SPACING = 1.6
const TRAINING_BASE_REWARD = 1
const TRAINING_REWARD_COEFFICIENT = 2

function getTrainingMilestoneStages(limit: number): number[] {
  const milestones: number[] = []
  let index = 0

  while (true) {
    const milestone = Math.floor(FIRST_MILESTONE_STAGE * MILESTONE_SPACING ** index)
    if (milestone > limit) {
      return milestones
    }

    milestones.push(milestone)
    index += 1
  }
}

function calculateTrainingMilestoneReward(highestStage: number): BigNumber {
  return getTrainingMilestoneStages(highestStage).reduce((total, _milestone, index) => {
    const reward = Math.floor(
      TRAINING_BASE_REWARD + TRAINING_REWARD_COEFFICIENT * Math.sqrt(index + 1),
    )
    return total.plus(reward)
  }, new BigNumber(0))
}

export type TrainingUpgradeKey = 'strengthGrowth' | 'experienceModifier' | 'monsterSoulModifier'

export interface AffordabilityReadModel {
  canAfford: boolean
  cost: BigNumber
  currentBalance: BigNumber
}

export interface StageLockReadModel {
  trainingLocked: boolean
  rebirthLocked: boolean
  gatewayLocked: boolean
}

export interface MilestoneSummaryReadModel {
  highestStageReached: number
  rewardForCurrentCycle: BigNumber
  trainingUnlocked: boolean
}

export interface RateDisplayReadModel {
  dps: BigNumber
  monsterSoulRate: BigNumber
  trainingPointRate: BigNumber
}

export interface TrainingNavigationVisibilityReadModel {
  visible: boolean
  unlocked: boolean
  everReset: boolean
}

export function selectTrainingUpgradeAffordability(
  state: GameState,
  upgradeKey: TrainingUpgradeKey,
): AffordabilityReadModel {
  const cost = getTrainingUpgradeCost(state.upgrades[upgradeKey])

  return {
    canAfford: state.trainingPoints.isGreaterThanOrEqualTo(cost),
    cost,
    currentBalance: state.trainingPoints,
  }
}

export function selectStageLockState(state: GameState): StageLockReadModel {
  return {
    trainingLocked: !state.trainingUnlocked && state.maxUnlockedStage < 10,
    rebirthLocked: !state.rebirthUnlocked && state.maxUnlockedStage < 100,
    gatewayLocked: !state.gatewayUnlocked && state.maxUnlockedStage < 1000,
  }
}

export function selectMilestoneSummary(state: GameState): MilestoneSummaryReadModel {
  return {
    highestStageReached: state.highestStageReachedThisCycle,
    rewardForCurrentCycle: calculateTrainingMilestoneReward(state.highestStageReachedThisCycle),
    trainingUnlocked: state.trainingUnlocked,
  }
}

export function selectRateDisplays(state: GameState): RateDisplayReadModel {
  return {
    dps: state.dps,
    monsterSoulRate: state.dps.dividedBy(10).integerValue(BigNumber.ROUND_FLOOR),
    trainingPointRate: state.upgrades.strengthGrowth > 0 ? new BigNumber(1) : new BigNumber(0),
  }
}

export function selectTrainingNavigationVisibility(
  state: GameState,
): TrainingNavigationVisibilityReadModel {
  const unlocked = state.trainingUnlocked || state.maxUnlockedStage >= 10
  const everReset = state.trainingResetCount > 0

  return {
    visible: unlocked || everReset,
    unlocked,
    everReset,
  }
}
