'use client'

import type { CSSProperties } from 'react'
import type { PlayerId } from '@/lib/game/types'

const PARTICLES = Array.from({ length: 16 }, (_, i) => {
  const angle = (i / 16) * Math.PI * 2
  const dist = 180 + (i % 3) * 50
  return {
    bx: `${Math.cos(angle) * dist}px`,
    by: `${Math.sin(angle) * dist}px`,
    color: ['var(--success)', 'var(--accent)', 'var(--primary)', 'var(--secondary)'][i % 4],
    size: 10 + (i % 3) * 5,
  }
})

interface SuccessOverlayProps {
  title?: string
  points?: string
  action?: string
  player?: PlayerId
  explanation?: string
}

export function SuccessOverlay({ title = 'Correct!', points = '+1', action = 'Push!', player, explanation }: SuccessOverlayProps) {
  const playerColor = player === 2 ? 'var(--secondary)' : 'var(--primary)'

  return (
    <div
      className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center overflow-hidden rounded-[2rem]"
      role="status"
      aria-live="assertive"
    >
      <div className="absolute inset-0 bg-success/15 backdrop-blur-[3px] animate-in fade-in duration-200" />
      <div className="absolute size-64 rounded-full border-[10px] border-success animate-ring" aria-hidden="true" />
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="absolute rounded-sm animate-burst"
          style={
            {
              width: p.size,
              height: p.size,
              background: p.color,
              boxShadow: `0 0 12px ${p.color}`,
              '--bx': p.bx,
              '--by': p.by,
              animationDelay: `${(i % 4) * 30}ms`,
            } as CSSProperties
          }
        />
      ))}
      <div className="relative flex flex-col items-center">
        {player && (
          <span
            className="font-display mb-3 rounded-full px-4 py-1 text-sm uppercase animate-pop-in"
            style={{ background: playerColor, color: 'var(--on-color)' }}
          >
            Player {player}
          </span>
        )}
        <span
          className="font-display text-glow text-8xl uppercase text-success animate-stamp"
          style={
            {
              '--glow-color': 'var(--success)',
              WebkitTextStroke: '2px color-mix(in oklch, var(--surface) 50%, transparent)',
            } as CSSProperties
          }
        >
          {title}
        </span>
        <span className="font-display mt-2 text-5xl text-accent animate-rise" style={{ animationDelay: '250ms' }}>
          {points}
        </span>
        <span
          className="font-display -mt-4 rounded-2xl bg-success px-6 py-2 text-3xl uppercase text-on-color animate-pop-in"
          style={{ animationDelay: '350ms' }}
        >
          {`${action} →`}
        </span>
        {explanation && (
          <div className="pointer-events-auto mt-5 max-w-xl rounded-2xl bg-card/95 px-5 py-3 text-center text-sm leading-relaxed text-muted-foreground ring-1 ring-border animate-pop-in" style={{ animationDelay: '450ms' }}>
            <span className="font-display mr-2 uppercase tracking-[0.16em] text-accent">Why:</span>{explanation}
          </div>
        )}
      </div>
    </div>
  )
}
