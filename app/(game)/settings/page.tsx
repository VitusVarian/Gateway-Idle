'use client'

import { useState } from 'react'
import { PlayCircle, RotateCcw } from 'lucide-react'
import { PageHeading } from '@/components/game/page-heading'
import { Panel } from '@/components/game/panel'
import { ToggleSwitch } from '@/components/game/settings/toggle-switch'
import { SelectInput } from '@/components/game/settings/select-input'
import { InfoCallout } from '@/components/game/info-callout'
import { useGame } from '@/lib/game/game-context'

export default function SettingsPage() {
  const { settings, updateSettings } = useGame()
  const [replayed, setReplayed] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        eyebrow="System"
        title="Settings"
        description="Tune accessibility, presentation, and onboarding for your session."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Panel title="Accessibility" subtitle="Adjust motion and contrast">
            <div className="divide-y divide-border/60">
              <ToggleSwitch
                label="Reduced motion"
                description="Minimize animations and transitions across the interface."
                checked={settings.reducedMotion}
                onChange={(v) => updateSettings({ reducedMotion: v })}
              />
              <ToggleSwitch
                label="Color-safe palette"
                description="Use higher-contrast status colors for readability."
                checked={settings.colorSafe}
                onChange={(v) => updateSettings({ colorSafe: v })}
              />
            </div>
          </Panel>

          <Panel title="Presentation" subtitle="Text sizing">
            <div className="divide-y divide-border/60">
              <SelectInput
                id="text-scale"
                label="Text scale"
                description="Scale interface text for comfortable reading."
                value={settings.textScale}
                onChange={(v) =>
                  updateSettings({ textScale: v as 'sm' | 'md' | 'lg' })
                }
                options={[
                  { label: 'Small', value: 'sm' },
                  { label: 'Medium', value: 'md' },
                  { label: 'Large', value: 'lg' },
                ]}
              />
            </div>
          </Panel>

          <Panel title="Onboarding" subtitle="First-time guidance">
            <div className="flex flex-col gap-4 py-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-foreground">
                  Replay the intro help
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Show the guided tour and tooltips again on your next visit.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setReplayed(true)
                  window.setTimeout(() => setReplayed(false), 2400)
                }}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/70 focus:outline-none focus:ring-2 focus:ring-ring/40"
              >
                {replayed ? (
                  <RotateCcw className="size-4" />
                ) : (
                  <PlayCircle className="size-4" />
                )}
                {replayed ? 'Help queued' : 'Replay help'}
              </button>
            </div>
          </Panel>
        </div>

        <div className="flex flex-col gap-6">
          <InfoCallout tone="info">
            <span className="font-medium text-foreground">
              Session-only settings.
            </span>{' '}
            These preferences apply to your current session for demonstration and
            are not persisted to a server.
          </InfoCallout>
          <Panel title="Current preferences">
            <dl className="flex flex-col gap-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Reduced motion</dt>
                <dd className="font-medium text-foreground">
                  {settings.reducedMotion ? 'On' : 'Off'}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Color-safe palette</dt>
                <dd className="font-medium text-foreground">
                  {settings.colorSafe ? 'On' : 'Off'}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Text scale</dt>
                <dd className="font-medium capitalize text-foreground">
                  {settings.textScale}
                </dd>
              </div>
            </dl>
          </Panel>
        </div>
      </div>
    </div>
  )
}
