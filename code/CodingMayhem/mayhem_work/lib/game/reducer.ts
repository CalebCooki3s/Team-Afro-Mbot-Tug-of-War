import { RULES } from './config'
import { getNextMicrogame } from './microgame-source'
import { generateMicrogame } from './challenges'
import type {
  Difficulty,
  GameMode,
  GameState,
  HowToOrigin,
  Overlay,
  RobotMode,
  RoundResult,
  Screen,
  SessionPhase,
  SessionState,
  PlayerId,
} from './types'

export type GameAction =
  | { type: 'GO_TO'; screen: Screen }
  | { type: 'OPEN_HOW_TO'; origin: HowToOrigin }
  | { type: 'SELECT_MODE'; mode: GameMode }
  | { type: 'SELECT_DIFFICULTY'; difficulty: Difficulty }
  | { type: 'SET_ROBOT_MODE'; robotMode: RobotMode }
  | { type: 'START_SESSION' }
  | { type: 'RESTART_SESSION' }
  | { type: 'SET_DEV_CONTROLLER_READY'; value: boolean }
    | {
      type: 'START_DEV_SESSION'
      difficulty: Difficulty
      mode: GameMode
      serial: number
      family: string
    }
  | { type: 'ACKNOWLEDGE_RESULT'; player: PlayerId }
  | { type: 'SET_PHASE'; phase: SessionPhase }
  | { type: 'RESOLVE_ROUND'; result: RoundResult }
  | { type: 'NEXT_ROUND' }
  | { type: 'OPEN_OVERLAY'; overlay: Exclude<Overlay, null> }
  | { type: 'CLOSE_OVERLAY' }
  | { type: 'QUIT_TO_MENU' }

export const initialGameState: GameState = {
  screen: 'menu',
  overlay: null,
  howToOrigin: 'menu',
  mode: null,
  difficulty: null,
  robotMode: 'physical',
  session: null,
  isDevSession: false,
  devControllerReady: false,
}

function createSession(mode: GameMode, difficulty: Difficulty, robotMode: RobotMode, ): SessionState {
  const microgame = getNextMicrogame(difficulty, [])
  return {
    id: Math.random().toString(36).slice(2),
    mode,
    difficulty,
    round: 1,
    phase: 'intro',
    microgame,
    score: 0,
    roundsPlayed: 0,
    streak: 0,
    bestStreak: 0,
    robot: mode === 'solo' ? RULES.solo.startDistance : 0,
    scores: { 1: 0, 2: 0 },
    roundResults: {},
    acknowledged: {},
    lastRound: null,
    winner: null,
    isOver: false,
    history: [microgame.id],
    robotMode
  }
}
function createDevSession(
  mode: GameMode,
  difficulty: Difficulty,
  robotMode: RobotMode,
  serial: number,
  family: string,
): SessionState {
  const microgame = generateMicrogame(
    difficulty,
    serial,
    family as Parameters<typeof generateMicrogame>[2],
  )

  return {
    id: Math.random().toString(36).slice(2),
    mode,
    difficulty,
    round: 1,
    phase: 'intro',
    microgame,
    score: 0,
    roundsPlayed: 0,
    streak: 0,
    bestStreak: 0,
    robot: mode === 'solo' ? RULES.solo.startDistance : 0,
    scores: { 1: 0, 2: 0 },
    roundResults: {},
    acknowledged: {},
    lastRound: null,
    winner: null,
    isOver: false,
    history: [microgame.id],
    robotMode,
  }
}
function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function resolveRound(session: SessionState, result: RoundResult): SessionState {
  const robotBefore = session.robot
  const roundsPlayed = session.roundsPlayed + 1

  if (session.mode === 'solo') {
    const success = result.outcome === 'success'
    const robot = success
      ? clamp(robotBefore + RULES.solo.push, 0, 100)
      : clamp(robotBefore - RULES.solo.pull, 0, 100)
    const streak = success ? session.streak + 1 : 0
    return {
      ...session,
      phase: 'result',
      roundsPlayed,
      score: success ? session.score + 1 : session.score,
      streak,
      bestStreak: Math.max(session.bestStreak, streak),
      robot,
      lastRound: { ...result, robotBefore, robotAfter: robot },
      isOver: robot <= 0,
    }
  }

  // Versus: negative values pull toward Player 1, positive toward Player 2.
  let robot = robotBefore
  const scores = { ...session.scores }
  if (result.player && result.outcome !== 'timeout') {
    const towardP1 = result.player === 1 ? -1 : 1
    const direction = result.outcome === 'success' ? towardP1 : -towardP1
    robot = clamp(robotBefore + direction * RULES.versus.step, -RULES.versus.max, RULES.versus.max)
    if (result.outcome === 'success') scores[result.player] += 1
  }
  const winner = robot <= -RULES.versus.max ? 1 : robot >= RULES.versus.max ? 2 : null

  return {
    ...session,
    phase: 'result',
    roundsPlayed,
    scores,
    robot,
    lastRound: { ...result, robotBefore, robotAfter: robot },
    winner,
    isOver: winner !== null,
  }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'GO_TO':
      return { ...state, screen: action.screen, overlay: null }

    case 'OPEN_HOW_TO':
      return { ...state, screen: 'howto', howToOrigin: action.origin, overlay: null }

    case 'SELECT_MODE':
      return { ...state, mode: action.mode, screen: 'difficulty' }

    case 'SELECT_DIFFICULTY':
      return { ...state, difficulty: action.difficulty, screen: 'briefing' }

    case 'SET_ROBOT_MODE':
      return {...state, robotMode: action.robotMode, }

    case 'START_SESSION': {
      if (!state.mode) return { ...state, screen: 'mode' }
      if (!state.difficulty) return { ...state, screen: 'difficulty' }
      return {
        ...state,
        screen: 'session',
        overlay: null,
        session: createSession(state.mode, state.difficulty, state.robotMode, ),
      }
    }
  case 'RESTART_SESSION': {
  const session = state.session

  if (!session) {
    return state
  }

  const microgame = state.isDevSession
  ? session.microgame
  : getNextMicrogame(session.difficulty, [])
  return {
    ...state,
    screen: 'session',
    overlay: null,
    session: {
      ...session,
      id: Math.random().toString(36).slice(2),
      round: 1,
      phase: 'intro',
      microgame,
      score: 0,
      roundsPlayed: 0,
      streak: 0,
      bestStreak: 0,
      robot: session.mode === 'solo' ? RULES.solo.startDistance : 0,
      scores: { 1: 0, 2: 0 },
      roundResults: {},
      acknowledged: {},
      lastRound: null,
      winner: null,
      isOver: false,
      history: [microgame.id],
    },
  }
}
        case 'START_DEV_SESSION': {
      return {
        ...state,
        screen: 'session',
        overlay: null,
        session: createDevSession(
          action.mode,
          action.difficulty,
          state.robotMode,
          action.serial,
          action.family,
        ),
      }
    }

    case 'SET_PHASE':
      if (!state.session) return state
      return { ...state, session: { ...state.session, phase: action.phase } }

    case 'RESOLVE_ROUND': {
      if (!state.session || state.session.phase !== 'playing') return state
      if (state.session.mode === 'solo') {
        return { ...state, session: resolveRound(state.session, action.result) }
      }
      const player = action.result.player
      if (!player || state.session.roundResults[player]) return state
      const roundResults = { ...state.session.roundResults, [player]: action.result }
      if (!roundResults[1] || !roundResults[2]) {
        return { ...state, session: { ...state.session, roundResults } }
      }
      const p1 = roundResults[1]
      const p2 = roundResults[2]
      const robotBefore = state.session.robot
      let robot = robotBefore
      const scores = { ...state.session.scores }
      if (p1.outcome === 'success') { robot -= RULES.versus.step; scores[1] += 1 }
      if (p2.outcome === 'success') { robot += RULES.versus.step; scores[2] += 1 }
      // Wrong answers do not create an additional pull; this keeps two wrong answers neutral.
      robot = clamp(robot, -RULES.versus.max, RULES.versus.max)
      const winner = robot <= -RULES.versus.max ? 1 : robot >= RULES.versus.max ? 2 : null
      const primary = p1.outcome === 'failure' || p1.outcome === 'timeout' ? p1 : p2
      const acknowledged = { 1: false, 2: false }
      return { ...state, session: { ...state.session, phase: 'result', roundsPlayed: state.session.roundsPlayed + 1, scores, robot, roundResults, lastRound: { ...primary, robotBefore, robotAfter: robot }, winner, isOver: winner !== null } }
    }

    case 'ACKNOWLEDGE_RESULT': {
      const session = state.session
      if (!session || session.phase !== 'result') return state
      const acknowledged = { ...session.acknowledged, [action.player]: true }
      const results = session.roundResults
      const needs = session.mode === 'solo'
        ? [1] as const
        : ([1, 2] as const)
      const done = needs.every((p) => acknowledged[p])

if (!done) {
  return {
    ...state,
    session: {
      ...session,
      acknowledged,
    },
  }
}

if (session.isOver) {
  return {
    ...state,
    session: {
      ...session,
      acknowledged,
    },
    screen: 'gameover',
    overlay: null,
  }
}
      const microgame = getNextMicrogame(session.difficulty, session.history)
      return {
        ...state,
        screen: 'session',
        overlay: null,
        session: {
          ...session,
          round: session.round + 1,
          phase: 'intro',
          microgame,
          lastRound: null,
          roundResults: {},
          acknowledged: {},
          history: [...session.history, microgame.id],
        },
      }
    }

    case 'NEXT_ROUND': {
      const session = state.session
      if (!session) return state
      if (session.isOver) return { ...state, screen: 'gameover', overlay: null }
      const microgame = getNextMicrogame(session.difficulty, session.history)
      return {
        ...state,
        session: {
          ...session,
          round: session.round + 1,
          phase: 'intro',
          microgame,
          lastRound: null,
          roundResults: {},
          acknowledged: {},
          history: [...session.history, microgame.id],
        },
      }
    }

    case 'OPEN_OVERLAY':
      return { ...state, overlay: action.overlay }

    case 'CLOSE_OVERLAY':
      return { ...state, overlay: null }

    case 'SET_DEV_CONTROLLER_READY':
  return {
    ...state,
    devControllerReady: action.value,
  }

    case 'QUIT_TO_MENU': {
  if (state.isDevSession) {
    return {
      ...state,
      screen: 'dev',
      overlay: null,
      session: null,
    }
  }

  return { ...initialGameState }
}

    default:
      return state
  }
}
