"use client"

import { GAME_CONFIG } from "@/lib/game-config"

export function StartScreen({ onStart, loading }: { onStart: () => void; loading: boolean }) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8 px-4 text-center animate-pop-in">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-robot-bob overflow-hidden rounded-full bg-white shadow-xl ring-4 ring-white">
          <img src="/robot.png" alt="Friendly game robot" className="h-40 w-40 object-cover" />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-6xl">
          Python <span className="text-blue-600">Tug</span>
          <span className="text-slate-400">-of-</span>
          <span className="text-red-600">War</span>
        </h1>
        <p className="max-w-xl text-balance text-lg text-slate-600">
          Two players. One robot. Answer Python questions faster than your opponent to pull the robot across
          your goal line!
        </p>
      </div>

      <div className="grid w-full gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-5 text-left">
          <div className="mb-2 text-sm font-bold uppercase tracking-wide text-blue-700">Player 1 · Blue</div>
          <p className="text-sm text-slate-600">
            Pull the robot to the <strong>left</strong> goal. Answer with the buttons on your side or keys{" "}
            <Keys keys={["1", "2", "3", "4"]} />.
          </p>
        </div>
        <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-5 text-left">
          <div className="mb-2 text-sm font-bold uppercase tracking-wide text-red-700">Player 2 · Red</div>
          <p className="text-sm text-slate-600">
            Pull the robot to the <strong>right</strong> goal. Answer with the buttons on your side or keys{" "}
            <Keys keys={["7", "8", "9", "0"]} />.
          </p>
        </div>
      </div>

      <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
        <li>⏱ {GAME_CONFIG.SECONDS_PER_QUESTION}s per question</li>
        <li>✅ Correct answer pulls the robot toward you</li>
        <li>🏆 First to their goal line wins</li>
      </ul>

      <button
        type="button"
        onClick={onStart}
        disabled={loading}
        className="rounded-full bg-slate-900 px-10 py-4 text-lg font-bold text-white shadow-lg transition hover:scale-105 hover:bg-slate-800 active:scale-95 disabled:opacity-60"
      >
        {loading ? "Loading…" : "Start Game"}
      </button>
    </div>
  )
}

function Keys({ keys }: { keys: string[] }) {
  return (
    <span className="inline-flex gap-1 align-middle">
      {keys.map((k) => (
        <kbd
          key={k}
          className="rounded-md border border-slate-300 bg-white px-1.5 py-0.5 font-mono text-xs font-semibold text-slate-700 shadow-sm"
        >
          {k}
        </kbd>
      ))}
    </span>
  )
}
