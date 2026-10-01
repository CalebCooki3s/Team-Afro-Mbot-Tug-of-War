"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { GAME_CONFIG, type PlayerId } from "./game-config"
import { getQuestions, type Question } from "./questions"

export type GameStatus = "idle" | "loading" | "playing" | "finished"

export type PlayerRoundStatus = "idle" | "correct" | "wrong"

type PlayerRound = {
  choice: number | null
  status: PlayerRoundStatus
}

type RoundState = {
  1: PlayerRound
  2: PlayerRound
  /** True once the correct answer should be revealed (resolved or timed out). */
  revealed: boolean
  /** True once no more answers are accepted and we are advancing. */
  resolved: boolean
  /** Why the round ended, for lightweight banner messaging. */
  outcome: "pending" | "p1" | "p2" | "timeout" | "both-wrong"
}

const freshRound = (): RoundState => ({
  1: { choice: null, status: "idle" },
  2: { choice: null, status: "idle" },
  revealed: false,
  resolved: false,
  outcome: "pending",
})

export type Winner = PlayerId | "draw" | null

export function useTugOfWar() {
  const [status, setStatus] = useState<GameStatus>("idle")
  const [questions, setQuestions] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [position, setPosition] = useState(GAME_CONFIG.START_POSITION)
  const [scores, setScores] = useState<Record<PlayerId, number>>({ 1: 0, 2: 0 })
  const [timeLeft, setTimeLeft] = useState(GAME_CONFIG.SECONDS_PER_QUESTION)
  const [round, setRoundState] = useState<RoundState>(freshRound)
  const [winner, setWinner] = useState<Winner>(null)

  // Refs mirror state so event handlers can read current values and run side
  // effects imperatively, keeping all setState calls pure (safe under StrictMode).
  const advanceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const positionRef = useRef(position)
  const roundRef = useRef(round)
  const indexRef = useRef(index)
  const questionsRef = useRef(questions)

  const setRound = (next: RoundState) => {
    roundRef.current = next
    setRoundState(next)
  }

  const clearAdvance = () => {
    if (advanceRef.current) {
      clearTimeout(advanceRef.current)
      advanceRef.current = null
    }
  }

  const question = questions[index]

  const finishByPosition = useCallback(() => {
    const pos = positionRef.current
    if (pos < GAME_CONFIG.START_POSITION) setWinner(1)
    else if (pos > GAME_CONFIG.START_POSITION) setWinner(2)
    else {
      setScores((s) => {
        setWinner(s[1] > s[2] ? 1 : s[2] > s[1] ? 2 : "draw")
        return s
      })
    }
    setStatus("finished")
  }, [])

  const scheduleNext = useCallback(
    (winningPlayer: PlayerId | null) => {
      clearAdvance()
      advanceRef.current = setTimeout(() => {
        if (winningPlayer) {
          setWinner(winningPlayer)
          setStatus("finished")
          return
        }
        const nextIndex = indexRef.current + 1
        if (nextIndex >= questionsRef.current.length) {
          finishByPosition()
          return
        }
        indexRef.current = nextIndex
        setIndex(nextIndex)
        setRound(freshRound())
        setTimeLeft(GAME_CONFIG.SECONDS_PER_QUESTION)
      }, GAME_CONFIG.ADVANCE_DELAY_MS)
    },
    [finishByPosition],
  )

  const start = useCallback(async () => {
    clearAdvance()
    setStatus("loading")
    const q = await getQuestions()
    questionsRef.current = q
    indexRef.current = 0
    positionRef.current = GAME_CONFIG.START_POSITION
    setQuestions(q)
    setIndex(0)
    setPosition(GAME_CONFIG.START_POSITION)
    setScores({ 1: 0, 2: 0 })
    setTimeLeft(GAME_CONFIG.SECONDS_PER_QUESTION)
    setRound(freshRound())
    setWinner(null)
    setStatus("playing")
  }, [])

  const reset = useCallback(() => {
    clearAdvance()
    setStatus("idle")
    setWinner(null)
  }, [])

  const answer = useCallback(
    (player: PlayerId, choiceIndex: number) => {
      if (status !== "playing") return
      const currentQuestion = questionsRef.current[indexRef.current]
      if (!currentQuestion) return

      const prev = roundRef.current
      if (prev.resolved || prev[player].status !== "idle") return

      const isCorrect = choiceIndex === currentQuestion.correctIndex
      const next: RoundState = {
        ...prev,
        [player]: { choice: choiceIndex, status: isCorrect ? "correct" : "wrong" },
      }

      if (isCorrect) {
        next.revealed = true
        next.resolved = true
        next.outcome = player === 1 ? "p1" : "p2"
        setRound(next)

        setScores((s) => ({ ...s, [player]: s[player] + 1 }))

        const delta = player === 1 ? -GAME_CONFIG.PULL_AMOUNT : GAME_CONFIG.PULL_AMOUNT
        const newPos = Math.max(0, Math.min(100, positionRef.current + delta))
        positionRef.current = newPos
        setPosition(newPos)

        const p1Wins = newPos <= GAME_CONFIG.P1_WIN_POSITION
        const p2Wins = newPos >= GAME_CONFIG.P2_WIN_POSITION
        scheduleNext(p1Wins ? 1 : p2Wins ? 2 : null)
      } else {
        const otherPlayer: PlayerId = player === 1 ? 2 : 1
        if (next[otherPlayer].status === "wrong") {
          next.revealed = true
          next.resolved = true
          next.outcome = "both-wrong"
          setRound(next)
          scheduleNext(null)
        } else {
          setRound(next)
        }
      }
    },
    [status, scheduleNext],
  )

  // Per-question countdown timer.
  useEffect(() => {
    if (status !== "playing") return
    if (round.resolved) return

    if (timeLeft <= 0) {
      const timedOut: RoundState = { ...roundRef.current, revealed: true, resolved: true, outcome: "timeout" }
      setRound(timedOut)
      scheduleNext(null)
      return
    }

    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [status, timeLeft, round.resolved, scheduleNext])

  // Cleanup any pending advance timer on unmount.
  useEffect(() => clearAdvance, [])

  return {
    status,
    question,
    questionNumber: index + 1,
    totalQuestions: questions.length,
    position,
    scores,
    timeLeft,
    round,
    winner,
    start,
    reset,
    answer,
  }
}
