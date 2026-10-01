/** Tunable rules for the tug-of-war game, kept in one place for easy balancing. */
export const GAME_CONFIG = {
  /** Rope position runs 0 (Player 1 wins) .. 100 (Player 2 wins). Start centered. */
  START_POSITION: 50,
  /** How far the robot slides toward a player on a correct answer. */
  PULL_AMOUNT: 12.5,
  /** Player 1 wins when the robot reaches this position or lower. */
  P1_WIN_POSITION: 6,
  /** Player 2 wins when the robot reaches this position or higher. */
  P2_WIN_POSITION: 94,
  /** Seconds allowed per question before it is skipped. */
  SECONDS_PER_QUESTION: 20,
  /** Delay (ms) before advancing to the next question after a result. */
  ADVANCE_DELAY_MS: 1400,
} as const

export type PlayerId = 1 | 2

export const PLAYERS: Record<
  PlayerId,
  { id: PlayerId; name: string; color: string; keys: string[] }
> = {
  1: { id: 1, name: "Player 1", color: "blue", keys: ["1", "2", "3", "4"] },
  2: { id: 2, name: "Player 2", color: "red", keys: ["7", "8", "9", "0"] },
}
