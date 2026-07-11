'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ActionButton } from '@/components/game/action-button'
import { AvatarPicker } from '@/components/game/avatar-picker'
import { InfoCallout } from '@/components/game/info-callout'
import { Panel, PanelHeader } from '@/components/game/panel'
import { TextInput } from '@/components/game/text-input'
import { useGame } from '@/lib/game/game-context'
import { avatars } from '@/lib/game/mock-data'

const NAME_PATTERN = /^[A-Za-z][A-Za-z0-9 '-]*$/

function validateName(name: string): string | null {
  const trimmed = name.trim()
  if (trimmed.length === 0) return null
  if (trimmed.length < 3) return 'Name must be at least 3 characters.'
  if (trimmed.length > 16) return 'Name must be 16 characters or fewer.'
  if (!NAME_PATTERN.test(trimmed))
    return 'Use letters, numbers, spaces, hyphens or apostrophes.'
  return null
}

export default function CharacterCreatePage() {
  const router = useRouter()
  const { setCharacter } = useGame()
  const [name, setName] = useState('')
  const [avatarId, setAvatarId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [touched, setTouched] = useState(false)

  const error = touched ? validateName(name) : null
  const trimmed = name.trim()
  const isValid =
    trimmed.length >= 3 &&
    trimmed.length <= 16 &&
    NAME_PATTERN.test(trimmed) &&
    Boolean(avatarId)

  function handleCreate() {
    if (!isValid || !avatarId) return
    setSubmitting(true)
    setCharacter((c) => ({ ...c, name: trimmed, avatarId }))
    window.setTimeout(() => router.push('/fight'), 700)
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center px-4 py-10">
      <div className="mb-6 text-center">
        <h1 className="font-display text-3xl font-bold tracking-wide text-balance">
          Forge Your Character
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
          Pick an avatar and choose a name before you step through the gateway.
        </p>
      </div>

      <Panel>
        <PanelHeader
          title="New Delver"
          description="Your choices set your appearance and identity."
        />
        <div className="grid gap-6 p-5 md:grid-cols-2">
          <AvatarPicker avatars={avatars} value={avatarId} onChange={setAvatarId} />

          <div className="flex flex-col gap-4">
            <TextInput
              label="Character name"
              value={name}
              maxLength={16}
              placeholder="e.g. Aldric"
              autoComplete="off"
              onBlur={() => setTouched(true)}
              onChange={(e) => {
                setName(e.target.value)
                if (!touched) setTouched(true)
              }}
              error={error ?? undefined}
              hint="3–16 characters. Letters, numbers, spaces, - and '."
            />

            {!avatarId ? (
              <InfoCallout tone="info">
                Select an avatar to continue.
              </InfoCallout>
            ) : null}

            {submitting ? (
              <InfoCallout tone="success">
                Character created. Entering the gateway…
              </InfoCallout>
            ) : null}

            <ActionButton
              fullWidth
              disabled={!isValid}
              loading={submitting}
              onClick={handleCreate}
            >
              Create character
            </ActionButton>
          </div>
        </div>
      </Panel>
    </main>
  )
}
