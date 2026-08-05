import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'
import {
  addRollingWindowReward,
  advanceRollingWindow,
  calculateRollingPerSecond,
  createRollingWindowState,
} from './rollingWindow'

describe('rollingWindow', () => {
  it('uses a fixed 60-bucket denominator for per-second estimates', () => {
    let state = createRollingWindowState()

    for (let i = 0; i < 60; i += 1) {
      state = addRollingWindowReward(state, new BigNumber(10), new BigNumber(5))

      // Keep all 60 reward buckets in-window for this assertion.
      if (i < 59) {
        state = advanceRollingWindow(state, 1000)
      }
    }

    const rates = calculateRollingPerSecond(state)
    expect(rates.estimatedExpPerSecond.toString()).toBe('0.16666666666666666667')
    expect(rates.estimatedMonsterSoulsPerSecond.toString()).toBe('0.08333333333333333333')
  })

  it('drops rewards older than 60 seconds', () => {
    let state = createRollingWindowState()

    state = addRollingWindowReward(state, new BigNumber(120), new BigNumber(60))
    state = advanceRollingWindow(state, 61_000)

    const rates = calculateRollingPerSecond(state)
    expect(rates.estimatedExpPerSecond.toString()).toBe('0')
    expect(rates.estimatedMonsterSoulsPerSecond.toString()).toBe('0')
  })
})
