export interface Character {
  id: string
  name: string
  avatarId: string
  level: number
  xp: number
  xpRequired: number
  skillPoints: number
}

export interface Resources {
  gold: number
  totalMined: number
  toolEffectMultiplier: number
}

export type CombatOutcome = 'none' | 'victory' | 'defeat'

export interface CombatState {
  selectedMonsterLevel: number
  playerHp: number
  playerMaxHp: number
  enemyHp: number
  enemyMaxHp: number
  cooldownSecRemaining: number
  lastOutcome: CombatOutcome
}

export interface SkillTreeState {
  availablePoints: number
  allocatedNodeIds: string[]
}

export type SkillNodeType = 'start' | 'travel' | 'notable'

export interface SkillNodeData {
  nodeId: string
  title: string
  description: string
  type: SkillNodeType
  cost: number
  /** grid position on the tree canvas (column, row) */
  col: number
  row: number
  /** ids of prerequisite nodes that connect to this one */
  requires: string[]
}

export interface Monster {
  id: string
  name: string
  level: number
  maxHp: number
  xpReward: number
  goldReward: number
}

export interface Tool {
  toolId: string
  name: string
  bonusPercent: number
  cost: number
}

export interface Avatar {
  avatarId: string
  label: string
  seed: string
}

export interface Settings {
  reducedMotion: boolean
  colorSafe: boolean
  textScale: 'sm' | 'md' | 'lg'
}
