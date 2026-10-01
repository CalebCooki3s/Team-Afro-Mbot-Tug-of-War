'use client'

import { useEffect, useRef } from 'react'
import type { GameInput, PlayerId } from './types'

export interface GameInputEvent {
  input: GameInput
  player: PlayerId
  source?: 'keyboard' | 'button' | 'lstick' | 'dpad'
}

export const GAME_INPUT_EVENT = 'pmm:input'

/**
 * Emit an abstract game input from any source.
 */
export function emitGameInput(event: GameInputEvent) {
  // Tell the UI that the controller was just used.
  if (event.source !== 'keyboard') {
    window.dispatchEvent(new Event('controller-input'))
  }

  window.dispatchEvent(
    new CustomEvent<GameInputEvent>(
      GAME_INPUT_EVENT,
      { detail: event }
    )
  )
}

export function useControllerCursor() {
  useEffect(() => {
    const hideCursor = () => {
      document.body.style.cursor = 'none'
    }

    const showCursor = () => {
      document.body.style.cursor = 'auto'
    }

    window.addEventListener('controller-input', hideCursor)
    window.addEventListener('mousemove', showCursor)

    return () => {
      window.removeEventListener('controller-input', hideCursor)
      window.removeEventListener('mousemove', showCursor)
      document.body.style.cursor = 'auto'
    }
  }, [])
}

/**
 * Keyboard fallback for development.
 *
 * Keyboard controls remain explicitly assigned:
 *
 * P1:
 * 1 2 3 4
 * W A S D
 *
 * P2:
 * 7 8 9 0
 * Arrow keys
 */
const KEYBOARD_MAP: Record<string, GameInputEvent> = {
  '1': { input: 'cross', player: 1 },
  '2': { input: 'circle', player: 1 },
  '3': { input: 'square', player: 1 },
  '4': { input: 'triangle', player: 1 },

  w: { input: 'up', player: 1 },
  a: { input: 'left', player: 1 },
  s: { input: 'down', player: 1 },
  d: { input: 'right', player: 1 },

  '7': { input: 'cross', player: 2 },
  '8': { input: 'circle', player: 2 },
  '9': { input: 'square', player: 2 },
  '0': { input: 'triangle', player: 2 },

  arrowup: { input: 'up', player: 2 },
  arrowleft: { input: 'left', player: 2 },
  arrowdown: { input: 'down', player: 2 },
  arrowright: { input: 'right', player: 2 },

  escape: { input: 'options', player: 1 },
  p: { input: 'options', player: 1 },
}

export const KEYBOARD_HINTS = {
  p1: {
    cross: '1',
    circle: '2',
    square: '3',
    triangle: '4',
  },
  p2: {
    cross: '7',
    circle: '8',
    square: '9',
    triangle: '0',
  },
} as const

/**
 * Return all currently connected gamepads.
 */
export function getConnectedGamepads(): Gamepad[] {
  if (
    typeof navigator === 'undefined' ||
    !navigator.getGamepads
  ) {
    return []
  }

  return Array.from(navigator.getGamepads()).filter(
    (pad): pad is Gamepad => Boolean(pad?.connected)
  )
}

/* -------------------------------------------------------------------------- */
/* Controller assignment                                                     */
/* -------------------------------------------------------------------------- */

/**
 * A controller assignment is identified by the browser's Gamepad index.
 *
 * Example:
 *
 * Gamepad index 2 → P1
 * Gamepad index 5 → P2
 *
 * The browser does not expose the physical USB port number,
 * so Gamepad.index is the stable identifier we can use.
 */
let playerAssignments: Record<PlayerId, number | null> = {
  1: null,
  2: null,
}

/**
 * Assign a connected controller to a player.
 */
export function assignControllerToPlayer(
  player: PlayerId,
  gamepadIndex: number
) {
  playerAssignments[player] = gamepadIndex
}

export function unassignControllerFromPlayer(
  player: PlayerId
) {
  playerAssignments[player] = null
}

/**
 * Remove all controller assignments.
 *
 * Useful when starting a new session or returning to the menu.
 */
export function clearControllerAssignments() {
  playerAssignments = {
    1: null,
    2: null,
  }
}

/**
 * Get the Gamepad index currently assigned to a player.
 */
export function getPlayerController(
  player: PlayerId
): number | null {
  return playerAssignments[player]
}

/**
 * Find which player owns a particular Gamepad.
 */
export function getPlayerForController(
  gamepadIndex: number
): PlayerId | null {
  if (playerAssignments[1] === gamepadIndex) {
    return 1
  }

  if (playerAssignments[2] === gamepadIndex) {
    return 2
  }

  return null
}

/**
 * Check whether a controller is already assigned.
 */
export function isControllerAssigned(
  gamepadIndex: number
): boolean {
  return (
    playerAssignments[1] === gamepadIndex ||
    playerAssignments[2] === gamepadIndex
  )
}

/**
 * Get the first available player slot.
 */
export function getNextAvailablePlayer(): PlayerId | null {
  if (playerAssignments[1] === null) {
    return 1
  }

  if (playerAssignments[2] === null) {
    return 2
  }

  return null
}

/* -------------------------------------------------------------------------- */
/* Gamepad input                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Polls the browser Gamepad API and translates controller input
 * into the abstract game input system.
 *
 * IMPORTANT:
 * Controller input is assigned according to playerAssignments.
 *
 * We do NOT automatically assume:
 *
 * Gamepad 0 = P1
 * Gamepad 1 = P2
 *
 * A controller must first be assigned by the Ready screen.
 */
export function useGamepadInput(
  enabled = true,
  allowUnassignedPlayerOne = false,
) {
  const previousButtons = useRef<Record<string, boolean[]>>({})
  const previousAxes = useRef<Record<string, string>>({})

  useEffect(() => {
    if (!enabled) return

    let frame = 0

    const tick = () => {
      const pads = getConnectedGamepads()

      pads.forEach((pad) => {
        let player = getPlayerForController(pad.index)

        if (!player && allowUnassignedPlayerOne) {
          if (playerAssignments[1] === null) {
            playerAssignments[1] = pad.index
            player = 1
          }
        }

        if (!player) {
          return
        }

        const key = `${pad.index}:${pad.id}`

        const previous = previousButtons.current[key] ?? []

        const buttons = pad.buttons.map(
          (button) => Boolean(button?.pressed),
        )

        // Face buttons
        const inputs: GameInput[] = [
          'cross',
          'circle',
          'square',
          'triangle',
        ]

        inputs.forEach((input, buttonIndex) => {
          if (
            buttons[buttonIndex] &&
            !previous[buttonIndex]
          ) {
            emitGameInput({
              input,
              player,
              source: 'button',
            })
          }
        })

        // Options / Menu
        if (
          buttons[9] &&
          !previous[9]
        ) {
          emitGameInput({
            input: 'options',
            player,
            source: 'button',
          })
        }

        // Left stick
        const x = pad.axes[0] ?? 0
        const y = pad.axes[1] ?? 0

        let stickDirection = ''

        if (x <= -0.55) {
          stickDirection = 'left'
        } else if (x >= 0.55) {
          stickDirection = 'right'
        } else if (y <= -0.55) {
          stickDirection = 'up'
        } else if (y >= 0.55) {
          stickDirection = 'down'
        }

        const previousStickDirection =
          previousAxes.current[key] ?? ''

        if (
          stickDirection &&
          stickDirection !== previousStickDirection
        ) {
          emitGameInput({
            input: stickDirection as GameInput,
            player,
            source: 'lstick',
          })
        }

        previousAxes.current[key] = stickDirection

        // D-pad
        const dpadButtons = [
          {
            index: 12,
            input: 'up' as GameInput,
          },
          {
            index: 13,
            input: 'down' as GameInput,
          },
          {
            index: 14,
            input: 'left' as GameInput,
          },
          {
            index: 15,
            input: 'right' as GameInput,
          },
        ]

        dpadButtons.forEach(({ index, input }) => {
          if (
            buttons[index] &&
            !previous[index]
          ) {
            emitGameInput({
              input,
              player,
              source: 'dpad',
            })
          }
        })

        previousButtons.current[key] = buttons
      })

      frame = window.requestAnimationFrame(tick)
    }

    frame = window.requestAnimationFrame(tick)

    return () => {
      window.cancelAnimationFrame(frame)
    }
  }, [enabled, allowUnassignedPlayerOne])
}


/* -------------------------------------------------------------------------- */
/* Unified game input                                                        */
/* -------------------------------------------------------------------------- */

export function useGameInput(
  handler: (event: GameInputEvent) => void,
  enabled = true
) {
  const handlerRef =
    useRef(handler)

  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    if (!enabled) return

    const onKey = (
      e: KeyboardEvent
    ) => {
      if (
        e.repeat ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey
      ) {
        return
      }

      const target =
        e.target as HTMLElement | null

      if (
        target &&
        (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA'
        )
      ) {
        return
      }

      const event =
        KEYBOARD_MAP[
          e.key.toLowerCase()
        ]

      if (!event) return

      e.preventDefault()

      handlerRef.current(event)
    }

    const onCustom = (
      e: Event
    ) => {
      handlerRef.current(
        (
          e as CustomEvent<GameInputEvent>
        ).detail
      )
    }

    window.addEventListener(
      'keydown',
      onKey
    )

    window.addEventListener(
      GAME_INPUT_EVENT,
      onCustom
    )

    return () => {
      window.removeEventListener(
        'keydown',
        onKey
      )

      window.removeEventListener(
        GAME_INPUT_EVENT,
        onCustom
      )
    }
  }, [enabled])
}