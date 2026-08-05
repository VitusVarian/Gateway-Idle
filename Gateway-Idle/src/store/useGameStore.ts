import BigNumber from 'bignumber.js'
import { create } from 'zustand'

interface GameState {
  monsterSouls: BigNumber
  dps: BigNumber
  gainMonsterSouls: (amount: BigNumber) => void
}

export const useGameStore = create<GameState>((set) => ({
  monsterSouls: new BigNumber(0),
  dps: new BigNumber(1),
  gainMonsterSouls: (amount) => {
    set((state) => ({
      monsterSouls: state.monsterSouls.plus(amount),
    }))
  },
}))
