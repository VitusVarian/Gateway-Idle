import BigNumber from 'bignumber.js'

export interface OfflineProgressInput {
  elapsedMs: number
  dps: BigNumber
}

export interface OfflineProgressResult {
  soulGain: BigNumber
}

export function applyOfflineProgress(input: OfflineProgressInput): OfflineProgressResult {
  const elapsedSeconds = new BigNumber(input.elapsedMs).dividedBy(1000)
  const soulGain = input.dps.multipliedBy(elapsedSeconds)

  return { soulGain }
}
