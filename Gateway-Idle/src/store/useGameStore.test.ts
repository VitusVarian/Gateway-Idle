import BigNumber from 'bignumber.js'
import { beforeEach, describe, expect, it } from 'vitest'
import { useGameStore } from './useGameStore'

describe('useGameStore tick stability', () => {
  beforeEach(() => {
    useGameStore.setState(useGameStore.getInitialState(), true)
  })

  it('ignores non-finite elapsed values', () => {
    const before = useGameStore.getState().experience

    useGameStore.getState().tick(Number.NaN)

    expect(useGameStore.getState().experience.toString()).toBe(before.toString())
  })

  it('clamps very large elapsed updates to protect long-session stability', () => {
    useGameStore.getState().tick(60_000)

    const state = useGameStore.getState()
    expect(state.trainingCycleMs).toBe(5_000)
    expect(state.rebirthCycleMs).toBe(5_000)
    expect(state.gatewayCycleMs).toBe(5_000)
    expect(state.experience.toString()).toBe(new BigNumber(5).toString())
  })

  it('does not allow retreating below stage 1', () => {
    useGameStore.getState().retreatStage()

    const state = useGameStore.getState()
    expect(state.currentStage).toBe(1)
    expect(state.monsterHp.isGreaterThan(0)).toBe(true)
  })
})
