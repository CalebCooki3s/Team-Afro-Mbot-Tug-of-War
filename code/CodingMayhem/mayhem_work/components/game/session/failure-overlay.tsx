'use client'

import type { CSSProperties } from 'react'
import type { PlayerId } from '@/lib/game/types'
import { RobotSprite } from '../robot-sprite'

interface FailureOverlayProps {
  title?: string
  message?: string
  player?: PlayerId
  explanation?: string
  correctAnswer?: string
}

export function FailureOverlay({
  title = 'Wrong!',
  message = 'mBot moves closer',
  player,
  explanation,
  correctAnswer,
}: FailureOverlayProps) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center overflow-hidden rounded-[2rem]"
      role="status"
      aria-live="assertive"
    >
      <div className="absolute inset-0 bg-danger/20 backdrop-blur-[3px] animate-in fade-in duration-150" />
      <div
        className="absolute inset-0 animate-pulse-glow"
        style={{ boxShadow: 'inset 0 0 120px 20px color-mix(in oklch, var(--danger) 45%, transparent)' }}
        aria-hidden="true"
      />
      <div className="relative flex flex-col items-center">
        {player && (
          <span
            className="font-display mb-3 rounded-full px-4 py-1 text-sm uppercase animate-pop-in"
            style={{ background: player === 2 ? 'var(--secondary)' : 'var(--primary)', color: 'var(--on-color)' }}
          >
            Player {player}
          </span>
        )}
        <span
          className="font-display text-glow text-8xl uppercase text-danger animate-stamp"
          style={
            {
              '--glow-color': 'var(--danger)',
              WebkitTextStroke: '2px color-mix(in oklch, var(--surface) 50%, transparent)',
            } as CSSProperties
          }
        >
          {title}
        </span>
        <div
          className="mt-6 flex items-center gap-4 rounded-2xl bg-danger px-6 py-3 animate-pop-in"
          style={{ animationDelay: '300ms' }}
        >
          <RobotSprite size="sm" mood="angry" className="animate-shake" />
          <span className="font-display text-2xl uppercase text-on-color">{message}</span>
        </div>

        {(explanation || correctAnswer) && (
          <div
            className="mt-4 max-w-2xl rounded-2xl border border-border/70 bg-card/95 px-6 py-4 text-center shadow-xl animate-pop-in"
            style={{ animationDelay: '500ms' }}
          >
            {correctAnswer && (
              <p className="font-display text-sm uppercase tracking-[0.16em] text-accent">
                Correct answer: <span className="text-foreground">{correctAnswer}</span>
              </p>
            )}
            {explanation && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{explanation}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
