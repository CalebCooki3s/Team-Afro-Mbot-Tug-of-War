import { DIFFICULTIES } from './config'
import { generateMicrogame } from './challenges'
import type { Difficulty, MicrogameDefinition } from './types'

/**
 * Dynamic challenge seam. Each round creates a fresh challenge so the
 * content can vary even when the same mechanic appears again.
 */
export function getNextMicrogame(
  difficulty: Difficulty,
  history: string[],
): MicrogameDefinition {
  let microgame = generateMicrogame(difficulty, history.length)

  // Avoid immediately repeating the same mechanic when possible.
  const recentMechanics = new Set(
    history.slice(-2).map((id) => id.split('-')[0]),
  )

  for (let i = 0; i < 4 && recentMechanics.has(microgame.kind.replace(/-.*/, '')); i += 1) {
    microgame = generateMicrogame(difficulty, history.length + i + 1)
  }

  return {
    ...microgame,
    timeLimit: Math.max(4, Math.round(microgame.timeLimit * DIFFICULTIES[difficulty].timeMultiplier)),
  }
}
