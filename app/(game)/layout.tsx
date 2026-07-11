import { AppShell } from '@/components/game/app-shell'

export default function GameLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppShell>{children}</AppShell>
}
