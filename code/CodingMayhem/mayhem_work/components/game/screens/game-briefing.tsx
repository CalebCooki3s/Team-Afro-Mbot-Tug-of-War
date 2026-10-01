'use client'

import { ChevronRight, Code2, HelpCircle, Target, Zap } from 'lucide-react'
import type { CSSProperties } from 'react'
import { DIFFICULTIES, MODES } from '@/lib/game/config'
import { useGame } from '@/lib/game/game-context'
import { ArcadeButton } from '../arcade-button'
import { DifficultyBadge } from '../difficulty-badge'
import { ScreenHeader } from '../screen-header'

const STEP_ICONS = [Code2, Target, Zap]
const STEP_COLORS = ['var(--primary)', 'var(--success)', 'var(--accent)']

export function GameBriefing() {
  const { state, dispatch } = useGame()
  const mode = state.mode ?? 'solo'
  const difficulty = state.difficulty ?? 'easy'
  const modeInfo = MODES[mode]
  const diffInfo = DIFFICULTIES[difficulty]

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-10 py-10">
      <ScreenHeader
        step="Step 3 of 3 · Briefing"
        title="Get Ready!"
        onBack={() => dispatch({ type: 'GO_TO', screen: 'difficulty' })}
      />

      <div className="mt-6 flex items-center justify-center gap-3">
        <span className="font-display rounded-full border border-border bg-card px-3 py-1 text-xs uppercase text-foreground">
          {modeInfo.title}
        </span>
        <DifficultyBadge difficulty={difficulty} />
      </div>

      <p className="mx-auto mt-8 max-w-2xl text-balance text-center text-xl leading-relaxed text-foreground">
        {"You're about to face a series of rapid programming challenges."}
      </p>
      <p
        className="mx-auto mt-3 max-w-2xl text-balance text-center text-base leading-relaxed"
        style={{ color: diffInfo.colorVar }}
      >
        {diffInfo.briefing}
      </p>

      <ol className="mt-12 flex items-stretch justify-center gap-4" aria-label="How a round works">
        {modeInfo.briefingFlow.map((label, i) => {
          const Icon = STEP_ICONS[i]
          const color = STEP_COLORS[i]
          return (
            <li key={label} className="flex items-center gap-4">
              <div
                className="arcade-panel arcade-glow flex w-52 flex-col items-center rounded-3xl p-6 text-center animate-pop-in"
                style={{ '--glow-color': color, animationDelay: `${i * 150}ms` } as CSSProperties}
              >
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  Step {i + 1}
                </span>
                <div
                  className="mt-3 flex size-14 items-center justify-center rounded-2xl"
                  style={{ background: `color-mix(in oklch, ${color} 16%, var(--card))`, color }}
                >
                  <Icon className="size-7" aria-hidden="true" />
                </div>
                <span className="font-display mt-4 text-lg uppercase leading-tight" style={{ color }}>
                  {label}
                </span>
              </div>
              {i < 2 && <ChevronRight className="size-8 text-muted-foreground" aria-hidden="true" />}
            </li>
          )
        })}
      </ol>

      <div className="mt-14 flex flex-col items-center gap-5">
        <ArcadeButton
          size="xl"
          tone="accent"
          className="min-w-72 animate-pulse-glow hover:animate-none"
          onClick={() => dispatch({ type: 'GO_TO', screen: 'ready' })}
          autoFocus
        >
          Ready
        </ArcadeButton>
        <button
          type="button"
          onClick={() => dispatch({ type: 'OPEN_HOW_TO', origin: 'briefing' })}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
        >
          <HelpCircle className="size-4" aria-hidden="true" />
          Review controls
        </button>
      </div>
    </div>
  )
}
