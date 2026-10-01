'use client'

export const ROBOT_SERVER_URL = 'http://127.0.0.1:5001'

export async function checkRobotConnection(
  signal?: AbortSignal,
): Promise<boolean> {
  try {
    const response = await fetch(
      `${ROBOT_SERVER_URL}/robot/status`,
      {
        method: 'GET',
        signal,
        cache: 'no-store',
      },
    )

    if (!response.ok) {
      return false
    }

    const data = await response.json()

    return data.connected === true
  } catch {
    return false
  }
}