'use client'

import { ROBOT_SERVER_URL } from './robot-connection'

export type RobotDirection = 'forward' | 'backward'

async function sendRobotCommand(
  direction: RobotDirection,
): Promise<boolean> {
  try {
    const response = await fetch(
      `${ROBOT_SERVER_URL}/robot/${direction}`,
      {
        method: 'POST',
        cache: 'no-store',
      },
    )

    return response.ok
  } catch {
    return false
  }
}

export function moveRobot(direction: RobotDirection) {
  return sendRobotCommand(direction)
}

export async function stopRobot() {
  try {
    const response = await fetch(
      `${ROBOT_SERVER_URL}/robot/stop`,
      {
        method: 'POST',
        cache: 'no-store',
      },
    )

    return response.ok
  } catch {
    return false
  }
}