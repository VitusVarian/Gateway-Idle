export interface AchievementDefinition {
  id: string
  title: string
  description: string
  rewardType: 'none' | 'training-point' | 'monster-soul'
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
    description: 'Clear the stage 10 boss gate.',
    rewardType: 'training-point',
    rewardValue: 1,
  },
  {
    id: 'stage-100-boss',
    title: 'Stage 100 Boss',
    description: 'Clear the stage 100 boss gate.',
    rewardType: 'training-point',
    rewardValue: 2,
  },
  {
    id: 'training-reset',
    title: 'Training Reset',
    description: 'Complete your first training reset.',
    rewardType: 'none',
  },
]
