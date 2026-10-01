import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { ArcadeButton } from './arcade-button'

export function ScreenHeader({
  step,
  title,
  subtitle,
  onBack,
  right,
}: {
  step?: string
  title: string
  subtitle?: string
  onBack?: () => void
  right?: ReactNode
}) {
  return (
    <header className="flex items-start justify-between gap-6">
      <div className="w-36 shrink-0">
        {onBack && (
          <ArcadeButton tone="neutral" size="sm" onClick={onBack}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back
          </ArcadeButton>
        )}
      </div>
      <div className="flex flex-col items-center text-center">
        {step && (
          <span className="mb-2 rounded-full bg-muted px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            {step}
          </span>
        )}
        <h1 className="font-display text-glow text-4xl uppercase text-primary md:text-5xl">{title}</h1>
        {subtitle && <p className="mt-3 max-w-xl text-pretty text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="flex w-36 shrink-0 justify-end">{right}</div>
    </header>
  )
}
