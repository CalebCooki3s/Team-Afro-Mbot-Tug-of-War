'use client'

import { Pause } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { SessionState } from '@/lib/game/types'
import { DifficultyBadge } from '../difficulty-badge'
import { RobotStatus } from '../robot-status'

function Stat({ label, children, color }: { label: string; children: ReactNode; color?: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <span className="font-display text-2xl tabular-nums leading-tight" style={{ color: color ?? 'var(--foreground)' }}>
        {children}
      </span>
    </div>
  )
}

export function TimerRing({ remainingMs, totalMs }: { remainingMs: number; totalMs: number }) {
  const ratio = totalMs > 0 ? Math.max(0, Math.min(1, remainingMs / totalMs)) : 0
  const seconds = Math.ceil(remainingMs / 1000)
  const urgent = ratio <= 0.3
  const color = urgent ? 'var(--danger)' : ratio <= 0.6 ? 'var(--accent)' : 'var(--success)'
  const r = 26
  const c = 2 * Math.PI * r

  return (
    <div
      className={cn('relative flex size-16 items-center justify-center', urgent && seconds > 0 && 'animate-pulse')}
      role="timer"
      aria-label={`${seconds} seconds remaining`}
    >
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r={r} fill="none" stroke="var(--muted)" strokeWidth="6" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - ratio)}
          style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: 'stroke 300ms' }}
        />
      </svg>
      <span className="font-display text-xl tabular-nums" style={{ color }}>
        {seconds}
      </span>
    </div>
  )
}

interface GameHUDProps {
  session: SessionState
  remainingMs: number
  totalMs: number
  onPause: () => void
}

export function GameHUD({ session, remainingMs, totalMs, onPause }: GameHUDProps) {
  const isSolo = session.mode === 'solo'

  return (
    <header className="arcade-panel flex items-center gap-6 rounded-3xl px-6 py-4">
      <div className="flex items-center gap-8">
        {isSolo ? (
          <>
            <Stat label="Score" color="var(--accent)">
              {session.score}
            </Stat>
            <Stat label="Round">{session.round}</Stat>
          </>
        ) : (
          <>
            <Stat label="Player 1" color="var(--primary)">
              {session.scores[1]}
            </Stat>
            <Stat label="Player 2" color="var(--secondary)">
              {session.scores[2]}
            </Stat>
            <Stat label="Round">{session.round}</Stat>
          </>
        )}
        {isSolo && (
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Difficulty</span>
            <DifficultyBadge difficulty={session.difficulty} />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1 px-4">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          {isSolo ? 'mBot Distance' : 'mBot Position'}
        </span>
        <div className="pt-4">
          <RobotStatus mode={session.mode} value={session.robot} />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Time</span>
          <TimerRing remainingMs={remainingMs} totalMs={totalMs} />
        </div>
        <button
          type="button"
          onClick={onPause}
          aria-label="Pause game"
          className="arcade-btn flex size-14 items-center justify-center rounded-2xl"
          style={{ '--btn-color': 'var(--muted)', '--btn-fg': 'var(--foreground)' } as CSSProperties}
        >
          <Pause className="size-6 fill-current" aria-hidden="true" />
        </button>
      </div>
    </header>
  )
}
