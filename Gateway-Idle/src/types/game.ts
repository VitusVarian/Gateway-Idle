import BigNumber from 'bignumber.js'

export interface SaveSchemaV1 {
  schemaVersion: 1
  meta: {
    appVersion: string
    createdAt: number
    updatedAt: number
    lastTickAt: number
  }
  resources: {
    experience: string
    monsterSoul: string
    trainingPoints: string
  }
  player: {
    level: string
    strength: string
    strengthGrowth: string
  }
  progression: {
    currentStage: number
    maxUnlockedStage: number
    trainingUnlocked: boolean
    rebirthUnlocked: boolean
    gatewayUnlocked: boolean
  }
  upgrades: {
    weaponLevel: number
    training: Record<string, number>
  }
  achievements: {
    unlockedIds: string[]
  }
  timers: {
    totalPlayMs: number
    trainingCycleMs: number
    rebirthCycleMs: number
    gatewayCycleMs: number
    firstTrainingMs: number | null
    firstRebirthMs: number | null
    firstGatewayMs: number | null
  }
}

export interface GameRuntimeSnapshot {
  meta: {
    createdAt: number
    lastTickAt: number
  }
  resources: {
    experience: BigNumber
    monsterSoul: BigNumber
    trainingPoints: BigNumber
  }
  player: {
    level: BigNumber
    strength: BigNumber
    strengthGrowth: BigNumber
  }
  progression: {
    currentStage: number
    maxUnlockedStage: number
    trainingUnlocked: boolean
    rebirthUnlocked: boolean
    gatewayUnlocked: boolean
  }
  upgrades: {
    weaponLevel: number
    training: Record<string, number>
  }
  achievements: {
    unlockedIds: string[]
  }
  timers: {
    totalPlayMs: number
    trainingCycleMs: number
    rebirthCycleMs: number
    gatewayCycleMs: number
    firstTrainingMs: number | null
    firstRebirthMs: number | null
    firstGatewayMs: number | null
  }
  dps: BigNumber
}
