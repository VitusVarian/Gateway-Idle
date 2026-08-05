import { useGameStore } from '../store/useGameStore'

const TICK_INTERVAL_MS = 250
const MAX_TICK_DELTA_MS = 5_000

/**
 * Starts the passive generation loop. Returns a cleanup function.
 * Must be called once at app startup, not inside React components.
 */
export function startTickEngine(): () => void {
  let lastTickAt = performance.now()

  const intervalId = setInterval(() => {
    const now = performance.now()
    const deltaMs = now - lastTickAt
    lastTickAt = now

    if (!Number.isFinite(deltaMs) || deltaMs <= 0) {
      return
    }

    useGameStore.getState().tick(Math.min(deltaMs, MAX_TICK_DELTA_MS))
  }, TICK_INTERVAL_MS)

  return () => clearInterval(intervalId)
}
