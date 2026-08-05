type EventMap = Record<string, unknown>
type Listener<T> = (payload: T) => void

export function createEventBus<TEvents extends EventMap>() {
  const listeners = new Map<keyof TEvents, Set<Listener<TEvents[keyof TEvents]>>>()

  function on<TKey extends keyof TEvents>(
    event: TKey,
    listener: Listener<TEvents[TKey]>,
  ): () => void {
    const eventListeners = listeners.get(event) ?? new Set<Listener<TEvents[keyof TEvents]>>()

    eventListeners.add(listener as Listener<TEvents[keyof TEvents]>)
    listeners.set(event, eventListeners)

    return () => {
      eventListeners.delete(listener as Listener<TEvents[keyof TEvents]>)
      if (eventListeners.size === 0) {
        listeners.delete(event)
      }
    }
  }

  function emit<TKey extends keyof TEvents>(event: TKey, payload: TEvents[TKey]): void {
    const eventListeners = listeners.get(event)
    if (!eventListeners) {
      return
    }

    for (const listener of eventListeners) {
      listener(payload)
    }
  }

  return { on, emit }
}
