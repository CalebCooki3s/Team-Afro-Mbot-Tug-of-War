'use client'

import { useEffect, useId, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface OverlayShellProps {
  title: string
  subtitle?: ReactNode
  children: ReactNode
  onEscape?: () => void
  accent?: string
  className?: string
}

/** Modal dialog frame used by pause, help, confirmations, and settings. */
export function OverlayShell({ title, subtitle, children, onEscape, accent, className }: OverlayShellProps) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null
    const first = panelRef.current?.querySelector<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])')
    first?.focus()
    return () => previouslyFocused?.focus?.()
  }, [])

  useEffect(() => {
    if (!onEscape) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onEscape()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onEscape])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-surface/75 backdrop-blur-md animate-in fade-in duration-200" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'arcade-panel arcade-glow relative w-full max-w-lg rounded-3xl p-8 animate-pop-in',
          className,
        )}
        style={{ '--glow-color': accent ?? 'var(--primary)' } as React.CSSProperties}
      >
        <h2
          id={titleId}
          className="font-display text-glow text-center text-4xl uppercase"
          style={{ color: accent ?? 'var(--primary)', '--glow-color': accent ?? 'var(--primary)' } as React.CSSProperties}
        >
          {title}
        </h2>
        {subtitle && <div className="mt-3 text-center text-sm text-muted-foreground">{subtitle}</div>}
        <div className="mt-8">{children}</div>
      </div>
    </div>
  )
}
