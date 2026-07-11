'use client'

import Image from 'next/image'
import { Check } from 'lucide-react'
import type { Avatar } from '@/lib/game/types'
import { cn } from '@/lib/utils'

interface AvatarPickerProps {
  avatars: Avatar[]
  value: string | null
  onChange: (avatarId: string) => void
}

export function AvatarPicker({ avatars, value, onChange }: AvatarPickerProps) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-foreground">
        Choose your avatar
      </legend>
      <div
        role="radiogroup"
        aria-label="Avatar selection"
        className="grid grid-cols-3 gap-3 sm:grid-cols-3"
      >
        {avatars.map((avatar) => {
          const selected = value === avatar.avatarId
          return (
            <button
              key={avatar.avatarId}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={avatar.label}
              onClick={() => onChange(avatar.avatarId)}
              className={cn(
                'group relative overflow-hidden rounded-lg border-2 bg-muted outline-none transition-all',
                'focus-visible:ring-2 focus-visible:ring-ring',
                selected
                  ? 'border-primary shadow-[var(--shadow-rpg-md)]'
                  : 'border-border hover:border-muted-foreground/60',
              )}
            >
              <span className="relative block aspect-square w-full">
                <Image
                  src={`/avatars/${avatar.avatarId}.png`}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 30vw, 120px"
                  className="object-cover"
                />
              </span>
              {selected ? (
                <span className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-3.5" aria-hidden="true" />
                </span>
              ) : null}
              <span className="block truncate border-t border-border bg-card px-1.5 py-1 text-center text-[11px] font-medium text-foreground">
                {avatar.label}
              </span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
