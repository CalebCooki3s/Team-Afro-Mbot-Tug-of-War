import { cn } from '@/lib/utils'

const SIZE = {
  sm: { box: 'w-10 h-9', eye: 'size-1.5', gap: 'gap-2', wheel: 'size-2.5' },
  md: { box: 'w-14 h-12', eye: 'size-2', gap: 'gap-3', wheel: 'size-3.5' },
  lg: { box: 'w-24 h-20', eye: 'size-3.5', gap: 'gap-5', wheel: 'size-6' },
}

/** An original, generic little robot built from simple shapes. */
export function RobotSprite({
  size = 'md',
  mood = 'normal',
  className,
}: {
  size?: keyof typeof SIZE
  mood?: 'normal' | 'angry' | 'dizzy'
  className?: string
}) {
  const s = SIZE[size]
  const eyeColor = mood === 'angry' ? 'var(--danger)' : 'var(--accent)'

  return (
    <div className={cn('relative flex flex-col items-center', className)} aria-hidden="true">
      <div className="h-2 w-0.5 bg-muted-foreground" />
      <div
        className="absolute -top-1 size-2 rounded-full animate-pulse-glow"
        style={{ background: eyeColor, boxShadow: `0 0 10px ${eyeColor}` }}
      />
      <div
        className={cn(
          'relative flex items-center justify-center rounded-xl border-2 border-foreground/20',
          s.box,
          s.gap,
        )}
        style={{
          background: 'linear-gradient(160deg, var(--primary), color-mix(in oklch, var(--primary) 55%, var(--surface)))',
          boxShadow: '0 0 24px -6px var(--primary)',
        }}
      >
        {[0, 1].map((i) => (
          <span
            key={i}
            className={cn('rounded-full', s.eye, mood === 'angry' && (i === 0 ? 'rotate-12' : '-rotate-12'))}
            style={{
              background: eyeColor,
              boxShadow: `0 0 8px ${eyeColor}`,
              borderRadius: mood === 'angry' ? '2px' : undefined,
            }}
          />
        ))}
      </div>
      <div className="-mt-1 flex w-full justify-between px-0.5">
        <span className={cn('rounded-full border-2 border-foreground/30 bg-surface', s.wheel)} />
        <span className={cn('rounded-full border-2 border-foreground/30 bg-surface', s.wheel)} />
      </div>
    </div>
  )
}
