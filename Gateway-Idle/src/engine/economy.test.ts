import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'
import { weaponUpgradeCost } from './economy'

describe('weaponUpgradeCost', () => {
  it('follows exponential growth by level', () => {
    expect(weaponUpgradeCost(0).toString()).toBe('50')
    expect(weaponUpgradeCost(1).toString()).toBe('55')
    expect(weaponUpgradeCost(2).toString()).toBe('60')
    expect(weaponUpgradeCost(10).isGreaterThan(new BigNumber(100))).toBe(true)
  })
})
