'use client'



import { useEffect, useMemo, useRef, useState } from 'react'

import {

  ArrowLeft,

  ChevronLeft,

  ChevronRight,

  FlaskConical,

  RotateCcw,

} from 'lucide-react'



import { generateMicrogame } from '@/lib/game/challenges'

import { MicrogameRenderer } from '../microgames/registry'

import type { Difficulty, GameMode, RoundResult } from '@/lib/game/types'

import { ArcadeButton } from '../arcade-button'

import { ScreenHeader } from '../screen-header'

import { useGame } from '@/lib/game/game-context'

import { useGameInput } from '@/lib/game/input'

import { cn } from '@/lib/utils'

import { ControllerCalibration } from '@/lib/game/ControllerCalibration'



const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'extreme']



const FAMILY_LABELS: Record<string, string> = {

  'quick-choice': 'Quick Code',

  'bubble-blitz': 'Bubble Blitz',

  dodge: 'Lane Logic',

  match: 'Match Attack',

  bug: 'Bug Hunt',

  build: 'Code Order',

  trace: 'Trace Race',

  boolean: 'Boolean Blitz',

  loop: 'Loop Lab',

  function: 'Function Forge',

  complexity: 'Complexity Crash',

  'loop-count': 'Loop Count',

  algorithm: 'Algorithm Arena',

}



const FAMILIES_BY_DIFFICULTY: Record<Difficulty, string[]> = {

  easy: [

    'quick-choice',

    'bubble-blitz',

    'match',

    'dodge',

    'boolean',

    'loop',

    'build',

    'loop-count',

  ],

  medium: [

    'bubble-blitz',

    'bug',

    'match',

    'build',

    'dodge',

    'boolean',

    'loop',

    'function',

    'trace',

    'loop-count',

  ],

  hard: [

    'bug',

    'build',

    'quick-choice',

    'match',

    'dodge',

    'trace',

    'boolean',

    'loop',

    'function',

    'complexity',

    'loop-count',

    'algorithm',

  ],

  extreme: [

    'bug',

    'build',

    'quick-choice',

    'match',

    'bubble-blitz',

    'dodge',

    'trace',

    'boolean',

    'loop',

    'function',

    'complexity',

    'loop-count',

    'algorithm',

  ],

}



const FORCED_FAMILY: Record<

  string,

  Parameters<typeof generateMicrogame>[2]

> = {

  'quick-choice': 'choice',

  'bubble-blitz': 'bubble',

  dodge: 'dodge',

  match: 'match',

  bug: 'bug',

  build: 'build',

  trace: 'trace',

  boolean: 'boolean',

  loop: 'loop',

  function: 'function',

  complexity: 'complexity',

  'loop-count': 'loop-count',

  algorithm: 'algorithm',

}



function useInputMode() {
  const [inputMode, setInputMode] = useState<'pc' | 'controller'>('pc')
  const [pendingMode, setPendingMode] = useState<'pc' | 'controller' | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const inputModeRef = useRef<'pc' | 'controller'>('pc')
  const pendingModeRef = useRef<'pc' | 'controller' | null>(null)

  useEffect(() => {
    let timer: number | undefined
    let interval: number | undefined

    const requestMode = (nextMode: 'pc' | 'controller') => {
      if (nextMode === inputModeRef.current) {
        if (pendingModeRef.current !== null) {
          pendingModeRef.current = null
          setPendingMode(null)
          setCountdown(null)
          if (interval !== undefined) window.clearInterval(interval)
          if (timer !== undefined) window.clearTimeout(timer)
        }
        return
      }

      if (pendingModeRef.current === nextMode) return

      pendingModeRef.current = nextMode
      setPendingMode(nextMode)
      setCountdown(3)

      if (interval !== undefined) window.clearInterval(interval)
      if (timer !== undefined) window.clearTimeout(timer)

      let remaining = 3
      interval = window.setInterval(() => {
        remaining -= 1
        setCountdown(remaining)
      }, 1000)

      timer = window.setTimeout(() => {
        inputModeRef.current = nextMode
        setInputMode(nextMode)
        pendingModeRef.current = null
        setPendingMode(null)
        setCountdown(null)
        if (interval !== undefined) window.clearInterval(interval)
      }, 3000)
    }

    const handleMouse = () => requestMode('pc')
    const handleKeyboard = () => requestMode('pc')
    const handleController = () => requestMode('controller')

    window.addEventListener('mousemove', handleMouse)
    window.addEventListener('keydown', handleKeyboard)
    window.addEventListener('controller-input', handleController)

    return () => {
      window.removeEventListener('mousemove', handleMouse)
      window.removeEventListener('keydown', handleKeyboard)
      window.removeEventListener('controller-input', handleController)
      if (timer !== undefined) window.clearTimeout(timer)
      if (interval !== undefined) window.clearInterval(interval)
    }
  }, [])

  return { inputMode, pendingMode, countdown }
}

export function DevLab() {

  const { state, dispatch } = useGame()



  const { inputMode, pendingMode, countdown } = useInputMode()
  const [controllerStage, setControllerStage] = useState<'setup' | 'calibration' | 'ready' | 'lab'>(
  state.devControllerReady ? 'ready' : 'setup'
)
  const [locked, setLocked] = useState({ difficulty: false, microgame: false, mode: false, question: false })
  const [exitConfirm, setExitConfirm] = useState(false)



  const [devInputMode, setDevInputMode] = useState<

    'keyboard' | 'controller' | null

  >(null)



  const [difficulty, setDifficulty] =

    useState<Difficulty>('easy')



  const [family, setFamily] =

    useState('quick-choice')



  const [mode, setMode] =

    useState<GameMode>('solo')



  const [serial, setSerial] =

    useState(0)



  const [results, setResults] =

    useState<RoundResult[]>([])



  const [controllerTest, setControllerTest] =

    useState(false)



    const [devSection, setDevSection] = useState<

      'difficulty' | 'microgame' | 'mode' | 'question'

    >('microgame')



const [devSelection, setDevSelection] = useState(0)
const [devNavigationActive, setDevNavigationActive] = useState(true)

const controllerOptionRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  const availableFamilies =

    FAMILIES_BY_DIFFICULTY[difficulty]





  const safeFamily =

    availableFamilies.includes(family)

      ? family

      : availableFamilies[0]!



  const effectiveMode: GameMode =

    safeFamily === 'algorithm'

      ? 'versus'

      : mode



  const definition = useMemo(

    () =>

      generateMicrogame(

        difficulty,

        serial,

        FORCED_FAMILY[safeFamily],

      ),

    [difficulty, safeFamily, serial],

  )



  const questionNumber =

    ['loop', 'function'].includes(safeFamily)

      ? (serial % 4) + 1

      : serial + 1



  const complete = results.length > 0



  const loadQuestion = (nextSerial: number) => {
  setResults([])
  setSerial(nextSerial)
}



  const chooseFamily = (nextFamily: string) => {

    setFamily(nextFamily)

    setSerial(0)

    setResults([])

    setControllerTest(false)

  }



  const chooseDifficulty = (level: Difficulty) => {

    setDifficulty(level)

    setSerial(0)

    setResults([])

    setControllerTest(false)

  }



  const controllerSections = ['difficulty', 'microgame', 'mode', 'question'] as const
  const openExitConfirm = () => setExitConfirm(true)
  const unlockCurrentSelection = () => setLocked((current) => ({ ...current, [devSection]: false }))
  const confirmControllerSelection = () => setLocked((current) => ({ ...current, [devSection]: true }))
  const controllerSelectionLocked = locked[devSection]

  useEffect(() => {
  if (inputMode !== 'controller') return
  if (controllerStage !== 'lab') return

  const key = `${devSection}-${devSelection}`
  const element = controllerOptionRefs.current[key]

  element?.scrollIntoView({
    block: 'nearest',
    behavior: 'smooth',
  })
}, [
  inputMode,
  controllerStage,
  devSection,
  devSelection,
])


  useGameInput((event) => {
    if (event.source !== 'keyboard') window.dispatchEvent(new Event('controller-input'))
    if (inputMode !== 'controller' || event.player !== 1) return
    if (controllerStage === 'calibration') return

    if (exitConfirm) {
      if (event.input === 'cross') dispatch({ type: 'GO_TO', screen: 'menu' })
      else if (event.input === 'circle') setExitConfirm(false)
      return
    }

    if (controllerStage === 'setup') {
      if (event.input === 'cross') setControllerStage('calibration')
      else if (event.input === 'circle') openExitConfirm()
      return
    }

    if (controllerStage === 'ready') {
      if (event.input === 'cross') setControllerStage('lab')
      else if (event.input === 'circle') openExitConfirm()
      return
    }

    if (controllerStage !== 'lab') return

    if (event.input === 'left' || event.input === 'right') {
      const direction = event.input === 'left' ? -1 : 1
      setDevSection((current) => {
        const index = controllerSections.indexOf(current)
        return controllerSections[(index + direction + controllerSections.length) % controllerSections.length]
      })
      setDevSelection(0)
      return
    }

    if (event.input === 'up' || event.input === 'down') {
      if (controllerSelectionLocked) return
      const direction = event.input === 'up' ? -1 : 1
      setDevSelection((current) => {
        if (devSection === 'difficulty') return Math.max(0, Math.min(current + direction, DIFFICULTIES.length - 1))
        if (devSection === 'microgame') return Math.max(0, Math.min(current + direction, availableFamilies.length - 1))
        if (devSection === 'mode') return Math.max(0, Math.min(current + direction, 1))
        return Math.max(0, Math.min(current + direction, 39))
      })
      return
    }

    if (event.input === 'cross') {
      if (controllerSelectionLocked) return
      if (devSection === 'difficulty') {
        const level = DIFFICULTIES[devSelection]
        if (level) chooseDifficulty(level)
      } else if (devSection === 'microgame') {
        const selectedFamily = availableFamilies[devSelection]
        if (selectedFamily) chooseFamily(selectedFamily)
      } else if (devSection === 'mode') {
        setMode(devSelection === 1 ? 'versus' : 'solo')
     } else if (devSection === 'question') {
          const selectedSerial = devSelection

          dispatch({
            type: 'START_DEV_SESSION',
            difficulty,
            mode: effectiveMode,
            serial: selectedSerial,
            family: FORCED_FAMILY[safeFamily] ?? safeFamily,
          })
        }
      confirmControllerSelection()
      return
    }

    if (event.input === 'circle') {
      if (controllerSelectionLocked) unlockCurrentSelection()
      else openExitConfirm()
    }
  }, true)

  return (

    <div className="mx-auto flex min-h-screen max-w-[1500px] flex-col px-8 py-7"

    style={{

       cursor: inputMode === 'controller' ? 'none' : 'auto',

      }}>

      <ScreenHeader

        step="Developer Tools"

        title="Dev Lab"

        subtitle="Test microgames directly without the ready check, mBot, or PS4 controllers. Keyboard input is available for P1 and P2."

        onBack={() =>

          dispatch({

            type: 'GO_TO',

            screen: 'menu',

          })

        }

      />

      {pendingMode && countdown !== null && (
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-accent/40 bg-accent/10 px-5 py-3 shadow-lg">
          <div>
            <p className="font-display text-xs uppercase tracking-[0.18em] text-accent">Switching input mode</p>
            <p className="mt-1 text-sm text-muted-foreground">{pendingMode === 'controller' ? 'Controller mode' : 'PC mode'} starts in {countdown}</p>
          </div>
          <span className="font-display text-3xl text-accent">{countdown}</span>
        </div>
      )}

      {inputMode === 'controller' ? (
        <div className="mt-6 flex flex-1 items-center justify-center">
          <div className="w-full max-w-5xl">
            {exitConfirm ? (
              <div className="arcade-panel mx-auto max-w-xl rounded-3xl p-8 text-center">
                <p className="font-display text-xs uppercase tracking-[0.2em] text-accent">Confirm Exit</p>
                <h2 className="mt-3 font-display text-4xl uppercase">Exit Dev Lab?</h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">Are you sure you want to leave the Dev Lab?</p>
                <div className="mt-7 flex justify-center gap-3"><ArcadeButton tone="accent" onClick={() => dispatch({ type: 'GO_TO', screen: 'menu' })}>X &nbsp; Confirm</ArcadeButton><ArcadeButton tone="neutral" onClick={() => setExitConfirm(false)}>O &nbsp; Cancel</ArcadeButton></div>
              </div>
            ) : controllerStage === 'setup' ? (
              <div className="arcade-panel rounded-3xl p-8">
                <p className="font-display text-xs uppercase tracking-[0.2em] text-accent">Controller Setup</p>
                <div className="mt-2 flex items-end justify-between gap-5"><div><h2 className="font-display text-4xl uppercase">Ready to calibrate</h2><p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">Confirm Player 1 controls before entering the controller Dev Lab.</p></div><div className="rounded-2xl border border-success/30 bg-success/10 px-4 py-3 text-right"><p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Status</p><p className="mt-1 font-display text-sm uppercase text-success">Connected</p></div></div>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">{['Player 1 assigned','Buttons detected','D-pad detected'].map((item) => <div key={item} className="rounded-2xl border border-border bg-surface/60 p-4"><p className="font-display text-xs uppercase">{item}</p><p className="mt-1 text-xs text-success">Ready</p></div>)}</div>
                <div className="mt-8 flex justify-between border-t border-border pt-5 text-xs text-muted-foreground"><span>O &nbsp; Exit</span><span className="font-display text-accent">X &nbsp; Start Calibration</span></div>
              </div>
            ) : controllerStage === 'calibration' ? (
              <div className="arcade-panel overflow-hidden rounded-3xl">
  <ControllerCalibration
    player={1}
    devMode
    onComplete={() => {
      setControllerStage('ready')
      dispatch({ type: 'SET_DEV_CONTROLLER_READY', value: true })
    }}
  />
</div>
            ) : controllerStage === 'ready' ? (
              <div className="arcade-panel mx-auto max-w-2xl rounded-3xl p-8 text-center"><p className="font-display text-xs uppercase tracking-[0.2em] text-success">Calibration Complete</p><h2 className="mt-3 font-display text-4xl uppercase">Controller Ready</h2><p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">Everything is calibrated. Press X to enter the Dev Lab.</p><p className="mt-7 font-display text-sm uppercase text-accent">X &nbsp; Enter Dev Lab &nbsp; · &nbsp; O &nbsp; Exit</p></div>
            ) : (
              <div className="space-y-5">
                <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
                  <div className="arcade-panel rounded-3xl p-6">
                    <div className="flex items-center justify-between"><div><p className="font-display text-xs uppercase tracking-[0.2em] text-accent">Controller Dev Lab</p><h2 className="mt-2 font-display text-3xl uppercase">Test Setup</h2></div><div className="rounded-xl border border-border bg-surface/60 px-3 py-2 text-right"><p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Controls</p><p className="mt-1 font-display text-xs">D-PAD · X · O</p></div></div>
                    <div className="mt-6 grid gap-3">
                      {([['difficulty','Difficulty',difficulty.toUpperCase()],['microgame','Microgame',FAMILY_LABELS[safeFamily]],['mode','Mode',effectiveMode.toUpperCase()],['question','Quiz Preview',`Question ${questionNumber}`]] as const).map(([id,label,value]) => (
                        <button key={id} type="button" onClick={() => setDevSection(id)} className={cn('flex items-center justify-between rounded-2xl border-2 px-5 py-4 text-left transition',devSection === id ? 'border-accent bg-accent/10 shadow-lg' : 'border-border bg-surface/50 hover:border-accent/40')}>
                          <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{label}</p><p className="mt-1 font-display text-base uppercase">{value}</p></div>
                          <span className={cn('rounded-lg px-2 py-1 text-[10px] font-bold uppercase',locked[id] ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground')}>{locked[id] ? 'Locked' : 'Edit'}</span>
                        </button>
                      ))}
                    </div>
                   <div className="mt-6 rounded-2xl border border-border bg-surface/40 p-4">
  <div className="flex items-center justify-between">
    <div>
      <p className="font-display text-xs uppercase tracking-[0.16em]">
        {devSection === 'difficulty' && 'Difficulty Options'}
        {devSection === 'microgame' && 'Microgame Options'}
        {devSection === 'mode' && 'Mode Options'}
        {devSection === 'question' && 'Question'}
      </p>

      <p className="mt-1 text-sm text-muted-foreground">
        {controllerSelectionLocked
          ? 'Locked in. Press O to unlock this setting.'
          : 'Use ↑ ↓ to choose, then X to lock it in.'}
      </p>
    </div>

    <span className="rounded-lg bg-accent/10 px-3 py-1 font-display text-xs uppercase text-accent">
      {devSelection + 1}
    </span>
  </div>

  <div className="mt-4 max-h-64 overflow-y-auto pr-1">
    {devSection === 'difficulty' &&
      DIFFICULTIES.map((level, index) => (
        <button
          key={level}
          ref={(element) => {
            controllerOptionRefs.current[`difficulty-${index}`] = element
          }}
          type="button"
          onClick={() => {
            if (controllerSelectionLocked) return
            setDevSelection(index)
          }}
          className={cn(
            'mb-2 flex w-full items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition',
            devSelection === index
              ? 'border-accent bg-accent/10'
              : 'border-border bg-surface/30',
            controllerSelectionLocked && 'opacity-60',
          )}
        >
          <span className="font-display text-sm uppercase">
            {level}
          </span>

          {devSelection === index && (
            <span className="text-xs font-bold uppercase text-accent">
              Selected
            </span>
          )}
        </button>
      ))}

    {devSection === 'microgame' &&
      availableFamilies.map((gameFamily, index) => (
        <button
          key={gameFamily}
          ref={(element) => {
            controllerOptionRefs.current[`microgame-${index}`] = element
          }}
          type="button"
          onClick={() => {
            if (controllerSelectionLocked) return
            setDevSelection(index)
          }}
          className={cn(
            'mb-2 flex w-full items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition',
            devSelection === index
              ? 'border-accent bg-accent/10'
              : 'border-border bg-surface/30',
            controllerSelectionLocked && 'opacity-60',
          )}
        >
          <span className="font-display text-sm uppercase">
            {FAMILY_LABELS[gameFamily]}
          </span>

          {devSelection === index && (
            <span className="text-xs font-bold uppercase text-accent">
              Selected
            </span>
          )}
        </button>
      ))}

    {devSection === 'mode' &&
      (['solo', 'versus'] as GameMode[]).map((gameMode, index) => (
        <button
          key={gameMode}
          ref={(element) => {
            controllerOptionRefs.current[`mode-${index}`] = element
          }}
          type="button"
          onClick={() => {
            if (controllerSelectionLocked) return
            setDevSelection(index)
          }}
          className={cn(
            'mb-2 flex w-full items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition',
            devSelection === index
              ? 'border-accent bg-accent/10'
              : 'border-border bg-surface/30',
            controllerSelectionLocked && 'opacity-60',
          )}
        >
          <span className="font-display text-sm uppercase">
            {gameMode}
          </span>

          {devSelection === index && (
            <span className="text-xs font-bold uppercase text-accent">
              Selected
            </span>
          )}
        </button>
      ))}

    {devSection === 'question' && (
      <div className="rounded-xl border-2 border-accent bg-accent/10 px-4 py-4">
        <p className="font-display text-lg uppercase">
          Question {questionNumber}
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          Press X to load the current question.
        </p>
      </div>
    )}
  </div>
</div>
                  </div>

                  <div className="rounded-3xl border border-primary/30 bg-primary/5 p-6"><p className="font-display text-xs uppercase tracking-[0.2em] text-primary">Up Next</p><h3 className="mt-2 font-display text-2xl uppercase">{FAMILY_LABELS[safeFamily]}</h3><div className="mt-5 space-y-3"><div className="rounded-2xl border border-border bg-card/70 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Difficulty</p><p className="mt-1 font-display text-sm uppercase">{difficulty}</p></div><div className="rounded-2xl border border-border bg-card/70 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Quiz</p><p className="mt-1 font-display text-sm uppercase">Question {questionNumber} of 40</p></div><div className="rounded-2xl border border-border bg-card/70 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">What to expect</p><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{`You will solve a ${difficulty} ${FAMILY_LABELS[safeFamily]} challenge.`}</p></div></div></div>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-border bg-card/70 px-5 py-4 text-xs text-muted-foreground"><span>← → &nbsp; Change setting &nbsp; · &nbsp; ↑ ↓ &nbsp; Change value</span><span className="font-display text-accent">X Lock &nbsp; · &nbsp; O Unlock / Exit</span></div>
              </div>
            )}
          </div>
        </div>
      ) : (

      <div className="mt-6 grid flex-1 gap-5 lg:grid-cols-[300px_1fr]">

        {/* SIDEBAR */}

        <aside className="arcade-panel rounded-3xl p-5">

          <div className="flex items-center gap-2">

            <FlaskConical className="size-5 text-accent" />



            <p className="font-display uppercase tracking-[0.18em]">

              Test Setup

            </p>

          </div>



          {/* DIFFICULTY */}

          <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">

            Difficulty

          </p>



          <div className="mt-2 grid grid-cols-2 gap-2">

            {DIFFICULTIES.map((level) => (

              <button

                key={level}

                type="button"

                onClick={() => chooseDifficulty(level)}

                className={cn(

                  'rounded-xl border-2 px-3 py-2 font-display text-xs uppercase',

                  difficulty === level

                    ? 'border-accent bg-accent/10'

                    : 'border-border bg-surface/60 hover:border-accent/50',

                  devSection === 'difficulty' &&

                    devSelection === DIFFICULTIES.indexOf(level) &&

                    'ring-2 ring-accent scale-[1.02]',

                )}

              >

                {level}

              </button>

            ))}

          </div>



          {/* MICROGAME */}

          <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">

            Microgame

          </p>



          <div className="mt-2 max-h-[42vh] space-y-2 overflow-y-auto pr-1">

            {availableFamilies.map((id, index) => (

              <button

                key={id}

                type="button"

                onClick={() => chooseFamily(id)}

                className="w-full rounded-xl border-2 border-border bg-surface/60 px-3 py-2 text-left font-display text-xs uppercase hover:border-primary/50"

              >

                {FAMILY_LABELS[id]}

              </button>

            ))}

          </div>



          {/* INPUT MODE */}

          {safeFamily !== 'algorithm' && (

            <>

              <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">

                Input mode

              </p>



              <div className="mt-2 grid grid-cols-2 gap-2">

                {(['solo', 'versus'] as const).map((value) => (

                  <button

                    key={value}

                    type="button"

                    onClick={() => {

                      setMode(value)

                      setControllerTest(false)

                    }}

                    className={cn(

                      'rounded-xl border-2 px-3 py-2 font-display text-xs uppercase',

                      mode === value

                        ? 'border-secondary bg-secondary/10'

                        : 'border-border bg-surface/60',

                    )}

                  >

                    {value}

                  </button>

                ))}

              </div>

            </>

          )}



          {/* KEYBOARD */}

          <div className="mt-5 rounded-2xl border border-border bg-surface/50 p-3 text-xs text-muted-foreground">

            <p className="font-display uppercase text-foreground">

              Keyboard

            </p>



            <p className="mt-1">

              P1: 1 2 3 4 = ✕ ○ □ △

            </p>



            <p>

              P2: 7 8 9 0 = ✕ ○ □ △

            </p>



            <p>

              Arrow keys can control P2 movement games.

            </p>

          </div>



          {/* HARDWARE */}

          <div className="mt-5 rounded-2xl border border-border bg-surface/50 p-3">

            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">

              Hardware

            </p>



            <button

              type="button"

              onClick={() => {

                setControllerTest(true)

                setResults([])

              }}

              className={cn(

                'mt-2 w-full rounded-xl border-2 px-3 py-2 text-left font-display text-xs uppercase',

                controllerTest

                  ? 'border-accent bg-accent/10'

                  : 'border-border bg-surface/60 hover:border-accent/50',

              )}

            >

              Controller Calibration

            </button>

          </div>

        </aside>



        {/* MAIN GAME AREA */}

        <main className="relative flex min-h-[650px] flex-col overflow-hidden rounded-3xl border border-border bg-card/70 shadow-xl">

          {/* HEADER */}

          <div className="flex items-center justify-between border-b border-border px-5 py-3">

            <div>

              <p className="font-display text-xs uppercase tracking-[0.2em] text-accent">

                {controllerTest

                  ? 'Controller Calibration'

                  : FAMILY_LABELS[safeFamily]}

              </p>



              <p className="text-xs text-muted-foreground">

                {controllerTest

                  ? 'PLAYER 1 · HARDWARE TEST'

                  : `${difficulty.toUpperCase()} · ${effectiveMode.toUpperCase()} · Test ${questionNumber}`}

              </p>

            </div>



            {!controllerTest && (

              <div className="flex items-center gap-2">

                <ArcadeButton

                  size="sm"

                  tone="neutral"

                  onClick={() => loadQuestion(serial - 1)}

                  disabled={serial === 0}

                >

                  <ChevronLeft className="size-4" />

                </ArcadeButton>



                <ArcadeButton

                  size="sm"

                  tone="neutral"

                  onClick={() => loadQuestion(serial + 1)}

                >

                  <ChevronRight className="size-4" />

                </ArcadeButton>

              </div>

            )}

          </div>



          {/* CONTENT */}

          <div className="relative flex flex-1 flex-col">

            {controllerTest ? (

              <ControllerCalibration

                player={1}

                devMode

                onComplete={() => {}}

              />

            ) : (

              <>

                <MicrogameRenderer

                  key={definition.id}

                  definition={definition}

                  mode={effectiveMode}

                  active={!complete}

                  onResolve={(result) =>

                    setResults((current) =>

                      current.some(

                        (r) =>

                          r.player === result.player &&

                          r.outcome === result.outcome,

                      )

                        ? current

                        : [...current, result],

                    )

                  }

                />



                {/* RESULT OVERLAY */}

                {complete && (

                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/65 p-6 backdrop-blur-sm">

                    <div className="w-full max-w-2xl rounded-3xl border-2 border-accent bg-card p-7 shadow-2xl">

                      <p className="font-display text-xs uppercase tracking-[0.2em] text-accent">

                        Dev Result

                      </p>



                      <h2 className="mt-2 font-display text-4xl uppercase">

                        Test complete

                      </h2>



                      <div className="mt-5 space-y-3">

                        {results.map((result, index) => (

                          <div

                            key={`${result.player ?? 0}-${index}`}

                            className="rounded-2xl border border-border bg-surface/70 p-4"

                          >

                            <div className="flex items-center justify-between">

                              <span className="font-display text-sm uppercase">

                                {result.player

                                  ? `Player ${result.player}`

                                  : 'Solo'}

                              </span>



                              <span

                                className={cn(

                                  'font-display text-sm uppercase',

                                  result.outcome === 'success'

                                    ? 'text-success'

                                    : 'text-danger',

                                )}

                              >

                                {result.outcome}

                              </span>

                            </div>



                            {result.correctAnswer && (

                              <p className="mt-2 text-sm">

                                Answer:{' '}

                                <span className="font-mono text-accent">

                                  {result.correctAnswer}

                                </span>

                              </p>

                            )}



                            {result.explanation && (

                              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">

                                {result.explanation}

                              </p>

                            )}

                          </div>

                        ))}

                      </div>



                      <div className="mt-6 flex flex-wrap justify-center gap-3">

                        <ArcadeButton

                          tone="accent"

                          onClick={() => loadQuestion(serial + 1000)}

                        >

                          <RotateCcw className="size-4" />

                          Try Again

                        </ArcadeButton>



                        <ArcadeButton

                          tone="neutral"

                          onClick={() => loadQuestion(serial + 1)}

                        >

                          <ChevronRight className="size-4" />

                          Next Test

                        </ArcadeButton>

                      </div>

                    </div>

                  </div>

                )}

              </>

            )}

          </div>

        </main>

      </div>



      )}

      {/* FOOTER */}

      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">

        <button

          type="button"

          onClick={() => {

            if (controllerTest) {

              setControllerTest(false)

              setResults([])

            } else {

              dispatch({

                type: 'GO_TO',

                screen: 'menu',

              })

            }

          }}

          className="inline-flex items-center gap-2 hover:text-foreground"

        >

          <ArrowLeft className="size-4" />



          {controllerTest

            ? 'Back to microgames'

            : 'Back to main menu'}

        </button>



        <span>

          {controllerTest

            ? 'Controller calibration checks the controls required for gameplay.'

            : 'Dev Lab bypasses the hardware ready check by design.'}

        </span>

      </div>

    </div>

  )

}