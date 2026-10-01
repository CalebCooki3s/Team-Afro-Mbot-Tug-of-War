'use client'

import { useEffect, useMemo, useState } from 'react'
import { ControllerGlyph } from '@/components/game/controller-glyph'
import {
  getConnectedGamepads,
  useGameInput,
  type GameInputEvent,
} from '@/lib/game/input'
import type { GameInput, PlayerId } from '@/lib/game/types'

type CalibrationStep =
  | 'wake'
  | 'buttons'
  | 'stick'
  | 'dpad'
  | 'options'
  | 'complete'

type ButtonInput = 'cross' | 'circle' | 'square' | 'triangle'

const BUTTONS: ButtonInput[] = [
  'cross',
  'circle',
  'square',
  'triangle',
]

const STICK_DIRECTIONS: GameInput[] = [
  'up',
  'right',
  'down',
  'left',
]

const STEP_LABELS: Record<CalibrationStep, string> = {
  wake: 'START / WAKE UP',
  buttons: 'BUTTON BLITZ',
  stick: 'STICK SPRINT',
  dpad: 'D-PAD DASH',
  options: 'OPTIONS TEST',
  complete: 'SYSTEMS READY',
}

function nextStep(step: CalibrationStep): CalibrationStep {
  if (step === 'wake') return 'buttons'
  if (step === 'buttons') return 'stick'
  if (step === 'stick') return 'dpad'
  if (step === 'dpad') return 'options'
  return 'complete'
}

export function ControllerCalibration({
  player = 1,
  devMode = false,
  onComplete,
}: {
  player?: PlayerId
  devMode?: boolean
  onComplete?: () => void
}) {
  const [step, setStep] = useState<CalibrationStep>('wake')
  const [buttonIndex, setButtonIndex] = useState(0)
  const [stickIndex, setStickIndex] = useState(0)
  const [dpadIndex, setDpadIndex] = useState(0)
  const [passed, setPassed] = useState<Record<string, boolean>>({})
  const [gamepads, setGamepads] = useState<Gamepad[]>([])
  const [lastInput, setLastInput] = useState<GameInputEvent | null>(null)

  useEffect(() => {
    const update = () => {
      setGamepads(getConnectedGamepads())
    }

    update()

    const interval = window.setInterval(update, 500)

    window.addEventListener('gamepadconnected', update)
    window.addEventListener('gamepaddisconnected', update)

    return () => {
      window.clearInterval(interval)
      window.removeEventListener('gamepadconnected', update)
      window.removeEventListener('gamepaddisconnected', update)
    }
  }, [])

  const connected = gamepads.length > 0
  const controller = gamepads[0]

  const buttonTarget = BUTTONS[buttonIndex]!
  const stickTarget = STICK_DIRECTIONS[stickIndex]!
  const dpadTarget = STICK_DIRECTIONS[dpadIndex]!

  const progress = useMemo(() => {
    const keys = [
      'wake',
      'cross',
      'circle',
      'square',
      'triangle',
      'stick-up',
      'stick-right',
      'stick-down',
      'stick-left',
      'dpad-up',
      'dpad-right',
      'dpad-down',
      'dpad-left',
      'options',
    ]

    return keys.filter((key) => passed[key]).length
  }, [passed])

  const markPassed = (key: string) => {
    setPassed((current) => ({
      ...current,
      [key]: true,
    }))
  }

  const handleInput = (event: GameInputEvent) => {
    if (event.player !== player) return

    setLastInput(event)

    if (step === 'wake' && event.input === 'cross') {
      markPassed('wake')
      setStep('buttons')
      return
    }

    if (step === 'buttons' && event.input === buttonTarget) {
      markPassed(buttonTarget)

      if (buttonIndex >= BUTTONS.length - 1) {
        setStep('stick')
      } else {
        setButtonIndex((value) => value + 1)
      }

      return
    }

    if (step === 'stick' && event.source === 'lstick' && event.input === stickTarget) {
      markPassed(`stick-${stickTarget}`)

      if (stickIndex >= STICK_DIRECTIONS.length - 1) {
        setStep('dpad')
      } else {
        setStickIndex((value) => value + 1)
      }

      return
    }

    if (step === 'dpad' && event.source === 'dpad' && event.input === dpadTarget) {
      markPassed(`dpad-${dpadTarget}`)

      if (dpadIndex >= STICK_DIRECTIONS.length - 1) {
        setStep('options')
      } else {
        setDpadIndex((value) => value + 1)
      }

      return
    }

    if (step === 'options' && event.input === 'options') {
      markPassed('options')
      setStep('complete')
      onComplete?.()
    }
  }

  useGameInput(handleInput, true)

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center p-6">
      <div className="w-full max-w-4xl rounded-[2rem] border border-border bg-card/90 p-8 shadow-2xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="font-display text-xs uppercase tracking-[0.25em] text-accent">
              Controller Calibration
            </p>

            <h1 className="mt-2 font-display text-3xl font-bold">
              {STEP_LABELS[step]}
            </h1>
          </div>

          <div className="text-right">
            <p className="text-xs uppercase text-muted-foreground">
              Progress
            </p>
            <p className="font-display text-2xl font-bold">
              {progress}/14
            </p>
          </div>
        </div>

        {!connected ? (
          <div className="rounded-2xl border border-danger/40 bg-danger/10 p-8 text-center">
            <p className="font-display text-xl font-bold">
              CONTROLLER NOT DETECTED
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              Connect your controller, then press a button.
            </p>
          </div>
        ) : step === 'wake' ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ControllerGlyph input="cross" size="xl" />

            <p className="mt-6 font-display text-2xl font-bold">
              PRESS X TO START
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              Wake up Player {player}'s controller.
            </p>
          </div>
        ) : step === 'buttons' ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-sm uppercase tracking-widest text-muted-foreground">
              Hit this button
            </p>

            <ControllerGlyph input={buttonTarget} size="xl" />

            <p className="mt-6 font-display text-2xl font-bold">
              {buttonTarget.toUpperCase()}
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              Find it and press it.
            </p>
          </div>
        ) : step === 'stick' ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="flex size-40 items-center justify-center rounded-full border-4 border-primary/40 bg-primary/10">
              <div
                className={[
                  'flex size-20 items-center justify-center rounded-full border-4 border-primary bg-primary/20 transition-transform',
                  stickTarget === 'up' && '-translate-y-8',
                  stickTarget === 'down' && 'translate-y-8',
                  stickTarget === 'left' && '-translate-x-8',
                  stickTarget === 'right' && 'translate-x-8',
                ].join(' ')}
              >
                <span className="text-2xl">●</span>
              </div>
            </div>

            <p className="mt-6 font-display text-2xl font-bold uppercase">
              Move LEFT STICK {stickTarget}
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              Push the stick until the target registers.
            </p>
          </div>
        ) : step === 'dpad' ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <ControllerGlyph input="dpad" size="xl" />

            <p className="mt-6 font-display text-2xl font-bold uppercase">
              Press D-PAD {dpadTarget}
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              We are checking the controller's directional pad.
            </p>
          </div>
        ) : step === 'options' ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <ControllerGlyph input="options" size="xl" />

            <p className="mt-6 font-display text-2xl font-bold">
              PRESS OPTIONS
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              This button opens the game menu during gameplay.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="flex size-24 items-center justify-center rounded-full border-4 border-success bg-success/15 text-4xl">
              ✓
            </div>

            <p className="mt-6 font-display text-3xl font-bold">
              CONTROLLER READY
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              Player {player} is cleared for gameplay.
            </p>

            {onComplete && (
              <button
                type="button"
                onClick={onComplete}
                className="mt-6 rounded-xl bg-primary px-6 py-3 font-display font-bold"
              >
                CONTINUE
              </button>
            )}
          </div>
        )}

        {devMode && (
          <div className="mt-8 grid gap-4 border-t border-border pt-6 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase text-muted-foreground">
                Controller
              </p>
              <p className="mt-1 font-medium">
                {controller?.id ?? 'Unknown'}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase text-muted-foreground">
                Assignment
              </p>
              <p className="mt-1 font-medium">
                Gamepad {controller?.index ?? '-'} → Player {player}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase text-muted-foreground">
                Hardware
              </p>
              <p className="mt-1 font-medium">
                {controller?.buttons.length ?? 0} buttons ·{' '}
                {controller?.axes.length ?? 0} axes
              </p>
            </div>

            <div>
              <p className="text-xs uppercase text-muted-foreground">
                Last input
              </p>
              <p className="mt-1 font-medium">
                {lastInput
                  ? `${lastInput.input} (${lastInput.source ?? 'unknown'})`
                  : 'Waiting...'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}