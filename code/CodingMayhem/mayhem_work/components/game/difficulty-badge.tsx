import { Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DIFFICULTIES } from '@/lib/game/config'
import type { Difficulty } from '@/lib/game/types'

export function DifficultyPips({ level, color, className }: { level: number; color: string; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)} aria-hidden="true">
      {[1, 2, 3, 4].map((i) => (
        <Zap
          key={i}
          className="size-3.5"
          style={{
            color: i <= level ? color : 'var(--border)',
            fill: i <= level ? color : 'transparent',
          }}
        />
      ))}
    </span>
  )
}

export function DifficultyBadge({ difficulty, className }: { difficulty: Difficulty; className?: string }) {
  const info = DIFFICULTIES[difficulty]
  return (
    <span
      className={cn(
        'font-display inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs uppercase',
        className,
      )}
      style={{
        color: info.colorVar,
        borderColor: `color-mix(in oklch, ${info.colorVar} 55%, transparent)`,
        background: `color-mix(in oklch, ${info.colorVar} 12%, transparent)`,
      }}
    >
      <DifficultyPips level={info.level} color={info.colorVar} />
      {info.label}
    </span>
  )
}
