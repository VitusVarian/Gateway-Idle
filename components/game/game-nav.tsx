'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Hammer, Pickaxe, Settings, Sparkles, Swords } from 'lucide-react'
import { cn } from '@/lib/utils'

export const navItems = [
  { href: '/fight', label: 'Fight', icon: Swords },
  { href: '/mining', label: 'Mining', icon: Pickaxe },
  { href: '/blacksmith', label: 'Blacksmith', icon: Hammer },
  { href: '/skills', label: 'Skill Tree', icon: Sparkles },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function GameNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav aria-label="Primary" className="flex flex-col gap-1">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex items-center gap-2.5 rounded-md border px-3 py-2 text-sm font-medium transition-colors outline-none',
              'focus-visible:ring-2 focus-visible:ring-ring',
              active
                ? 'border-primary/40 bg-primary/15 text-primary'
                : 'border-transparent text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground',
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
