'use client'

import { SkillNode } from './skill-node'
import type { SkillNodeData } from '@/lib/game/types'

interface SkillTreeCanvasProps {
  nodes: SkillNodeData[]
  allocatedIds: string[]
  selectedId: string | null
  onSelect: (nodeId: string) => void
}

const COLS = 4
const ROWS = 4
// virtual coordinate space (percentages) for edge drawing
const cellX = (col: number) => ((col + 0.5) / COLS) * 100
const cellY = (row: number) => ((row + 0.5) / ROWS) * 100

export function SkillTreeCanvas({
  nodes,
  allocatedIds,
  selectedId,
  onSelect,
}: SkillTreeCanvasProps) {
  const byId = new Map(nodes.map((n) => [n.nodeId, n]))

  function isConnected(node: SkillNodeData) {
    return (
      node.requires.length === 0 ||
      node.requires.some((r) => allocatedIds.includes(r))
    )
  }

  return (
    <div className="relative w-full" style={{ aspectRatio: '1 / 1', maxWidth: 560 }}>
      {/* Edges */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {nodes.flatMap((node) =>
          node.requires.map((reqId) => {
            const from = byId.get(reqId)
            if (!from) return null
            const active =
              allocatedIds.includes(node.nodeId) && allocatedIds.includes(reqId)
            return (
              <line
                key={`${reqId}-${node.nodeId}`}
                x1={cellX(from.col)}
                y1={cellY(from.row)}
                x2={cellX(node.col)}
                y2={cellY(node.row)}
                stroke={active ? 'var(--primary)' : 'var(--border)'}
                strokeWidth={active ? 1 : 0.6}
                vectorEffect="non-scaling-stroke"
              />
            )
          }),
        )}
      </svg>

      {/* Nodes */}
      <div
        className="absolute inset-0 grid"
        style={{
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
        }}
      >
        {nodes.map((node) => (
          <div
            key={node.nodeId}
            className="flex items-center justify-center"
            style={{
              gridColumn: node.col + 1,
              gridRow: node.row + 1,
            }}
          >
            <SkillNode
              title={node.title}
              type={node.type}
              allocated={allocatedIds.includes(node.nodeId)}
              connected={isConnected(node)}
              selected={selectedId === node.nodeId}
              onSelect={() => onSelect(node.nodeId)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
