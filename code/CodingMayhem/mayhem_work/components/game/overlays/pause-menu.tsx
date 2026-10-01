'use client'

import { HelpCircle, LogOut, Play, RotateCcw } from 'lucide-react'
import { ArcadeButton } from '../arcade-button'
import { OverlayShell } from '../overlay-shell'
import { ThemeToggle } from '../theme-toggle'

interface PauseMenuProps {
  selectedIndex: number
  onResume: () => void
  onRestart: () => void
  onHelp: () => void
  onQuit: () => void
}

export function PauseMenu({
  selectedIndex,
  onResume,
  onRestart,
  onHelp,
  onQuit,
}: PauseMenuProps) {
  return (
    <OverlayShell
      title="Paused"
      subtitle="The clock is frozen. Take a breath."
      onEscape={onResume}
    >
      <div className="flex flex-col gap-4">
        <ArcadeButton
          size="lg"
          tone="success"
          onClick={onResume}
          className={selectedIndex === 0 ? 'scale-105 ring-2 ring-yellow-300' : ''}
        >
          <Play className="size-5 fill-current" aria-hidden="true" />
          Resume
        </ArcadeButton>

        <ArcadeButton
          size="lg"
          tone="primary"
          onClick={onRestart}
          className={selectedIndex === 1 ? 'scale-105 ring-2 ring-yellow-300' : ''}
        >
          <RotateCcw className="size-5" aria-hidden="true" />
          Restart
        </ArcadeButton>

        <ArcadeButton
          size="lg"
          tone="neutral"
          onClick={onHelp}
          className={selectedIndex === 2 ? 'scale-105 ring-2 ring-yellow-300' : ''}
        >
          <HelpCircle className="size-5" aria-hidden="true" />
          Help
        </ArcadeButton>

        <ArcadeButton
          size="lg"
          tone="danger"
          onClick={onQuit}
          className={selectedIndex === 3 ? 'scale-105 ring-2 ring-yellow-300' : ''}
        >
          <LogOut className="size-5" aria-hidden="true" />
          Quit
        </ArcadeButton>
      </div>

      <div className="mt-8 flex flex-col items-center gap-3">
  <ThemeToggle size="sm" />

  <div className="text-center text-xs text-muted-foreground">
    <span className="font-display uppercase">
      ← → Theme
    </span>
    <span className="mx-2">•</span>
    <span className="font-display uppercase">
      X Select
    </span>
    <span className="mx-2">•</span>
    <span className="font-display uppercase">
      ○ Exit
    </span>
  </div>
</div>
    </OverlayShell>
  )
}