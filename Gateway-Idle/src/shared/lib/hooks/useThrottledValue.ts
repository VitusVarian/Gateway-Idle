import { useEffect, useState } from 'react'

export function useThrottledValue<T>(value: T, intervalMs: number): T {
  const [throttled, setThrottled] = useState(value)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setThrottled(value)
    }, intervalMs)

    return () => window.clearTimeout(timeoutId)
  }, [value, intervalMs])

  return throttled
}
