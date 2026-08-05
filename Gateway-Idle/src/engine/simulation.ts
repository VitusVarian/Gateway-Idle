import BigNumber from 'bignumber.js'
import {
  attackIntervalMs,
  clampStage,
  damageMultiplierFromWeaponLevel,
  experienceGainForStage,
  experienceToLevel,
  monsterHitPointsForStage,
  monsterSoulGainForStage,
} from './economy'
import { ECONOMY_CONFIG } from './economyConfig'
import {
  addRollingWindowReward,
  advanceRollingWindow,
  calculateRollingPerSecond,
  createRollingWindowState,
  type RollingWindowState,
} from './rollingWindow'

export type CombatPhase = 'battling' | 'postBattleCooldown'
export type BossEncounterState = 'none' | 'gateActive' | 'gateCleared'

const BOSS_STAGES = [10, 100, 1000] as const

function isBossStage(stage: number): boolean {
  return BOSS_STAGES.includes(stage as (typeof BOSS_STAGES)[number])
}

function bossEncounterStateForStage(stage: number, maxUnlockedStage: number): BossEncounterState {
  if (!isBossStage(stage)) {
    return 'none'
  }

  return maxUnlockedStage > stage ? 'gateCleared' : 'gateActive'
}

export interface SimulationState {
  phase: CombatPhase
  bossEncounterState: BossEncounterState
  level: BigNumber
  strength: BigNumber
  strengthGrowth: BigNumber
  experience: BigNumber
  monsterSouls: BigNumber
  trainingPoints: BigNumber
  weaponLevel: number
  currentStage: number
  maxUnlockedStage: number
  killsOnStage: number
  killsRequiredOnStage: number
  autoAdvanceEnabled: boolean
  monsterHpCurrent: BigNumber
  monsterHpMax: BigNumber
  attackProgressMs: number
  phaseProgressMs: number
  totalPlayMs: number
  rollingWindow: RollingWindowState
  estimatedExpPerSecond: BigNumber
  estimatedMonsterSoulsPerSecond: BigNumber
}

export function createInitialSimulationState(): SimulationState {
  const stage = 1
  const hp = monsterHitPointsForStage(stage)
  const rollingWindow = createRollingWindowState()

  return {
    phase: 'battling',
    bossEncounterState: bossEncounterStateForStage(stage, stage),
    level: new BigNumber(1),
    strength: new BigNumber(1),
    strengthGrowth: new BigNumber(1),
    experience: new BigNumber(0),
    monsterSouls: new BigNumber(0),
    trainingPoints: new BigNumber(0),
    weaponLevel: 0,
    currentStage: stage,
    maxUnlockedStage: stage,
    killsOnStage: 0,
    killsRequiredOnStage: ECONOMY_CONFIG.killsRequiredPerStage,
    autoAdvanceEnabled: false,
    monsterHpCurrent: hp,
    monsterHpMax: hp,
    attackProgressMs: 0,
    phaseProgressMs: 0,
    totalPlayMs: 0,
    rollingWindow,
    estimatedExpPerSecond: new BigNumber(0),
    estimatedMonsterSoulsPerSecond: new BigNumber(0),
  }
}

function levelUpWithOverflow(state: SimulationState): SimulationState {
  const next = { ...state }
  let required = experienceToLevel(next.level)

  while (next.experience.isGreaterThanOrEqualTo(required)) {
    next.experience = next.experience.minus(required)
    next.level = next.level.plus(1)
    next.strength = next.strength.plus(next.strengthGrowth)
    required = experienceToLevel(next.level)
  }

  return next
}

function spawnMonsterForCurrentStage(state: SimulationState): SimulationState {
  const hp = monsterHitPointsForStage(state.currentStage)
  return {
    ...state,
    bossEncounterState: bossEncounterStateForStage(state.currentStage, state.maxUnlockedStage),
    monsterHpCurrent: hp,
    monsterHpMax: hp,
    attackProgressMs: 0,
  }
}

function resolveMonsterDefeat(state: SimulationState): SimulationState {
  let next = { ...state }

  const experienceGain = experienceGainForStage(next.currentStage)
  const monsterSoulGain = monsterSoulGainForStage(next.currentStage)

  next.experience = next.experience.plus(experienceGain)
  next.monsterSouls = next.monsterSouls.plus(monsterSoulGain)
  next.rollingWindow = addRollingWindowReward(next.rollingWindow, experienceGain, monsterSoulGain)
  next.killsOnStage += 1

  if (next.killsOnStage >= next.killsRequiredOnStage) {
    next.maxUnlockedStage = Math.max(next.maxUnlockedStage, next.currentStage + 1)
  }

  if (next.autoAdvanceEnabled && next.maxUnlockedStage > next.currentStage) {
    next.currentStage += 1
    next.killsOnStage = 0
  }

  next = levelUpWithOverflow(next)
  const rates = calculateRollingPerSecond(next.rollingWindow)

  return {
    ...next,
    phase: 'postBattleCooldown',
    bossEncounterState: bossEncounterStateForStage(next.currentStage, next.maxUnlockedStage),
    phaseProgressMs: 0,
    attackProgressMs: 0,
    estimatedExpPerSecond: rates.estimatedExpPerSecond,
    estimatedMonsterSoulsPerSecond: rates.estimatedMonsterSoulsPerSecond,
  }
}

export function advanceSimulation(state: SimulationState, elapsedMs: number): SimulationState {
  if (!Number.isFinite(elapsedMs) || elapsedMs <= 0) {
    return state
  }

  const normalizedMaxUnlockedStage = Math.max(1, clampStage(state.maxUnlockedStage))
  const normalizedCurrentStage = Math.min(clampStage(state.currentStage), normalizedMaxUnlockedStage)

  let next = {
    ...state,
    totalPlayMs: state.totalPlayMs + elapsedMs,
    currentStage: normalizedCurrentStage,
    maxUnlockedStage: normalizedMaxUnlockedStage,
    bossEncounterState: bossEncounterStateForStage(normalizedCurrentStage, normalizedMaxUnlockedStage),
  }

  let remainingMs = elapsedMs
  const intervalMs = attackIntervalMs()

  while (remainingMs > 0) {
    const elapsedStepMs = next.phase === 'battling'
      ? Math.min(remainingMs, intervalMs - next.attackProgressMs)
      : Math.min(remainingMs, ECONOMY_CONFIG.postBattleCooldownMs - next.phaseProgressMs)

    next = {
      ...next,
      rollingWindow: advanceRollingWindow(next.rollingWindow, elapsedStepMs),
    }

    if (next.phase === 'battling') {
      const timeToNextAttack = intervalMs - next.attackProgressMs
      const stepMs = Math.min(remainingMs, timeToNextAttack)

      next.attackProgressMs += stepMs
      remainingMs -= stepMs

      if (next.attackProgressMs >= intervalMs) {
        next.attackProgressMs = 0

        const damage = next.strength
          .multipliedBy(damageMultiplierFromWeaponLevel(next.weaponLevel))
          .integerValue(BigNumber.ROUND_FLOOR)

        next.monsterHpCurrent = next.monsterHpCurrent.minus(damage)

        if (next.monsterHpCurrent.isLessThanOrEqualTo(0)) {
          next = resolveMonsterDefeat(next)
        }
      }
    } else {
      const timeToBattleReady = ECONOMY_CONFIG.postBattleCooldownMs - next.phaseProgressMs
      const stepMs = Math.min(remainingMs, timeToBattleReady)

      next.phaseProgressMs += stepMs
      remainingMs -= stepMs

      if (next.phaseProgressMs >= ECONOMY_CONFIG.postBattleCooldownMs) {
        next = spawnMonsterForCurrentStage({
          ...next,
          phase: 'battling',
          phaseProgressMs: 0,
        })
      }
    }
  }

  const rates = calculateRollingPerSecond(next.rollingWindow)

  return {
    ...next,
    estimatedExpPerSecond: rates.estimatedExpPerSecond,
    estimatedMonsterSoulsPerSecond: rates.estimatedMonsterSoulsPerSecond,
  }
}

export function switchStage(state: SimulationState, targetStage: number): SimulationState {
  const clampedTarget = clampStage(targetStage)
  const unlockedTarget = Math.min(clampedTarget, state.maxUnlockedStage)

  const next: SimulationState = {
    ...state,
    currentStage: unlockedTarget,
    killsOnStage: 0,
    phase: 'battling',
    rollingWindow: createRollingWindowState(),
    estimatedExpPerSecond: new BigNumber(0),
    estimatedMonsterSoulsPerSecond: new BigNumber(0),
    phaseProgressMs: 0,
    attackProgressMs: 0,
  }

  return spawnMonsterForCurrentStage(next)
}
