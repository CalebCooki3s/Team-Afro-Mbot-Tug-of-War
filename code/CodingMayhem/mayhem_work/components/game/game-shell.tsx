'use client'

import { GameProvider, useGame } from '@/lib/game/game-context'
import { useGameInput } from '@/lib/game/input'
import { ArcadeBackground } from './arcade-background'
import { QuitConfirmation, RestartConfirmation } from './overlays/confirm-dialogs'
import { HelpOverlay } from './overlays/help-overlay'
import { PauseMenu } from './overlays/pause-menu'
import { SettingsOverlay } from './overlays/settings-overlay'
import { DifficultySelect } from './screens/difficulty-select'
import { GameBriefing } from './screens/game-briefing'
import { GameOverScreen } from './screens/game-over'
import { HowToPlay } from './screens/how-to-play'
import { MainMenu } from './screens/main-menu'
import { ModeSelect } from './screens/mode-select'
import { ReadyCheck } from './screens/ready-check'
import { GameSession } from './session/game-session'
import { DevLab } from './screens/dev-lab'
import { useEffect, useState } from 'react'


function ActiveScreen() {
  const { state } = useGame()
  switch (state.screen) {
    case 'menu':
      return <MainMenu />
    case 'mode':
      return <ModeSelect />
    case 'difficulty':
      return <DifficultySelect />
    case 'howto':
      return <HowToPlay />
    case 'briefing':
      return <GameBriefing />
    case 'ready':
      return <ReadyCheck />
    case 'session':
      return <GameSession />
    case 'gameover':
      return <GameOverScreen />
    case 'dev':
      return <DevLab />
  }
}

function ActiveOverlay() {
  const { state, dispatch } = useGame()
  const open = (overlay: 'pause' | 'help' | 'quit' | 'restart') => dispatch({ type: 'OPEN_OVERLAY', overlay })
  const close = () => dispatch({ type: 'CLOSE_OVERLAY' })
  const [pauseSelection, setPauseSelection] = useState(0)
  const [navigationMode, setNavigationMode] = useState<'vertical' | 'theme'>('vertical')

useEffect(() => {
  if (state.overlay === 'pause') {
    setPauseSelection(0)
    setNavigationMode('vertical')
  }
}, [state.overlay])

const pauseOptions = ['resume', 'restart', 'help', 'quit'] as const


  useGameInput((event) => {
    if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur()
  }


  if (state.overlay !== 'pause') return

  if (event.input === 'circle') {
    close()
    return
  }

  if (event.input === 'up') {
  setNavigationMode('vertical')
  setPauseSelection((current) =>
    Math.max(0, current - 1)
  )
  return
}

if (event.input === 'down') {
  setNavigationMode('vertical')
  setPauseSelection((current) =>
    Math.min(pauseOptions.length - 1, current + 1)
  )
  return
}

if (event.input === 'left' || event.input === 'right') {
  setNavigationMode('theme')

  window.dispatchEvent(
    new CustomEvent('theme-controller-input', {
      detail: event.input,
    }),
  )

  return
}

  if (event.input === 'cross') {
  if (navigationMode === 'theme') {
    window.dispatchEvent(new Event('theme-controller-confirm'))
    return
  }

  const selected = pauseOptions[pauseSelection]

    if (selected === 'resume') {
      close()
    } else if (selected === 'restart') {
      open('restart')
    } else if (selected === 'help') {
      open('help')
    } else if (selected === 'quit') {
      open('quit')
    } else if (selected === 'theme') {
  // Theme button is handled by the actual ThemeToggle below.
}
  }
}, state.overlay === 'pause')

  switch (state.overlay) {
    case 'pause':
      return (
       <PauseMenu
  selectedIndex={pauseSelection}
  onResume={close}
  onRestart={() => open('restart')}
  onHelp={() => open('help')}
  onQuit={() => open('quit')}
/>
      )
    case 'help':
      return state.session ? (
        <HelpOverlay microgame={state.session.microgame} mode={state.session.mode} onClose={close} />
      ) : null
 case 'restart':
  return (
    <RestartConfirmation
      onConfirm={() => {
        dispatch({ type: 'CLOSE_OVERLAY' })

        setTimeout(() => {
          dispatch({ type: 'RESTART_SESSION' })
        }, 0)
      }}
      onCancel={() => open('pause')}
    />
  )
    case 'quit':
      return <QuitConfirmation onConfirm={() => dispatch({ type: 'QUIT_TO_MENU' })} onCancel={() => open('pause')} />
    case 'settings':
      return <SettingsOverlay onClose={close} />
    default:
      return null
  }
}

function ShellFrame() {
  const { state } = useGame()
  return (
    <>
      <ArcadeBackground intensity={state.screen === 'session' ? 'calm' : 'full'} />
      <div key={state.screen} className="relative min-h-screen overflow-x-hidden animate-screen-in">
        <ActiveScreen />
      </div>
      <ActiveOverlay />
    </>
  )
}

export function GameShell() {
  return (
    <GameProvider>
      <ShellFrame />
    </GameProvider>
  )
}
