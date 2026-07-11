'use client'

import { useEffect, useRef, useState } from 'react'
import { Coins, Pickaxe, Timer } from 'lucide-react'
import { ActionButton } from '@/components/game/action-button'
import { ToolStoreItem } from '@/components/game/mining/tool-store-item'
import { PageHeading } from '@/components/game/page-heading'
import { Panel, PanelHeader } from '@/components/game/panel'
import { useGame } from '@/lib/game/game-context'
import { tools } from '@/lib/game/mock-data'
import { cn } from '@/lib/utils'

const MINE_DURATION = 4 // seconds

export default function MiningPage() {
  const { resources, ownedToolIds, mine, buyTool } = useGame()
  const [mining, setMining] = useState(false)
  const [remaining, setRemaining] = useState(0)
  const [lastGain, setLastGain] = useState<number | null>(null)
  const [buying, setBuying] = useState<string | null>(null)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [])

  function handleMine() {
    if (mining) return
    setMining(true)
    setRemaining(MINE_DURATION)
    setLastGain(null)
    timerRef.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (timerRef.current) window.clearInterval(timerRef.current)
          const gain = Math.round(55 * resources.toolEffectMultiplier)
          setLastGain(gain)
          mine()
          setMining(false)
          return 0
        }
        return r - 1
      })
    }, 1000)
  }

  function handleBuy(toolId: string, cost: number) {
    if (resources.gold < cost) return
    setBuying(toolId)
    window.setTimeout(() => {
      buyTool(toolId)
      setBuying(null)
    }, 500)
  }

  const progress = mining ? ((MINE_DURATION - remaining) / MINE_DURATION) * 100 : 0

  return (
    <div>
      <PageHeading
        title="Gold Mine"
        description="Mine for gold and invest in better tools to multiply your yield."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Mining activity */}
        <Panel>
          <PanelHeader title="Mining" description="Swing your pick to earn gold." />
          <div className="flex flex-col items-center gap-5 p-6">
            <div className="flex size-28 items-center justify-center rounded-full border-2 border-border bg-background text-primary">
              <Pickaxe
                className={cn('size-12', mining ? 'animate-bounce' : '')}
                aria-hidden="true"
              />
            </div>

            <div className="w-full" aria-live="polite">
              {mining ? (
                <div>
                  <div className="mb-1 flex items-center justify-center gap-1.5 text-sm text-warning">
                    <Timer className="size-4" aria-hidden="true" />
                    Mining… {remaining}s remaining
                  </div>
                  <div
                    role="progressbar"
                    aria-valuenow={Math.round(progress)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="h-2.5 w-full overflow-hidden rounded-full border border-border bg-background"
                  >
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-1000 ease-linear"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ) : lastGain !== null ? (
                <p className="flex items-center justify-center gap-1.5 text-sm font-semibold text-success">
                  <Coins className="size-4" aria-hidden="true" />
                  +{lastGain.toLocaleString()} gold mined!
                </p>
              ) : (
                <p className="text-center text-sm text-muted-foreground">
                  Ready to mine. Current yield x
                  {resources.toolEffectMultiplier.toFixed(2)}.
                </p>
              )}
            </div>

            <ActionButton
              fullWidth
              onClick={handleMine}
              loading={mining}
              disabled={mining}
              icon={<Pickaxe className="size-4" aria-hidden="true" />}
            >
              {mining ? 'Mining…' : 'Mine gold'}
            </ActionButton>

            <dl className="grid w-full grid-cols-2 gap-2">
              <div className="rounded-md border border-border bg-background p-2 text-center">
                <dt className="text-xs text-muted-foreground">Total mined</dt>
                <dd className="text-sm font-semibold tabular-nums">
                  {resources.totalMined.toLocaleString()}
                </dd>
              </div>
              <div className="rounded-md border border-border bg-background p-2 text-center">
                <dt className="text-xs text-muted-foreground">Yield multiplier</dt>
                <dd className="text-sm font-semibold tabular-nums">
                  x{resources.toolEffectMultiplier.toFixed(2)}
                </dd>
              </div>
            </dl>
          </div>
        </Panel>

        {/* Tool store */}
        <Panel>
          <PanelHeader
            title="Tool Store"
            description="Permanent upgrades to your mining yield."
          />
          <div className="flex flex-col gap-2.5 p-4">
            {tools.map((tool) => (
              <ToolStoreItem
                key={tool.toolId}
                name={tool.name}
                bonusPercent={tool.bonusPercent}
                cost={tool.cost}
                owned={ownedToolIds.includes(tool.toolId)}
                affordable={resources.gold >= tool.cost}
                loading={buying === tool.toolId}
                onPurchase={() => handleBuy(tool.toolId, tool.cost)}
              />
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}
