'use client'

import { Gamepad2, Target, Trophy, TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import type { GameMode, MicrogameDefinition } from '@/lib/game/types'
import { ArcadeButton } from '../arcade-button'
import { ControllerGlyph } from '../controller-glyph'
import { OverlayShell } from '../overlay-shell'

function HelpSection({ icon, title, color, children }: { icon: ReactNode; title: string; color: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl bg-surface/70 p-4 ring-1 ring-border">
      <h3 className="font-display flex items-center gap-2 text-xs uppercase" style={{ color }}>
        {icon}
        {title}
      </h3>
      <div className="mt-2 text-sm leading-relaxed text-foreground">{children}</div>
    </section>
  )
}

interface HelpOverlayProps {
  microgame: Pick<MicrogameDefinition, 'objective' | 'controls'>
  mode: GameMode
  onClose: () => void
}

export function HelpOverlay({ microgame, mode, onClose }: HelpOverlayProps) {
  return (
    <OverlayShell title="Help" onEscape={onClose} className="max-w-2xl" accent="var(--accent)">
      <div className="grid grid-cols-2 gap-4">
        <HelpSection icon={<Target className="size-4" aria-hidden="true" />} title="Objective" color="var(--primary)">
          {microgame.objective}
        </HelpSection>
        <HelpSection icon={<Gamepad2 className="size-4" aria-hidden="true" />} title="Controls" color="var(--secondary)">
          <ul className="flex flex-col gap-2">
            {microgame.controls.map((c) => (
              <li key={c.input + c.label} className="flex items-center gap-2">
                <ControllerGlyph input={c.input} size="sm" />
                {c.label}
              </li>
            ))}
          </ul>
        </HelpSection>
        <HelpSection icon={<Trophy className="size-4" aria-hidden="true" />} title="How to Win" color="var(--success)">
          {mode === 'solo'
            ? 'Answer correctly to push the mBot away. Survive as many microgames as you can.'
            : 'Answer correctly first to pull the mBot to your side. Drag it all the way to win.'}
        </HelpSection>
        <HelpSection
          icon={<TriangleAlert className="size-4" aria-hidden="true" />}
          title="If You Get It Wrong"
          color="var(--danger)"
        >
          {mode === 'solo'
            ? 'The mBot moves closer. If it reaches you, the game is over. Running out of time counts as wrong.'
            : 'A wrong answer hands ground to your opponent — the mBot slides toward their side.'}
        </HelpSection>
      </div>
      <div className="mt-8 flex justify-center">
        <ArcadeButton size="lg" tone="accent" onClick={onClose}>
          Back to Game
        </ArcadeButton>
      </div>
    </OverlayShell>
  )
}
