export type GameMode = 'solo' | 'versus'

export type Difficulty = 'easy' | 'medium' | 'hard' | 'extreme'

export type PlayerId = 1 | 2

/**
 * Abstract game inputs. Keyboard maps to these today; a PS4 controller
 * adapter can later emit the exact same events (see lib/game/input.ts).
 */
export type GameInput =
  | 'cross'
  | 'circle'
  | 'square'
  | 'triangle'
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'options'

/** Inputs that can be listed in a microgame's control instructions. */
export type ControlInput =
  | 'cross'
  | 'circle'
  | 'square'
  | 'triangle'
  | 'dpad'
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'lstick'
  | 'rstick'
  | 'l1'
  | 'r1'
  | 'options'

export interface MicrogameControl {
  input: ControlInput
  label: string
}

/** Future mechanics — used for tagging/visuals only in this build. */
export type MicrogameMechanic =
  | 'debug'
  | 'predict'
  | 'build'
  | 'trace'
  | 'catch'
  | 'dodge'
  | 'match'
  | 'navigate'
  | 'algorithm'
  | 'boss'

/**
 * The data contract every microgame provides. `kind` selects the renderer
 * from the microgame registry; `payload` is renderer-specific.
 */
export interface MicrogameDefinition<TPayload = unknown> {
  id: string
  kind: string
  mechanic: MicrogameMechanic
  name: string
  description: string
  objective: string
  controls: MicrogameControl[]
  difficulty: Difficulty
  isDevSession: boolean
  devControllerReady: boolean
  /** Seconds */
  timeLimit: number
  payload: TPayload
}

export type RoundOutcome = 'success' | 'failure' | 'timeout'

export interface RoundResult {
  outcome: RoundOutcome
  /** Which player produced the result (versus mode). */
  player?: PlayerId
  /** Optional teaching feedback shown after a missed challenge. */
  explanation?: string
  /** Optional correct answer/value shown in the result feedback. */
  correctAnswer?: string
}

export interface ResolvedRound extends RoundResult {
  robotBefore: number
  robotAfter: number
}

export type SessionPhase = 'intro' | 'countdown' | 'playing' | 'result'

export interface SessionState {
  /** Changes on every new/restarted session so timers remount. */
  id: string
  mode: GameMode
  difficulty: Difficulty
  round: number
  phase: SessionPhase
  microgame: MicrogameDefinition
  /** Solo */
  score: number
  roundsPlayed: number
  streak: number
  bestStreak: number
  /** Solo: 0 (caught) → 100 (safe). Versus: -100 (P1 side) → 100 (P2 side). */
  robot: number
  /** Versus */
  scores: Record<PlayerId, number>
  lastRound: ResolvedRound | null
  roundResults: Partial<Record<PlayerId, RoundResult>>
  acknowledged: Partial<Record<PlayerId, boolean>>
  winner: PlayerId | null
  isOver: boolean
  history: string[]


  robotMode: RobotMode
}

export type Screen =
  | 'menu'
  | 'mode'
  | 'difficulty'
  | 'howto'
  | 'briefing'
  | 'ready'
  | 'session'
  | 'gameover'
  | 'dev'

export type Overlay = 'pause' | 'help' | 'quit' | 'restart' | 'settings' | null

export type HowToOrigin = 'menu' | 'briefing'

export type RobotMode = 'physical' | 'virtual'

export interface GameState {
  screen: Screen
  overlay: Overlay
  howToOrigin: HowToOrigin
  mode: GameMode | null
  difficulty: Difficulty | null
  robotMode: RobotMode
  session: SessionState | null
  isDevSession: boolean
  devControllerReady: boolean
}

/** Props every microgame renderer receives. */
export interface MicrogameProps<TPayload = unknown> {
  definition: MicrogameDefinition<TPayload>
  mode: GameMode
  /** True while the round is live and unpaused. Renderers must ignore input otherwise. */
  active: boolean
  /** In versus mode, an individual player renderer can be isolated to this player. */
  player?: PlayerId
  onResolve: (result: RoundResult) => void
}
