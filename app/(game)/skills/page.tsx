'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { PageHeading } from '@/components/game/page-heading'
import { Panel, PanelHeader } from '@/components/game/panel'
import { SkillDetailPanel } from '@/components/game/skills/skill-detail-panel'
import { SkillTreeCanvas } from '@/components/game/skills/skill-tree-canvas'
import { useGame } from '@/lib/game/game-context'
import { skillNodes } from '@/lib/game/mock-data'

export default function SkillsPage() {
  const { character, skillTree, allocateSkill } = useGame()
  const [selectedId, setSelectedId] = useState<string | null>('start_01')
  const [loading, setLoading] = useState(false)

  const selectedNode =
    skillNodes.find((n) => n.nodeId === selectedId) ?? null
  const allocated = selectedNode
    ? skillTree.allocatedNodeIds.includes(selectedNode.nodeId)
    : false
  const connected = selectedNode
    ? selectedNode.requires.length === 0 ||
      selectedNode.requires.some((r) => skillTree.allocatedNodeIds.includes(r))
    : false

  function handleAllocate() {
    if (!selectedNode) return
    setLoading(true)
    window.setTimeout(() => {
      allocateSkill(selectedNode.nodeId)
      setLoading(false)
    }, 450)
  }

  return (
    <div>
      <PageHeading
        title="Skill Tree"
        description="Spend skill points on connected nodes to strengthen your delver."
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel>
          <PanelHeader
            title="Passive Tree"
            action={
              <span className="flex items-center gap-1.5 rounded-md border border-secondary/40 bg-secondary/10 px-2 py-1 text-sm font-semibold text-secondary">
                <Sparkles className="size-4" aria-hidden="true" />
                {character.skillPoints} point
                {character.skillPoints === 1 ? '' : 's'}
              </span>
            }
          />
          <div className="flex justify-center p-6">
            <SkillTreeCanvas
              nodes={skillNodes}
              allocatedIds={skillTree.allocatedNodeIds}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Node Details" />
          <div className="p-4">
            <SkillDetailPanel
              node={selectedNode}
              allocated={allocated}
              connected={connected}
              availablePoints={character.skillPoints}
              onAllocate={handleAllocate}
              loading={loading}
            />
          </div>
        </Panel>
      </div>
    </div>
  )
}
