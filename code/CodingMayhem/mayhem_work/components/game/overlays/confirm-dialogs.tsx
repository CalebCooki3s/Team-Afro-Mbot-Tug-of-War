'use client'

import { ArcadeButton, type ArcadeTone } from '../arcade-button'
import { OverlayShell } from '../overlay-shell'
import { useGameInput } from '@/lib/game/input'
import { useState } from 'react'


interface ConfirmProps {
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmDialog({
  title,
  message,
  confirmLabel,
  tone,
  accent,
  onConfirm,
  onCancel,
}: ConfirmProps & {
  title: string
  message: string
  confirmLabel: string
  tone: ArcadeTone
  accent: string
}) {
  const [selection, setSelection] = useState(0)

  useGameInput((event) => {
    if (event.player !== 1) return

    if (event.input === 'left' || event.input === 'up') {
      setSelection(0)
      return
    }

    if (event.input === 'right' || event.input === 'down') {
      setSelection(1)
      return
    }

    if (event.input === 'cross') {
      if (selection === 0) {
        onCancel()
      } else {
        onConfirm()
      }
      return
    }

    if (event.input === 'circle') {
      onCancel()
    }
  }, true)

  return (
    <OverlayShell
      title={title}
      onEscape={onCancel}
      accent={accent}
    >
      <p className="text-center text-lg text-foreground">
        {message}
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <ArcadeButton
          size="lg"
          tone="neutral"
          onClick={onCancel}
          className={
            selection === 0
              ? 'scale-105 border-2 border-primary'
              : ''
          }
        >
          Cancel
        </ArcadeButton>

        <ArcadeButton
          size="lg"
          tone={tone}
          onClick={onConfirm}
          className={
            selection === 1
              ? 'scale-105 border-2 border-primary'
              : ''
          }
        >
          {confirmLabel}
        </ArcadeButton>
      </div>

      <div className="mt-6 text-center text-xs text-muted-foreground">
        <span className="font-display uppercase">
          ← → Select
        </span>
        <span className="mx-2">•</span>
        <span className="font-display uppercase">
          X Confirm
        </span>
        <span className="mx-2">•</span>
        <span className="font-display uppercase">
          ○ Back
        </span>
      </div>
    </OverlayShell>
  )
}

export function QuitConfirmation(props: ConfirmProps) {
  return (
    <ConfirmDialog
      title="Quit?"
      message="Are you sure you want to quit? Your progress will be lost."
      confirmLabel="Quit"
      tone="danger"
      accent="var(--danger)"
      {...props}
    />
  )
}

export function RestartConfirmation(props: ConfirmProps) {
  return (
    <ConfirmDialog
      title="Restart?"
      message="Restart this game? Score and mBot position will reset."
      confirmLabel="Restart"
      tone="primary"
      accent="var(--primary)"
      {...props}
    />
  )
}
