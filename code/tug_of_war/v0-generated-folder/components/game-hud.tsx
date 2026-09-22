"use client"

import { GAME_CONFIG, type PlayerId } from "@/lib/game-config"

export function GameHud({
  questionNumber,
  totalQuestions,
  timeLeft,
  scores,
}: {
  questionNumber: number
  totalQuestions: number
  timeLeft: number
  scores: Record<PlayerId, number>
}) {
  const urgent = timeLeft <= 5
  const pct = (timeLeft / GAME_CONFIG.SECONDS_PER_QUESTION) * 100

  return (
    <div className="flex items-center justify-between gap-4">
      <ScoreBadge label="Player 1" score={scores[1]} tone="blue" />

      <div className="flex flex-col items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Question {questionNumber}
          {totalQuestions ? ` / ${totalQuestions}` : ""}
        </span>
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-full border-4 text-2xl font-black tabular-nums transition-colors ${
            urgent ? "animate-pulse border-red-400 text-red-600" : "border-slate-200 text-slate-700"
          }`}
          role="timer"
          aria-live="off"
          aria-label={`${timeLeft} seconds left`}
        >
          {timeLeft}
        </div>
        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full rounded-full transition-[width] duration-1000 ease-linear ${
              urgent ? "bg-red-500" : "bg-slate-500"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <ScoreBadge label="Player 2" score={scores[2]} tone="red" align="right" />
    </div>
  )
}

function ScoreBadge({
  label,
  score,
  tone,
  align = "left",
}: {
  label: string
  score: number
  tone: "blue" | "red"
  align?: "left" | "right"
}) {
  const toneClasses = tone === "blue" ? "border-blue-200 bg-blue-50 text-blue-700" : "border-red-200 bg-red-50 text-red-700"
  return (
    <div className={`flex flex-col ${align === "right" ? "items-end" : "items-start"}`}>
      <span className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</span>
      <div className={`flex items-center gap-2 rounded-2xl border-2 px-4 py-1.5 ${toneClasses}`}>
        <span className="text-3xl font-black tabular-nums leading-none">{score}</span>
        <span className="text-xs font-semibold uppercase">pts</span>
      </div>
    </div>
  )
}
