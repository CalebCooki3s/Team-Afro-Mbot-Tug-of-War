import { forwardRef, type ButtonHTMLAttributes, type CSSProperties } from 'react'
import { cn } from '@/lib/utils'

export type ArcadeTone = 'primary' | 'secondary' | 'accent' | 'success' | 'danger' | 'neutral'

const TONES: Record<ArcadeTone, { color: string; fg: string }> = {
  primary: { color: 'var(--primary)', fg: 'var(--primary-foreground)' },
  secondary: { color: 'var(--secondary)', fg: 'var(--secondary-foreground)' },
  accent: { color: 'var(--accent)', fg: 'var(--accent-foreground)' },
  success: { color: 'var(--success)', fg: 'var(--on-color)' },
  danger: { color: 'var(--danger)', fg: 'var(--on-color)' },
  neutral: { color: 'var(--muted)', fg: 'var(--foreground)' },
}

const SIZES = {
  sm: 'h-10 px-4 text-xs rounded-xl gap-2',
  md: 'h-12 px-6 text-sm rounded-xl gap-2.5',
  lg: 'h-16 px-8 text-base rounded-2xl gap-3',
  xl: 'h-20 px-10 text-xl rounded-2xl gap-4',
} as const

export interface ArcadeButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: ArcadeTone
  size?: keyof typeof SIZES
  /** Override with any CSS color, e.g. a difficulty color variable. */
  color?: string
}

export const ArcadeButton = forwardRef<HTMLButtonElement, ArcadeButtonProps>(function ArcadeButton(
  { tone = 'primary', size = 'md', color, className, style, type = 'button', ...props },
  ref,
) {
  const t = TONES[tone]
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'arcade-btn font-display inline-flex select-none items-center justify-center uppercase tracking-wide',
        SIZES[size],
        className,
      )}
      style={
        {
          '--btn-color': color ?? t.color,
          '--btn-fg': color ? 'var(--on-color)' : t.fg,
          ...style,
        } as CSSProperties
      }
      {...props}
    />
  )
})
