import { del, get, set } from 'idb-keyval'

const SAVE_KEY = 'gateway-idle-save'
const SAVE_BACKUP_KEY = 'gateway-idle-save-backup'

export async function loadPrimarySave<T>(): Promise<T | null> {
  const payload = await get<T>(SAVE_KEY)
  return payload ?? null
}

export async function loadBackupSave<T>(): Promise<T | null> {
  const payload = await get<T>(SAVE_BACKUP_KEY)
  return payload ?? null
}

export async function writePrimarySave<T>(payload: T): Promise<void> {
  await set(SAVE_KEY, payload)
}

export async function writeBackupSave<T>(payload: T): Promise<void> {
  await set(SAVE_BACKUP_KEY, payload)
}

export async function clearAllSaves(): Promise<void> {
  await Promise.all([del(SAVE_KEY), del(SAVE_BACKUP_KEY)])
}
