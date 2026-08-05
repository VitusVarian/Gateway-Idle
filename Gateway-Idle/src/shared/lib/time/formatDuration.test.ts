import { describe, expect, it } from 'vitest'
import { formatDuration } from './formatDuration'

describe('formatDuration', () => {
  it('formats minutes and seconds', () => {
    expect(formatDuration(65)).toBe('1:05')
  })

  it('formats hours when needed', () => {
    expect(formatDuration(3661)).toBe('1:01:01')
  })
})
