'use client'

import { Target } from 'lucide-react'
import type { ReactNode } from 'react'
import type { MicrogameDefinition, SessionState } from '@/lib/game/types'
import { ControllerGlyph } from '../controller-glyph'
import { GameHUD } from './game-hud'

interface MicrogameScreenProps {
  session: SessionState
  microgame: MicrogameDefinition
  remainingMs: number
  onPause: () => void
  /** The microgame renderer plugs in here. */
  children: ReactNode
}

export function MicrogameScreen({ session, microgame, remainingMs, onPause, children }: MicrogameScreenProps) {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <GameHUD
        session={session}
        remainingMs={remainingMs}
        totalMs={microgame.timeLimit * 1000}
        onPause={onPause}
      />

      <section
        aria-label={`Microgame: ${microgame.name}`}
        className="arcade-panel stage-dots relative flex min-h-[28rem] flex-1 flex-col overflow-hidden rounded-[2rem]"
      >
        <div className="flex items-center justify-between border-b border-border/70 px-6 py-3">
          <h2 className="font-display text-lg uppercase text-accent">{microgame.name}</h2>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            {microgame.mechanic}
          </span>
        </div>
        <div className="relative flex flex-1 flex-col">{children}</div>
      </section>

      <footer className="arcade-panel flex items-center justify-between gap-6 rounded-3xl px-6 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <Target className="size-5 shrink-0 text-primary" aria-hidden="true" />
          <p className="truncate text-sm text-foreground">
            <span className="font-display mr-2 text-xs uppercase text-primary">Objective</span>
            {microgame.objective}
          </p>
        </div>
        <ul className="flex shrink-0 items-center gap-4" aria-label="Controls">
          {microgame.controls.map((control) => (
            <li key={control.input + control.label} className="flex items-center gap-2 text-xs text-muted-foreground">
              <ControllerGlyph input={control.input} size="sm" />
              {control.label}
            </li>
          ))}
        </ul>
      </footer>
    </div>
  )
}
