'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * A countdown that truly freezes while paused and resumes from where it left
 * off. Remount (via `key`) to reset. Returns remaining milliseconds.
 */
export function usePausableTimer(
  durationMs: number,
  paused: boolean,
  onComplete?: () => void,
) {
  const [remaining, setRemaining] = useState(durationMs)
  const remainingRef = useRef(durationMs)
  const doneRef = useRef(false)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    if (paused || doneRef.current) return
    let last = performance.now()
    let frame = 0

    const tick = (now: number) => {
      remainingRef.current = Math.max(0, remainingRef.current - (now - last))
      last = now
      setRemaining(remainingRef.current)
      if (remainingRef.current <= 0) {
        doneRef.current = true
        onCompleteRef.current?.()
        return
      }
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [paused])

  return remaining
}
