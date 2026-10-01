'use client'

import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react'
import { gameReducer, initialGameState, type GameAction } from './reducer'
import { useControllerCursor, useGamepadInput } from './input'
import type { GameState } from './types'

interface GameContextValue {
  state: GameState
  dispatch: Dispatch<GameAction>
  /** True when gameplay timers should be frozen. */
  isPaused: boolean
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState)

  useControllerCursor()

  useGamepadInput(
    state.screen !== 'gameover',
    state.screen !== 'ready',
  )

  const value = useMemo(
    () => ({
      state,
      dispatch,
      isPaused: state.overlay !== null,
    }),
    [state],
  )

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const ctx = useContext(GameContext)

  if (!ctx) {
    throw new Error('useGame must be used within GameProvider')
  }

  return ctx
}