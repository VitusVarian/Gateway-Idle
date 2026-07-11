'use client'

import { useState } from 'react'
import { Shield, Swords } from 'lucide-react'
import { UpgradeCard } from '@/components/game/blacksmith/upgrade-card'
import { InfoCallout } from '@/components/game/info-callout'
import { PageHeading } from '@/components/game/page-heading'
import { useGame } from '@/lib/game/game-context'
import { armorTiers, weaponTiers } from '@/lib/game/mock-data'

export default function BlacksmithPage() {
  const { resources, weaponTier, armorTier, upgradeWeapon, upgradeArmor } =
    useGame()
  const [pending, setPending] = useState<'weapon' | 'armor' | null>(null)

  function withLoading(kind: 'weapon' | 'armor', fn: () => void) {
    setPending(kind)
    window.setTimeout(() => {
      fn()
      setPending(null)
    }, 550)
  }

  return (
    <div>
      <PageHeading
        title="The Blacksmith"
        description="Spend gold to reforge your weapon and armor into ever-deadlier gear."
      />

      <InfoCallout tone="info" className="mb-4">
        Upgrades apply instantly and improve your combat power. Costs rise with
        each tier.
      </InfoCallout>

      <div className="grid gap-4 lg:grid-cols-2">
        <UpgradeCard
          variant="weapon"
          title="Weapon"
          icon={<Swords className="size-5" aria-hidden="true" />}
          tiers={weaponTiers}
          currentTier={weaponTier}
          gold={resources.gold}
          loading={pending === 'weapon'}
          onUpgrade={() => withLoading('weapon', upgradeWeapon)}
        />
        <UpgradeCard
          variant="armor"
          title="Armor"
          icon={<Shield className="size-5" aria-hidden="true" />}
          tiers={armorTiers}
          currentTier={armorTier}
          gold={resources.gold}
          loading={pending === 'armor'}
          onUpgrade={() => withLoading('armor', upgradeArmor)}
        />
      </div>
    </div>
  )
}
