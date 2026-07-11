'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Menu, Pickaxe, Swords, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CharacterStats } from './character-stats'
import { GameNav } from './game-nav'

function QuickActions({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Quick Actions
      </p>
      <div className="grid grid-cols-2 gap-2">
        <Link
          href="/fight"
          onClick={onNavigate}
          className="flex items-center justify-center gap-1.5 rounded-md border border-border bg-background px-2 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Swords className="size-3.5" aria-hidden="true" />
          Fight
        </Link>
        <Link
          href="/mining"
          onClick={onNavigate}
          className="flex items-center justify-center gap-1.5 rounded-md border border-border bg-background px-2 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Pickaxe className="size-3.5" aria-hidden="true" />
          Mine
        </Link>
      </div>
    </div>
  )
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col gap-5">
      <div>
        <Link
          href="/fight"
          onClick={onNavigate}
          className="font-display text-xl font-bold tracking-wide text-primary outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Gateway
        </Link>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Incremental
        </p>
      </div>
      <CharacterStats />
      <GameNav onNavigate={onNavigate} />
      <div className="mt-auto">
        <QuickActions onNavigate={onNavigate} />
      </div>
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Close drawer on Escape.
  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawerOpen])

  return (
    <div className="min-h-dvh bg-background">
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 lg:hidden">
        <span className="font-display text-lg font-bold tracking-wide text-primary">
          Gateway Incremental
        </span>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-expanded={drawerOpen}
          aria-controls="mobile-sidebar"
        >
          <Menu className="size-4" aria-hidden="true" />
          Menu
        </button>
      </div>

      <div className="mx-auto flex w-full max-w-[1600px]">
        {/* Desktop left column — fixed 25% */}
        <aside className="sticky top-0 hidden h-dvh w-1/4 shrink-0 overflow-y-auto border-r border-border bg-surface p-5 lg:block">
          <SidebarContent />
        </aside>

        {/* Main content — 75% */}
        <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
      </div>

      {/* Mobile drawer */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div
            id="mobile-sidebar"
            role="dialog"
            aria-modal="true"
            aria-label="Character and navigation"
            className={cn(
              'absolute inset-y-0 left-0 w-[85%] max-w-sm overflow-y-auto border-r border-border bg-surface p-5',
            )}
          >
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="size-4" aria-hidden="true" />
                Close
              </button>
            </div>
            <SidebarContent onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      ) : null}
    </div>
  )
}
