'use client'

import { useState, type CSSProperties } from 'react'
import { cn } from '@/lib/utils'
import type { DemoChoicePayload } from '@/lib/game/demo-microgames'
import { KEYBOARD_HINTS, useGameInput } from '@/lib/game/input'
import type { ControlInput, MicrogameProps, PlayerId } from '@/lib/game/types'
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
              'flex gap-5 px-5 py-0.5',
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

/** Placeholder four-choice microgame used to demonstrate the framework. */
export function DemoChoiceMicrogame({ definition, mode, active, onResolve }: MicrogameProps<DemoChoicePayload>) {
  const { payload } = definition
  const [picked, setPicked] = useState<{ index: number; player: PlayerId } | null>(null)
  const isDebug = definition.mechanic === 'debug'

  const choose = (index: number, player: PlayerId) => {
    if (!active || picked) return
    setPicked({ index, player })
    onResolve({ outcome: index === payload.correctIndex ? 'success' : 'failure', player })
  }

  useGameInput((event) => {
    const index = CHOICE_INPUTS.indexOf(event.input as (typeof CHOICE_INPUTS)[number])
    if (index === -1) return
    if (mode === 'solo' && event.player !== 1) return
    choose(index, event.player)
  }, active)

  return (
    <div className="grid flex-1 grid-cols-[1.1fr_1fr] gap-8 p-8">
      <div className="flex flex-col justify-center gap-4">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">main.py</span>
        <CodeBlock code={payload.code} highlightLine={isDebug && picked ? payload.correctIndex : undefined} />
      </div>

      <div className="flex flex-col justify-center gap-5">
        <h3 className="font-display text-3xl uppercase text-foreground">{payload.question}</h3>
        <ul className="grid grid-cols-2 gap-4">
          {payload.options.map((option, i) => {
            const input = CHOICE_INPUTS[i] as ControlInput
            const color = CHOICE_COLORS[i]
            const isPicked = picked?.index === i
            const isCorrect = i === payload.correctIndex
            const revealed = picked !== null
            return (
              <li key={option + i}>
                <button
                  type="button"
                  disabled={!active || revealed}
                  onClick={() => choose(i, 1)}
                  className={cn(
                    'arcade-btn flex w-full items-center gap-4 rounded-2xl px-4 py-5 text-left disabled:opacity-100',
                    revealed && !isPicked && !isCorrect && 'opacity-40',
                  )}
                  style={
                    {
                      '--btn-color': revealed && isCorrect ? 'var(--success)' : isPicked ? 'var(--danger)' : 'var(--card)',
                      '--btn-fg': revealed && (isCorrect || isPicked) ? 'var(--on-color)' : 'var(--foreground)',
                      boxShadow: revealed ? undefined : `0 6px 0 0 color-mix(in oklch, ${color} 55%, var(--surface)), 0 0 0 2px color-mix(in oklch, ${color} 45%, transparent) inset`,
                    } as CSSProperties
                  }
                >
                  <ControllerGlyph input={input} size="md" />
                  <span className="font-mono text-xl font-bold">{option}</span>
                </button>
              </li>
            )
          })}
        </ul>
        <p className="text-xs text-muted-foreground">
          {mode === 'solo'
            ? `Keyboard: ${Object.values(KEYBOARD_HINTS.p1).join(' ')} · or click a choice`
            : `P1 keys ${Object.values(KEYBOARD_HINTS.p1).join(' ')} · P2 keys ${Object.values(KEYBOARD_HINTS.p2).join(' ')} · first answer counts`}
        </p>
      </div>
    </div>
  )
}
