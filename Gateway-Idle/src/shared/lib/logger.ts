type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const isDev = import.meta.env.DEV

function shouldLog(level: LogLevel): boolean {
  return isDev || level === 'warn' || level === 'error'
}

export function log(level: LogLevel, message: string, data?: unknown): void {
  if (!shouldLog(level)) {
    return
  }

  const prefix = `[gateway-idle/${level}]`
  if (level === 'error') {
    console.error(prefix, message, data)
    return
  }

  if (level === 'warn') {
    console.warn(prefix, message, data)
    return
  }

  if (level === 'info') {
    console.info(prefix, message, data)
    return
  }

  console.debug(prefix, message, data)
}
