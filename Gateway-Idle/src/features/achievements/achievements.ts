export type AchievementRewardType =
  'none' | 'trainingPoints' | 'strengthGrowth' | 'experienceModifier'

export interface AchievementDefinition {
  id: string
  title: string
  description: string
  rewardType: AchievementRewardType
  rewardValue?: number
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'first-victory',
    title: 'First Victory',
    description: 'Defeat your first monster.',
    rewardType: 'none',
  },
  {
    id: 'stage-10-boss',
    title: 'Stage 10 Boss',
    description: 'Clear the boss at stage 10.',
    rewardType: 'trainingPoints',
    rewardValue: 3,
  },
  {
    id: 'stage-100-boss',
    title: 'Stage 100 Boss',
    description: 'Clear the boss at stage 100.',
    rewardType: 'strengthGrowth',
    rewardValue: 1,
  },
  {
    id: 'training-reset',
    title: 'Training Reset',
    description: 'Complete your first Training reset.',
    rewardType: 'none',
  },
]

export function getAchievementById(id: string): AchievementDefinition | undefined {
  return ACHIEVEMENTS.find((achievement) => achievement.id === id)
}
