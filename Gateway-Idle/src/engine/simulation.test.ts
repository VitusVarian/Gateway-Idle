import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'
import { attackIntervalMs } from './economy'
import { ECONOMY_CONFIG } from './economyConfig'
import { advanceSimulation, createInitialSimulationState, switchStage } from './simulation'

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

  it('enforces stage unlocks from maxUnlockedStage and never auto-unlocks by current stage', () => {
    const start = createInitialSimulationState()
    const forged = {
      ...start,
      currentStage: 7,
      maxUnlockedStage: 3,
    }

    const progressed = advanceSimulation(forged, 1)

    expect(progressed.currentStage).toBe(3)
    expect(progressed.maxUnlockedStage).toBe(3)
  })

  it('immediately restarts battling when switching stage during cooldown', () => {
    const start = createInitialSimulationState()
    const onCooldown = {
      ...start,
      phase: 'postBattleCooldown' as const,
      phaseProgressMs: ECONOMY_CONFIG.postBattleCooldownMs - 250,
    }

    const switched = switchStage(onCooldown, 1)

    expect(switched.phase).toBe('battling')
    expect(switched.phaseProgressMs).toBe(0)
    expect(switched.attackProgressMs).toBe(0)
  })

  it('resets active-stage kills when leaving a stage and returns at 0', () => {
    const start = createInitialSimulationState()
    const unlocked = {
      ...start,
      maxUnlockedStage: 3,
      currentStage: 2,
      killsOnStage: 9,
    }

    const stageOne = switchStage(unlocked, 1)
    const stageTwoAgain = switchStage(stageOne, 2)

    expect(stageOne.killsOnStage).toBe(0)
    expect(stageTwoAgain.killsOnStage).toBe(0)
    expect(stageTwoAgain.estimatedExpPerSecond.toString()).toBe('0')
    expect(stageTwoAgain.estimatedMonsterSoulsPerSecond.toString()).toBe('0')
  })

  it('advances through battling -> cooldown -> battling and sets boss gate state at stage 10', () => {
    const start = createInitialSimulationState()
    const onBossStage = {
      ...start,
      currentStage: 10,
      maxUnlockedStage: 10,
      killsOnStage: ECONOMY_CONFIG.killsRequiredPerStage - 1,
      monsterHpCurrent: new BigNumber(1),
      monsterHpMax: new BigNumber(1),
      attackProgressMs: attackIntervalMs() - 1,
    }

    const afterKill = advanceSimulation(onBossStage, 1)
    expect(afterKill.phase).toBe('postBattleCooldown')
    expect(afterKill.bossEncounterState).toBe('gateCleared')
    expect(afterKill.maxUnlockedStage).toBe(11)

    const backToBattle = advanceSimulation(afterKill, ECONOMY_CONFIG.postBattleCooldownMs)
    expect(backToBattle.phase).toBe('battling')
  })

  it('tracks boss encounter gate state for stages 100 and 1000', () => {
    const start = createInitialSimulationState()

    const stage10GateActive = advanceSimulation(
      {
        ...start,
        currentStage: 10,
        maxUnlockedStage: 10,
      },
      1,
    )
    expect(stage10GateActive.bossEncounterState).toBe('gateActive')

    const stage100GateActive = advanceSimulation(
      {
        ...start,
        currentStage: 100,
        maxUnlockedStage: 100,
      },
      1,
    )
    expect(stage100GateActive.bossEncounterState).toBe('gateActive')

    const stage1000GateCleared = advanceSimulation(
      {
        ...start,
        currentStage: 1000,
        maxUnlockedStage: 1001,
      },
      1,
    )
    expect(stage1000GateCleared.bossEncounterState).toBe('gateCleared')
  })
})
