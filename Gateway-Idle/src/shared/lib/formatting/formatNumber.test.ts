import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'
import { formatNumber } from './formatNumber'

describe('formatNumber', () => {
  it('formats small values without suffixes', () => {
    expect(formatNumber(new BigNumber('0'))).toBe('0')
    expect(formatNumber(new BigNumber('12.345'))).toBe('12.35')
    expect(formatNumber(new BigNumber('999.99'))).toBe('999.99')
  })

  it('formats values with suffixes and rollover handling', () => {
    expect(formatNumber(new BigNumber('1000'))).toBe('1K')
    expect(formatNumber(new BigNumber('1500000'))).toBe('1.5M')
    expect(formatNumber(new BigNumber('999999'))).toBe('1M')
  })

  it('formats tiny and negative values readably', () => {
    expect(formatNumber(new BigNumber('0.0001234'))).toBe('0.000123')
    expect(formatNumber(new BigNumber('-15320'))).toBe('-15.32K')
  })

  it('falls back to scientific notation for huge magnitudes', () => {
    expect(formatNumber(new BigNumber('1e40'))).toBe('1.00e+40')
  })

  it('guards invalid numbers', () => {
    expect(formatNumber(new BigNumber(NaN))).toBe('0')
  })
})
