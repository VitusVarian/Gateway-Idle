import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Cinzel, Source_Sans_3 } from 'next/font/google'
import { GameProvider } from '@/lib/game/game-context'
import './globals.css'

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-display-face',
})

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: 'Gateway Incremental — Dark Fantasy Idle RPG',
  description:
    'Fight monsters, mine gold, upgrade your gear at the blacksmith, and shape your destiny through the skill tree in this dark fantasy idle RPG.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0f1115',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${cinzel.variable} ${sourceSans.variable}`}>
      <body className="bg-background font-sans antialiased">
        <GameProvider>{children}</GameProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
