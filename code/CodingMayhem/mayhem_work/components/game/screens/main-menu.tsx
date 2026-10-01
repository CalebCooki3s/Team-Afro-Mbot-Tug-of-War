'use client'

import { useEffect, useState } from 'react'
import { BookOpen, FlaskConical, Play, Settings } from 'lucide-react'
import { useGame } from '@/lib/game/game-context'
import { useGameInput } from '@/lib/game/input'
import { ArcadeButton } from '../arcade-button'
import { RobotSprite } from '../robot-sprite'


const SNIPPETS = [
  { code: 'def mayhem():', className: 'left-[8%] top-[22%] -rotate-6', color: 'var(--primary)' },
  { code: 'while alive:', className: 'right-[9%] top-[30%] rotate-3', color: 'var(--secondary)' },
  { code: 'score += 1', className: 'left-[12%] bottom-[26%] rotate-3', color: 'var(--success)' },
  { code: 'print("GO!")', className: 'right-[12%] bottom-[22%] -rotate-3', color: 'var(--accent)' },
]

export function MainMenu() {
  const { dispatch } = useGame()
  const [selected, setSelected] = useState(0)

  const menuItems = [
    {
      label: 'Play',
      action: () => dispatch({ type: 'GO_TO', screen: 'mode' }),
    },
    {
      label: 'How to Play',
      action: () => dispatch({ type: 'OPEN_HOW_TO', origin: 'menu' }),
    },
    ...(process.env.NODE_ENV === 'development'
      ? [
          {
            label: 'Dev Lab',
            action: () => dispatch({ type: 'GO_TO', screen: 'dev' }),
          },
        ]
      : []),
  ]

  useEffect(() => {
    if (selected >= menuItems.length) {
      setSelected(0)
    }
  }, [selected, menuItems.length])

  useGameInput((event) => {
    if (event.player !== 1) return

    if (event.input === 'up') {
      setSelected((current) =>
        current > 0 ? current - 1 : menuItems.length - 1,
      )
    }

    if (event.input === 'down') {
      setSelected((current) =>
        current < menuItems.length - 1 ? current + 1 : 0,
      )
    }

    if (event.input === 'cross') {
      menuItems[selected]?.action()
    }
  })

  return (
    <div className="relative flex min-h-screen flex-col px-10 py-8">
      <header className="flex items-center justify-between">
        <span className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Insert Code to Continue
        </span>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => dispatch({ type: 'OPEN_OVERLAY', overlay: 'settings' })}
            className="arcade-panel flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Settings"
          >
            <Settings className="size-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden lg:block"
      >
        {SNIPPETS.map((s, i) => (
          <div
            key={s.code}
            className={`arcade-panel absolute rounded-xl px-4 py-2 font-mono text-sm animate-float ${s.className}`}
            style={{
              color: s.color,
              animationDelay: `${-i * 1.4}s`,
            }}
          >
            {s.code}
          </div>
        ))}
      </div>

      <main className="relative flex flex-1 flex-col items-center justify-center gap-12">
        <div className="flex flex-col items-center text-center">
          <RobotSprite size="lg" className="mb-6 animate-bob" />

          <h1 className="flex flex-col items-center leading-none">
            <span
              className="font-display text-glow text-6xl uppercase text-primary md:text-7xl"
              style={{ '--glow-color': 'var(--primary)' } as React.CSSProperties}
            >
              Python
            </span>

            <span
              className="font-display mt-2 text-7xl uppercase text-accent md:text-8xl"
              style={{
                textShadow:
                  '4px 4px 0 var(--secondary), 8px 8px 0 color-mix(in oklch, var(--secondary) 40%, transparent)',
              }}
            >
              Micro Mayhem
            </span>
          </h1>

          <p className="mt-8 rounded-full border border-border bg-card/60 px-5 py-2 font-mono text-lg text-foreground backdrop-blur">
            <span className="text-secondary">{'>>>'}</span> Think fast. Code faster.
            <span
              className="ml-1 inline-block h-5 w-2.5 translate-y-0.5 bg-primary animate-pulse"
              aria-hidden="true"
            />
          </p>
        </div>

        <nav
          aria-label="Main menu"
          className="flex w-full max-w-md flex-col gap-5"
        >
          <ArcadeButton
            size="xl"
            tone="accent"
            onClick={menuItems[0].action}
           className="hover:scale-[1.03]"
          >
            <Play className="size-6 fill-current" aria-hidden="true" />
            Play
          </ArcadeButton>

          <ArcadeButton
            size="lg"
            tone="neutral"
            onClick={menuItems[1].action}
            className="hover:scale-[1.03]"
          >
            <BookOpen className="size-5" aria-hidden="true" />
            How to Play
          </ArcadeButton>

          {process.env.NODE_ENV === 'development' && (
            <ArcadeButton
              size="lg"
              tone="neutral"
              onClick={menuItems[2].action}
              className={
                selected === 2
                  ? 'ring-4 ring-primary ring-offset-4 ring-offset-background scale-[1.03]'
                  : ''
              }
            >
              <FlaskConical className="size-5" aria-hidden="true" />
              Dev Lab
            </ArcadeButton>
          )}
        </nav>
      </main>

      <footer className="relative flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
        <span>v0.1 · Visual Foundation Build</span>

        <span className="flex items-center gap-2">
          <span
            className="size-2 rounded-full bg-accent animate-pulse-glow"
            aria-hidden="true"
          />
          mBot: Demo Mode
        </span>
      </footer>
    </div>
  )
}