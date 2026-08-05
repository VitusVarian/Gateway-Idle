import BigNumber from 'bignumber.js'
import { beforeEach, describe, expect, it } from 'vitest'
import { useGameStore } from '../useGameStore'
import {
  selectMilestoneSummary,
  selectRateDisplays,
  selectStageLockState,
  selectTrainingNavigationVisibility,
  selectTrainingUpgradeAffordability,
} from './gameSelectors'

describe('game selectors', () => {
  beforeEach(() => {
    useGameStore.setState(useGameStore.getInitialState())
  })

  it('derives affordability and stage-lock state from the game state', () => {
    const initial = useGameStore.getState()
    const unaffordable = selectTrainingUpgradeAffordability(initial, 'strengthGrowth')
    expect(unaffordable.canAfford).toBe(false)
    expect(unaffordable.cost.toString()).toBe('1')

    useGameStore.setState({
      trainingPoints: new BigNumber(2),
      upgrades: { ...initial.upgrades, strengthGrowth: 1 },
      maxUnlockedStage: 10,
      trainingUnlocked: true,
    })

    const affordable = selectTrainingUpgradeAffordability(useGameStore.getState(), 'strengthGrowth')
    expect(affordable.canAfford).toBe(true)

    const stageLockState = selectStageLockState(useGameStore.getState())
    expect(stageLockState.trainingLocked).toBe(false)
    expect(stageLockState.rebirthLocked).toBe(true)
    expect(stageLockState.gatewayLocked).toBe(true)
  })

  it('builds milestone and rate read models for the shell', () => {
    useGameStore.setState({
      highestStageReachedThisCycle: 10,
      currentStage: 10,
      dps: new BigNumber(12),
      trainingPoints: new BigNumber(4),
    })

    const milestoneSummary = selectMilestoneSummary(useGameStore.getState())
    const rateDisplays = selectRateDisplays(useGameStore.getState())

    expect(milestoneSummary.highestStageReached).toBe(10)
    expect(milestoneSummary.rewardForCurrentCycle.toString()).toBe('3')
    expect(rateDisplays.dps.toString()).toBe('12')
    expect(rateDisplays.monsterSoulRate.toString()).toBe('1')
  })

  it('shows training navigation after an ever-reset or unlock threshold', () => {
    useGameStore.setState({
      trainingUnlocked: false,
      trainingResetCount: 0,
      maxUnlockedStage: 9,
    })

    expect(selectTrainingNavigationVisibility(useGameStore.getState()).visible).toBe(false)

    useGameStore.setState({
      trainingUnlocked: false,
      trainingResetCount: 1,
      maxUnlockedStage: 9,
    })

    expect(selectTrainingNavigationVisibility(useGameStore.getState()).visible).toBe(true)
  })
})
