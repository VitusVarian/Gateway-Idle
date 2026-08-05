import { useEffect, type PropsWithChildren } from 'react'
import { HotkeysProvider } from 'react-hotkeys-hook'
import { Toaster } from 'sonner'
import { startTickEngine } from '../../engine/tickEngine'

export function AppProviders({ children }: PropsWithChildren) {
  useEffect(() => {
    return startTickEngine()
  }, [])

  return (
    <HotkeysProvider>
      {children}
      <Toaster richColors position="top-right" />
    </HotkeysProvider>
  )
}
