'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { ActionButton } from '@/components/game/action-button'
import { BrandHeader } from '@/components/game/brand-header'
import { InfoCallout } from '@/components/game/info-callout'
import { Panel } from '@/components/game/panel'

type AuthStatus = 'default' | 'loading' | 'error' | 'success'

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.9 3.4 14.7 2.4 12 2.4 6.9 2.4 2.8 6.5 2.8 11.9S6.9 21.6 12 21.6c5.4 0 8.9-3.8 8.9-9.1 0-.6-.06-1.1-.15-1.6H12z"
      />
    </svg>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [status, setStatus] = useState<AuthStatus>('default')

  function handleSignIn() {
    setStatus('loading')
    // Mock OAuth resolution (no backend per spec).
    window.setTimeout(() => {
      setStatus('success')
      window.setTimeout(() => router.push('/character/create'), 600)
    }, 900)
  }

  return (
    <main className="flex min-h-dvh flex-col bg-background px-4 py-10">
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-[480px]">
          <BrandHeader subtitle="A dark fantasy idle RPG. Fight, mine, forge, and grow stronger — one encounter at a time." />

          <Panel className="mt-8 p-6">
            <h2 className="sr-only">Sign in</h2>
            <p className="text-center text-sm leading-relaxed text-muted-foreground">
              Sign in to start a new journey or resume your saved progress.
            </p>

            <div className="mt-5">
              <ActionButton
                tone="muted"
                fullWidth
                loading={status === 'loading'}
                disabled={status === 'success'}
                onClick={handleSignIn}
                icon={<GoogleMark />}
                aria-label="Sign in with Google"
              >
                {status === 'success' ? 'Signed in' : 'Sign in with Google'}
              </ActionButton>
            </div>

            {status === 'error' ? (
              <InfoCallout tone="error" className="mt-4">
                Sign-in failed. Please try again.
              </InfoCallout>
            ) : null}

            {status === 'success' ? (
              <InfoCallout tone="success" className="mt-4">
                Success. Taking you to character creation…
              </InfoCallout>
            ) : null}

            <div className="mt-5 flex items-start gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
              <span className="leading-relaxed">
                We only use your account to save progress. No spam, no ads, no
                pay-to-win.
              </span>
            </div>
          </Panel>
        </div>
      </div>

      <footer className="mx-auto mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
        <a href="#" className="hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
          Terms
        </a>
        <a href="#" className="hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
          Privacy
        </a>
        <a href="#" className="hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
          Support
        </a>
      </footer>
    </main>
  )
}
