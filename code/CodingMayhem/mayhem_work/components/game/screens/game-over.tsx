'use client'

import { Crown, Home, RotateCcw } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'
import { useGame } from '@/lib/game/game-context'
import { ArcadeButton } from '../arcade-button'
import { DifficultyBadge } from '../difficulty-badge'
import { RobotSprite } from '../robot-sprite'

function StatCard({ label, children, color, delay }: { label: string; children: ReactNode; color: string; delay: number }) {
  return (
    <div
      className="arcade-panel flex flex-col items-center rounded-3xl px-8 py-6 animate-pop-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <span className="font-display mt-2 text-5xl tabular-nums" style={{ color }}>
        {children}
      </span>
    </div>
  )
}

export function GameOverScreen() {
  const { state, dispatch } = useGame()
  const session = state.session
  if (!session) return null

  const isSolo = session.mode === 'solo'
  const winner = session.winner
  const winnerColor = winner === 2 ? 'var(--secondary)' : 'var(--primary)'
  const headlineColor = isSolo ? 'var(--danger)' : winnerColor

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-10 py-10 text-center">
      <div className="relative mb-6">
        {isSolo ? (
          <RobotSprite size="lg" mood="angry" className="animate-shake" />
        ) : (
          <div className="flex items-end gap-4">
            <Crown className="size-16 animate-bob" style={{ color: 'var(--accent)', fill: 'var(--accent)' }} aria-hidden="true" />
          </div>
        )}
      </div>

      <h1
        className="font-display text-glow text-8xl uppercase animate-stamp"
        style={{ color: headlineColor, '--glow-color': headlineColor } as CSSProperties}
      >
        {isSolo ? 'Game Over' : `Player ${winner ?? 1} Wins`}
      </h1>
      <p className="font-display mt-6 text-2xl uppercase text-foreground">
        {isSolo ? 'The mBot got you!' : 'The mBot has been pulled across the line!'}
      </p>

      <div className="mt-12 flex items-stretch justify-center gap-6">
        {isSolo ? (
          <>
            <StatCard label="Final Score" color="var(--accent)" delay={150}>
              {session.score}
            </StatCard>
            <StatCard label="Microgames" color="var(--primary)" delay={250}>
              {session.roundsPlayed}
            </StatCard>
            <StatCard label="Best Streak" color="var(--success)" delay={350}>
              {session.bestStreak}
            </StatCard>
          </>
        ) : (
          <>
            <StatCard label="Player 1" color="var(--primary)" delay={150}>
              {session.scores[1]}
            </StatCard>
            <StatCard label="Player 2" color="var(--secondary)" delay={250}>
              {session.scores[2]}
            </StatCard>
            <StatCard label="Rounds" color="var(--accent)" delay={350}>
              {session.roundsPlayed}
            </StatCard>
          </>
        )}
      </div>

      <div className="mt-6">
        <DifficultyBadge difficulty={session.difficulty} />
      </div>

      <div className="mt-12 flex gap-5">
        <ArcadeButton size="xl" tone="accent" onClick={() => dispatch({ type: 'START_SESSION' })} autoFocus>
          <RotateCcw className="size-6" aria-hidden="true" />
          Play Again
        </ArcadeButton>
        <ArcadeButton size="xl" tone="neutral" onClick={() => dispatch({ type: 'QUIT_TO_MENU' })}>
          <Home className="size-6" aria-hidden="true" />
          Main Menu
        </ArcadeButton>
      </div>
    </div>
  )
}
