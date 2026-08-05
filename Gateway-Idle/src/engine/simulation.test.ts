import { describe, expect, it } from 'vitest'
import { advanceSimulation, createInitialSimulationState } from './simulation'

describe('advanceSimulation determinism', () => {
  it('produces the same result for equivalent elapsed time batching', () => {
    const start = createInitialSimulationState()

    const singleStep = advanceSimulation(start, 10_000)

    let repeated = start
    for (let i = 0; i < 10; i += 1) {
      repeated = advanceSimulation(repeated, 1_000)
    }

    expect(repeated.monsterSouls.toString()).toBe(singleStep.monsterSouls.toString())
    expect(repeated.experience.toString()).toBe(singleStep.experience.toString())
    expect(repeated.level.toString()).toBe(singleStep.level.toString())
    expect(repeated.currentStage).toBe(singleStep.currentStage)
    expect(repeated.maxUnlockedStage).toBe(singleStep.maxUnlockedStage)
    expect(repeated.phase).toBe(singleStep.phase)
    expect(repeated.killsOnStage).toBe(singleStep.killsOnStage)
  })

  it('transitions between battle and cooldown while earning resources', () => {
    const start = createInitialSimulationState()
    const progressed = advanceSimulation(start, 30_000)

    expect(progressed.monsterSouls.isGreaterThan(0)).toBe(true)
    expect(progressed.experience.isGreaterThanOrEqualTo(0)).toBe(true)
    expect(progressed.phase === 'battling' || progressed.phase === 'postBattleCooldown').toBe(true)
    expect(progressed.maxUnlockedStage).toBeGreaterThanOrEqual(1)
  })
})
