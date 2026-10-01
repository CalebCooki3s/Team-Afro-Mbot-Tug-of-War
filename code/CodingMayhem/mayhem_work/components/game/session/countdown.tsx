'use client'

import type { CSSProperties } from 'react'
import { RULES } from '@/lib/game/config'
import { usePausableTimer } from '@/lib/game/use-pausable-timer'

const STEPS = ['3', '2', '1', 'GO!'] as const
const COLORS = ['var(--primary)', 'var(--secondary)', 'var(--accent)', 'var(--success)']

export function Countdown({ paused, onComplete }: { paused: boolean; onComplete: () => void }) {
  const total = RULES.countdownStepMs * STEPS.length
  const remaining = usePausableTimer(total, paused, onComplete)
  const index = Math.min(STEPS.length - 1, Math.floor((total - remaining) / RULES.countdownStepMs))
  const label = STEPS[index]
  const color = COLORS[index]

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-live="assertive">
      <div
        key={`ring-${index}`}
        className="absolute size-72 rounded-full border-8 animate-ring"
        style={{ borderColor: color }}
        aria-hidden="true"
      />
      <span
        key={index}
        className="font-display text-glow relative animate-countdown text-[11rem] leading-none"
        style={
          {
            color,
            '--glow-color': color,
            WebkitTextStroke: '3px color-mix(in oklch, var(--surface) 60%, transparent)',
          } as CSSProperties
        }
      >
        {label}
      </span>
    </div>
  )
}
