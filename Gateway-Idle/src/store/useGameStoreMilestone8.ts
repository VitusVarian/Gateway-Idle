import BigNumber from 'bignumber.js'
import { create } from 'zustand'
import {
  attackIntervalMs,
  damageMultiplierFromWeaponLevel,
  weaponUpgradeCost,
} from '../engine/economy'
import {
  advanceSimulation,
  createInitialSimulationState,
  switchStage,
  type CombatPhase,
  type SimulationState,
} from '../engine/simulation'

type TrainingUpgradeKey = 'strengthGrowth' | 'experienceModifier' | 'monsterSoulModifier'
type AchievementRewardType = 'none' | 'trainingPoints'
type BossEncounterState = 'inactive' | 'engaged' | 'cooldown'

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

interface GameState {
  monsterSouls: BigNumber
  trainingPoints: BigNumber
  dps: BigNumber
  level: number
  strength: number
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
  monsterMaxHp: BigNumber
  totalPlayMs: number
  combatPhase: CombatPhase
  phaseProgressMs: number
  attackProgressMs: number
  killsOnStage: number
  killsRequiredOnStage: number
  autoAdvanceEnabled: boolean
  bossEncounterState: BossEncounterState
  expPerSecondEstimate: BigNumber
  monsterSoulsPerSecondEstimate: BigNumber
  rateWindowExpBuckets: number[]
  rateWindowSoulBuckets: number[]
  rateWindowIndex: number
  rateWindowElapsedMs: number
  gainMonsterSouls: (amount: BigNumber) => void
  tick: (elapsedMs: number) => void
  advanceStage: () => void
  retreatStage: () => void
  startTrainingReset: () => void
  buyTrainingUpgrade: (upgradeKey: TrainingUpgradeKey) => void
  purchaseWeaponUpgrade: () => void
  manualAttack: () => void
}

const BOSS_STAGES = [10, 100, 1000] as const
const FIRST_MILESTONE_STAGE = 10
const MILESTONE_SPACING = 1.6
const TRAINING_BASE_REWARD = 1
const TRAINING_REWARD_COEFFICIENT = 2
const TRAINING_UPGRADE_BASE_COST = 1
const TRAINING_UPGRADE_COST_RATE = 1.1
const MAX_ELAPSED_MS_PER_TICK = 5_000
const RATE_WINDOW_BUCKET_COUNT = 60
const RATE_BUCKET_MS = 1_000

const RATE_BUCKET_TEMPLATE = Object.freeze(Array.from({ length: RATE_WINDOW_BUCKET_COUNT }, () => 0))

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

export function getTrainingUpgradeCost(level: number): BigNumber {
  return new BigNumber(TRAINING_UPGRADE_BASE_COST)
    .multipliedBy(new BigNumber(TRAINING_UPGRADE_COST_RATE).pow(level))
    .integerValue(BigNumber.ROUND_FLOOR)
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

function toSimulationState(state: GameState): SimulationState {
  return {
    phase: state.combatPhase,
    level: new BigNumber(state.level),
    strength: new BigNumber(state.strength),
    strengthGrowth: new BigNumber(state.strengthGrowth),
    experience: state.experience,
    monsterSouls: state.monsterSouls,
    trainingPoints: state.trainingPoints,
    weaponLevel: state.weaponLevel,
    currentStage: state.currentStage,
    maxUnlockedStage: state.maxUnlockedStage,
    killsOnStage: state.killsOnStage,
    killsRequiredOnStage: state.killsRequiredOnStage,
    autoAdvanceEnabled: state.autoAdvanceEnabled,
    monsterHpCurrent: state.monsterHp,
    monsterHpMax: state.monsterMaxHp,
    attackProgressMs: state.attackProgressMs,
    phaseProgressMs: state.phaseProgressMs,
    totalPlayMs: state.totalPlayMs,
  }
}

function getBossEncounterState(stage: number, phase: CombatPhase): BossEncounterState {
  if (!isBossStage(stage)) {
    return 'inactive'
  }

  return phase === 'battling' ? 'engaged' : 'cooldown'
}

function recomputeDps(strength: number, weaponLevel: number): BigNumber {
  const attacksPerSecond = new BigNumber(1000).dividedBy(attackIntervalMs())
  return new BigNumber(strength)
    .multipliedBy(damageMultiplierFromWeaponLevel(weaponLevel))
    .multipliedBy(attacksPerSecond)
    .integerValue(BigNumber.ROUND_FLOOR)
}

function foldGainIntoRateWindow(
  state: GameState,
  elapsedMs: number,
  expGain: BigNumber,
  soulGain: BigNumber,
): {
  expPerSecondEstimate: BigNumber
  monsterSoulsPerSecondEstimate: BigNumber
  rateWindowExpBuckets: number[]
  rateWindowSoulBuckets: number[]
  rateWindowElapsedMs: number
  rateWindowIndex: number
} {
  if (elapsedMs <= 0) {
    return {
      expPerSecondEstimate: state.expPerSecondEstimate,
      monsterSoulsPerSecondEstimate: state.monsterSoulsPerSecondEstimate,
      rateWindowExpBuckets: state.rateWindowExpBuckets,
      rateWindowSoulBuckets: state.rateWindowSoulBuckets,
      rateWindowElapsedMs: state.rateWindowElapsedMs,
      rateWindowIndex: state.rateWindowIndex,
    }
  }

  const expBuckets = [...state.rateWindowExpBuckets]
  const soulBuckets = [...state.rateWindowSoulBuckets]
  let bucketIndex = state.rateWindowIndex
  let bucketElapsedMs = state.rateWindowElapsedMs

  const expRatePerMs = expGain.dividedBy(elapsedMs).toNumber()
  const soulRatePerMs = soulGain.dividedBy(elapsedMs).toNumber()

  let remainingMs = elapsedMs
  while (remainingMs > 0) {
    const remainingBucketMs = RATE_BUCKET_MS - bucketElapsedMs
    const stepMs = Math.min(remainingMs, remainingBucketMs)

    expBuckets[bucketIndex] += expRatePerMs * stepMs
    soulBuckets[bucketIndex] += soulRatePerMs * stepMs

    bucketElapsedMs += stepMs
    remainingMs -= stepMs

    if (bucketElapsedMs >= RATE_BUCKET_MS) {
      bucketElapsedMs = 0
      bucketIndex = (bucketIndex + 1) % RATE_WINDOW_BUCKET_COUNT
      expBuckets[bucketIndex] = 0
      soulBuckets[bucketIndex] = 0
    }
  }

  const expTotal = expBuckets.reduce((sum, bucket) => sum + bucket, 0)
  const soulTotal = soulBuckets.reduce((sum, bucket) => sum + bucket, 0)

  return {
    expPerSecondEstimate: new BigNumber(expTotal)
      .dividedBy(RATE_WINDOW_BUCKET_COUNT)
      .integerValue(BigNumber.ROUND_FLOOR),
    monsterSoulsPerSecondEstimate: new BigNumber(soulTotal)
      .dividedBy(RATE_WINDOW_BUCKET_COUNT)
      .integerValue(BigNumber.ROUND_FLOOR),
    rateWindowExpBuckets: expBuckets,
    rateWindowSoulBuckets: soulBuckets,
    rateWindowElapsedMs: bucketElapsedMs,
    rateWindowIndex: bucketIndex,
  }
}

function applySimulationDelta(state: GameState, nextSimulation: SimulationState, elapsedMs: number): GameState {
  const experienceGain = nextSimulation.experience.minus(state.experience)
  const soulGain = nextSimulation.monsterSouls.minus(state.monsterSouls)
  const rateWindow = foldGainIntoRateWindow(state, elapsedMs, experienceGain, soulGain)

  const nextLevel = nextSimulation.level.integerValue(BigNumber.ROUND_FLOOR).toNumber()
  const nextStrength = nextSimulation.strength.integerValue(BigNumber.ROUND_FLOOR).toNumber()
  const nextStrengthGrowth = nextSimulation.strengthGrowth
    .integerValue(BigNumber.ROUND_FLOOR)
    .toNumber()

  const nextCoreState: GameState = {
    ...state,
    monsterSouls: nextSimulation.monsterSouls,
    trainingPoints: nextSimulation.trainingPoints,
    experience: nextSimulation.experience,
    level: nextLevel,
    strength: nextStrength,
    strengthGrowth: nextStrengthGrowth,
    dps: recomputeDps(nextStrength, nextSimulation.weaponLevel),
    currentStage: nextSimulation.currentStage,
    maxUnlockedStage: nextSimulation.maxUnlockedStage,
    highestStageReachedThisCycle: Math.max(state.highestStageReachedThisCycle, nextSimulation.currentStage),
    trainingUnlocked: state.trainingUnlocked || nextSimulation.maxUnlockedStage >= 10,
    rebirthUnlocked: state.rebirthUnlocked || nextSimulation.maxUnlockedStage >= 100,
    gatewayUnlocked: state.gatewayUnlocked || nextSimulation.maxUnlockedStage >= 1000,
    isBossStage: isBossStage(nextSimulation.currentStage),
    monsterHp: nextSimulation.monsterHpCurrent,
    monsterMaxHp: nextSimulation.monsterHpMax,
    totalPlayMs: nextSimulation.totalPlayMs,
    combatPhase: nextSimulation.phase,
    phaseProgressMs: nextSimulation.phaseProgressMs,
    attackProgressMs: nextSimulation.attackProgressMs,
    killsOnStage: nextSimulation.killsOnStage,
    killsRequiredOnStage: nextSimulation.killsRequiredOnStage,
    autoAdvanceEnabled: nextSimulation.autoAdvanceEnabled,
    bossEncounterState: getBossEncounterState(nextSimulation.currentStage, nextSimulation.phase),
    expPerSecondEstimate: rateWindow.expPerSecondEstimate,
    monsterSoulsPerSecondEstimate: rateWindow.monsterSoulsPerSecondEstimate,
    rateWindowExpBuckets: rateWindow.rateWindowExpBuckets,
    rateWindowSoulBuckets: rateWindow.rateWindowSoulBuckets,
    rateWindowIndex: rateWindow.rateWindowIndex,
    rateWindowElapsedMs: rateWindow.rateWindowElapsedMs,
    trainingCycleMs: state.trainingCycleMs + elapsedMs,
    rebirthCycleMs: state.rebirthCycleMs + elapsedMs,
    gatewayCycleMs: state.gatewayCycleMs + elapsedMs,
  }

  const stageAchievementId =
    nextCoreState.maxUnlockedStage >= 1000
      ? 'stage-1000-boss'
      : nextCoreState.maxUnlockedStage >= 100
        ? 'stage-100-boss'
        : nextCoreState.maxUnlockedStage >= 10
          ? 'stage-10-boss'
          : ''

  return {
    ...nextCoreState,
    ...unlockAchievement(nextCoreState, stageAchievementId),
  }
}

function applyStageSwitch(state: GameState, targetStage: number): GameState {
  const stage = Math.max(1, Math.min(targetStage, state.maxUnlockedStage))
  const switched = switchStage(toSimulationState(state), stage)
  return applySimulationDelta(state, switched, 0)
}

const simulation = createInitialSimulationState()
const strength = simulation.strength.toNumber()

export const useGameStore = create<GameState>((set, get) => ({
  monsterSouls: simulation.monsterSouls,
  trainingPoints: simulation.trainingPoints,
  dps: recomputeDps(strength, simulation.weaponLevel),
  level: simulation.level.toNumber(),
  strength,
  strengthGrowth: simulation.strengthGrowth.toNumber(),
  experience: simulation.experience,
  currentStage: simulation.currentStage,
  maxUnlockedStage: simulation.maxUnlockedStage,
  highestStageReachedThisCycle: simulation.currentStage,
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
  isBossStage: isBossStage(simulation.currentStage),
  monsterHp: simulation.monsterHpCurrent,
  monsterMaxHp: simulation.monsterHpMax,
  totalPlayMs: 0,
  combatPhase: simulation.phase,
  phaseProgressMs: simulation.phaseProgressMs,
  attackProgressMs: simulation.attackProgressMs,
  killsOnStage: simulation.killsOnStage,
  killsRequiredOnStage: simulation.killsRequiredOnStage,
  autoAdvanceEnabled: false,
  bossEncounterState: getBossEncounterState(simulation.currentStage, simulation.phase),
  expPerSecondEstimate: new BigNumber(0),
  monsterSoulsPerSecondEstimate: new BigNumber(0),
  rateWindowExpBuckets: [...RATE_BUCKET_TEMPLATE],
  rateWindowSoulBuckets: [...RATE_BUCKET_TEMPLATE],
  rateWindowIndex: 0,
  rateWindowElapsedMs: 0,
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
  advanceStage: () => {
    set((state) => {
      if (state.currentStage >= state.maxUnlockedStage) {
        return {}
      }

      return applyStageSwitch(state, state.currentStage + 1)
    })
  },
  retreatStage: () => {
    set((state) => applyStageSwitch(state, state.currentStage - 1))
  },
  startTrainingReset: () => {
    set((state) => {
      if (!state.trainingUnlocked) {
        return {}
      }

      const trainingReward = calculateTrainingMilestoneReward(state.highestStageReachedThisCycle)
      const resetSimulation = createInitialSimulationState()
      const resetStrengthGrowth = 1 + state.upgrades.strengthGrowth

      const resetState: GameState = {
        ...state,
        monsterSouls: new BigNumber(0),
        trainingPoints: state.trainingPoints.plus(trainingReward),
        dps: recomputeDps(resetSimulation.strength.toNumber(), 0),
        level: 1,
        strength: 1,
        strengthGrowth: resetStrengthGrowth,
        experience: new BigNumber(0),
        currentStage: 1,
        maxUnlockedStage: 1,
        highestStageReachedThisCycle: 1,
        trainingUnlocked: true,
        rebirthUnlocked: false,
        gatewayUnlocked: false,
        trainingResetCount: state.trainingResetCount + 1,
        totalTrainingPointsEarned: state.totalTrainingPointsEarned.plus(trainingReward),
        trainingCycleMs: 0,
        firstTrainingMs: state.firstTrainingMs ?? state.trainingCycleMs,
        isBossStage: false,
        weaponLevel: 0,
        monsterHp: resetSimulation.monsterHpCurrent,
        monsterMaxHp: resetSimulation.monsterHpMax,
        combatPhase: 'battling',
        phaseProgressMs: 0,
        attackProgressMs: 0,
        killsOnStage: 0,
        killsRequiredOnStage: resetSimulation.killsRequiredOnStage,
        autoAdvanceEnabled: false,
        bossEncounterState: 'inactive',
        expPerSecondEstimate: new BigNumber(0),
        monsterSoulsPerSecondEstimate: new BigNumber(0),
        rateWindowExpBuckets: [...RATE_BUCKET_TEMPLATE],
        rateWindowSoulBuckets: [...RATE_BUCKET_TEMPLATE],
        rateWindowIndex: 0,
        rateWindowElapsedMs: 0,
      }

      return {
        ...resetState,
        ...unlockAchievement(resetState, 'first-training-reset'),
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
        dps: recomputeDps(state.strength, state.weaponLevel),
      }
    })
  },
  purchaseWeaponUpgrade: () => {
    set((state) => {
      const cost = weaponUpgradeCost(state.weaponLevel)
      if (state.monsterSouls.isLessThan(cost)) {
        return {}
      }

      const nextWeaponLevel = state.weaponLevel + 1
      return {
        monsterSouls: state.monsterSouls.minus(cost),
        weaponLevel: nextWeaponLevel,
        dps: recomputeDps(state.strength, nextWeaponLevel),
      }
    })
  },
  manualAttack: () => {
    get().tick(RATE_BUCKET_MS)
  },
}))
