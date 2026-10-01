import type { Difficulty, GameMode } from './types'

export const RULES = {
  solo: {
    startDistance: 60,
    push: 12,
    pull: 20,
  },
  versus: {
    step: 25,
    max: 100,
  },
  introMs: 3200,
  countdownStepMs: 700,
  resultMs: 4500,
} as const

export interface ModeInfo {
  id: GameMode
  title: string
  shortTitle: string
  description: string
  briefingFlow: [string, string, string]
}

export const MODES: Record<GameMode, ModeInfo> = {
  solo: {
    id: 'solo',
    title: 'Solo / Bomb Mode',
    shortTitle: 'Solo',
    description:
      "You're on your own. Solve programming microgames while the mBot gets closer. Correct answers push it away. Wrong answers let it move closer.",
    briefingFlow: ['Solve the challenge', 'Get it right', 'Push the mBot'],
  },
  versus: {
    id: 'versus',
    title: 'Two Player Tug of War',
    shortTitle: 'Two Player',
    description:
      'Battle another player. Solve programming challenges to pull the mBot toward your side.',
    briefingFlow: ['Solve it first', 'Get it right', 'Pull the mBot'],
  },
}

export interface DifficultyInfo {
  id: Difficulty
  label: string
  level: 1 | 2 | 3 | 4
  description: string
  briefing: string
  /** CSS variable holding this difficulty's color */
  colorVar: string
  timeMultiplier: number
}

export const DIFFICULTIES: Record<Difficulty, DifficultyInfo> = {
  easy: {
    id: 'easy',
    label: 'Easy',
    level: 1,
    description:
      'Programming fundamentals, variables, operators, simple conditions, and basic code recognition.',
    briefing: 'Warm up your brain. Spot values, read simple code, and keep the mBot at bay.',
    colorVar: 'var(--diff-easy)',
    timeMultiplier: 1,
  },
  medium: {
    id: 'medium',
    label: 'Medium',
    level: 2,
    description:
      'Trace code, work with loops and functions, and solve short programming problems.',
    briefing: 'Loops, functions, and quick traces. Think one step ahead of the machine.',
    colorVar: 'var(--diff-medium)',
    timeMultiplier: 1,
  },
  hard: {
    id: 'hard',
    label: 'Hard',
    level: 3,
    description:
      'Debug code, reason through recursion, solve multi-step problems, and identify programming patterns.',
    briefing: 'Bugs are hiding everywhere. Debug fast, reason deep, and never blink.',
    colorVar: 'var(--diff-hard)',
    timeMultiplier: 1,
  },
  extreme: {
    id: 'extreme',
    label: 'Extreme',
    level: 4,
    description:
      'Advanced programming challenges, technical interview-style problems, algorithms, recursion, and code construction.',
    briefing: 'Interview-grade pressure. Algorithms, recursion, and zero margin for error.',
    colorVar: 'var(--diff-extreme)',
    timeMultiplier: 1,
  },
}

export const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'medium', 'hard', 'extreme']
