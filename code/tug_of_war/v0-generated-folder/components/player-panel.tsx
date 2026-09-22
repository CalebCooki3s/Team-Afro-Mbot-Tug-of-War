"use client"

import { PLAYERS, type PlayerId } from "@/lib/game-config"
import type { PlayerRoundStatus } from "@/lib/use-tug-of-war"

const LETTERS = ["A", "B", "C", "D"]

type PlayerRound = { choice: number | null; status: PlayerRoundStatus }

const TONES = {
  blue: {
    ring: "border-blue-200",
    header: "text-blue-700",
    btn: "border-blue-200 bg-white hover:border-blue-400 hover:bg-blue-50 active:bg-blue-100",
    badge: "bg-blue-600",
  },
  red: {
    ring: "border-red-200",
    header: "text-red-700",
    btn: "border-red-200 bg-white hover:border-red-400 hover:bg-red-50 active:bg-red-100",
    badge: "bg-red-600",
  },
} as const

export function PlayerPanel({
  player,
  choiceCount,
  round,
  onAnswer,
  align = "left",
}: {
  player: PlayerId
  choiceCount: number
  round: PlayerRound & { resolved: boolean }
  onAnswer: (choiceIndex: number) => void
  align?: "left" | "right"
}) {
  const config = PLAYERS[player]
  const tone = TONES[config.color as "blue" | "red"]
  const locked = round.resolved || round.status !== "idle"

  return (
    <div className={`relative rounded-3xl border-2 ${tone.ring} bg-slate-50 p-4`}>
      <div
        className={`mb-3 flex items-center gap-2 ${align === "right" ? "justify-end" : "justify-start"} ${tone.header}`}
      >
        <span className="text-sm font-black uppercase tracking-wide">{config.name}</span>
      </div>

      <Feedback status={round.status} />

      <div className="grid grid-cols-2 gap-2.5">
        {Array.from({ length: choiceCount }).map((_, i) => {
          const isChosen = round.choice === i
          const stateCls =
            round.status !== "idle" && isChosen
              ? round.status === "correct"
                ? "border-emerald-400 bg-emerald-50"
                : "border-red-400 bg-red-50 animate-shake"
              : tone.btn

          return (
            <button
              key={i}
              type="button"
              disabled={locked}
              onClick={() => onAnswer(i)}
              className={`flex items-center gap-2 rounded-xl border-2 px-3 py-3 transition disabled:cursor-not-allowed disabled:opacity-55 ${stateCls}`}
            >
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg font-mono text-base font-bold text-white ${tone.badge}`}>
                {LETTERS[i]}
              </span>
              <kbd className="ml-auto rounded-md border border-slate-300 bg-white px-1.5 py-0.5 font-mono text-xs font-semibold text-slate-500">
                {config.keys[i]}
              </kbd>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Feedback({ status }: { status: PlayerRoundStatus }) {
  if (status === "idle") return <div className="mb-3 h-7" aria-hidden />
  const correct = status === "correct"
  return (
    <div
      className={`mb-3 flex h-7 animate-pop-in items-center justify-center rounded-full text-sm font-bold ${
        correct ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
      }`}
      role="status"
    >
      {correct ? "✅ Correct! +1" : "❌ Wrong!"}
    </div>
  )
}
