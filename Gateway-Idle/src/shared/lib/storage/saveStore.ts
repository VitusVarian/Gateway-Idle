import { get, set } from 'idb-keyval'

const SAVE_KEY = 'gateway-idle-save'

export async function loadSave<T>(): Promise<T | null> {
  const payload = await get<T>(SAVE_KEY)
  return payload ?? null
}

export async function writeSave<T>(payload: T): Promise<void> {
  await set(SAVE_KEY, payload)
}
