"use client"

import { useEffect } from "react"
import { PLAYERS, type PlayerId } from "@/lib/game-config"
import { useTugOfWar } from "@/lib/use-tug-of-war"
import { GameHud } from "./game-hud"
import { PlayerPanel } from "./player-panel"
import { QuestionCard } from "./question-card"
import { RopeArena } from "./rope-arena"
import { StartScreen } from "./start-screen"
import { WinnerScreen } from "./winner-screen"

const ROUND_BANNER: Record<string, { text: string; cls: string } | null> = {
  pending: null,
  p1: { text: "Player 1 pulls the robot! 🔵", cls: "bg-blue-100 text-blue-700" },
  p2: { text: "Player 2 pulls the robot! 🔴", cls: "bg-red-100 text-red-700" },
  timeout: { text: "⏱ Time's up — nobody moves!", cls: "bg-amber-100 text-amber-700" },
  "both-wrong": { text: "Both wrong — nobody moves!", cls: "bg-slate-200 text-slate-600" },
}

export function TugOfWarGame() {
  const game = useTugOfWar()
  const { status, question, round, answer } = game

  // Keyboard controls: Player 1 uses 1-4, Player 2 uses 7/8/9/0.
  useEffect(() => {
    if (status !== "playing" || !question) return
    const handler = (e: KeyboardEvent) => {
      for (const id of [1, 2] as PlayerId[]) {
        const keyIndex = PLAYERS[id].keys.indexOf(e.key)
        if (keyIndex >= 0 && keyIndex < question.choices.length) {
          answer(id, keyIndex)
          return
        }
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [status, question, answer])

  if (status === "idle" || status === "loading") {
    return (
      <Shell>
        <StartScreen onStart={game.start} loading={status === "loading"} />
      </Shell>
    )
  }

  if (status === "finished") {
    return (
      <Shell>
        <WinnerScreen winner={game.winner} scores={game.scores} onPlayAgain={game.start} />
      </Shell>
    )
  }

  const banner = ROUND_BANNER[round.outcome]

  return (
    <Shell>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        <GameHud
          questionNumber={game.questionNumber}
          totalQuestions={game.totalQuestions}
          timeLeft={game.timeLeft}
          scores={game.scores}
        />

        <RopeArena position={game.position} />

        <div className="relative flex h-8 items-center justify-center">
          {banner ? (
            <span className={`animate-pop-in rounded-full px-4 py-1 text-sm font-bold ${banner.cls}`}>
              {banner.text}
            </span>
          ) : (
            <span className="text-sm font-medium text-slate-400">Be the first to answer correctly!</span>
          )}
        </div>

        {question ? <QuestionCard question={question} round={round} /> : null}

        <div className="grid grid-cols-2 gap-4">
          <PlayerPanel
            player={1}
            choiceCount={question?.choices.length ?? 4}
            round={{ ...round[1], resolved: round.resolved }}
            onAnswer={(i) => answer(1, i)}
          />
          <PlayerPanel
            player={2}
            choiceCount={question?.choices.length ?? 4}
            round={{ ...round[2], resolved: round.resolved }}
            onAnswer={(i) => answer(2, i)}
            align="right"
          />
        </div>
      </div>
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-sky-50 via-white to-rose-50 px-3 py-6">
      {children}
    </main>
  )
}
