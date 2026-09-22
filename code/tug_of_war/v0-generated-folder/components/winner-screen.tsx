"use client"

import { useMemo } from "react"
import type { PlayerId } from "@/lib/game-config"
import type { Winner } from "@/lib/use-tug-of-war"

export function WinnerScreen({
  winner,
  scores,
  onPlayAgain,
}: {
  winner: Winner
  scores: Record<PlayerId, number>
  onPlayAgain: () => void
}) {
  const isDraw = winner === "draw" || winner === null
  const tone = winner === 1 ? "blue" : winner === 2 ? "red" : "slate"

  const heading = isDraw ? "It's a Tie!" : `Player ${winner} Wins!`
  const accent =
    tone === "blue" ? "text-blue-600" : tone === "red" ? "text-red-600" : "text-slate-700"

  return (
    <div className="relative mx-auto flex w-full max-w-2xl flex-col items-center gap-6 px-4 text-center">
      {!isDraw ? <Confetti tone={tone as "blue" | "red"} /> : null}

      <div className="z-10 animate-robot-bob overflow-hidden rounded-full bg-white shadow-xl ring-4 ring-white">
        <img src="/robot.png" alt="Celebrating robot" className="h-36 w-36 object-cover" />
      </div>

      <div className="z-10 animate-pop-in">
        <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Game Over</p>
        <h1 className={`text-5xl font-black tracking-tight sm:text-6xl ${accent}`}>{heading}</h1>
      </div>

      <div className="z-10 flex items-stretch gap-4">
        <FinalScore label="Player 1" score={scores[1]} tone="blue" highlight={winner === 1} />
        <div className="flex items-center text-2xl font-black text-slate-400">vs</div>
        <FinalScore label="Player 2" score={scores[2]} tone="red" highlight={winner === 2} />
      </div>

      <button
        type="button"
        onClick={onPlayAgain}
        className="z-10 rounded-full bg-slate-900 px-10 py-4 text-lg font-bold text-white shadow-lg transition hover:scale-105 hover:bg-slate-800 active:scale-95"
      >
        Play Again
      </button>
    </div>
  )
}

function FinalScore({
  label,
  score,
  tone,
  highlight,
}: {
  label: string
  score: number
  tone: "blue" | "red"
  highlight: boolean
}) {
  const base = tone === "blue" ? "border-blue-200 bg-blue-50 text-blue-700" : "border-red-200 bg-red-50 text-red-700"
  const win = tone === "blue" ? "border-blue-500 ring-4 ring-blue-200" : "border-red-500 ring-4 ring-red-200"
  return (
    <div className={`flex flex-col items-center rounded-2xl border-2 px-6 py-4 ${base} ${highlight ? win : ""}`}>
      <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
      <span className="text-4xl font-black tabular-nums">{score}</span>
      {highlight ? <span className="text-lg">🏆</span> : null}
    </div>
  )
}

function Confetti({ tone }: { tone: "blue" | "red" }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 2.5 + Math.random() * 2,
        color: [tone === "blue" ? "#3b82f6" : "#ef4444", "#f59e0b", "#10b981", "#8b5cf6"][i % 4],
        size: 6 + Math.random() * 8,
      })),
    [tone],
  )

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="animate-confetti absolute top-0 rounded-sm"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  )
}
