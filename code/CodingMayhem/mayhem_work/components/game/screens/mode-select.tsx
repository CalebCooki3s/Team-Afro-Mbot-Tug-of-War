'use client'

import { useState } from 'react'
import { Bomb, Swords } from 'lucide-react'
import type { CSSProperties } from 'react'
import { MODES } from '@/lib/game/config'
import { useGame } from '@/lib/game/game-context'
import { useGameInput } from '@/lib/game/input'
import type { GameMode } from '@/lib/game/types'
import { ArcadeButton } from '../arcade-button'
import { RobotStatus } from '../robot-status'
import { ScreenHeader } from '../screen-header'

const CARD_STYLE: Record<
  GameMode,
  {
    color: string
    Icon: typeof Bomb
    preview: number
    tone: 'accent' | 'secondary'
  }
> = {
  solo: {
    color: 'var(--accent)',
    Icon: Bomb,
    preview: 42,
    tone: 'accent',
  },
  versus: {
    color: 'var(--secondary)',
    Icon: Swords,
    preview: -30,
    tone: 'secondary',
  },
}

function ModeCard({
  mode,
  onSelect,
  selected,
}: {
  mode: GameMode
  onSelect: () => void
  selected: boolean
}) {
  const info = MODES[mode]
  const style = CARD_STYLE[mode]
  const { Icon } = style

  return (
    <article
      className="arcade-panel group relative flex min-h-[30rem] h-full flex-col overflow-hidden rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 hover:arcade-glow hover:scale-[1.02]"
      style={{ '--glow-color': style.color } as CSSProperties}
    >
      <div
        className="absolute inset-x-0 top-0 h-1.5"
        style={{
          background: style.color,
          boxShadow: `0 0 24px ${style.color}`,
        }}
      />

      <div className="flex items-center gap-4">
        <div
          className="flex size-16 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110"
          style={{
            background: `color-mix(in oklch, ${style.color} 18%, var(--card))`,
            color: style.color,
          }}
        >
          <Icon className="size-8" aria-hidden="true" />
        </div>

        <h2
          className="font-display text-3xl uppercase leading-tight"
          style={{ color: style.color }}
        >
          {info.title}
        </h2>
      </div>

      <p className="mt-6 text-pretty leading-relaxed text-muted-foreground">
        {info.description}
      </p>

      <div className="mt-8 rounded-2xl bg-surface/70 px-5 pb-5 pt-8 ring-1 ring-border">
        <RobotStatus mode={mode} value={style.preview} compact />
      </div>

      <ArcadeButton
        size="lg"
        tone={style.tone}
        className="mt-8 w-full"
        onClick={onSelect}
      >
        Select {info.shortTitle}
      </ArcadeButton>
    </article>
  )
}

export function ModeSelect() {
  const { dispatch } = useGame()
  const [selected, setSelected] = useState(0)

  const modes: GameMode[] = ['solo', 'versus']

  const selectMode = (index: number) => {
    dispatch({
      type: 'SELECT_MODE',
      mode: modes[index],
    })
  }

  useGameInput((event) => {
    if (event.player !== 1) return

    if (event.input === 'left' || event.input === 'up') {
      setSelected((current) =>
        current > 0 ? current - 1 : modes.length - 1,
      )
    }

    if (event.input === 'right' || event.input === 'down') {
      setSelected((current) =>
        current < modes.length - 1 ? current + 1 : 0,
      )
    }

    if (event.input === 'cross') {
      selectMode(selected)
    }

    if (event.input === 'circle') {
      dispatch({ type: 'GO_TO', screen: 'menu' })
    }
  })

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-10 py-10">
      <ScreenHeader
        step="Step 1 of 3"
        title="Choose Your Mode"
        subtitle="Face the machine alone, or battle a friend for control of the mBot."
        onBack={() => dispatch({ type: 'GO_TO', screen: 'menu' })}
      />

      <div className="mt-12 grid flex-1 auto-rows-fr grid-cols-2 items-stretch gap-8">
        <ModeCard
          mode="solo"
          selected={selected === 0}
          onSelect={() => selectMode(0)}
        />

        <ModeCard
          mode="versus"
          selected={selected === 1}
          onSelect={() => selectMode(1)}
        />
      </div>
    </div>
  )
}