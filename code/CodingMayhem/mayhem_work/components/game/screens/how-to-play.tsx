'use client'

import { Check, Play, Timer, X } from 'lucide-react'
import { useGame } from '@/lib/game/game-context'
import type { ControlInput } from '@/lib/game/types'
import { ArcadeButton } from '../arcade-button'
import { ControllerGlyph } from '../controller-glyph'
import { RobotSprite } from '../robot-sprite'
import { ScreenHeader } from '../screen-header'

const FACE_CONTROLS: { input: ControlInput; label: string }[] = [
  { input: 'cross', label: 'Choice 1' },
  { input: 'circle', label: 'Choice 2' },
  { input: 'square', label: 'Choice 3' },
  { input: 'triangle', label: 'Choice 4' },
]

const EXTRA_CONTROLS: { input: ControlInput; label: string }[] = [
  { input: 'dpad', label: 'D-pad — move, select lines' },
  { input: 'lstick', label: 'Left stick — steer, dodge, catch' },
  { input: 'options', label: 'Options — pause the game' },
]

export function HowToPlay() {
  const { state, dispatch } = useGame()
  const fromBriefing = state.howToOrigin === 'briefing'

  const back = () => dispatch({ type: 'GO_TO', screen: fromBriefing ? 'briefing' : 'menu' })
  const start = () => dispatch(fromBriefing ? { type: 'START_SESSION' } : { type: 'GO_TO', screen: 'mode' })

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-10 py-10">
      <ScreenHeader
        title="How to Play"
        subtitle="Complete rapid programming microgames before time runs out."
        onBack={back}
      />

      <div className="mt-10 grid grid-cols-3 gap-6">
        <section className="arcade-panel flex flex-col items-center rounded-3xl p-6 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-accent/15 text-accent">
            <Timer className="size-7" aria-hidden="true" />
          </div>
          <h2 className="font-display mt-4 text-xl uppercase text-accent">Beat the Clock</h2>
          <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">
            Every microgame has a short objective and may use different controls. Read fast, act faster.
          </p>
        </section>

        <section
          className="arcade-panel arcade-glow flex flex-col items-center rounded-3xl p-6 text-center"
          style={{ '--glow-color': 'var(--success)' } as React.CSSProperties}
        >
          <div className="flex size-14 items-center justify-center rounded-2xl bg-success/15 text-success">
            <Check className="size-8" strokeWidth={3} aria-hidden="true" />
          </div>
          <h2 className="font-display mt-4 text-xl uppercase text-success">Correct</h2>
          <div className="mt-4 flex items-center gap-3 font-display text-sm uppercase text-foreground">
            Push the mBot
            <span className="flex items-center gap-1 text-success" aria-hidden="true">
              {'→→'}
              <RobotSprite size="sm" />
            </span>
          </div>
        </section>

        <section
          className="arcade-panel arcade-glow flex flex-col items-center rounded-3xl p-6 text-center"
          style={{ '--glow-color': 'var(--danger)' } as React.CSSProperties}
        >
          <div className="flex size-14 items-center justify-center rounded-2xl bg-danger/15 text-danger">
            <X className="size-8" strokeWidth={3} aria-hidden="true" />
          </div>
          <h2 className="font-display mt-4 text-xl uppercase text-danger">Wrong</h2>
          <div className="mt-4 flex items-center gap-3 font-display text-sm uppercase text-foreground">
            <span className="flex items-center gap-1 text-danger" aria-hidden="true">
              <RobotSprite size="sm" mood="angry" />
              {'←←'}
            </span>
            mBot moves closer
          </div>
        </section>
      </div>

      <section className="arcade-panel mt-6 grid grid-cols-[1.3fr_1fr] gap-10 rounded-3xl p-8">
        <div>
          <h2 className="font-display text-xl uppercase text-primary">Controller</h2>
          <ul className="mt-6 grid grid-cols-2 gap-4">
            {FACE_CONTROLS.map((c) => (
              <li key={c.input} className="flex items-center gap-4 rounded-2xl bg-surface/70 p-4 ring-1 ring-border">
                <ControllerGlyph input={c.input} size="lg" />
                <span className="font-display text-lg uppercase text-foreground">{c.label}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-display text-xl uppercase text-secondary">Some games also use</h2>
          <ul className="mt-6 flex flex-col gap-3">
            {EXTRA_CONTROLS.map((c) => (
              <li key={c.input} className="flex items-center gap-4 text-sm text-foreground">
                <ControllerGlyph input={c.input} size="md" />
                {c.label}
              </li>
            ))}
          </ul>
          <p className="mt-6 rounded-xl bg-muted/60 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
            No controller yet? Use keys <kbd className="font-bold text-foreground">1–4</kbd> for Player 1,{' '}
            <kbd className="font-bold text-foreground">7–0</kbd> for Player 2, and{' '}
            <kbd className="font-bold text-foreground">Esc</kbd> to pause.
          </p>
        </div>
      </section>

      <div className="mt-8 flex justify-center gap-5">
        <ArcadeButton size="lg" tone="neutral" onClick={back}>
          Back
        </ArcadeButton>
        <ArcadeButton size="lg" tone="accent" onClick={start}>
          <Play className="size-5 fill-current" aria-hidden="true" />
          Start Game
        </ArcadeButton>
      </div>
    </div>
  )
}
