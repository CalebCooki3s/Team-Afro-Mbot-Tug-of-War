"use client"

import { GAME_CONFIG } from "@/lib/game-config"

export function RopeArena({ position }: { position: number }) {
  // Pull direction hint based on distance from center.
  const fromCenter = position - GAME_CONFIG.START_POSITION
  const leaning = Math.abs(fromCenter) < 2 ? "center" : fromCenter < 0 ? "left" : "right"

  return (
    <div className="relative h-44 w-full overflow-hidden rounded-3xl border-2 border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100 shadow-inner sm:h-52">
      {/* Goal zones */}
      <GoalZone side="left" active={leaning === "left"} />
      <GoalZone side="right" active={leaning === "right"} />

      {/* Center line */}
      <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 border-l-2 border-dashed border-slate-300" />
      <div className="absolute left-1/2 top-2 -translate-x-1/2 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
        Start
      </div>

      {/* Rope */}
      <div className="absolute left-0 top-1/2 h-2 w-full -translate-y-1/2 rounded-full bg-gradient-to-r from-amber-700 via-amber-500 to-amber-700 opacity-80" />

      {/* Robot on the rope */}
      <div
        className="absolute top-1/2 z-10 transition-[left] duration-700 ease-out"
        style={{ left: `${position}%` }}
      >
        <div className="animate-robot-bob overflow-hidden rounded-full bg-white shadow-xl ring-4 ring-white">
          <img
            src="/robot.png"
            alt="Robot being pulled across the rope"
            className="h-24 w-24 object-cover sm:h-28 sm:w-28"
          />
        </div>
      </div>
    </div>
  )
}

function GoalZone({ side, active }: { side: "left" | "right"; active: boolean }) {
  const isLeft = side === "left"
  const tone = isLeft ? "blue" : "red"
  const grad = isLeft
    ? "bg-gradient-to-r from-blue-500/25 to-transparent"
    : "bg-gradient-to-l from-red-500/25 to-transparent"
  const border = isLeft ? "border-blue-400" : "border-red-400"
  const text = isLeft ? "text-blue-700" : "text-red-700"

  return (
    <div
      className={`absolute top-0 h-full ${grad} ${isLeft ? "left-0" : "right-0"}`}
      style={{ width: `${GAME_CONFIG.P1_WIN_POSITION + 4}%` }}
    >
      <div
        className={`absolute top-0 h-full border-dashed ${border} ${
          isLeft ? "right-0 border-r-2" : "left-0 border-l-2"
        } ${active ? "opacity-100" : "opacity-60"}`}
      />
      <div
        className={`absolute top-1/2 -translate-y-1/2 ${isLeft ? "left-2" : "right-2"} flex flex-col items-center gap-1`}
      >
        <span className={`text-2xl ${active ? "animate-bounce" : ""}`}>{isLeft ? "🏁" : "🏁"}</span>
        <span className={`text-[10px] font-black uppercase tracking-wider ${text}`}>{isLeft ? "P1" : "P2"}</span>
      </div>
    </div>
  )
}
