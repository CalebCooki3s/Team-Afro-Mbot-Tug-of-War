import { User } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { GameMode } from '@/lib/game/types'
import { RobotSprite } from './robot-sprite'

interface RobotStatusProps {
  mode: GameMode
  /** Solo: distance 0–100. Versus: position -100 (P1) → 100 (P2). */
  value: number
  compact?: boolean
  className?: string
}

function PlayerMarker({
  label,
  color,
  highlighted,
}: {
  label: string
  color: string
  highlighted?: boolean
}) {
  return (
    <div className="flex shrink-0 flex-col items-center gap-1">
      <div
        className={cn(
          'flex size-10 items-center justify-center rounded-xl border-2 transition-all duration-500',
          highlighted && 'scale-110',
        )}
        style={{
          borderColor: color,
          background: `color-mix(in oklch, ${color} 18%, var(--card))`,
          boxShadow: highlighted ? `0 0 24px -2px ${color}` : `0 0 14px -8px ${color}`,
        }}
      >
        <User className="size-5" style={{ color }} aria-hidden="true" />
      </div>
      <span className="font-display text-[10px] uppercase" style={{ color }}>
        {label}
      </span>
    </div>
  )
}

export function RobotStatus({ mode, value, compact, className }: RobotStatusProps) {
  if (mode === 'solo') {
    const distance = Math.max(0, Math.min(100, value))
    const danger = distance <= 30
    const label = danger ? 'DANGER' : distance <= 55 ? 'CLOSING IN' : 'SAFE'
    const statusColor = danger ? 'var(--danger)' : distance <= 55 ? 'var(--accent)' : 'var(--success)'

    return (
      <div
        className={cn('flex items-center gap-4', className)}
        role="meter"
        aria-label="mBot distance"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(distance)}
        aria-valuetext={`${Math.round(distance)}% away, ${label.toLowerCase()}`}
      >
        <PlayerMarker label="You" color="var(--primary)" highlighted={danger} />
        <div className="relative flex-1">
          <div className="relative h-3 overflow-hidden rounded-full bg-surface ring-1 ring-border">
            <div
              className="absolute inset-y-0 left-0 transition-[width] duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
              style={{
                width: `${distance}%`,
                background: `linear-gradient(90deg, var(--danger), var(--accent) 45%, var(--success))`,
                opacity: 0.85,
              }}
            />
            {[25, 50, 75].map((tick) => (
              <span key={tick} className="absolute inset-y-0 w-px bg-background/60" style={{ left: `${tick}%` }} />
            ))}
          </div>
          <div
            className="absolute top-1/2 -translate-x-1/2 -translate-y-[62%] transition-[left] duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            style={{ left: `${distance}%` }}
          >
            <RobotSprite size="sm" mood={danger ? 'angry' : 'normal'} className="animate-bob" />
          </div>
        </div>
        {!compact && (
          <div className="flex w-24 shrink-0 flex-col items-end">
            <span className="font-display text-xl tabular-nums" style={{ color: statusColor }}>
              {Math.round(distance)}%
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: statusColor }}>
              {label}
            </span>
          </div>
        )}
      </div>
    )
  }

  const position = Math.max(-100, Math.min(100, value))
  const percent = (position + 100) / 2
  const leaning = position < 0 ? 1 : position > 0 ? 2 : null

  return (
    <div
      className={cn('flex items-center gap-4', className)}
      role="meter"
      aria-label="mBot position"
      aria-valuemin={-100}
      aria-valuemax={100}
      aria-valuenow={Math.round(position)}
      aria-valuetext={leaning ? `Leaning toward player ${leaning}` : 'Centered'}
    >
      <PlayerMarker label="P1" color="var(--primary)" highlighted={leaning === 1} />
      <div className="relative flex-1">
        <div className="relative h-3 overflow-hidden rounded-full bg-surface ring-1 ring-border">
          <div
            className="absolute inset-y-0 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            style={{
              left: position < 0 ? `${percent}%` : '50%',
              right: position > 0 ? `${100 - percent}%` : '50%',
              background: position < 0 ? 'var(--primary)' : 'var(--secondary)',
              opacity: 0.85,
            }}
          />
          <span className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-foreground/40" />
        </div>
        <div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-[62%] transition-[left] duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          style={{ left: `${percent}%` }}
        >
          <RobotSprite size="sm" className="animate-bob" />
        </div>
      </div>
      <PlayerMarker label="P2" color="var(--secondary)" highlighted={leaning === 2} />
    </div>
  )
}
