import { Gamepad2, Move, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ControlInput } from '@/lib/game/types'

type FaceShape = 'cross' | 'circle' | 'square' | 'triangle'

const FACE: Partial<Record<ControlInput, { shape: FaceShape; color: string; name: string }>> = {
  cross: { shape: 'cross', color: 'var(--ps-cross)', name: 'Cross' },
  circle: { shape: 'circle', color: 'var(--ps-circle)', name: 'Circle' },
  square: { shape: 'square', color: 'var(--ps-square)', name: 'Square' },
  triangle: { shape: 'triangle', color: 'var(--ps-triangle)', name: 'Triangle' },
}

function FaceShapeIcon({ shape }: { shape: FaceShape }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-[52%]"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {shape === 'cross' && <path d="M5 5 L19 19 M19 5 L5 19" />}
      {shape === 'circle' && <circle cx="12" cy="12" r="8" />}
      {shape === 'square' && <rect x="4.5" y="4.5" width="15" height="15" rx="1.5" />}
      {shape === 'triangle' && <path d="M12 4 L20.5 19 L3.5 19 Z" />}
    </svg>
  )
}

const NAMES: Record<ControlInput, string> = {
  cross: 'Cross',
  circle: 'Circle',
  square: 'Square',
  triangle: 'Triangle',
  dpad: 'D-pad',
  lstick: 'Left stick',
  rstick: 'Right stick',
  l1: 'L1',
  r1: 'R1',
  options: 'Options',
}

export function controlName(input: ControlInput) {
  return NAMES[input]
}

const SIZE = {
  sm: 'size-7 text-sm',
  md: 'size-10 text-lg',
  lg: 'size-14 text-2xl',
  xl: 'size-20 text-4xl',
}

export function ControllerGlyph({
  input,
  size = 'md',
  className,
}: {
  input: ControlInput
  size?: keyof typeof SIZE
  className?: string
}) {
  const face = FACE[input]
  const base = cn(
    'inline-flex shrink-0 items-center justify-center rounded-full border-2 font-bold leading-none',
    SIZE[size],
    className,
  )

  if (face) {
    return (
      <span
        role="img"
        aria-label={face.name}
        className={base}
        style={{
          color: face.color,
          borderColor: `color-mix(in oklch, ${face.color} 70%, transparent)`,
          background: `color-mix(in oklch, ${face.color} 14%, var(--card))`,
          boxShadow: `0 0 16px -6px ${face.color}`,
        }}
      >
        <FaceShapeIcon shape={face.shape} />
      </span>
    )
  }

  const Icon = input === 'dpad' ? Gamepad2 : input === 'options' ? Menu : Move
  const text = input === 'l1' ? 'L1' : input === 'r1' ? 'R1' : null

  return (
    <span
      role="img"
      aria-label={NAMES[input]}
      className={cn(base, 'rounded-xl border-border bg-muted text-foreground')}
    >
      {text ? (
        <span className="font-display text-[0.6em]" aria-hidden="true">
          {text}
        </span>
      ) : (
        <Icon className="size-[55%]" aria-hidden="true" />
      )}
    </span>
  )
}
