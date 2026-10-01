'use client'

import { Clock } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { DIFFICULTIES } from '@/lib/game/config'
import type { MicrogameDefinition } from '@/lib/game/types'
import { ControllerGlyph } from '../controller-glyph'
import { DifficultyBadge } from '../difficulty-badge'

interface MicrogameIntroProps {
  microgame: Pick<MicrogameDefinition, 'name' | 'description' | 'objective' | 'controls' | 'timeLimit' | 'difficulty'>
  round: number
  /** Rendered over the card, e.g. the countdown. */
  children?: ReactNode
  dimmed?: boolean
}

export function MicrogameIntro({ microgame, round, children, dimmed }: MicrogameIntroProps) {
  const color = DIFFICULTIES[microgame.difficulty].colorVar

  return (
    <div className="relative flex flex-1 items-center justify-center">
      <article
        className={cn(
          'arcade-panel arcade-glow relative w-full max-w-3xl overflow-hidden rounded-[2rem] p-10 transition-all duration-500 animate-screen-in',
          dimmed && 'scale-95 opacity-40 blur-[2px]',
        )}
        style={{ '--glow-color': color } as CSSProperties}
        aria-hidden={dimmed}
      >
        <div
          className="absolute inset-x-0 top-0 h-2"
          style={{ background: `linear-gradient(90deg, var(--primary), ${color}, var(--secondary))` }}
        />
        <div className="flex items-center justify-between">
          <span className="font-display rounded-full bg-muted px-4 py-1.5 text-xs uppercase text-muted-foreground">
            Microgame {round}
          </span>
          <div className="flex items-center gap-3">
            <DifficultyBadge difficulty={microgame.difficulty} />
            <span className="font-display inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs uppercase text-accent">
              <Clock className="size-3.5" aria-hidden="true" />
              {microgame.timeLimit}s
            </span>
          </div>
        </div>

        <h2
          className="font-display text-glow mt-8 text-center text-6xl uppercase text-accent animate-stamp"
          style={{ '--glow-color': 'var(--accent)' } as CSSProperties}
        >
          {microgame.name}
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-balance text-center text-xl text-foreground">{microgame.description}</p>

        <div className="mt-10 grid grid-cols-2 gap-6">
          <section className="rounded-2xl bg-surface/70 p-5 ring-1 ring-border">
            <h3 className="font-display text-xs uppercase text-primary">Objective</h3>
            <p className="mt-2 text-pretty text-foreground">{microgame.objective}</p>
          </section>
          <section className="rounded-2xl bg-surface/70 p-5 ring-1 ring-border">
            <h3 className="font-display text-xs uppercase text-secondary">How to Play</h3>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
              {microgame.controls.map((control) => (
                <li key={control.input + control.label} className="flex items-center gap-2 text-sm text-foreground">
                  <ControllerGlyph input={control.input} size="sm" />
                  {control.label}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </article>
      {children}
    </div>
  )
}
