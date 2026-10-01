'use client'

import { moveRobot } from '@/lib/game/robot-control'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { cn } from '@/lib/utils'
import { RULES } from '@/lib/game/config'
import { generateMicrogame } from '@/lib/game/challenges'
import { useGame } from '@/lib/game/game-context'
import { useGameInput } from '@/lib/game/input'
import type { PlayerId, RoundResult, SessionState } from '@/lib/game/types'
import { usePausableTimer } from '@/lib/game/use-pausable-timer'
import { MicrogameRenderer } from '../microgames/registry'
import { Countdown } from './countdown'
import { FailureOverlay } from './failure-overlay'
import { MicrogameIntro } from './microgame-intro'
import { MicrogameScreen } from './microgame-screen'
import { SuccessOverlay } from './success-overlay'


function IntroPhase({ session, paused, onDone }: { session: SessionState; paused: boolean; onDone: () => void }) {
  usePausableTimer(RULES.introMs, paused, onDone)
  return (
    <MicrogameIntro microgame={session.microgame} round={session.round}>
      <button type="button" onClick={onDone} className="absolute bottom-0 right-0 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground">
        {'Skip →'}
      </button>
    </MicrogameIntro>
  )
}

function ResultTimer({ paused, onDone }: { paused: boolean; onDone: () => void }) {
  usePausableTimer(RULES.resultMs, paused, onDone)
  return null
}

function PlayerResultCard({ player, result }: { player: PlayerId; result?: RoundResult }) {
  if (!result) {
    return <div className="rounded-2xl border border-border bg-card/90 p-5"><p className="font-display text-xs uppercase tracking-[0.2em] text-muted-foreground">Player {player}</p><p className="mt-2 text-sm text-muted-foreground">No result recorded.</p></div>
  }
  const success = result.outcome === 'success'
  const timeout = result.outcome === 'timeout'
  return (
    <div className={cn('rounded-2xl border-2 bg-card/95 p-5 shadow-xl', success ? 'border-success/60' : 'border-danger/60')}>
      <div className="flex items-center justify-between gap-3">
        <p className="font-display text-sm uppercase tracking-[0.18em]">Player {player}</p>
        <span className={cn('rounded-full px-3 py-1 font-display text-xs uppercase', success ? 'bg-success text-on-color' : 'bg-danger text-on-color')}>
          {success ? 'Correct' : timeout ? 'Time Out' : 'Wrong'}
        </span>
      </div>
      {!success && result.correctAnswer && (
        <p className="mt-4 font-display text-sm uppercase tracking-[0.12em] text-accent">
          Correct answer: <span className="text-foreground">{result.correctAnswer}</span>
        </p>
      )}
      {success && result.correctAnswer && <p className="mt-3 font-display text-sm uppercase tracking-[0.12em] text-accent">Answer: <span className="text-foreground">{result.correctAnswer}</span></p>}
      {result.explanation && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{result.explanation}</p>}
    </div>
  )
}

function VersusResultOverlay({ session }: { session: SessionState }) {
  const { dispatch } = useGame()
  const p1 = session.roundResults[1]
  const p2 = session.roundResults[2]
  const pending = ([1, 2] as const).filter((player) => !session.acknowledged[player])
  const p1Correct = p1?.outcome === 'success'
  const p2Correct = p2?.outcome === 'success'
  const headline = p1Correct && !p2Correct ? 'PLAYER 1 WINS THE ROUND' : p2Correct && !p1Correct ? 'PLAYER 2 WINS THE ROUND' : p1Correct && p2Correct ? 'BOTH PLAYERS GOT IT' : 'NOBODY SCORES'

  return (
    <div className="pointer-events-auto absolute inset-0 z-30 flex items-center justify-center overflow-hidden rounded-[2rem]">
      <div className="absolute inset-0 bg-background/55 backdrop-blur-[2px]" />
      <div className="relative mx-6 w-full max-w-5xl rounded-[2rem] border border-border/80 bg-card/95 p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center">
          <p className="font-display text-xs uppercase tracking-[0.25em] text-accent">Round Result</p>
          <h2 className="mt-2 font-display text-4xl uppercase">{headline}</h2>
          <p className="mt-2 text-sm text-muted-foreground">Read both results before continuing.</p>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-5">
          <PlayerResultCard player={1} result={p1} />
          <PlayerResultCard player={2} result={p2} />
        </div>
        <div className="mt-6 flex justify-center gap-3">
          {pending.map((player) => (
            <button key={player} type="button" onClick={() => dispatch({ type: 'ACKNOWLEDGE_RESULT', player })} className="rounded-xl bg-card px-5 py-3 font-display text-sm uppercase text-foreground ring-2 ring-accent hover:bg-accent/10">
              Player {player}: Continue
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function ResultOverlay({ session }: { session: SessionState }) {
  const { dispatch } = useGame()
  const last = session.lastRound
  if (!last) return null
  const isSolo = session.mode === 'solo'
  if (!isSolo) return <VersusResultOverlay session={session} />

  if (last.outcome === 'success') {
    return <SuccessOverlay player={undefined} action="Push!" explanation={last.explanation} />
  }

  const pending: PlayerId[] = session.acknowledged[1] ? [] : [1]
  return (
    <>
      <FailureOverlay title={last.outcome === 'timeout' ? "Time's Up!" : 'Wrong!'} message="mBot moves closer" explanation={last.explanation} correctAnswer={last.correctAnswer} />
      <div className="pointer-events-auto absolute bottom-5 left-1/2 z-40 -translate-x-1/2">
        {pending.map((player) => (
          <button key={player} type="button" onClick={() => dispatch({ type: 'ACKNOWLEDGE_RESULT', player })} className="rounded-xl bg-card px-5 py-3 font-display text-sm uppercase text-foreground ring-2 ring-accent hover:bg-accent/10">
            Continue
          </button>
        ))}
      </div>
    </>
  )
}

function PlayPhase({ session, paused }: { session: SessionState; paused: boolean }) {
  const { dispatch } = useGame()
  const isPlaying = session.phase === 'playing'
  const sharedVersus = session.mode === 'versus' && ['quick-choice', 'bubble-blitz', 'loop-count', 'algorithm-arena', 'trace-race',].includes(session.microgame.kind)
  const player2Microgame = useMemo(() => {
    if (session.mode !== 'versus' || session.microgame.kind !== 'dodge-code') return session.microgame
    return {
      ...generateMicrogame(session.difficulty, session.round * 100 + 2, 'dodge'),
      timeLimit: session.microgame.timeLimit,
    }
  }, [session.mode, session.difficulty, session.round, session.microgame])

  const resolve = useCallback((result: RoundResult) => {
    if (session.phase !== 'playing') return
    dispatch({ type: 'RESOLVE_ROUND', result })
  }, [dispatch, session.phase])

  const remaining = usePausableTimer(session.microgame.timeLimit * 1000, paused || !isPlaying, () => {
    // Loop Count and Algorithm Arena own their internal question timers so they can
    // grade the hidden input count instead of being marked as a generic timeout.
    if (session.microgame.kind === 'loop-count' || session.microgame.kind === 'algorithm-arena' || session.microgame.kind === 'match-pairs') return
    if (session.mode === 'versus') {
      if (!session.roundResults[1]) resolve({ outcome: 'timeout', player: 1, explanation: 'Player 1 did not answer before the timer expired.', correctAnswer: 'Time expired.' })
      if (!session.roundResults[2]) resolve({ outcome: 'timeout', player: 2, explanation: 'Player 2 did not answer before the timer expired.', correctAnswer: 'Time expired.' })
    } else {
      resolve({ outcome: 'timeout', explanation: 'Time expired before you answered.', correctAnswer: 'Time expired.' })
    }
  })

  const failed = session.phase === 'result' && session.lastRound?.outcome !== 'success'

  return (
    <div className={cn('flex flex-1 flex-col', failed && 'animate-shake')}>
      <MicrogameScreen session={session} microgame={session.microgame} remainingMs={remaining} onPause={() => dispatch({ type: 'OPEN_OVERLAY', overlay: 'pause' })}>
        {session.mode === 'versus' ? (
          sharedVersus ? (
            <MicrogameRenderer definition={session.microgame} mode="versus" active={isPlaying && !paused} onResolve={resolve} />
          ) : (
            <div className="grid flex-1 grid-cols-2 divide-x divide-border/70">
              <div className="min-w-0"><MicrogameRenderer definition={session.microgame} mode="versus" player={1} active={isPlaying && !paused && !session.roundResults[1]} onResolve={resolve} /></div>
              <div className="min-w-0"><MicrogameRenderer definition={player2Microgame} mode="versus" player={2} active={isPlaying && !paused && !session.roundResults[2]} onResolve={resolve} /></div>
            </div>
          )
        ) : (
          <MicrogameRenderer definition={session.microgame} mode="solo" active={isPlaying && !paused} onResolve={resolve} />
        )}

        {session.phase === 'result' && (
          <>
            <ResultOverlay session={session} />
            {session.mode === 'solo' && session.lastRound?.outcome === 'success' && (
              <ResultTimer paused={paused} onDone={() => dispatch({ type: 'ACKNOWLEDGE_RESULT', player: 1 })} />
            )}
          </>
        )}
      </MicrogameScreen>
    </div>
  )
}

export function GameSession() {
  const { state, dispatch, isPaused } = useGame()
  const session = state.session

  const lastRobotCommand = useRef<string | null>(null)

useEffect(() => {
  if (!session) return
  if (session.robotMode !== 'physical') return
  if (session.phase !== 'result') return
  if (!session.lastRound) return

  const commandKey = `${session.id}-${session.round}`

  // Prevent React re-renders from sending the same command twice.
  if (lastRobotCommand.current === commandKey) return
  lastRobotCommand.current = commandKey

  if (session.mode === 'solo') {
    if (session.lastRound.outcome === 'success') {
      void moveRobot('forward')
    }

    return
  }

  const p1 = session.roundResults[1]
  const p2 = session.roundResults[2]

  if (!p1 || !p2) return

  const p1Correct = p1.outcome === 'success'
  const p2Correct = p2.outcome === 'success'

  // Only a successful player moves the physical robot.
  if (p1Correct && !p2Correct) {
    void moveRobot('backward')
  } else if (p2Correct && !p1Correct) {
    void moveRobot('forward')
  }
}, [session])

 useGameInput((event) => {
  if (state.overlay !== null) return

  if (event.input === 'options') {
    dispatch({ type: 'OPEN_OVERLAY', overlay: 'pause' })
    return
  }

  if (!session) return

  if (session.phase === 'intro' && event.input === 'cross') {
    dispatch({ type: 'SET_PHASE', phase: 'countdown' })
    return
  }

  if (session.phase === 'result' && event.input === 'cross') {
    dispatch({ type: 'ACKNOWLEDGE_RESULT', player: 1 })
  }
}, state.overlay === null)

  if (!session) return null
  const roundKey = `${session.id}-${session.round}`

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col px-8 py-6">
      {session.phase === 'intro' && <IntroPhase key={`${roundKey}-intro`} session={session} paused={isPaused} onDone={() => dispatch({ type: 'SET_PHASE', phase: 'countdown' })} />}
      {session.phase === 'countdown' && <MicrogameIntro key={`${roundKey}-countdown`} microgame={session.microgame} round={session.round} dimmed><Countdown paused={isPaused} onComplete={() => dispatch({ type: 'SET_PHASE', phase: 'playing' })} /></MicrogameIntro>}
      {(session.phase === 'playing' || session.phase === 'result') && <PlayPhase key={`${roundKey}-play`} session={session} paused={isPaused} />}
    </div>
  )
}
