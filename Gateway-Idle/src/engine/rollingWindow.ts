import BigNumber from 'bignumber.js'

const WINDOW_SIZE = 60
const ONE_SECOND_MS = 1000

export interface RollingWindowState {
  expBuckets: BigNumber[]
  soulBuckets: BigNumber[]
  activeBucketIndex: number
  activeBucketElapsedMs: number
}

export function createRollingWindowState(): RollingWindowState {
  const zeroBuckets = Array.from({ length: WINDOW_SIZE }, () => new BigNumber(0))

  return {
    expBuckets: zeroBuckets,
    soulBuckets: Array.from({ length: WINDOW_SIZE }, () => new BigNumber(0)),
    activeBucketIndex: 0,
    activeBucketElapsedMs: 0,
  }
}

function advanceBuckets(
  buckets: BigNumber[],
  nextActiveBucketIndex: number,
  shiftedBucketCount: number,
): BigNumber[] {
  const nextBuckets = [...buckets]

  for (let i = 1; i <= shiftedBucketCount; i += 1) {
    nextBuckets[(nextActiveBucketIndex - i + WINDOW_SIZE) % WINDOW_SIZE] = new BigNumber(0)
  }

  return nextBuckets
}

export function advanceRollingWindow(
  state: RollingWindowState,
  elapsedMs: number,
): RollingWindowState {
  if (!Number.isFinite(elapsedMs) || elapsedMs <= 0) {
    return state
  }

  const totalElapsedMs = state.activeBucketElapsedMs + elapsedMs
  const shiftedBuckets = Math.floor(totalElapsedMs / ONE_SECOND_MS)

  if (shiftedBuckets <= 0) {
    return {
      ...state,
      activeBucketElapsedMs: totalElapsedMs,
    }
  }

  const clampedShiftCount = Math.min(shiftedBuckets, WINDOW_SIZE)
  const nextActiveBucketIndex = (state.activeBucketIndex + clampedShiftCount) % WINDOW_SIZE
  const nextElapsedMs = totalElapsedMs % ONE_SECOND_MS

  return {
    expBuckets: advanceBuckets(state.expBuckets, nextActiveBucketIndex, clampedShiftCount),
    soulBuckets: advanceBuckets(state.soulBuckets, nextActiveBucketIndex, clampedShiftCount),
    activeBucketIndex: nextActiveBucketIndex,
    activeBucketElapsedMs: nextElapsedMs,
  }
}

export function addRollingWindowReward(
  state: RollingWindowState,
  experienceGain: BigNumber,
  monsterSoulGain: BigNumber,
): RollingWindowState {
  const nextExpBuckets = [...state.expBuckets]
  const nextSoulBuckets = [...state.soulBuckets]

  nextExpBuckets[state.activeBucketIndex] = nextExpBuckets[state.activeBucketIndex].plus(experienceGain)
  nextSoulBuckets[state.activeBucketIndex] = nextSoulBuckets[state.activeBucketIndex].plus(monsterSoulGain)

  return {
    ...state,
    expBuckets: nextExpBuckets,
    soulBuckets: nextSoulBuckets,
  }
}

function sumBuckets(buckets: BigNumber[]): BigNumber {
  return buckets.reduce((acc, value) => acc.plus(value), new BigNumber(0))
}

export function calculateRollingPerSecond(state: RollingWindowState): {
  estimatedExpPerSecond: BigNumber
  estimatedMonsterSoulsPerSecond: BigNumber
} {
  return {
    estimatedExpPerSecond: sumBuckets(state.expBuckets).dividedBy(WINDOW_SIZE),
    estimatedMonsterSoulsPerSecond: sumBuckets(state.soulBuckets).dividedBy(WINDOW_SIZE),
  }
}
