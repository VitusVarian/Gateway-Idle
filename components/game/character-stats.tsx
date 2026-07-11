'use client'

import Image from 'next/image'
import { Heart, Pickaxe, Shield, Swords } from 'lucide-react'
import { useGame } from '@/lib/game/game-context'
import { armorTiers, weaponTiers } from '@/lib/game/mock-data'
import { GlobalHUD } from './global-hud'
import { Panel } from './panel'

export function CharacterStats() {
  const { character, resources, combat, weaponTier, armorTier } = useGame()

  const stats = [
    {
      icon: Swords,
      label: 'Weapon',
      value: weaponTiers[weaponTier]?.value ?? '—',
    },
    {
      icon: Shield,
      label: 'Armor',
      value: armorTiers[armorTier]?.value ?? '—',
    },
    {
      icon: Heart,
      label: 'Health',
      value: `${combat.playerHp}/${combat.playerMaxHp}`,
    },
    {
      icon: Pickaxe,
      label: 'Mine Rate',
      value: `x${resources.toolEffectMultiplier.toFixed(2)}`,
    },
  ]

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="relative size-14 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
          <Image
            src={`/avatars/${character.avatarId}.png`}
            alt={`${character.name} portrait`}
            fill
            sizes="56px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-semibold tracking-wide">
            {character.name}
          </p>
          <p className="text-xs text-muted-foreground">The Gateway Delver</p>
        </div>
      </div>

      <GlobalHUD
        characterName={character.name}
        level={character.level}
        xpCurrent={character.xp}
        xpRequired={character.xpRequired}
        skillPoints={character.skillPoints}
        gold={resources.gold}
      />

      <Panel className="p-3">
        <dl className="grid grid-cols-2 gap-2">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-md border border-border bg-background p-2">
              <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon className="size-3.5" aria-hidden="true" />
                {label}
              </dt>
              <dd className="mt-0.5 text-sm font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </Panel>
    </div>
  )
}
