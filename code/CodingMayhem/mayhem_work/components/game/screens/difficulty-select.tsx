'use client'

import { Flame, Skull, Sprout, Zap } from 'lucide-react'
import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils'
import { DIFFICULTIES, DIFFICULTY_ORDER, MODES } from '@/lib/game/config'
import { useGame } from '@/lib/game/game-context'
import type { Difficulty } from '@/lib/game/types'
import { ArcadeButton } from '../arcade-button'
import { DifficultyPips } from '../difficulty-badge'
import { ScreenHeader } from '../screen-header'

const ICONS: Record<Difficulty, typeof Zap> = {
  easy: Sprout,
  medium: Zap,
  hard: Flame,
  extreme: Skull,
}

function DifficultyCard({ difficulty, onSelect }: { difficulty: Difficulty; onSelect: () => void }) {
  const info = DIFFICULTIES[difficulty]
  const Icon = ICONS[difficulty]
  const color = info.colorVar
  const intensity = info.level

  return (
    <article
      className={cn(
        'arcade-panel group relative flex flex-col overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:-translate-y-2',
        intensity >= 3 && 'arcade-glow',
        intensity === 4 && 'hover:animate-shake',
      )}
      style={{ '--glow-color': color } as CSSProperties}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-60 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(ellipse at top, color-mix(in oklch, ${color} ${intensity * 7}%, transparent), transparent 70%)`,
        }}
        aria-hidden="true"
      />
      {intensity === 4 && (
        <div
          className="pointer-events-none absolute inset-0 rounded-3xl ring-2 animate-pulse-glow"
          style={{ '--tw-ring-color': color } as CSSProperties}
          aria-hidden="true"
        />
      )}

      <div className="relative flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Level {info.level}
        </span>
        <DifficultyPips level={info.level} color={color} />
      </div>

      <div
        className="relative mx-auto mt-6 flex size-20 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110"
        style={{
          background: `color-mix(in oklch, ${color} ${10 + intensity * 5}%, var(--card))`,
          color,
          boxShadow: `0 0 ${intensity * 10}px -4px ${color}`,
        }}
      >
        <Icon className="size-10" aria-hidden="true" />
      </div>

      <h2
        className="font-display text-glow relative mt-6 text-center text-3xl uppercase"
        style={{ color, '--glow-color': color } as CSSProperties}
      >
        {info.label}
      </h2>
      <p className="relative mt-4 flex-1 text-pretty text-center text-sm leading-relaxed text-muted-foreground">
        {info.description}
      </p>

      <ArcadeButton size="md" color={color} className="relative mt-6 w-full" onClick={onSelect}>
        Select
      </ArcadeButton>
    </article>
  )
}

export function DifficultySelect() {
  const { state, dispatch } = useGame()
  const modeLabel = state.mode ? MODES[state.mode].title : 'Game'

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-10 py-10">
      <ScreenHeader
        step={`Step 2 of 3 · ${modeLabel}`}
        title="Pick Your Difficulty"
        subtitle="The higher you climb, the deeper the reasoning gets — not just the faster the clock."
        onBack={() => dispatch({ type: 'GO_TO', screen: 'mode' })}
      />
      <div className="mt-12 grid grid-cols-4 gap-6">
        {DIFFICULTY_ORDER.map((d) => (
          <DifficultyCard
            key={d}
            difficulty={d}
            onSelect={() => dispatch({ type: 'SELECT_DIFFICULTY', difficulty: d })}
          />
        ))}
      </div>
    </div>
  )
}
