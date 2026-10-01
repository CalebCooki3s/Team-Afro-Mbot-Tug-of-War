'use client'

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { cn } from '@/lib/utils'
import { useGameInput, KEYBOARD_HINTS } from '@/lib/game/input'
import type {
  BuildCodePayload,
  BugHuntPayload,
  BubblePayload,
  ChoicePayload,
  MatchPayload,
  DodgePayload,
  TracePayload,
  BooleanPayload,
  LoopPayload,
  FunctionPayload,
  ComplexityPayload,
  LoopCountPayload,
  AlgorithmArenaPayload,
} from '@/lib/game/challenges'
import type { Difficulty,ControlInput, MicrogameProps, PlayerId, RoundResult } from '@/lib/game/types'
import { ControllerGlyph } from '../controller-glyph'

const CHOICE_INPUTS = ['cross', 'circle', 'square', 'triangle'] as const
const CHOICE_COLORS = ['var(--ps-cross)', 'var(--ps-circle)', 'var(--ps-square)', 'var(--ps-triangle)']

function CodeBlock({ code, highlightLine }: { code: string; highlightLine?: number }) {
  const lines = code.split('\n')
  return (
    <pre className="overflow-hidden rounded-2xl bg-surface/90 py-4 font-mono text-lg ring-1 ring-border">
      <code>
        {lines.map((line, i) => (
          <div
            key={i}
            className={cn(
              'flex gap-5 px-5 py-0.5 transition-colors',
              highlightLine === i && 'bg-danger/15 shadow-[inset_3px_0_0_var(--danger)]',
            )}
          >
            <span className="w-5 select-none text-right text-muted-foreground/60">{i + 1}</span>
            <span className="whitespace-pre text-foreground">{line || ' '}</span>
          </div>
        ))}
      </code>
    </pre>
  )
}

export function QuickChoiceMicrogame({ definition, mode, active, player, onResolve }: MicrogameProps<ChoicePayload>) {
  const { payload } = definition
  const [pickedBy, setPickedBy] = useState<Partial<Record<PlayerId, number>>>({})

  const choose = (index: number, answeringPlayer: PlayerId) => {
    if (!active || pickedBy[answeringPlayer] !== undefined) return
    setPickedBy((prev) => ({ ...prev, [answeringPlayer]: index }))
    const correct = index === payload.correctIndex
    onResolve({
      outcome: correct ? 'success' : 'failure',
      player: answeringPlayer,
      explanation: payload.explanation,
      correctAnswer: payload.options[payload.correctIndex],
    })
  }

  useGameInput((event) => {
    const index = CHOICE_INPUTS.indexOf(event.input as (typeof CHOICE_INPUTS)[number])
    if (index === -1) return
    const answeringPlayer = player ?? event.player
    if (!answeringPlayer) return
    choose(index, answeringPlayer)
  }, active)

  const shared = mode === 'versus' && !player

  return (
    <div className="flex flex-1 flex-col justify-center gap-6 p-8">
      <div className="mx-auto w-full max-w-5xl text-center">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">main.py</span>
        <div className="mt-3"><CodeBlock code={payload.code} /></div>
        <h3 className="mt-5 font-display text-3xl uppercase text-foreground">{payload.question}</h3>
      </div>
      <ul className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-4">
        {payload.options.map((option, i) => {
          const input = CHOICE_INPUTS[i] as ControlInput
          const color = CHOICE_COLORS[i]
          const pickedBySomeone = Object.values(pickedBy).includes(i)
          const isCorrect = i === payload.correctIndex
          return (
            <li key={`${option}-${i}`}>
              <button
                type="button"
                disabled={!active || (shared ? Object.keys(pickedBy).length >= 2 : pickedBy[player ?? 1] !== undefined)}
                onClick={() => choose(i, player ?? 1)}
                className={cn('arcade-btn flex min-h-20 w-full items-center gap-4 rounded-2xl px-4 py-5 text-left disabled:opacity-100', pickedBySomeone && 'opacity-60')}
                style={{ '--btn-color': 'var(--card)', '--btn-fg': 'var(--foreground)', boxShadow: `0 6px 0 0 color-mix(in oklch, ${color} 55%, var(--surface)), 0 0 0 2px color-mix(in oklch, ${color} 45%, transparent) inset` } as CSSProperties}
              >
                <ControllerGlyph input={input} size="md" />
                <span className="font-mono text-xl font-bold">{option}</span>
                {pickedBySomeone && <span className="ml-auto text-xs uppercase text-muted-foreground">Locked</span>}
              </button>
            </li>
          )
        })}
      </ul>
      <p className="text-center text-xs text-muted-foreground">
        {shared ? 'Both players answer the same challenge. The round resolves after both lock in.' : mode === 'solo' ? `Keyboard: ${Object.values(KEYBOARD_HINTS.p1).join(' ')} · or click a choice` : `Player ${player ?? 1}: use your controller to answer`}
      </p>
    </div>
  )
}

export function BugHuntMicrogame({ definition, mode, active, player, onResolve }: MicrogameProps<BugHuntPayload>) {
  const { payload } = definition
  const [selected, setSelected] = useState(0)
  const [found, setFound] = useState<number[]>([])
  const bugs = payload.bugIndices?.length ? payload.bugIndices : [payload.bugIndex]
  const complete = found.length === bugs.length

  const submit = (playerId: PlayerId = 1) => {
    if (!active || complete || found.includes(selected)) return
    const correct = bugs.includes(selected)
    if (!correct) {
      onResolve({
        outcome: 'failure',
        player: playerId,
        explanation: payload.explanation,
        correctAnswer: bugs.map((i) => `Line ${i + 1}`).join(', '),
      })
      return
    }

    const next = [...found, selected]
    setFound(next)
    if (next.length === bugs.length) {
      onResolve({
        outcome: 'success',
        player: playerId,
        explanation: payload.explanation,
        correctAnswer: bugs.map((i) => `Line ${i + 1}`).join(', '),
      })
    } else {
      setSelected((current) => {
        const nextLine = payload.code.findIndex((_, i) => !next.includes(i))
        return nextLine >= 0 ? nextLine : current
      })
    }
  }

  useGameInput((event) => {
    if (event.player !== (player ?? 1)) return
    if (event.input === 'up') setSelected((v) => Math.max(0, v - 1))
    if (event.input === 'down') setSelected((v) => Math.min(payload.code.length - 1, v + 1))
    if (event.input === 'cross') submit(event.player)
  }, active)

  return (
    <div className="flex flex-1 flex-col justify-center gap-5 p-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.2em] text-danger">Threat detected</p>
          <h3 className="font-display mt-1 text-3xl uppercase">{bugs.length > 1 ? 'Find every broken line' : 'Which line is broken?'}</h3>
          {bugs.length > 1 && <p className="mt-1 text-sm text-muted-foreground">Bugs found: {found.length}/{bugs.length}</p>}
        </div>
        <div className="rounded-xl bg-danger/10 px-4 py-2 font-mono text-sm text-danger">SELECT → MARK</div>
      </div>

      <div className="mx-auto w-full max-w-4xl space-y-2">
        {payload.code.map((line, i) => {
          const isSelected = selected === i
          const isFound = found.includes(i)
          return (
            <button
              key={`${line}-${i}`}
              type="button"
              disabled={!active || isFound || complete}
              onClick={() => setSelected(i)}
              className={cn(
                'flex w-full items-center gap-4 rounded-xl border-2 px-5 py-4 text-left font-mono text-lg transition-all',
                isFound
                  ? 'border-success bg-success/15 opacity-60'
                  : isSelected
                    ? 'border-accent bg-accent/10 translate-x-2 shadow-[0_0_24px_color-mix(in_oklch,var(--accent)_20%,transparent)]'
                    : 'border-border bg-surface/70 hover:border-primary/50',
              )}
            >
              <span className="w-8 text-right text-muted-foreground">{i + 1}</span>
              <span className="flex-1">{line}</span>
              {isFound && <span className="font-display text-success">FOUND</span>}
            </button>
          )
        })}
      </div>

      <button
        type="button"
        disabled={!active || complete || found.includes(selected)}
        onClick={() => submit(player ?? 1)}
        className="arcade-btn mx-auto rounded-2xl px-10 py-3 font-display uppercase"
        style={{ '--btn-color': 'var(--danger)', '--btn-fg': 'var(--on-color)' } as CSSProperties}
      >
        <ControllerGlyph input="cross" size="sm" /> {bugs.length > 1 ? 'Mark Bug' : 'Submit Line'}
      </button>
    </div>
  )
}

export function CodeBuildMicrogame({
  definition,
  mode,
  active,
  player,
  onResolve,
}: MicrogameProps<BuildCodePayload>) {
  const { payload } = definition
  const isSolo = mode === 'solo'
  const isVersus = mode === 'versus'

  type BuildPlayer = 1 | 2

  const makeBlocks = (p: BuildPlayer) => {
    if (p === 1) return payload.blocks

    // Same educational question, but shuffled differently for P2.
    const blocks = [...payload.blocks]

    for (let i = blocks.length - 1; i > 0; i--) {
      const j = (i * 7 + 3) % (i + 1)
      ;[blocks[i], blocks[j]] = [blocks[j], blocks[i]]
    }

    return blocks
  }

  const [sequences, setSequences] = useState<
    Record<BuildPlayer, number[]>
  >({
    1: [],
    2: [],
  })

  const [selectedBlocks, setSelectedBlocks] = useState<
    Record<BuildPlayer, number>
  >({
    1: 0,
    2: 0,
  })

  const [wrongPlayer, setWrongPlayer] = useState<
    BuildPlayer | null
  >(null)

  const [executingPlayer, setExecutingPlayer] =
    useState<BuildPlayer | null>(null)

  const [finished, setFinished] = useState(false)

  const resolvedRef = useRef(false)

  useEffect(() => {
    resolvedRef.current = false

    setSequences({
      1: [],
      2: [],
    })

    setSelectedBlocks({
      1: 0,
      2: 0,
    })

    setWrongPlayer(null)
    setExecutingPlayer(null)
    setFinished(false)
  }, [definition.id])

  const place = (
    index: number,
    p: BuildPlayer
  ) => {
    if (!active || finished || executingPlayer !== null) return

    const sequence = sequences[p]

    if (sequence.includes(index)) return

    const next = [...sequence, index]

    setSequences((prev) => ({
      ...prev,
      [p]: next,
    }))

    setSelectedBlocks((prev) => ({
      ...prev,
      [p]: index,
    }))

    // Still building.
    if (next.length < payload.correctOrder.length) {
      return
    }

    const correct = next.every(
      (value, i) =>
        value === payload.correctOrder[i]
    )

    if (!correct) {
      // Wrong program: shake it, explain, then allow another attempt.
      setWrongPlayer(p)

      setTimeout(() => {
        setWrongPlayer(null)

        setSequences((prev) => ({
          ...prev,
          [p]: [],
        }))

        setSelectedBlocks((prev) => ({
          ...prev,
          [p]: 0,
        }))
      }, 700)

      return
    }

    // Correct program — show execution animation.
    setExecutingPlayer(p)

    setTimeout(() => {
      if (resolvedRef.current) return

      resolvedRef.current = true
      setFinished(true)

      onResolve({
        outcome: 'success',
        player: p,
        explanation: payload.explanation,
        correctAnswer: payload.correctOrder
          .map((v) => payload.blocks[v])
          .join(' → '),
      })
    }, isSolo ? 1600 : 900)
  }

  useGameInput(
    (event) => {
      if (!active || finished || executingPlayer !== null) return

      const p = isSolo
        ? 1
        : (event.player as BuildPlayer)

      if (p !== 1 && p !== 2) return

      const sequence = sequences[p]
      const blocks = payload.blocks

      if (event.input === 'up') {
        setSelectedBlocks((prev) => ({
          ...prev,
          [p]: Math.max(
            0,
            prev[p] - 1
          ),
        }))
      }

      if (event.input === 'down') {
        setSelectedBlocks((prev) => ({
          ...prev,
          [p]: Math.min(
            blocks.length - 1,
            prev[p] + 1
          ),
        }))
      }

      if (event.input === 'cross') {
        place(
          selectedBlocks[p],
          p
        )
      }
    },
    active && !finished
  )

  const renderPlayer = (p: BuildPlayer) => {
    const sequence = sequences[p]
    const selected = selectedBlocks[p]
    const isWrong = wrongPlayer === p
    const isExecuting = executingPlayer === p

    return (
      <div
        className={cn(
          'flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-4 transition-all',
          isWrong && 'animate-shake',
          isExecuting && 'ring-2 ring-accent/40'
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-xs uppercase tracking-[0.2em] text-primary">
              {isSolo ? 'SOLO CODE ORDER' : `PLAYER ${p}`}
            </p>

            <h3 className="font-display text-xl uppercase">
              Build the Program
            </h3>
          </div>

          <div className="text-right">
            <div className="font-display text-lg">
              {sequence.length}/
              {payload.correctOrder.length}
            </div>

            <div className="text-[10px] uppercase text-muted-foreground">
              lines placed
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="flex gap-1.5">
          {payload.correctOrder.map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-2 flex-1 rounded-full transition-all duration-300',
                i < sequence.length
                  ? 'bg-accent'
                  : 'bg-muted'
              )}
            />
          ))}
        </div>

        {/* Program slots */}
        <div className="rounded-2xl border-2 border-border bg-card/60 p-2">
          <div className="mb-2 font-display text-[10px] uppercase tracking-wider text-muted-foreground">
            Program execution order
          </div>

          <div className="space-y-1.5">
            {payload.correctOrder.map((_, position) => {
              const blockIndex = sequence[position]
              const block =
                blockIndex !== undefined
                  ? payload.blocks[blockIndex]
                  : null

              return (
                <div
                  key={position}
                  className={cn(
                    'flex min-h-9 items-center gap-2 rounded-xl border px-3 py-1.5 font-mono text-xs transition-all duration-300',
                    block
                      ? 'border-accent/60 bg-accent/10'
                      : 'border-dashed border-border bg-background/40'
                  )}
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 font-display text-[10px] text-primary">
                    {position + 1}
                  </span>

                  {block ? (
                    <code>{block}</code>
                  ) : (
                    <span className="text-muted-foreground">
                      DROP CODE HERE
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Status */}
        {isExecuting ? (
          <div className="rounded-xl border-2 border-accent bg-accent/10 p-3 text-center">
            <p className="font-display text-sm uppercase text-accent">
              CODE EXECUTING...
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Program order is correct.
            </p>
          </div>
        ) : isWrong ? (
          <div className="rounded-xl border-2 border-destructive bg-destructive/10 p-3 text-center">
            <p className="font-display text-sm uppercase text-destructive">
              SYNTAX FLOW ERROR
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              That order does not produce the required program.
              Try again.
            </p>
          </div>
        ) : (
          <p className="text-center text-xs text-muted-foreground">
            Select the code blocks in the order they should execute.
          </p>
        )}

        {/* Available blocks */}
        <div className="grid min-h-0 flex-1 gap-1.5 overflow-y-auto pr-1">
          {payload.blocks.map((block, i) => {
            const used = sequence.includes(i)
            const position = sequence.indexOf(i)

            return (
              <button
                key={`${block}-${i}`}
                type="button"
                disabled={
                  !active ||
                  used ||
                  isExecuting ||
                  finished
                }
                onClick={() => place(i, p)}
                className={cn(
                 'group flex items-center gap-3 rounded-xl border-2 px-4 py-2 text-left font-mono transition-all duration-200',
                  used
                    ? 'border-success/40 bg-success/5 opacity-40'
                    : selected === i
                      ? 'border-accent bg-accent/10 -translate-y-1 ring-2 ring-accent/20'
                      : 'border-border bg-surface/70 hover:-translate-y-1 hover:border-primary',
                  isWrong &&
                    !used &&
                    'animate-pulse'
                )}
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-display text-xs text-primary">
                  {used
                    ? position + 1
                    : i + 1}
                </span>

                <code className="text-sm">
                  {block}
                </code>

                {!used && (
                  <span className="ml-auto text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                    SELECT
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  if (isSolo) {
    return (
      <div className="flex flex-1 flex-col justify-center px-6 pb-6 pt-10">
        <div className="mx-auto w-full max-w-4xl">
          {renderPlayer(1)}
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-border px-5 pb-3 pt-6 text-center">
        <p className="font-display text-xs uppercase tracking-[0.2em] text-primary">
          CODE ORDER
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          First player to correctly assemble the program wins.
        </p>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-2 divide-x divide-border overflow-hidden">
        {renderPlayer(1)}
        {renderPlayer(2)}
      </div>
    </div>
  )
}





export function BubbleBlitzMicrogame({
  definition,
  mode,
  active,
  player,
  onResolve,
}: MicrogameProps<BubblePayload>) {
  const { payload } = definition

  const [pickedBy, setPickedBy] =
    useState<Partial<Record<PlayerId, number>>>({})
  const [aim, setAim] =
    useState<Partial<Record<PlayerId, number>>>({ 1: 0, 2: 0 })
  const [popping, setPopping] = useState<number | null>(null)
  const [poppedBubbles, setPoppedBubbles] = useState<Set<number>>(new Set())

  useEffect(() => {
  setPickedBy({})
  setAim({ 1: 0, 2: 0 })
  setPopping(null)
  setPoppedBubbles(new Set())
}, [definition])

  const shared = mode === 'versus' && !player

  const positions = useMemo(() => {
    const count = payload.bubbles.length

    const sizeRange =
      count <= 4
        ? { min: 125, max: 150 }
        : count <= 8
          ? { min: 95, max: 120 }
          : count <= 12
            ? { min: 72, max: 92 }
            : { min: 58, max: 76 }

    const generated: Array<{
      x: number
      y: number
      size: number
    }> = []

    for (let i = 0; i < count; i++) {
      let placed = false

      for (let attempt = 0; attempt < 300 && !placed; attempt++) {
        const size =
          sizeRange.min +
          Math.floor(
            Math.random() *
              (sizeRange.max - sizeRange.min + 1)
          )

        const radiusPercent = (size / 2 / 800) * 100
        const padding = radiusPercent + 4

        const x =
          padding +
          Math.random() * Math.max(1, 100 - padding * 2)

        const y =
          padding +
          Math.random() * Math.max(1, 100 - padding * 2)

        const overlaps = generated.some((other) => {
          const dx = ((x - other.x) / 100) * 800
          const dy = ((y - other.y) / 100) * 800
          const distance = Math.sqrt(dx * dx + dy * dy)

          return (
            distance <
            size / 2 + other.size / 2 + 14
          )
        })

        if (!overlaps) {
          generated.push({ x, y, size })
          placed = true
        }
      }

      if (!placed) {
        generated.push({
          x: 8 + Math.random() * 84,
          y: 8 + Math.random() * 84,
          size: sizeRange.min,
        })
      }
    }

    return generated
  }, [payload.bubbles])

  const pop = (
  index: number,
  answeringPlayer: PlayerId
) => {
  if (
    !active ||
    pickedBy[answeringPlayer] !== undefined ||
    popping !== null ||
    poppedBubbles.has(index)
  ) {
    return
  }

  setPopping(index)

  const correct = index === payload.correctIndex

  window.setTimeout(() => {
    // Permanently hide this bubble
    setPoppedBubbles((prev) => {
      const next = new Set(prev)
      next.add(index)
      return next
    })

    setPickedBy((prev) => ({
      ...prev,
      [answeringPlayer]: index,
    }))

    window.setTimeout(() => {
      setPopping(null)

      onResolve({
        outcome: correct ? 'success' : 'failure',
        player: answeringPlayer,
        explanation: payload.explanation,
        correctAnswer:
          payload.bubbles[payload.correctIndex],
      })
    }, 100)
  }, 420)
}

  useGameInput(
    (event) => {
      const answeringPlayer =
        player ?? event.player

      if (!answeringPlayer) return

      if (event.input === 'left') {
        setAim((prev) => ({
          ...prev,
          [answeringPlayer]:
            ((prev[answeringPlayer] ?? 0) +
              payload.bubbles.length -
              1) %
            payload.bubbles.length,
        }))
      }

      if (event.input === 'right') {
        setAim((prev) => ({
          ...prev,
          [answeringPlayer]:
            ((prev[answeringPlayer] ?? 0) + 1) %
            payload.bubbles.length,
        }))
      }

      if (event.input === 'cross') {
        pop(
          aim[answeringPlayer] ?? 0,
          answeringPlayer
        )
      }
    },
    active
  )

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden p-5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,color-mix(in_oklch,var(--primary)_12%,transparent),transparent_55%)]" />

      <div className="relative z-10 mx-auto w-[min(92%,800px)] rounded-full bg-card/90 px-5 py-3 text-center shadow-lg ring-1 ring-border">
        <p className="font-display text-sm uppercase text-accent">
          {payload.prompt}
        </p>

        <code className="mt-1 block whitespace-pre-wrap text-xs text-muted-foreground">
          {payload.code ?? ''}
        </code>
      </div>

      <div
        className="relative z-10 mx-auto mt-4 aspect-square w-full max-w-4xl overflow-hidden rounded-[2rem] border border-border/70 bg-surface/45 ring-1 ring-primary/10"
        style={{ cursor: 'crosshair' }}
      >
        {payload.bubbles.map((bubble, i) => {
          const isPicked =
            Object.values(pickedBy).includes(i)

          const isCorrect =
            i === payload.correctIndex

          const position = positions[i]!

          const isAimed =
            !isPicked &&
            ((aim[1] === i && player !== 2) ||
              (aim[2] === i && player === 2))

          const isPopping = popping === i
          if (poppedBubbles.has(i)) return null

          return (
            <div
              key={`${bubble}-${i}`}
              className="absolute"
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                width: position.size,
                height: position.size,
                transform:
                  'translate(-50%, -50%)',
              }}
            >
              <button
                type="button"
                disabled={
                  !active ||
                  popping !== null ||
                  (shared
                    ? Object.keys(pickedBy).length >= 2
                    : pickedBy[player ?? 1] !==
                      undefined)
                }
                onClick={() =>
                  pop(i, player ?? 1)
                }
                className={cn(
                  'absolute inset-0 flex items-center justify-center rounded-full border-4 font-display transition-all duration-300',
                  'hover:scale-110 hover:brightness-125',
                  isAimed &&
                    'ring-4 ring-primary/70 ring-offset-2',
                  isPopping &&
                    'scale-[1.35] opacity-0',
                  !isPicked &&
                    !isPopping &&
                    'animate-float bg-primary/15 text-foreground backdrop-blur-sm',
                  isPicked &&
                    (isCorrect
                      ? 'bg-success text-on-color'
                      : 'bg-danger text-on-color')
                )}
                style={{
                  fontSize: Math.max(
                    12,
                    Math.round(
                      position.size * 0.18
                    )
                  ),
                  borderColor: isPicked
                    ? isCorrect
                      ? 'var(--success)'
                      : 'var(--danger)'
                    : 'var(--primary)',
                }}
              >
                {bubble}
              </button>
              {isPopping && (
                <span className="pointer-events-none absolute inset-[-10px] rounded-full border-4 border-white animate-ping" />
              )}
            </div>
          )
        })}
      </div>

      <div className="relative z-10 mx-auto mt-3 rounded-full bg-card/90 px-4 py-2 text-xs text-muted-foreground">
        <ControllerGlyph
          input="lstick"
          size="sm"
        />
        Aim with ← →
        &nbsp;
        <ControllerGlyph
          input="cross"
          size="sm"
        />
        Pop
        &nbsp;•&nbsp;
        Mouse: click a bubble
      </div>
    </div>
  )
}

export function MatchPairsMicrogame({ definition, active, player, onResolve }: MicrogameProps<MatchPayload>) {
  const { payload } = definition
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null)
  const [selectedRight, setSelectedRight] = useState<number | null>(null)
  const [matched, setMatched] = useState<number[]>([])
  const [mistakes, setMistakes] = useState(0)
  const [attemptKey, setAttemptKey] = useState(0)
  const maxMistakes = 5

  const recordMistake = (playerId: PlayerId, timedOut = false) => {
    if (!active || mistakes >= maxMistakes) return
    const nextMistakes = mistakes + 1
    setMistakes(nextMistakes)
    setSelectedLeft(null)
    setSelectedRight(null)
    setAttemptKey((value) => value + 1)
    if (nextMistakes >= maxMistakes) {
      onResolve({
        outcome: 'failure',
        player: playerId,
        explanation: timedOut
          ? `You ran out of time too many times. You used all ${maxMistakes} mistakes. ${payload.explanation}`
          : `You used all ${maxMistakes} mistakes. ${payload.explanation}`,
        correctAnswer: 'Match every item correctly.',
      })
    }
  }

  const chooseRight = (rightIndex: number, playerId: PlayerId = 1) => {
    if (!active || selectedLeft === null || matched.includes(selectedLeft)) return
    const correct = payload.pairs[selectedLeft] === rightIndex
    if (!correct) {
      recordMistake(playerId)
      return
    }
    const next = [...matched, selectedLeft]
    setMatched(next)
    setSelectedRight(null)
    setSelectedLeft(null)
    if (next.length === payload.left.length) onResolve({ outcome: 'success', player: playerId, explanation: payload.explanation, correctAnswer: 'All pairs matched.' })
  }

  const attemptDurationMs = Math.max(7000, Math.min(12000, definition.timeLimit * 1000))
  const attemptRemaining = useQuestionCountdown(
    active,
    attemptDurationMs,
    `${definition.id}-${attemptKey}`,
    () => recordMistake(player ?? 1, true),
  )

  useGameInput((event) => {
    if (event.player !== (player ?? 1)) return
    if (event.input === 'up' || event.input === 'down') {
      setSelectedLeft((current) => {
        let next = current === null ? 0 : current + (event.input === 'down' ? 1 : -1)
        next = (next + payload.left.length) % payload.left.length
        for (let i = 0; i < payload.left.length && matched.includes(next); i += 1) {
          next = (next + (event.input === 'down' ? 1 : -1) + payload.left.length) % payload.left.length
        }
        setSelectedRight(null)
        return next
      })
    }
    if ((event.input === 'left' || event.input === 'right') && selectedLeft !== null) {
      setSelectedRight((current) => {
        const base = current === null ? (event.input === 'right' ? -1 : 0) : current
        return event.input === 'right' ? (base + 1) % payload.right.length : (base + payload.right.length - 1) % payload.right.length
      })
    }
    if (event.input === 'cross' && selectedLeft !== null && selectedRight !== null) chooseRight(selectedRight, event.player)
  }, active)

  const remainingSeconds = Math.ceil(attemptRemaining / 1000)

  return (
    <div className="grid flex-1 grid-cols-2 gap-8 p-8">
      <div className="col-span-2 flex items-center justify-between rounded-2xl border border-border bg-surface/60 px-5 py-3">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.2em] text-accent">Match Attack</p>
          <p className="text-xs text-muted-foreground">Wrong match or timer expiry costs one mistake. You get five.</p>
        </div>
        <div className="text-right">
          <p className="font-display text-xs uppercase tracking-[0.16em] text-muted-foreground">Mistakes</p>
          <div className="mt-1 flex gap-1.5" aria-label={`${mistakes} of ${maxMistakes} mistakes used`}>
            {Array.from({ length: maxMistakes }, (_, i) => <span key={i} className={cn('h-3 w-8 rounded-full border', i < mistakes ? 'border-danger bg-danger' : 'border-border bg-background/40')} />)}
          </div>
          <p className="mt-1 font-mono text-xs text-muted-foreground">{remainingSeconds}s this attempt</p>
        </div>
      </div>

      <div className="space-y-3">
        <p className="font-display text-xs uppercase tracking-[0.2em] text-primary">Concepts</p>
        {payload.left.map((item, i) => (
          <button key={item} type="button" disabled={!active || matched.includes(i)} onClick={() => { if (!active || matched.includes(i)) return; setSelectedLeft(i); setSelectedRight(null) }} className={cn('flex w-full items-center justify-between rounded-2xl border-2 px-5 py-5 font-mono transition-all', matched.includes(i) && 'border-success bg-success/10 opacity-50', selectedLeft === i && !matched.includes(i) ? 'border-accent bg-accent/10 -translate-x-1 ring-2 ring-accent/20' : 'border-border bg-surface/70')}>
            <span>{item}</span>{matched.includes(i) && <span className="font-display text-success">✓</span>}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        <p className="font-display text-xs uppercase tracking-[0.2em] text-secondary">{selectedLeft === null ? 'Select a concept first' : 'Choose its match'}</p>
        {payload.right.map((item, i) => {
          const isMatched = matched.includes(payload.pairs.indexOf(i))
          return <button key={item} type="button" disabled={!active || selectedLeft === null || isMatched} onClick={() => { setSelectedRight(i); chooseRight(i, player ?? 1) }} className={cn('flex w-full rounded-2xl border-2 px-5 py-5 font-mono transition-all', isMatched && 'border-success bg-success/10 opacity-50', selectedRight === i && selectedLeft !== null && !isMatched ? 'border-accent bg-accent/10 translate-x-1 ring-2 ring-accent/20' : 'border-border bg-surface/70 hover:translate-x-1 hover:border-secondary')}>{item}</button>
        })}
      </div>
    </div>
  )
}

export function DodgeCodeMicrogame({ definition, active, player, onResolve }: MicrogameProps<DodgePayload>) {
  const { payload } = definition
  const [lane, setLane] = useState(1)
  const [locked, setLocked] = useState(false)
  const move = (delta: number) => setLane((v) => Math.max(0, Math.min(2, v + delta)))
  const submit = () => {
    if (!active || locked) return
    setLocked(true)
    const correct = lane === payload.safeIndex
    onResolve({ outcome: correct ? 'success' : 'failure', player: player ?? 1, explanation: payload.explanation, correctAnswer: payload.lanes[payload.safeIndex] })
  }
  useGameInput((event) => {
    if (event.player !== (player ?? 1)) return
    if (event.input === 'left') move(-1)
    if (event.input === 'right') move(1)
    if (event.input === 'cross') submit()
  }, active)
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <CodeBlock code={payload.code} />
      <div className="grid w-full max-w-3xl grid-cols-3 gap-4">
        {payload.lanes.map((name, i) => (
          <button key={name} type="button" disabled={!active || locked} onClick={() => setLane(i)} className={cn('h-32 rounded-3xl border-4 font-display text-2xl uppercase transition-all', lane === i ? 'border-accent bg-accent/15 -translate-y-2 shadow-lg' : 'border-border bg-surface/70 hover:border-primary')}>
            {name}
          </button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground"><ControllerGlyph input="lstick" size="sm" /> Move lanes · <ControllerGlyph input="cross" size="sm" /> Lock</p>
    </div>
  )
}
export function TraceRaceMicrogame({
  definition,
  active,
  player,
  mode,
  onResolve,
}: MicrogameProps<TracePayload>) {
  const isSolo = mode === 'solo'
  const isVersus = mode === 'versus' && !player
  type TracePlayer = 1 | 2

  const makeQuestion = (p: 1 | 2, index: number): TracePayload => {
    const n = index + p

    const bank: TracePayload[] = [
      {
        code: `x = ${2 + (n % 4)}
for i in range(3):
    x += i
print(x)`,
        steps: [
          `${2 + (n % 4)}`,
          `${3 + (n % 4)}`,
          `${5 + (n % 4)}`,
          `${7 + (n % 4)}`,
        ],
        correctIndex: 3,
        explanation: 'range(3) adds 0, then 1, then 2.',
      },
      {
        code: `x = ${4 + (n % 5)}
for i in range(2):
    x += 2
print(x)`,
        steps: [
          `${4 + (n % 5)}`,
          `${6 + (n % 5)}`,
          `${8 + (n % 5)}`,
          `${10 + (n % 5)}`,
        ],
        correctIndex: 2,
        explanation: 'The loop runs twice and adds 2 each time.',
      },
      {
        code: `value = ${2 + (n % 3)}
for i in range(3):
    value *= 2
print(value)`,
        steps: [
          `${2 + (n % 3)}`,
          `${4 + (n % 3)}`,
          `${8 + (n % 3)}`,
          `${16 + (n % 3)}`,
        ],
        correctIndex: 3,
        explanation: 'The value is doubled three times.',
      },
      {
        code: `x = ${8 + (n % 5)}
if x > 10:
    x -= 3
else:
    x += 2
print(x)`,
        steps: [
          `${5 + (n % 5)}`,
          `${7 + (n % 5)}`,
          `${8 + (n % 5)}`,
          `${10 + (n % 5)}`,
        ],
        correctIndex: 0,
        explanation: 'If x is greater than 10, subtract 3. Otherwise add 2.',
      },
      {
        code: `def step(x):
    return x + 4

value = ${1 + (n % 5)}
value = step(value)
print(value)`,
        steps: [
          `${2 + (n % 5)}`,
          `${4 + (n % 5)}`,
          `${5 + (n % 5)}`,
          `${7 + (n % 5)}`,
        ],
        correctIndex: 3,
        explanation: 'step adds 4 to the starting value.',
      },
      {
        code: `x = ${10 + (n % 5)}
for i in range(3):
    x -= 1
print(x)`,
        steps: [
          `${7 + (n % 5)}`,
          `${8 + (n % 5)}`,
          `${9 + (n % 5)}`,
          `${10 + (n % 5)}`,
        ],
        correctIndex: 0,
        explanation: 'The loop subtracts 1 three times.',
      },
      {
        code: `total = 0
for i in range(${3 + (n % 3)}):
    total += i
print(total)`,
        steps: ['3', '5', '6', '10'],
        correctIndex: 2,
        explanation: 'The loop adds each value produced by range.',
      },
      {
        code: `x = ${6 + (n % 6)}
if x % 2 == 0:
    x //= 2
else:
    x += 3
print(x)`,
        steps: [
          `${3 + Math.floor(n / 2)}`,
          `${4 + (n % 4)}`,
          `${6 + (n % 6)}`,
          `${9 + (n % 3)}`,
        ],
        correctIndex: 0,
        explanation: 'An even value is divided by 2 using integer division.',
      },
    ]

    return bank[index % bank.length]
  }

  // ------------------------------------------------------------
  // SOLO: POWER THE ROBOT BATTERY
  // ------------------------------------------------------------

  const [soloQuestionIndex, setSoloQuestionIndex] = useState(0)
  const [soloQuestion, setSoloQuestion] = useState(() =>
    makeQuestion(1, 0)
  )
  const [soloSelected, setSoloSelected] = useState(0)
  const [soloLocked, setSoloLocked] = useState(false)
  const [battery, setBattery] = useState(0)
  const [soloFinished, setSoloFinished] = useState(false)

  // ------------------------------------------------------------
  // VERSUS: LIVE ROBOT RACE
  // ------------------------------------------------------------

  const [questionIndex, setQuestionIndex] = useState<
  Record<TracePlayer, number>
>({
  1: 0,
  2: 0,
})

const [questions, setQuestions] = useState<
  Record<TracePlayer, TracePayload>
>({
  1: makeQuestion(1, 0),
  2: makeQuestion(2, 0),
})

const [selected, setSelected] = useState<
  Record<TracePlayer, number>
>({
  1: 0,
  2: 0,
})

const [locked, setLocked] = useState<
  Record<TracePlayer, boolean>
>({
  1: false,
  2: false,
})

const [scores, setScores] = useState<
  Record<TracePlayer, number>
>({
  1: 0,
  2: 0,
})
  const [robotPosition, setRobotPosition] = useState(50)
  const [finished, setFinished] = useState(false)

  const resolvedRef = useRef(false)

  // Reset whenever a new microgame starts.
  useEffect(() => {
    resolvedRef.current = false

    setSoloQuestionIndex(0)
    setSoloQuestion(makeQuestion(1, 0))
    setSoloSelected(0)
    setSoloLocked(false)
    setBattery(0)
    setSoloFinished(false)

    setQuestionIndex({
      1: 0,
      2: 0,
    })

    setQuestions({
      1: makeQuestion(1, 0),
      2: makeQuestion(2, 0),
    })

    setSelected({
      1: 0,
      2: 0,
    })

    setLocked({
      1: false,
      2: false,
    })

    setScores({
      1: 0,
      2: 0,
    })

    setRobotPosition(50)
    setFinished(false)
  }, [definition.id])

  // ------------------------------------------------------------
  // SOLO ANSWER
  // ------------------------------------------------------------

  const answerSolo = (answerIndex: number) => {
    if (!active || soloLocked || soloFinished) return

    const correct = answerIndex === soloQuestion.correctIndex

    setSoloSelected(answerIndex)
    setSoloLocked(true)

    if (correct) {
      const newBattery = Math.min(100, battery + 25)
      setBattery(newBattery)

      if (newBattery >= 100) {
        setTimeout(() => {
  if (resolvedRef.current) return

  resolvedRef.current = true
  setSoloFinished(true)

  onResolve({
    outcome: 'success',
    player: 1,
    explanation: 'The robot battery reached 100%.',
    correctAnswer: '100% battery',
  })
}, 1800)
        return
      }
    }

    // Wrong or correct under 100% = next question.
    setTimeout(() => {
      if (resolvedRef.current) return

      const next = soloQuestionIndex + 1

      setSoloQuestionIndex(next)
      setSoloQuestion(makeQuestion(1, next))
      setSoloSelected(0)
      setSoloLocked(false)
    }, 350)
  }

  // ------------------------------------------------------------
  // VERSUS ANSWER
  // ------------------------------------------------------------

  const answerVersus = (p: 1 | 2, answerIndex: number) => {
    if (!active || locked[p] || finished) return

    const question = questions[p]
    const correct = answerIndex === question.correctIndex

    setSelected((prev) => ({
      ...prev,
      [p]: answerIndex,
    }))

    setLocked((prev) => ({
      ...prev,
      [p]: true,
    }))

    if (correct) {
      const newScore = scores[p] + 1

      setScores((prev) => ({
        ...prev,
        [p]: newScore,
      }))

      // Each correct answer moves the robot one space.
      setRobotPosition((position) =>
        p === 1
          ? Math.max(0, position - 12.5)
          : Math.min(100, position + 12.5)
      )

      // Four correct answers wins.
      if (newScore >= 4) {
        setTimeout(() => {
          if (resolvedRef.current) return

          resolvedRef.current = true
          setFinished(true)

          const loser = p === 1 ? 2 : 1

          onResolve({
            outcome: 'success',
            player: p,
            explanation: `Player ${p} reached 4 correct answers.`,
            correctAnswer: '4 correct answers',
          })

          onResolve({
            outcome: 'failure',
            player: loser,
            explanation: `Player ${p} reached 4 correct answers first.`,
            correctAnswer: '4 correct answers',
          })
        }, 350)

        return
      }
    }

    // WRONG = no movement, no loss, new question.
    setTimeout(() => {
      if (resolvedRef.current) return

      const next = questionIndex[p] + 1

      setQuestionIndex((prev) => ({
        ...prev,
        [p]: next,
      }))

      setQuestions((prev) => ({
        ...prev,
        [p]: makeQuestion(p, next),
      }))

      setSelected((prev) => ({
        ...prev,
        [p]: 0,
      }))

      setLocked((prev) => ({
        ...prev,
        [p]: false,
      }))
    }, 350)
  }

  // ------------------------------------------------------------
  // CONTROLLER INPUT
  // ------------------------------------------------------------

  useGameInput(
    (event) => {
      if (!active) return

      if (isSolo) {
        if (event.player !== 1) return

        if (event.input === 'up') {
          setSoloSelected((v) =>
            Math.max(0, v - 1)
          )
        }

        if (event.input === 'down') {
          setSoloSelected((v) =>
            Math.min(
              soloQuestion.steps.length - 1,
              v + 1
            )
          )
        }

        if (event.input === 'cross') {
          answerSolo(soloSelected)
        }

        return
      }

      if (!isVersus) return

      const p = event.player as TracePlayer

      if (p !== 1 && p !== 2) return

      if (event.input === 'up') {
        setSelected((prev) => ({
          ...prev,
          [p]: Math.max(0, prev[p] - 1),
        }))
      }

      if (event.input === 'down') {
        setSelected((prev) => ({
          ...prev,
          [p]: Math.min(
            questions[p].steps.length - 1,
            prev[p] + 1
          ),
        }))
      }

      if (event.input === 'cross') {
        answerVersus(p, selected[p])
      }
    },
    active && !finished && !soloFinished
  )

  // ------------------------------------------------------------
  // PC KEYBOARD
  // ------------------------------------------------------------

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!active) return

      if (isSolo) {
        const keys = ['1', '2', '3', '4']
        const index = keys.indexOf(event.key)

        if (index !== -1) {
          event.preventDefault()
          answerSolo(index)
        }

        return
      }

      if (!isVersus || finished) return

      const p1Keys = ['1', '2', '3', '4']
      const p2Keys = ['7', '8', '9', '0']

      const p1Index = p1Keys.indexOf(event.key)
      const p2Index = p2Keys.indexOf(event.key)

      if (p1Index !== -1) {
        event.preventDefault()
        answerVersus(1, p1Index)
      }

      if (p2Index !== -1) {
        event.preventDefault()
        answerVersus(2, p2Index)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [
    active,
    isSolo,
    isVersus,
    finished,
    soloFinished,
    soloSelected,
    soloQuestion,
    soloLocked,
    battery,
    questions,
    selected,
    locked,
    questionIndex,
  ])

  // ------------------------------------------------------------
  // SOLO UI
  // ------------------------------------------------------------

  if (isSolo) {
    return (
      <div className="flex flex-1 flex-col justify-center gap-6 p-8">
        <div className="text-center">
          <p className="font-display text-xs uppercase tracking-[0.2em] text-primary">
            TRACE RACE
          </p>

          <h3 className="mt-1 font-display text-3xl uppercase">
            POWER THE ROBOT
          </h3>

          <p className="mt-2 text-sm text-muted-foreground">
            Trace the code and charge the battery.
          </p>
        </div>

        {/* ROBOT */}
        <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-3xl border-2 border-border bg-card/70 text-6xl">
          {battery >= 100 ? '🤖' : '🔋'}
        </div>

        {/* BATTERY */}
        <div className="mx-auto w-full max-w-2xl">
          <div className="mb-2 flex justify-between font-display text-sm uppercase">
            <span>ROBOT BATTERY</span>
            <span>{battery}%</span>
          </div>

          <div className="h-8 overflow-hidden rounded-full border-2 border-border bg-muted">
            <div
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${battery}%` }}
            />
          </div>
        </div>

        {battery >= 100 ? (
          <div className="text-center font-display text-2xl uppercase text-accent">
            ROBOT ONLINE
          </div>
        ) : (
          <>
            <div className="mx-auto w-full max-w-3xl">
              <CodeBlock code={soloQuestion.code} />
            </div>

            <div className="mx-auto grid w-full max-w-3xl grid-cols-2 gap-3">
              {soloQuestion.steps.map((step, i) => (
                <button
                  key={`${step}-${i}`}
                  type="button"
                  disabled={!active || soloLocked || soloFinished}
                  onClick={() => answerSolo(i)}
                  className={cn(
                    'rounded-2xl border-2 p-5 text-left font-mono text-xl transition-all',
                    soloSelected === i
                      ? 'border-accent bg-accent/10 -translate-y-1'
                      : 'border-border bg-surface/70 hover:border-primary',
                    soloLocked && 'cursor-not-allowed opacity-70'
                  )}
                >
                  <span className="mr-2 font-display">
                    {i + 1}.
                  </span>

                  {step}
                </button>
              ))}
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Question {soloQuestionIndex + 1} · Wrong answers do not
              end the run
            </p>
          </>
        )}
      </div>
    )
  }

  // ------------------------------------------------------------
  // VERSUS UI
  // ------------------------------------------------------------

  return (
    <div className="flex h-full flex-1 flex-col gap-4 p-4">
      <div className="rounded-2xl border-2 border-border bg-card/70 p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-display text-xs uppercase">
            TRACE RACE
          </span>

          <span className="font-display text-xs uppercase">
            FIRST TO 4 CORRECT
          </span>
        </div>

        <div className="relative h-14">
          <div className="absolute left-0 right-0 top-1/2 h-3 -translate-y-1/2 rounded-full bg-muted" />

          <span className="absolute left-0 top-1/2 -translate-y-1/2 font-display text-xs">
            P1
          </span>

          <span className="absolute right-0 top-1/2 -translate-y-1/2 font-display text-xs">
            P2
          </span>

          <div
            className="absolute top-1/2 z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-primary bg-background text-xl shadow-lg transition-all duration-300"
            style={{
              left: `${robotPosition}%`,
            }}
          >
            🤖
          </div>
        </div>

        <div className="flex justify-between font-display text-xs">
          <span>{scores[1]} CORRECT</span>
          <span>{scores[2]} CORRECT</span>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-2 divide-x divide-border/70">
        {([1, 2] as TracePlayer[]).map((p) => {
          const question = questions[p]

          return (
            <div key={p} className="min-w-0 p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="font-display text-sm uppercase">
                    PLAYER {p}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Question {questionIndex[p] + 1}
                  </div>
                </div>

                <div className="font-display text-xl">
                  {scores[p]} CORRECT
                </div>
              </div>

              <CodeBlock code={question.code} />

              <div className="mt-4 grid grid-cols-2 gap-3">
                {question.steps.map((step, i) => (
                  <button
                    key={`${step}-${i}`}
                    type="button"
                    disabled={!active || locked[p] || finished}
                    onClick={() => answerVersus(p, i)}
                    className={cn(
                      'rounded-xl border-2 p-4 text-left font-mono transition-all',
                      selected[p] === i
                        ? 'border-accent bg-accent/10 -translate-y-1'
                        : 'border-border bg-surface/70 hover:border-primary',
                      locked[p] && 'cursor-not-allowed opacity-70'
                    )}
                  >
                    <span className="mr-2 font-display">
                      {i + 1}.
                    </span>

                    {step}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
function LearningChoiceButtons({ options, active, selected, correctIndex, onChoose }: { options: string[]; active: boolean; selected: number | null; correctIndex: number; onChoose: (index: number) => void }) {
  return (
    <div className="mx-auto grid w-full max-w-4xl grid-cols-2 gap-4">
      {options.map((option, i) => (
        <button key={`${option}-${i}`} type="button" disabled={!active || selected !== null} onClick={() => onChoose(i)} className={cn('arcade-btn min-h-24 rounded-2xl px-5 py-4 text-left font-mono text-xl', selected === i && (i === correctIndex ? 'ring-4 ring-success' : 'ring-4 ring-danger'), selected !== null && i === correctIndex && 'ring-2 ring-success')}>
          <ControllerGlyph input={CHOICE_INPUTS[i]} size="md" /> <span className="ml-3">{option}</span>
        </button>
      ))}
    </div>
  )
}

function useLearningChoice<T extends { options: string[]; correctIndex: number; explanation: string }>(payload: T, active: boolean, player: PlayerId | undefined, onResolve: (result: RoundResult) => void) {
  const [selected, setSelected] = useState<number | null>(null)
  const choose = (index: number, answeringPlayer: PlayerId = player ?? 1) => {
    if (!active || selected !== null) return
    setSelected(index)
    const correct = index === payload.correctIndex
    onResolve({ outcome: correct ? 'success' : 'failure', player: answeringPlayer, explanation: payload.explanation, correctAnswer: payload.options[payload.correctIndex] })
  }
  useGameInput((event) => {
    if (event.player !== (player ?? 1)) return
    const index = CHOICE_INPUTS.indexOf(event.input as (typeof CHOICE_INPUTS)[number])
    if (index >= 0) choose(index, event.player)
  }, active)
  return { selected, choose }
}

function useQuestionCountdown(active: boolean, durationMs: number, keyValue: string, onComplete: () => void) {
  const [remaining, setRemaining] = useState(durationMs)
  const remainingRef = useRef(durationMs)
  const doneRef = useRef(false)
  const onCompleteRef = useRef(onComplete)
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])
  useEffect(() => {
    remainingRef.current = durationMs
    setRemaining(durationMs)
    doneRef.current = false
  }, [durationMs, keyValue])
  useEffect(() => {
    if (!active || doneRef.current) return
    let last = performance.now()
    let frame = 0
    const tick = (now: number) => {
      remainingRef.current = Math.max(0, remainingRef.current - (now - last))
      last = now
      setRemaining(remainingRef.current)
      if (remainingRef.current <= 0) {
        doneRef.current = true
        onCompleteRef.current()
        return
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [active, keyValue, durationMs])
  return remaining
}

export function LoopCountMicrogame({
  definition,
  mode,
  active,
  player,
  onResolve,
}: MicrogameProps<LoopCountPayload>) {
  const { payload } = definition
  const shared = mode === 'versus' && !player

  const [counts, setCounts] = useState<Partial<Record<PlayerId, number>>>({
    1: 0,
    2: 0,
  })

  const [locked, setLocked] = useState<Partial<Record<PlayerId, boolean>>>({})
  const [revealed, setRevealed] = useState(false)
  const [pulse, setPulse] = useState<Partial<Record<PlayerId, number>>>({
    1: 0,
    2: 0,
  })

  const resolvedRef = useRef(false)

  const changeCount = (p: PlayerId, amount: number) => {
    if (!active || locked[p] || resolvedRef.current) return

    setCounts((prev) => ({
      ...prev,
      [p]: Math.max(0, (prev[p] ?? 0) + amount),
    }))

    setPulse((prev) => ({
      ...prev,
      [p]: (prev[p] ?? 0) + 1,
    }))
  }

  const lockAnswer = (p: PlayerId) => {
    if (!active || locked[p] || resolvedRef.current) return

    const newLocked = {
      ...locked,
      [p]: true,
    }

    setLocked(newLocked)

    if (shared) {
      const otherPlayer: PlayerId = p === 1 ? 2 : 1

      if (newLocked[otherPlayer]) {
        setRevealed(true)

        window.setTimeout(() => {
          if (resolvedRef.current) return
          resolvedRef.current = true

          const resultFor = (playerId: PlayerId): RoundResult => {
            const count = counts[playerId] ?? 0
            const correct = count === payload.answer

            return {
              outcome: correct ? 'success' : 'failure',
              player: playerId,
              explanation: payload.explanation,
              correctAnswer: String(payload.answer),
            }
          }

          onResolve(resultFor(1))
          onResolve(resultFor(2))
        }, 700)
      }
    } else {
      setRevealed(true)

      window.setTimeout(() => {
        if (resolvedRef.current) return
        resolvedRef.current = true

        const count = counts[p] ?? 0
        const correct = count === payload.answer

        onResolve({
          outcome: correct ? 'success' : 'failure',
          player: p,
          explanation: payload.explanation,
          correctAnswer: String(payload.answer),
        })
      }, 700)
    }
  }

  useGameInput(
    (event) => {
      const p = player ?? event.player

      if (!p || !active || resolvedRef.current) return

      if (event.input === 'up') {
        changeCount(p, 1)
      }

      if (event.input === 'down') {
        changeCount(p, -1)
      }

      if (event.input === 'cross') {
        lockAnswer(p)
      }

      if (event.input === 'circle') {
        changeCount(p, -1)
      }
    },
    active
  )

  // PC keyboard controls
  useEffect(() => {
    if (!active) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || resolvedRef.current) return

      const p = player ?? 1

      if (event.key === ' ') {
        event.preventDefault()
        changeCount(p, 1)
      }

      if (event.key === 'Backspace') {
        event.preventDefault()
        changeCount(p, -1)
      }

      if (event.key === 'Enter') {
        event.preventDefault()
        lockAnswer(p)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [active, player, locked, counts])

  const renderPlayerBox = (p: PlayerId) => {
    const isLocked = !!locked[p]
    const value = counts[p] ?? 0
    const showValue = revealed
    const pulseKey = pulse[p] ?? 0

    return (
      <div className="flex flex-col items-center gap-3">
        <p className="font-display text-sm uppercase tracking-[0.18em] text-muted-foreground">
          PLAYER {p}
        </p>

      <div
  key={pulseKey}
  className={cn(
    'flex h-32 w-44 items-center justify-center rounded-3xl border-2 bg-card/80 transition-all',
    isLocked
      ? 'border-accent ring-2 ring-accent/30'
      : 'border-border',
    pulseKey > 0 && 'loop-count-bounce'
  )}
>
  <span className="font-display text-5xl">
    {showValue ? value : '???'}
  </span>
</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!active || isLocked}
            onClick={() => changeCount(p, -1)}
            className="arcade-btn flex size-11 items-center justify-center rounded-xl text-xl"
          >
            −
          </button>

          <button
            type="button"
            disabled={!active || isLocked}
            onClick={() => changeCount(p, 1)}
            className="arcade-btn flex size-11 items-center justify-center rounded-xl text-xl"
          >
            +
          </button>

          <button
            type="button"
            disabled={!active || isLocked}
            onClick={() => lockAnswer(p)}
            className="arcade-btn rounded-xl px-4 py-2 font-display text-sm uppercase"
          >
            Lock In
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          {isLocked ? 'LOCKED IN' : 'Adjust your answer'}
        </p>
      </div>
    )
  }

  const remaining = useQuestionCountdown(
    active && !revealed,
    definition.timeLimit * 1000,
    definition.id,
    () => {
      if (shared) {
        lockAnswer(1)
        lockAnswer(2)
      } else {
        lockAnswer(player ?? 1)
      }
    }
  )

  return (
    <div className="flex flex-1 flex-col justify-center gap-6 p-8">
      <div className="mx-auto w-full max-w-4xl text-center">
        <p className="font-display text-xs uppercase tracking-[0.22em] text-primary">
          COUNT THE LOOP
        </p>

        <h3 className="mt-2 font-display text-3xl uppercase">
          How many times does the loop execute?
        </h3>

        <p className="mt-2 text-sm text-muted-foreground">
          Study the code, adjust your answer, then lock it in.
        </p>
      </div>

      <CodeBlock code={payload.code} />

      <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-8 md:grid-cols-2">
        {shared ? (
          <>
            {renderPlayerBox(1)}
            {renderPlayerBox(2)}
          </>
        ) : (
          renderPlayerBox(player ?? 1)
        )}
      </div>

      <div className="mx-auto rounded-full bg-card/90 px-5 py-3 text-center text-xs text-muted-foreground">
        <span>Keyboard: Space +1 • Backspace −1 • Enter Lock In</span>
        <span className="mx-3">•</span>
        <span>Mouse: − / + • Lock In</span>
        <span className="mx-3">•</span>
        <span>Controller: ↑ +1 • ↓ / ○ −1 • ✕ Lock In</span>
      </div>

      <div className="text-center">
        <p className="font-display text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Time
        </p>

        <p className="mt-1 font-display text-3xl text-accent">
          {Math.ceil(remaining / 1000)}
        </p>
      </div>
    </div>
  )
}


type ArenaPos = [number, number]
type ArenaDir = 'up' | 'down' | 'left' | 'right'
type ArenaProgram = { code: string; moves: ArenaDir[]; label: string }

const ARENA_DIRS: ArenaDir[] = ['up', 'down', 'left', 'right']
const ARENA_DELTAS: Record<ArenaDir, [number, number]> = {
  up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1],
}
const ARENA_NAMES: Record<ArenaDir, string> = { up: 'up', down: 'down', left: 'left', right: 'right' }

function arenaOpen(maze: string[], pos: ArenaPos) {
  const [r, c] = pos
  return Boolean(maze[r]?.[c]) && maze[r]?.[c] !== '#'
}

function arenaStep(maze: string[], pos: ArenaPos, dir: ArenaDir): ArenaPos {
  const [dr, dc] = ARENA_DELTAS[dir]
  const next: ArenaPos = [pos[0] + dr, pos[1] + dc]
  return arenaOpen(maze, next) ? next : pos
}

function arenaPath(maze: string[], start: ArenaPos, goal: ArenaPos): ArenaDir[] {
  const key = (p: ArenaPos) => `${p[0]},${p[1]}`
  const queue: Array<{ pos: ArenaPos; path: ArenaDir[] }> = [{ pos: start, path: [] }]
  const seen = new Set([key(start)])
  while (queue.length) {
    const { pos, path } = queue.shift()!
    if (pos[0] === goal[0] && pos[1] === goal[1]) return path
    for (const dir of ARENA_DIRS) {
      const next = arenaStep(maze, pos, dir)
      const k = key(next)
      if (k === key(pos) || seen.has(k)) continue
      seen.add(k)
      queue.push({ pos: next, path: [...path, dir] })
    }
  }
  return []
}

function arenaProgramFromMoves(moves: ArenaDir[], difficulty: Difficulty): ArenaProgram {
  const lines: string[] = []
  let i = 0
  while (i < moves.length) {
    const dir = moves[i]!
    let count = 1
    while (i + count < moves.length && moves[i + count] === dir) count += 1
    if (count > 1) lines.push(`for i in range(${count}):\n    move_${dir}()`)
    else lines.push(`move_${dir}()`)
    i += count
  }
  if (difficulty === 'extreme' && moves.length >= 3) {
    const first = moves[0]!
    const second = moves[1]!
    const tail = moves.slice(2)
    const tailCode = tail.map((move) => `    move_${move}()`).join('\n')
    return {
      code: `for i in range(2):\n    if i == 0:\n        move_${first}()\n    else:\n        move_${second}()${tailCode ? `\n${tailCode}` : ''}`,
      moves,
      label: moves.map((move) => ARENA_NAMES[move]).join(' → '),
    }
  }
  return { code: lines.join('\n'), moves, label: moves.map((move) => ARENA_NAMES[move]).join(' → ') }
}

function makeArenaPrograms(maze: string[], pos: ArenaPos, crown: ArenaPos, seed: number, difficulty: Difficulty): ArenaProgram[] {
  const path = arenaPath(maze, pos, crown)
  const count = difficulty === 'extreme' ? 4 : 3
  const correctMoves = path.slice(0, Math.min(count, Math.max(2, path.length)))
  const first = path[0] ?? 'right'
  const alternatives: ArenaDir[][] = []
  const wrongDirs = ARENA_DIRS.filter((dir) => dir !== first)
  for (let i = 0; i < 3; i += 1) {
    const dir = wrongDirs[(seed + i) % wrongDirs.length]!
    const len = difficulty === 'extreme' ? 2 + ((seed + i) % 3) : 2 + ((seed + i) % 2)
    const moves: ArenaDir[] = [dir]
    for (let j = 1; j < len; j += 1) moves.push(ARENA_DIRS[(seed + i + j) % ARENA_DIRS.length]!)
    alternatives.push(moves)
  }
  const programs = [arenaProgramFromMoves(correctMoves, difficulty), ...alternatives.map((moves) => arenaProgramFromMoves(moves, difficulty))]
  // Keep the correct route in a different button slot each question.
  const correctSlot = seed % 4
  ;[programs[0], programs[correctSlot]] = [programs[correctSlot]!, programs[0]!]
  return programs
}

export function AlgorithmArenaMicrogame({ definition, active, onResolve }: MicrogameProps<AlgorithmArenaPayload>) {
  const { payload } = definition
  const [positions, setPositions] = useState<Record<PlayerId, ArenaPos>>({ 1: payload.start1, 2: payload.start2 })
  const [question, setQuestion] = useState<Record<PlayerId, number>>({ 1: 0, 2: 0 })
  const [busy, setBusy] = useState<Record<PlayerId, boolean>>({ 1: false, 2: false })
  const [feedback, setFeedback] = useState<Record<PlayerId, string>>({ 1: '', 2: '' })
  const [questionRemaining, setQuestionRemaining] = useState<Record<PlayerId, number>>({ 1: 20, 2: 20 })
  const [raceRemaining, setRaceRemaining] = useState(payload.raceSeconds)
  const resolvedRef = useRef(false)

  const difficulty = definition.difficulty
  const programs = useMemo(() => ({
    1: makeArenaPrograms(payload.maze, positions[1], payload.crown, question[1] + 11, difficulty),
    2: makeArenaPrograms(payload.maze, positions[2], payload.crown, question[2] + 29, difficulty),
  }), [payload.maze, payload.crown, positions, question, difficulty])


  useEffect(() => {
  if (!active || resolvedRef.current) return

  const id = window.setInterval(() => {
    setRaceRemaining((value) => Math.max(0, value - 1))

    // question timer logic...
  }, 1000)

  return () => window.clearInterval(id)
}, [active, busy])

  useEffect(() => {
  if (!active || resolvedRef.current || raceRemaining > 0) return

  resolvedRef.current = true

  onResolve({
    outcome: 'timeout',
    player: 1,
    explanation:
      'The race timer expired. Loops help a program repeat movement, but the robot still needs the right path through the maze.',
    correctAnswer: 'Use loops to repeat movement.',
  })

  onResolve({
    outcome: 'timeout',
    player: 2,
    explanation:
      'The race timer expired. Loops help a program repeat movement, but the robot still needs the right path through the maze.',
    correctAnswer: 'Use loops to repeat movement.',
  })
}, [active, raceRemaining, onResolve])


  const execute = (player: PlayerId, index: number) => {
    if (!active || busy[player] || resolvedRef.current) return
    const program = programs[player][index]!
    setBusy((b) => ({ ...b, [player]: true }))
    setFeedback((f) => ({ ...f, [player]: 'EXECUTING…' }))
    let stepIndex = 0
    const step = () => {
      if (resolvedRef.current) return
      const move = program.moves[stepIndex]
      if (move) {
        setPositions((current) => ({ ...current, [player]: arenaStep(payload.maze, current[player], move) }))
        stepIndex += 1
        window.setTimeout(step, 160)
        return
      }
      setPositions((current) => {
        const reached = current[player][0] === payload.crown[0] && current[player][1] === payload.crown[1]
        if (reached && !resolvedRef.current) {
          resolvedRef.current = true
          const loser: PlayerId = player === 1 ? 2 : 1
          onResolve({ outcome: 'success', player, explanation: 'You traced the movement program correctly and reached the crown.', correctAnswer: 'Reach the crown.' })
          onResolve({ outcome: 'failure', player: loser, explanation: 'Your opponent reached the crown first. Trace each loop before choosing a movement program.', correctAnswer: 'Choose the program that advances through the open path.' })
        }
        return current
      })
      setBusy((b) => ({ ...b, [player]: false }))
      setQuestion((q) => ({ ...q, [player]: q[player] + 1 }))
      setQuestionRemaining((q) => ({ ...q, [player]: 20 }))
      setFeedback((f) => ({ ...f, [player]: 'Choose your next program' }))
    }
    step()
  }

  useGameInput((event) => {
    if (event.player !== 1 && event.player !== 2) return
    const index = CHOICE_INPUTS.indexOf(event.input as (typeof CHOICE_INPUTS)[number])
    if (index >= 0) execute(event.player, index)
  }, active)

  const cell = (r: number, c: number) => {
    if (positions[1][0] === r && positions[1][1] === c) return <span className="text-lg">🤖</span>
    if (positions[2][0] === r && positions[2][1] === c) return <span className="text-lg">🤖</span>
    if (payload.crown[0] === r && payload.crown[1] === c) return <span className="text-lg">👑</span>
    return null
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-hidden p-4">
      <div className="flex items-center justify-between rounded-2xl border border-border bg-card/80 px-5 py-3">
        <div><p className="font-display text-xs uppercase tracking-[0.18em] text-primary">Race Time</p><p className="font-display text-2xl">{raceRemaining}s</p></div>
        <p className="text-center text-xs text-muted-foreground">Choose a program → execute it → get a new program set.</p>
        <div className="text-right"><p className="font-display text-xs uppercase tracking-[0.18em] text-accent">CROWN</p><p className="font-display text-sm">FIRST THERE WINS</p></div>
      </div>
      <div className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-4">
        {([1, 2] as const).map((player) => (
          <div key={player} className="rounded-2xl border border-border bg-card/80 p-3">
            <div className="mb-2 flex items-center justify-between"><span className="font-display text-sm uppercase">Player {player}</span><span className="font-display text-sm text-accent">{questionRemaining[player]}s</span></div>
            <div className="grid grid-cols-2 gap-2">
              {programs[player].map((program, i) => (
                <button key={`${player}-${question[player]}-${i}`} type="button" disabled={!active || busy[player]} onClick={() => execute(player, i)} className="min-h-28 rounded-xl border-2 border-border bg-surface/80 p-3 text-left transition hover:border-accent disabled:opacity-50">
                  <div className="mb-2 flex items-center justify-between"><span className="font-display text-sm">{CHOICE_INPUTS[i] === 'cross' ? '✕' : CHOICE_INPUTS[i] === 'circle' ? '○' : CHOICE_INPUTS[i] === 'square' ? '□' : '△'}</span><span className="text-[10px] uppercase text-muted-foreground">Program {i + 1}</span></div>
                  <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed">{program.code}</pre>
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">{feedback[player] || 'Choose the movement program that advances toward the crown.'}</p>
          </div>
        ))}
      </div>
      <div className="mx-auto grid aspect-square w-full max-w-[620px] overflow-hidden rounded-2xl border border-border bg-surface/50" style={{ gridTemplateColumns: 'repeat(15, minmax(0, 1fr))' }}>
        {payload.maze.flatMap((row, r) => [...row].map((char, c) => <div key={`${r}-${c}`} className={cn('flex items-center justify-center border border-border/20 text-center', char === '#' ? 'bg-card' : 'bg-background/60')}>{cell(r, c)}</div>))}
      </div>
    </div>
  )
}

export function BooleanBlitzMicrogame({ definition, active, player, onResolve }: MicrogameProps<BooleanPayload>) {
  const { payload } = definition
  const { selected, choose } = useLearningChoice(payload, active, player, onResolve)
  return <div className="flex flex-1 flex-col justify-center gap-8 p-8 text-center"><p className="font-display text-sm uppercase tracking-[0.2em] text-secondary">BOOLEAN BLITZ</p><h3 className="font-display text-4xl uppercase">What does this evaluate to?</h3><div className="mx-auto rounded-3xl border-2 border-accent/50 bg-surface/70 px-10 py-8 font-mono text-3xl shadow-lg">{payload.expression}</div><LearningChoiceButtons options={payload.options} active={active} selected={selected} correctIndex={payload.correctIndex} onChoose={choose} /></div>
}

export function LoopLabMicrogame({ definition, active, player, onResolve }: MicrogameProps<LoopPayload>) {
  const { payload } = definition
  const { selected, choose } = useLearningChoice(payload, active, player, onResolve)
  return <div className="flex flex-1 flex-col justify-center gap-6 p-8"><div className="text-center"><p className="font-display text-sm uppercase tracking-[0.2em] text-primary">LOOP LAB</p><h3 className="font-display mt-2 text-3xl uppercase">Predict the final output</h3></div><CodeBlock code={payload.code} /><LearningChoiceButtons options={payload.options} active={active} selected={selected} correctIndex={payload.correctIndex} onChoose={choose} /></div>
}

export function FunctionForgeMicrogame({ definition, active, player, onResolve }: MicrogameProps<FunctionPayload>) {
  const { payload } = definition
  const { selected, choose } = useLearningChoice(payload, active, player, onResolve)
  return <div className="flex flex-1 flex-col justify-center gap-7 p-8"><div className="text-center"><p className="font-display text-sm uppercase tracking-[0.2em] text-accent">FUNCTION FORGE</p><h3 className="font-display mt-2 text-3xl uppercase">Send the input through the function</h3></div><div className="mx-auto flex w-full max-w-3xl items-center justify-center gap-5"><div className="rounded-2xl border border-border bg-card px-6 py-4 font-mono">INPUT</div><div className="h-1 w-16 bg-accent"/><div className="rounded-2xl border-2 border-accent bg-accent/10 px-8 py-5 font-display text-xl">FUNCTION</div><div className="h-1 w-16 bg-accent"/><div className="rounded-2xl border border-border bg-card px-6 py-4 font-mono">?</div></div><CodeBlock code={payload.code} /><LearningChoiceButtons options={payload.options} active={active} selected={selected} correctIndex={payload.correctIndex} onChoose={choose} /></div>
}

export function ComplexityCrashMicrogame({ definition, active, player, onResolve }: MicrogameProps<ComplexityPayload>) {
  const { payload } = definition
  const { selected, choose } = useLearningChoice(payload, active, player, onResolve)
  return <div className="flex flex-1 flex-col justify-center gap-7 p-8"><div className="text-center"><p className="font-display text-sm uppercase tracking-[0.2em] text-danger">COMPLEXITY CRASH</p><h3 className="font-display mt-2 text-3xl uppercase">How fast does this code grow?</h3></div><CodeBlock code={payload.code} /><div className="grid grid-cols-2 gap-4 mx-auto w-full max-w-4xl">{payload.options.map((o,i)=><button key={o} type="button" disabled={!active || selected!==null} onClick={()=>choose(i)} className={cn('rounded-2xl border-2 p-6 font-mono text-2xl transition-all hover:-translate-y-1', selected===i?'border-accent bg-accent/10':'border-border bg-surface/70')}>{o}</button>)}</div></div>
}
