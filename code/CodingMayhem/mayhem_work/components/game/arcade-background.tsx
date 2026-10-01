import { cn } from '@/lib/utils'

const TOKENS = [
  { t: 'def', x: 6, delay: 0, dur: 22, color: 'var(--primary)' },
  { t: '{ }', x: 16, delay: 6, dur: 26, color: 'var(--secondary)' },
  { t: '>>>', x: 27, delay: 12, dur: 20, color: 'var(--accent)' },
  { t: 'if', x: 38, delay: 3, dur: 24, color: 'var(--success)' },
  { t: '[ ]', x: 49, delay: 15, dur: 28, color: 'var(--primary)' },
  { t: '==', x: 60, delay: 8, dur: 21, color: 'var(--secondary)' },
  { t: 'for', x: 71, delay: 1, dur: 25, color: 'var(--accent)' },
  { t: '()', x: 82, delay: 10, dur: 23, color: 'var(--success)' },
  { t: '#', x: 92, delay: 17, dur: 27, color: 'var(--primary)' },
  { t: 'print', x: 11, delay: 19, dur: 30, color: 'var(--accent)' },
  { t: ':', x: 55, delay: 22, dur: 19, color: 'var(--secondary)' },
  { t: 'return', x: 86, delay: 4, dur: 32, color: 'var(--primary)' },
]

export function ArcadeBackground({
  intensity = 'full',
  className,
}: {
  intensity?: 'full' | 'calm'
  className?: string
}) {
  return (
    <div aria-hidden="true" className={cn('pointer-events-none fixed inset-0 overflow-hidden', className)}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--primary)_14%,transparent),transparent_60%)]" />
      <div className="absolute -left-40 top-1/4 size-[36rem] rounded-full bg-secondary/10 blur-3xl animate-float" />
      <div
        className="absolute -right-40 top-10 size-[30rem] rounded-full bg-primary/10 blur-3xl animate-float"
        style={{ animationDelay: '-3s' }}
      />

      <div className="absolute inset-x-[-20%] bottom-0 h-[45vh] overflow-hidden">
        <div className="arcade-grid absolute inset-0 top-0" />
      </div>

      {intensity === 'full' &&
        TOKENS.map((token) => (
          <span
            key={token.t + token.x}
            className="font-mono absolute bottom-[-4rem] text-lg font-bold opacity-0 animate-drift"
            style={{
              left: `${token.x}%`,
              color: `color-mix(in oklch, ${token.color} 45%, transparent)`,
              animationDuration: `${token.dur}s`,
              animationDelay: `${token.delay}s`,
            }}
          >
            {token.t}
          </span>
        ))}

      <div className="scanlines absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,color-mix(in_oklch,var(--surface)_70%,transparent))]" />
    </div>
  )
}
