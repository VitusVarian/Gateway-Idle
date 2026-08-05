import BigNumber from 'bignumber.js'

export interface Resources {
  monsterSouls: BigNumber
  trainingPoints: BigNumber
}

export interface SavePayloadV1 {
  schemaVersion: 1
  resources: {
    monsterSouls: string
    trainingPoints: string
  }
}
