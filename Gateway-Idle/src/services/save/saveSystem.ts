import BigNumber from 'bignumber.js'
import { applyOfflineProgress } from '../../engine/economy/offlineProgress'
import { log } from '../../shared/lib/logger'
import {
  clearAllSaves,
  loadBackupSave,
  loadPrimarySave,
  writeBackupSave,
  writePrimarySave,
} from '../../shared/lib/storage/saveStore'
import type { GameRuntimeSnapshot, SaveSchemaV1 } from '../../types/game'
import { decodeAndVerifySaveBundle, encodeSaveBundle } from './saveCodec'
import {
  createDefaultSaveV1,
  toRuntimeSnapshotFromSave,
  tryValidateAndMigrateSave,
  toSaveFromSnapshot,
  validateAndMigrateSave,
} from './saveSchema'

const APP_VERSION = '0.1.0'
const AUTOSAVE_INTERVAL_MS = 30_000
const MIN_SAVE_GAP_MS = 3_000
const MAX_OFFLINE_DELTA_MS = 8 * 60 * 60 * 1000

export interface SaveSystemBindings {
  exportSnapshot: () => GameRuntimeSnapshot
  hydrateSnapshot: (snapshot: GameRuntimeSnapshot) => void
  applyOfflineSoulGain: (amount: BigNumber, elapsedMs: number, now: number) => void
  recordForegroundTime: (elapsedMs: number, now: number) => void
}

function clampOfflineDelta(deltaMs: number): number {
  if (!Number.isFinite(deltaMs)) {
    return 0
  }

  if (deltaMs <= 0) {
    return 0
  }

  return Math.min(deltaMs, MAX_OFFLINE_DELTA_MS)
}

async function persistSave(payload: SaveSchemaV1): Promise<void> {
  await writePrimarySave(payload)
  await writeBackupSave(payload)
}

async function loadWithFallback(now: number): Promise<{ save: SaveSchemaV1; source: 'primary' | 'backup' | 'default' }> {
  try {
    const primary = await loadPrimarySave<unknown>()
    if (primary !== null) {
      const sanitizedPrimary = tryValidateAndMigrateSave(primary, now, APP_VERSION)
      if (sanitizedPrimary) {
        return { save: sanitizedPrimary, source: 'primary' }
      }

      log('warn', 'Primary save payload is invalid. Attempting backup save.')
    }
  } catch (error) {
    log('warn', 'Primary save load failed. Attempting backup save.', error)
  }

  try {
    const backup = await loadBackupSave<unknown>()
    if (backup !== null) {
      const sanitizedBackup = tryValidateAndMigrateSave(backup, now, APP_VERSION)
      if (sanitizedBackup) {
        return { save: sanitizedBackup, source: 'backup' }
      }

      log('warn', 'Backup save payload is invalid. Falling back to default save.')
    }
  } catch (error) {
    log('warn', 'Backup save load failed. Falling back to default save.', error)
  }

  return { save: createDefaultSaveV1(now, APP_VERSION), source: 'default' }
}

export interface SaveSystemHandle {
  ready: Promise<void>
  exportSave: () => Promise<string>
  importSave: (encodedSave: string) => Promise<void>
  saveNow: () => Promise<void>
  fullReset: () => Promise<void>
  dispose: () => void
}

export function createSaveSystem(bindings: SaveSystemBindings): SaveSystemHandle {
  let disposed = false
  let autosaveTimer: ReturnType<typeof setInterval> | undefined
  let lastForegroundTick = Date.now()
  let lastSavedAt = 0
  let saveInFlight: Promise<void> | null = null

  const saveNow = async (): Promise<void> => {
    if (disposed) {
      return
    }

    if (saveInFlight) {
      await saveInFlight
      return
    }

    const now = Date.now()
    if (now - lastSavedAt < MIN_SAVE_GAP_MS) {
      return
    }

    saveInFlight = (async () => {
      try {
        const state = bindings.exportSnapshot()
        const payload = toSaveFromSnapshot(
          {
            ...state,
            meta: {
              ...state.meta,
              lastTickAt: now,
            },
          },
          now,
          APP_VERSION,
        )

        await persistSave(payload)
        lastSavedAt = now
      } catch (error) {
        log('warn', 'Failed to persist save payload.', error)
      }
    })().finally(() => {
      saveInFlight = null
    })

    await saveInFlight
  }

  const flushForegroundTime = () => {
    const now = Date.now()
    const elapsed = Math.max(0, now - lastForegroundTick)
    if (elapsed > 0) {
      bindings.recordForegroundTime(elapsed, now)
      lastForegroundTick = now
    }
  }

  const onVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      flushForegroundTime()
      void saveNow()
      return
    }

    lastForegroundTick = Date.now()
  }

  const onBeforeUnload = () => {
    flushForegroundTime()
    void saveNow()
  }

  const ready = (async () => {
    const now = Date.now()
    const loaded = await loadWithFallback(now)

    if (loaded.source !== 'primary') {
      log('warn', `Loaded ${loaded.source} save payload due to primary save issue.`)
      try {
        await persistSave(loaded.save)
      } catch (error) {
        log('warn', 'Failed to repair primary save after fallback load.', error)
      }
    }

    const snapshot = toRuntimeSnapshotFromSave(loaded.save)
    bindings.hydrateSnapshot(snapshot)

    const offlineElapsedMs = clampOfflineDelta(now - loaded.save.meta.lastTickAt)
    if (offlineElapsedMs > 0) {
      const result = applyOfflineProgress({ elapsedMs: offlineElapsedMs, dps: snapshot.dps })
      bindings.applyOfflineSoulGain(result.soulGain, offlineElapsedMs, now)
    }

    lastForegroundTick = Date.now()

    autosaveTimer = setInterval(() => {
      flushForegroundTime()
      void saveNow()
    }, AUTOSAVE_INTERVAL_MS)

    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('beforeunload', onBeforeUnload)
  })()

  const exportSave = async (): Promise<string> => {
    const state = bindings.exportSnapshot()
    const payload = toSaveFromSnapshot(state, Date.now(), APP_VERSION)
    return encodeSaveBundle(payload)
  }

  const importSave = async (encodedSave: string): Promise<void> => {
    const decoded = await decodeAndVerifySaveBundle(encodedSave)
    const sanitized = validateAndMigrateSave(decoded, Date.now(), APP_VERSION)
    const snapshot = toRuntimeSnapshotFromSave(sanitized)
    bindings.hydrateSnapshot(snapshot)
    await persistSave(sanitized)
  }

  const fullReset = async (): Promise<void> => {
    const now = Date.now()
    const defaultSave = createDefaultSaveV1(now, APP_VERSION)
    bindings.hydrateSnapshot(toRuntimeSnapshotFromSave(defaultSave))
    await clearAllSaves()
    await persistSave(defaultSave)
  }

  const dispose = () => {
    if (disposed) {
      return
    }

    disposed = true
    if (autosaveTimer) {
      clearInterval(autosaveTimer)
    }

    document.removeEventListener('visibilitychange', onVisibilityChange)
    window.removeEventListener('beforeunload', onBeforeUnload)
  }

  return {
    ready,
    exportSave,
    importSave,
    saveNow,
    fullReset,
    dispose,
  }
}
