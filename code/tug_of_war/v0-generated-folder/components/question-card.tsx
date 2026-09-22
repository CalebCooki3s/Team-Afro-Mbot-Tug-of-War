"use client"

import type { Question } from "@/lib/questions"

const LETTERS = ["A", "B", "C", "D"]

type RoundLike = {
  1: { choice: number | null; status: string }
  2: { choice: number | null; status: string }
  revealed: boolean
}

export function QuestionCard({ question, round }: { question: Question; round: RoundLike }) {
  return (
    <div key={question.id} className="animate-pop-in rounded-3xl border-2 border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <h2 className="text-balance text-center text-xl font-bold text-slate-900 sm:text-2xl">{question.prompt}</h2>

      {question.code ? (
        <pre className="mx-auto mt-4 max-w-md overflow-x-auto rounded-xl bg-slate-900 px-4 py-3 text-left font-mono text-sm leading-relaxed text-emerald-300 sm:text-base">
          <code>{question.code}</code>
        </pre>
      ) : null}

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {question.choices.map((choice, i) => (
          <ChoiceRow key={i} letter={LETTERS[i]} text={choice} index={i} question={question} round={round} />
        ))}
      </div>
    </div>
  )
}

function ChoiceRow({
  letter,
  text,
  index,
  question,
  round,
}: {
  letter: string
  text: string
  index: number
  question: Question
  round: RoundLike
}) {
  const isCorrect = index === question.correctIndex
  const p1Picked = round[1].choice === index
  const p2Picked = round[2].choice === index

  let container = "border-slate-200 bg-slate-50"
  if (round.revealed && isCorrect) {
    container = "border-emerald-400 bg-emerald-50"
  } else if (round.revealed && (p1Picked || p2Picked)) {
    container = "border-red-300 bg-red-50"
  }

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-left transition-colors ${container}`}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900 font-mono text-sm font-bold text-white">
        {letter}
      </span>
      <span className="flex-1 font-mono text-sm text-slate-800 sm:text-base">{text}</span>

      <span className="flex shrink-0 items-center gap-1">
        {p1Picked ? <PickTag tone="blue" /> : null}
        {p2Picked ? <PickTag tone="red" /> : null}
        {round.revealed && isCorrect ? <span className="text-lg">✅</span> : null}
      </span>
    </div>
  )
}

function PickTag({ tone }: { tone: "blue" | "red" }) {
  const cls = tone === "blue" ? "bg-blue-600" : "bg-red-600"
  return (
    <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase text-white ${cls}`}>
      {tone === "blue" ? "P1" : "P2"}
    </span>
  )
}
