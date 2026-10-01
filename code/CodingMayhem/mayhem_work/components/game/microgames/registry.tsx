'use client'

import type { ComponentType } from 'react'
import type { MicrogameProps } from '@/lib/game/types'
import {
  BubbleBlitzMicrogame,
  BugHuntMicrogame,
  CodeBuildMicrogame,
  MatchPairsMicrogame,
  QuickChoiceMicrogame,
  DodgeCodeMicrogame,
  TraceRaceMicrogame,
  BooleanBlitzMicrogame,
  LoopLabMicrogame,
  FunctionForgeMicrogame,
  ComplexityCrashMicrogame,
  LoopCountMicrogame,
  AlgorithmArenaMicrogame,
} from './interactive-microgames'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MICROGAME_REGISTRY: Record<string, ComponentType<MicrogameProps<any>>> = {
  'quick-choice': QuickChoiceMicrogame,
  'bug-hunt': BugHuntMicrogame,
  'code-build': CodeBuildMicrogame,
  'bubble-blitz': BubbleBlitzMicrogame,
  'match-pairs': MatchPairsMicrogame,
  'dodge-code': DodgeCodeMicrogame,
  'trace-race': TraceRaceMicrogame,
  'boolean-blitz': BooleanBlitzMicrogame,
  'loop-lab': LoopLabMicrogame,
  'function-forge': FunctionForgeMicrogame,
  'complexity-crash': ComplexityCrashMicrogame,
  'loop-count': LoopCountMicrogame,
  'algorithm-arena': AlgorithmArenaMicrogame,
}

export function MicrogameRenderer(props: MicrogameProps) {
  const Renderer = MICROGAME_REGISTRY[props.definition.kind]
  if (!Renderer) {
    return (
      <div className="flex flex-1 items-center justify-center p-10 text-center text-muted-foreground">
        {`No renderer registered for microgame kind "${props.definition.kind}".`}
      </div>
    )
  }
  return <Renderer {...props} />
}
