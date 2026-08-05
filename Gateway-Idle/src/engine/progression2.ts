export type TrainingUpgradeKey = 'strengthGrowth' | 'experienceModifier' | 'monsterSoulModifier'

export interface TrainingUpgradeDefinition {
  key: TrainingUpgradeKey
  label: string
  baseCost: number
  costGrowth: number
}

export function calculateMonsterHitPoints(level: number): number {
  const base = 10
  const coefficient = 2
  const growthRate = 1.08
  const raw = Math.floor(base * (level * coefficient + Math.pow(growthRate, level)))
  const bossLevels = [10, 100, 1000]
  const tierMultiplier = 2 ** bossLevels.filter((bossLevel) => level >= bossLevel).length
  return Math.floor(raw * tierMultiplier)
}

export function calculateTrainingMilestoneReward(level: number): number {
  const firstMilestone = 10
  const spacing = 1.6
  const milestoneLevel = Math.floor(firstMilestone * Math.pow(spacing, level - 1))
  const baseReward = 1
  const rewardCoeff = 2
  return Math.floor(baseReward + rewardCoeff * Math.sqrt(milestoneLevel))
}

export function isBossStage(level: number): boolean {
  return [10, 100, 1000].includes(level)
}

export const TRAINING_UPGRADE_DEFINITIONS: TrainingUpgradeDefinition[] = [
  { key: 'strengthGrowth', label: 'Strength Growth', baseCost: 1, costGrowth: 1.1 },
  { key: 'experienceModifier', label: 'Experience Modifier', baseCost: 1, costGrowth: 1.1 },
  { key: 'monsterSoulModifier', label: 'Monster Soul Modifier', baseCost: 1, costGrowth: 1.1 },
]
