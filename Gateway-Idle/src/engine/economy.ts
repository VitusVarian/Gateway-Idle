import BigNumber from 'bignumber.js'
import { ECONOMY_CONFIG } from './economyConfig'

const BN_ZERO = new BigNumber(0)

export function weaponUpgradeCost(level: number): BigNumber {
  // Exponential curve: each level multiplies cost by a constant growth rate.
  return new BigNumber(ECONOMY_CONFIG.weaponBaseCost)
    .multipliedBy(new BigNumber(ECONOMY_CONFIG.weaponCostGrowthRate).pow(level))
    .integerValue(BigNumber.ROUND_FLOOR)
}

export function damageMultiplierFromWeaponLevel(weaponLevel: number): BigNumber {
  return new BigNumber(1).plus(new BigNumber(ECONOMY_CONFIG.weaponDamageStep).multipliedBy(weaponLevel))
}

function bossTierMultiplier(stage: number): BigNumber {
  let tiers = 0
  if (stage >= 10) tiers += 1
  if (stage >= 100) tiers += 1
  if (stage >= 1000) tiers += 1
  return new BigNumber(2).pow(tiers)
}

export function monsterHitPointsForStage(stage: number): BigNumber {
  const base = new BigNumber(ECONOMY_CONFIG.monsterBaseHitPoints)
  const linear = new BigNumber(stage).multipliedBy(ECONOMY_CONFIG.monsterCoefficient)
  const exponential = new BigNumber(ECONOMY_CONFIG.monsterGrowthRate).pow(stage)

  return base
    .multipliedBy(linear.plus(exponential))
    .multipliedBy(bossTierMultiplier(stage))
    .integerValue(BigNumber.ROUND_FLOOR)
}

export function experienceToLevel(level: BigNumber): BigNumber {
  return new BigNumber(ECONOMY_CONFIG.experienceToLevelBase)
    .multipliedBy(level.pow(ECONOMY_CONFIG.levelingDifficulty))
    .integerValue(BigNumber.ROUND_FLOOR)
}

export function experienceGainForStage(stage: number, experienceModifier = new BigNumber(1)): BigNumber {
  return new BigNumber(ECONOMY_CONFIG.experienceGainBase)
    .multipliedBy(stage)
    .multipliedBy(experienceModifier)
    .integerValue(BigNumber.ROUND_FLOOR)
}

export function monsterSoulGainForStage(stage: number, monsterSoulModifier = new BigNumber(1)): BigNumber {
  return new BigNumber(ECONOMY_CONFIG.monsterSoulGainBase)
    .multipliedBy(stage)
    .multipliedBy(monsterSoulModifier)
    .integerValue(BigNumber.ROUND_FLOOR)
}

export function attackIntervalMs(): number {
  return ECONOMY_CONFIG.attackSpeedBaseSeconds * 1000
}

export function clampStage(stage: number): number {
  return Math.max(1, Math.floor(stage))
}

export function canAfford(cost: BigNumber, currency: BigNumber): boolean {
  return currency.isGreaterThanOrEqualTo(cost)
}

export function safeBigNumber(value: BigNumber): BigNumber {
  return value.isFinite() ? value : BN_ZERO
}
