import BigNumber from 'bignumber.js'

export const TRAINING_FIRST_MILESTONE = 10
export const TRAINING_MILESTONE_SPACING = 1.6
export const TRAINING_BASE_REWARD = 1
export const TRAINING_REWARD_COEFF = 2

export const BOSS_LEVELS = [10, 100, 1000]

export interface TrainingUpgradeDefinition {
  key: string
  label: string
  description: string
  baseCost: number
  costGrowth: number
}

export const TRAINING_UPGRADE_DEFINITIONS: TrainingUpgradeDefinition[] = [
  {
    key: 'strengthGrowth',
    label: 'Strength Growth',
    description: 'Improves strength gained per level.',
    baseCost: 1,
    costGrowth: 1.35,
  },
  {
    key: 'experienceModifier',
    label: 'Experience Modifier',
    description: 'Boosts experience from combat.',
    baseCost: 2,
    costGrowth: 1.45,
  },
  {
    key: 'monsterSoulModifier',
    label: 'Monster Soul Modifier',
    description: 'Improves Monster Soul rewards.',
    baseCost: 2,
    costGrowth: 1.45,
  },
]

export function calculateTrainingMilestoneReward(stage: number): number {
  if (stage < TRAINING_FIRST_MILESTONE) {
    return 0
  }

  let reward = 0
  let milestone = TRAINING_FIRST_MILESTONE
  let index = 1

  while (milestone <= stage) {
    reward += Math.floor(TRAINING_BASE_REWARD + TRAINING_REWARD_COEFF * Math.sqrt(index))
    milestone = Math.floor(TRAINING_FIRST_MILESTONE * Math.pow(TRAINING_MILESTONE_SPACING, index))
    index += 1
  }

  return reward
}

export function calculateTrainingMilestoneLevel(index: number): number {
  return Math.floor(TRAINING_FIRST_MILESTONE * Math.pow(TRAINING_MILESTONE_SPACING, index - 1))
}

export function isBossStage(stage: number): boolean {
  return BOSS_LEVELS.includes(stage)
}

export function getBossTierMultiplier(stage: number): number {
  return 2 ** BOSS_LEVELS.filter((bossLevel) => bossLevel <= stage).length
}

export function calculateMonsterHitPoints(stage: number): number {
  const baseHp = 25
  const growthRate = 1.12
  const rawHp = Math.floor(baseHp * (stage * 2 + Math.pow(growthRate, stage)))
  return Math.floor(rawHp * getBossTierMultiplier(stage))
}

export function formatBigNumber(value: BigNumber): string {
  return value.toFormat(2)
}
