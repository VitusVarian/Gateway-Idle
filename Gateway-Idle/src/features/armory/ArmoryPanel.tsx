import { Hammer, Swords } from 'lucide-react'
import { canAfford, weaponUpgradeCost } from '../../engine/economy'
import { formatNumber } from '../../shared/lib/formatting/formatNumber'
import { useGameStore } from '../../store/useGameStore'

export function ArmoryPanel() {
  const monsterSouls = useGameStore((state) => state.monsterSouls)
  const weaponLevel = useGameStore((state) => state.weaponLevel)
  const dps = useGameStore((state) => state.dps)
  const purchaseWeaponUpgrade = useGameStore((state) => state.purchaseWeaponUpgrade)

  const upgradeCost = weaponUpgradeCost(weaponLevel)
  const canPurchase = canAfford(upgradeCost, monsterSouls)

  return (
    <article
      className="rounded-2xl border border-stone-700/40 bg-stone-900/70 p-4 text-stone-200"
      aria-label="Armory panel"
    >
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <Hammer className="h-5 w-5 text-amber-300" aria-hidden="true" />
        Armory
      </h2>

      <div className="mt-3 space-y-2 text-sm">
        <p className="flex items-center justify-between gap-4">
          <span className="text-stone-300">Weapon Level</span>
          <span className="font-semibold text-stone-100">{weaponLevel}</span>
        </p>
        <p className="flex items-center justify-between gap-4">
          <span className="text-stone-300">Damage Per Second</span>
          <span className="font-semibold text-stone-100">{formatNumber(dps)}</span>
        </p>
        <p className="flex items-center justify-between gap-4">
          <span className="text-stone-300">Upgrade Cost</span>
          <span className="font-semibold text-stone-100">
            {formatNumber(upgradeCost)} Monster Souls
          </span>
        </p>
      </div>

      <button
        type="button"
        onClick={() => {
          purchaseWeaponUpgrade()
        }}
        disabled={!canPurchase}
        className="mt-4 inline-flex items-center gap-2 rounded-xl border border-amber-400/50 bg-amber-300/90 px-4 py-2 font-medium text-stone-950 transition enabled:hover:bg-amber-200 disabled:cursor-not-allowed disabled:border-stone-600/70 disabled:bg-stone-700/80 disabled:text-stone-300"
      >
        <Swords className="h-4 w-4" aria-hidden="true" />
        Upgrade Weapon
      </button>
    </article>
  )
}
