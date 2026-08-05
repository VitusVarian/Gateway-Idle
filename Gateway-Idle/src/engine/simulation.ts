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

export type CombatPhase = 'battling' | 'postBattleCooldown'

export interface SimulationState {
  phase: CombatPhase
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
}

export function createInitialSimulationState(): SimulationState {
  const stage = 1
  const hp = monsterHitPointsForStage(stage)

  return {
    phase: 'battling',
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
    monsterHpCurrent: hp,
    monsterHpMax: hp,
    attackProgressMs: 0,
  }
}

function resolveMonsterDefeat(state: SimulationState): SimulationState {
  let next = { ...state }

  next.experience = next.experience.plus(experienceGainForStage(next.currentStage))
  next.monsterSouls = next.monsterSouls.plus(monsterSoulGainForStage(next.currentStage))
  next.killsOnStage += 1

  if (next.killsOnStage >= next.killsRequiredOnStage) {
    next.maxUnlockedStage = Math.max(next.maxUnlockedStage, next.currentStage + 1)
  }

  if (next.autoAdvanceEnabled && next.maxUnlockedStage > next.currentStage) {
    next.currentStage += 1
    next.killsOnStage = 0
  }

  next = levelUpWithOverflow(next)

  return {
    ...next,
    phase: 'postBattleCooldown',
    phaseProgressMs: 0,
    attackProgressMs: 0,
  }
}

export function advanceSimulation(state: SimulationState, elapsedMs: number): SimulationState {
  if (!Number.isFinite(elapsedMs) || elapsedMs <= 0) {
    return state
  }

  let next = {
    ...state,
    totalPlayMs: state.totalPlayMs + elapsedMs,
    currentStage: clampStage(state.currentStage),
    maxUnlockedStage: Math.max(clampStage(state.maxUnlockedStage), clampStage(state.currentStage)),
  }

  let remainingMs = elapsedMs
  const intervalMs = attackIntervalMs()

  while (remainingMs > 0) {
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

  return next
}

export function switchStage(state: SimulationState, targetStage: number): SimulationState {
  const clampedTarget = clampStage(targetStage)
  const unlockedTarget = Math.min(clampedTarget, state.maxUnlockedStage)

  const next: SimulationState = {
    ...state,
    currentStage: unlockedTarget,
    killsOnStage: 0,
    phase: 'battling',
    phaseProgressMs: 0,
    attackProgressMs: 0,
  }

  return spawnMonsterForCurrentStage(next)
}
