import BigNumber from 'bignumber.js'
import { z } from 'zod'
import type { GameRuntimeSnapshot, SaveSchemaV1 } from '../../types/game'

const CURRENT_SCHEMA_VERSION = 1 as const

const nonNegativeInt = z.number().int().nonnegative()

const saveSchemaV1 = z.object({
  schemaVersion: z.literal(1),
  meta: z.object({
    appVersion: z.string().min(1),
    createdAt: nonNegativeInt,
    updatedAt: nonNegativeInt,
    lastTickAt: nonNegativeInt,
  }),
  resources: z.object({
    experience: z.string(),
    monsterSoul: z.string(),
    trainingPoints: z.string(),
  }),
  player: z.object({
    level: z.string(),
    strength: z.string(),
    strengthGrowth: z.string(),
  }),
  progression: z.object({
    currentStage: nonNegativeInt,
    maxUnlockedStage: nonNegativeInt,
    trainingUnlocked: z.boolean(),
    rebirthUnlocked: z.boolean(),
    gatewayUnlocked: z.boolean(),
  }),
  upgrades: z.object({
    weaponLevel: nonNegativeInt,
    training: z.record(z.string(), nonNegativeInt),
  }),
  achievements: z.object({
    unlockedIds: z.array(z.string()),
  }),
  timers: z.object({
    totalPlayMs: nonNegativeInt,
    trainingCycleMs: nonNegativeInt,
    rebirthCycleMs: nonNegativeInt,
    gatewayCycleMs: nonNegativeInt,
    firstTrainingMs: nonNegativeInt.nullable(),
    firstRebirthMs: nonNegativeInt.nullable(),
    firstGatewayMs: nonNegativeInt.nullable(),
  }),
})

function safeBigNumber(value: string, fallback: string): string {
  const parsed = new BigNumber(value)
  if (!parsed.isFinite() || parsed.isNaN()) {
    return fallback
  }

  return parsed.toFixed()
}

export function createDefaultSaveV1(now = Date.now(), appVersion = '0.1.0'): SaveSchemaV1 {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    meta: {
      appVersion,
      createdAt: now,
      updatedAt: now,
      lastTickAt: now,
    },
    resources: {
      experience: '0',
      monsterSoul: '0',
      trainingPoints: '0',
    },
    player: {
      level: '1',
      strength: '1',
      strengthGrowth: '1',
    },
    progression: {
      currentStage: 1,
      maxUnlockedStage: 1,
      trainingUnlocked: false,
      rebirthUnlocked: false,
      gatewayUnlocked: false,
    },
    upgrades: {
      weaponLevel: 1,
      training: {
        strengthGrowth: 0,
        levelingDifficulty: 0,
        experienceModifier: 0,
        monsterSoulModifier: 0,
      },
    },
    achievements: {
      unlockedIds: [],
    },
    timers: {
      totalPlayMs: 0,
      trainingCycleMs: 0,
      rebirthCycleMs: 0,
      gatewayCycleMs: 0,
      firstTrainingMs: null,
      firstRebirthMs: null,
      firstGatewayMs: null,
    },
  }
}

function sanitizeSaveV1(input: SaveSchemaV1): SaveSchemaV1 {
  const progressionStage = Math.max(1, input.progression.currentStage)
  const progressionMax = Math.max(progressionStage, input.progression.maxUnlockedStage)

  return {
    ...input,
    resources: {
      experience: safeBigNumber(input.resources.experience, '0'),
      monsterSoul: safeBigNumber(input.resources.monsterSoul, '0'),
      trainingPoints: safeBigNumber(input.resources.trainingPoints, '0'),
    },
    player: {
      level: safeBigNumber(input.player.level, '1'),
      strength: safeBigNumber(input.player.strength, '1'),
      strengthGrowth: safeBigNumber(input.player.strengthGrowth, '1'),
    },
    progression: {
      ...input.progression,
      currentStage: progressionStage,
      maxUnlockedStage: progressionMax,
    },
    upgrades: {
      ...input.upgrades,
      weaponLevel: Math.max(1, input.upgrades.weaponLevel),
      training: Object.fromEntries(
        Object.entries(input.upgrades.training).map(([key, value]) => [key, Math.max(0, value)]),
      ),
    },
    achievements: {
      unlockedIds: [...new Set(input.achievements.unlockedIds)],
    },
    timers: {
      ...input.timers,
      totalPlayMs: Math.max(0, input.timers.totalPlayMs),
      trainingCycleMs: Math.max(0, input.timers.trainingCycleMs),
      rebirthCycleMs: Math.max(0, input.timers.rebirthCycleMs),
      gatewayCycleMs: Math.max(0, input.timers.gatewayCycleMs),
      firstTrainingMs:
        input.timers.firstTrainingMs === null ? null : Math.max(0, input.timers.firstTrainingMs),
      firstRebirthMs:
        input.timers.firstRebirthMs === null ? null : Math.max(0, input.timers.firstRebirthMs),
      firstGatewayMs:
        input.timers.firstGatewayMs === null ? null : Math.max(0, input.timers.firstGatewayMs),
    },
  }
}

function migrateV0ToV1(input: unknown, now: number, appVersion: string): SaveSchemaV1 {
  const fallback = createDefaultSaveV1(now, appVersion)

  if (!input || typeof input !== 'object') {
    return fallback
  }

  const record = input as Record<string, unknown>
  const legacyResource = record.resources as Record<string, unknown> | undefined

  return {
    ...fallback,
    resources: {
      ...fallback.resources,
      monsterSoul:
        typeof legacyResource?.monsterSouls === 'string'
          ? legacyResource.monsterSouls
          : fallback.resources.monsterSoul,
      trainingPoints:
        typeof legacyResource?.trainingPoints === 'string'
          ? legacyResource.trainingPoints
          : fallback.resources.trainingPoints,
    },
  }
}

function migrateToCurrent(input: unknown, now: number, appVersion: string): SaveSchemaV1 {
  if (!input || typeof input !== 'object') {
    return createDefaultSaveV1(now, appVersion)
  }

  const record = input as Record<string, unknown>
  const version = typeof record.schemaVersion === 'number' ? record.schemaVersion : 0

  if (version <= 0) {
    return migrateV0ToV1(input, now, appVersion)
  }

  if (version === 1) {
    const parsed = saveSchemaV1.safeParse(input)
    if (!parsed.success) {
      return createDefaultSaveV1(now, appVersion)
    }

    return parsed.data
  }

  return createDefaultSaveV1(now, appVersion)
}

export function tryValidateAndMigrateSave(
  input: unknown,
  now = Date.now(),
  appVersion = '0.1.0',
): SaveSchemaV1 | null {
  if (!input || typeof input !== 'object') {
    return null
  }

  const record = input as Record<string, unknown>
  const version = typeof record.schemaVersion === 'number' ? record.schemaVersion : 0

  if (version > CURRENT_SCHEMA_VERSION) {
    return null
  }

  if (version === 1) {
    const parsed = saveSchemaV1.safeParse(input)
    return parsed.success ? sanitizeSaveV1(parsed.data) : null
  }

  const migrated = migrateV0ToV1(input, now, appVersion)
  const parsed = saveSchemaV1.safeParse(migrated)
  return parsed.success ? sanitizeSaveV1(parsed.data) : null
}

export function validateAndMigrateSave(
  input: unknown,
  now = Date.now(),
  appVersion = '0.1.0',
): SaveSchemaV1 {
  const strict = tryValidateAndMigrateSave(input, now, appVersion)
  if (strict) {
    return strict
  }

  const migrated = migrateToCurrent(input, now, appVersion)
  const parsed = saveSchemaV1.safeParse(migrated)
  if (!parsed.success) {
    return createDefaultSaveV1(now, appVersion)
  }

  return sanitizeSaveV1(parsed.data)
}

export function toSaveFromSnapshot(
  snapshot: GameRuntimeSnapshot,
  now = Date.now(),
  appVersion = '0.1.0',
): SaveSchemaV1 {
  return sanitizeSaveV1({
    schemaVersion: 1,
    meta: {
      appVersion,
      createdAt: snapshot.meta.createdAt,
      updatedAt: now,
      lastTickAt: snapshot.meta.lastTickAt,
    },
    resources: {
      experience: snapshot.resources.experience.toFixed(),
      monsterSoul: snapshot.resources.monsterSoul.toFixed(),
      trainingPoints: snapshot.resources.trainingPoints.toFixed(),
    },
    player: {
      level: snapshot.player.level.toFixed(),
      strength: snapshot.player.strength.toFixed(),
      strengthGrowth: snapshot.player.strengthGrowth.toFixed(),
    },
    progression: { ...snapshot.progression },
    upgrades: {
      weaponLevel: snapshot.upgrades.weaponLevel,
      training: { ...snapshot.upgrades.training },
    },
    achievements: {
      unlockedIds: [...snapshot.achievements.unlockedIds],
    },
    timers: { ...snapshot.timers },
  })
}

export function toRuntimeSnapshotFromSave(save: SaveSchemaV1): GameRuntimeSnapshot {
  return {
    meta: {
      createdAt: save.meta.createdAt,
      lastTickAt: save.meta.lastTickAt,
    },
    resources: {
      experience: new BigNumber(save.resources.experience),
      monsterSoul: new BigNumber(save.resources.monsterSoul),
      trainingPoints: new BigNumber(save.resources.trainingPoints),
    },
    player: {
      level: new BigNumber(save.player.level),
      strength: new BigNumber(save.player.strength),
      strengthGrowth: new BigNumber(save.player.strengthGrowth),
    },
    progression: { ...save.progression },
    upgrades: {
      weaponLevel: save.upgrades.weaponLevel,
      training: { ...save.upgrades.training },
    },
    achievements: {
      unlockedIds: [...save.achievements.unlockedIds],
    },
    timers: { ...save.timers },
    dps: new BigNumber(1),
  }
}
