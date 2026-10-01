'use client'

import { useEffect, useState } from 'react'
import { Bluetooth, Check, Play, Radio, X } from 'lucide-react'
import { useGame } from '@/lib/game/game-context'
import {
  assignControllerToPlayer,
  clearControllerAssignments,
  getConnectedGamepads,
  getNextAvailablePlayer,
  getPlayerController,
  isControllerAssigned,
  unassignControllerFromPlayer,
} from '@/lib/game/input'
import { checkRobotConnection } from '@/lib/game/robot-connection'
import { ArcadeButton } from '../arcade-button'
import { ScreenHeader } from '../screen-header'

function Status({
  ok,
  label,
  detail,
}: {
  ok: boolean
  label: string
  detail: string
}) {
  return (
    <div className="arcade-panel flex items-center gap-4 rounded-3xl p-5">
      <div
        className={`flex size-12 shrink-0 items-center justify-center rounded-full ${
          ok
            ? 'bg-success/15 text-success'
            : 'bg-danger/15 text-danger'
        }`}
      >
        {ok ? (
          <Check className="size-6" />
        ) : (
          <X className="size-6" />
        )}
      </div>

      <div className="min-w-0">
        <p className="font-display text-lg uppercase">
          {label}
        </p>

        <p className="text-sm text-muted-foreground">
          {detail}
        </p>
      </div>

      <span
        className={`ml-auto rounded-full px-3 py-1 text-[10px] font-bold uppercase ${
          ok
            ? 'bg-success/10 text-success'
            : 'bg-danger/10 text-danger'
        }`}
      >
        {ok ? 'Ready' : 'Not Ready'}
      </span>
    </div>
  )
}

export function ReadyCheck() {
  const { state, dispatch } = useGame()
  const versus = state.mode === 'versus'

  const [pads, setPads] = useState<Gamepad[]>([])

  const [assignments, setAssignments] = useState<{
    1: number | null
    2: number | null
  }>({
    1: getPlayerController(1),
    2: getPlayerController(2),
  })

  const [robotReady, setRobotReady] = useState(false)
  const [checkingRobot, setCheckingRobot] = useState(true)

  /*
   * TRUE  = Physical mBot required
   * FALSE = Virtual robot mode
   */
  const [usePhysicalRobot, setUsePhysicalRobot] = useState(true)

  /*
   * Start every Ready Check with a clean
   * controller assignment.
   */
  useEffect(() => {
    clearControllerAssignments()

    setAssignments({
      1: null,
      2: null,
    })
  }, [])

  /*
   * Keep the connected controller list updated.
   */
  useEffect(() => {
    const update = () => {
      setPads(getConnectedGamepads())
    }

    update()

    window.addEventListener('gamepadconnected', update)
    window.addEventListener('gamepaddisconnected', update)

    const id = window.setInterval(update, 500)

    return () => {
      window.removeEventListener('gamepadconnected', update)
      window.removeEventListener('gamepaddisconnected', update)
      window.clearInterval(id)
    }
  }, [])

  /*
   * mBot connection check.
   *
   * We still check the robot even when Virtual Robot
   * mode is selected so the UI can show whether it
   * happens to be available.
   */
  useEffect(() => {
  let cancelled = false
  let timeoutId: number | undefined

  const check = async () => {
    const controller = new AbortController()

    const abortTimeout = window.setTimeout(() => {
      controller.abort()
    }, 2000)

    try {
      const ok = await checkRobotConnection(controller.signal)

      if (!cancelled) {
        setRobotReady(ok)
        setCheckingRobot(false)
      }
    } catch {
      if (!cancelled) {
        setRobotReady(false)
        setCheckingRobot(false)
      }
    } finally {
      window.clearTimeout(abortTimeout)

      if (!cancelled) {
        timeoutId = window.setTimeout(check, 2000)
      }
    }
  }

  setCheckingRobot(true)
  check()

  return () => {
    cancelled = true

    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId)
    }
  }
}, [])
  /*
   * PLAYER CLAIMING
   *
   * Unassigned controllers claim the next available
   * player when X is pressed.
   */
  useEffect(() => {
    let frame = 0

    const previousButtons: Record<number, boolean> = {}

    const checkForClaims = () => {
      const connected = getConnectedGamepads()

      connected.forEach((pad) => {
        const xPressed = Boolean(
          pad.buttons[0]?.pressed,
        )

        const wasPressed =
          previousButtons[pad.index] ?? false

        /*
         * Only react to the moment X is pressed.
         */
        if (
          xPressed &&
          !wasPressed &&
          !isControllerAssigned(pad.index)
        ) {
          const nextPlayer =
            getNextAvailablePlayer()

          /*
           * Solo only needs Player 1.
           */
          if (
            nextPlayer === null ||
            (!versus && nextPlayer === 2)
          ) {
            return
          }

          assignControllerToPlayer(
            nextPlayer,
            pad.index,
          )

          setAssignments({
            1: getPlayerController(1),
            2: getPlayerController(2),
          })
        }

        previousButtons[pad.index] = xPressed
      })

      /*
       * Remove assignments for disconnected
       * controllers.
       */
      const connectedIndexes = new Set(
        connected.map((pad) => pad.index),
      )

      const p1 = getPlayerController(1)
      const p2 = getPlayerController(2)

      if (
        p1 !== null &&
        !connectedIndexes.has(p1)
      ) {
        unassignControllerFromPlayer(1)
      }

      if (
        p2 !== null &&
        !connectedIndexes.has(p2)
      ) {
        unassignControllerFromPlayer(2)
      }

      /*
       * Keep React state synchronized with
       * the assignment manager.
       */
      setAssignments((current) => {
        const next = {
          1: getPlayerController(1),
          2: getPlayerController(2),
        }

        if (
          next[1] === current[1] &&
          next[2] === current[2]
        ) {
          return current
        }

        return next
      })

      frame = window.requestAnimationFrame(
        checkForClaims,
      )
    }

    frame = window.requestAnimationFrame(
      checkForClaims,
    )

    return () => {
      window.cancelAnimationFrame(frame)
    }
  }, [versus])

  const p1Ready = assignments[1] !== null

  const p2Ready =
    !versus || assignments[2] !== null

  /*
   * Robot readiness only matters when the user
   * selected Physical mBot mode.
   */
  const robotRequirementMet =
    !usePhysicalRobot || robotReady

  const allReady =
    p1Ready &&
    p2Ready &&
    robotRequirementMet

  /*
   * Keep these only to determine whether a
   * controller is currently connected.
   *
   * We intentionally do NOT display pad.id.
   */
  const p1Pad =
    assignments[1] !== null
      ? pads.find(
          (pad) =>
            pad.index === assignments[1],
        )
      : null

  const p2Pad =
    assignments[2] !== null
      ? pads.find(
          (pad) =>
            pad.index === assignments[2],
        )
      : null

  /*
   * Prevent unused-variable issues while still
   * allowing the connected-state lookup above.
   */
  void p1Pad
  void p2Pad

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-10 py-10">
      <ScreenHeader
        step="Pre-game Check"
        title="Ready Check"
        subtitle="Connect your controllers and choose how you want to run the robot."
        onBack={() =>
          dispatch({
            type: 'GO_TO',
            screen: 'briefing',
          })
        }
      />

      <div className="mx-auto mt-12 grid w-full max-w-3xl gap-4">

        {/* PLAYER 1 */}
        <Status
          ok={p1Ready}
          label="Player 1"
          detail={
            p1Ready
              ? 'Controller assigned to Player 1.'
              : 'Press ✕ on a controller to claim Player 1.'
          }
        />

        {/* PLAYER 2 */}
        {versus && (
          <Status
            ok={p2Ready}
            label="Player 2"
            detail={
              p2Ready
                ? 'Controller assigned to Player 2.'
                : 'Press ✕ on another controller to claim Player 2.'
            }
          />
        )}

        {/* ROBOT MODE */}
        <div className="arcade-panel rounded-3xl p-5">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
              <Radio className="size-6" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-display text-lg uppercase">
                Robot Mode
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Choose whether the game should use the
                physical mBot or a virtual robot.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                  setUsePhysicalRobot(true)

                  dispatch({
                    type: 'SET_ROBOT_MODE',
                    robotMode: 'physical',
                  })
                }}
                  className={`rounded-2xl border px-4 py-4 text-left transition ${
                    usePhysicalRobot
                      ? 'border-accent bg-accent/10'
                      : 'border-border bg-background/40 hover:bg-muted/40'
                  }`}
                >
                  <p className="font-display text-sm uppercase">
                    Physical mBot
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Use the real robot for movement.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUsePhysicalRobot(false)

                    dispatch({
                      type: 'SET_ROBOT_MODE',
                      robotMode: 'virtual',
                    })
                  }}
                  className={`rounded-2xl border px-4 py-4 text-left transition ${
                    !usePhysicalRobot
                      ? 'border-accent bg-accent/10'
                      : 'border-border bg-background/40 hover:bg-muted/40'
                  }`}
                >
                  <p className="font-display text-sm uppercase">
                    Virtual Robot
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Run without a physical mBot.
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* mBOT STATUS */}
        <Status
          ok={
            usePhysicalRobot
              ? robotReady
              : true
          }
          label="mBot"
          detail={
            usePhysicalRobot
              ? checkingRobot
                ? 'Checking the robot server and Bluetooth connection…'
                : robotReady
                  ? 'mBot responded to a safe stop test.'
                  : 'mBot is required for Physical mode.'
              : robotReady
                ? 'Optional — the game will run in Virtual Robot mode.'
                : 'Not connected — Virtual Robot mode does not require it.'
          }
        />

      </div>

      {/* CONTROLLER / ROBOT HELP */}
      <div className="mx-auto mt-8 flex max-w-3xl items-start gap-3 rounded-2xl border border-accent/30 bg-accent/5 p-4 text-sm text-muted-foreground">
        <Bluetooth className="mt-0.5 size-5 shrink-0 text-accent" />

        <p>
          Press ✕ on a controller to claim a player.
          The first controller claims Player 1. In
          Versus mode, the next unassigned controller
          claims Player 2.
          {' '}
          {usePhysicalRobot
            ? 'Physical mBot mode is enabled.'
            : 'Virtual Robot mode is enabled, so an mBot is optional.'}
        </p>
      </div>

      <div className="mt-auto flex flex-col items-center gap-4 pt-10">

        <ArcadeButton
          size="xl"
          tone="accent"
          disabled={!allReady}
          onClick={() =>
            dispatch({
              type: 'START_SESSION',
            })
          }
        >
          <Play className="size-5 fill-current" />

          {allReady
            ? 'Start Mayhem'
            : 'Waiting for All Systems'}
        </ArcadeButton>

        {!allReady && (
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
            {versus
              ? usePhysicalRobot
                ? 'P1 + P2 + mBot required'
                : 'P1 + P2 required'
              : usePhysicalRobot
                ? 'P1 + mBot required'
                : 'P1 required'}
          </p>
        )}

      </div>
    </div>
  )
}