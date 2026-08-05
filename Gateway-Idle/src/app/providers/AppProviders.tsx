import type { PropsWithChildren } from 'react'
import { HotkeysProvider } from 'react-hotkeys-hook'
import { Toaster } from 'sonner'

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <HotkeysProvider>
      {children}
      <Toaster richColors position="top-right" />
    </HotkeysProvider>
  )
}
