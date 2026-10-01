'use client'

'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ThemeName } from '@/lib/game/theme'
import { useTheme } from './theme-provider'
import { useGameInput } from '@/lib/game/input'


const OPTIONS: { value: ThemeName; label: string; Icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
]

export function ThemeToggle({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' }) {
  const { theme, setTheme } = useTheme()
  const [controllerSelection, setControllerSelection] = useState<ThemeName>(theme)

  const [selection, setSelection] = useState(theme === 'light' ? 0 : 1)

useEffect(() => {
  setControllerSelection(theme)
}, [theme])
useEffect(() => {
  const handleThemeInput = (event: Event) => {
    const customEvent = event as CustomEvent<'left' | 'right'>

    setControllerSelection((current) => {
      if (customEvent.detail === 'left') {
        return current === 'light' ? 'dark' : 'light'
      }

      return current === 'light' ? 'dark' : 'light'
    })
  }

  window.addEventListener('theme-controller-input', handleThemeInput)

  return () => {
    window.removeEventListener('theme-controller-input', handleThemeInput)
  }
}, [])
useEffect(() => {
  const handleThemeConfirm = () => {
    setTheme(controllerSelection)
  }

  window.addEventListener('theme-controller-confirm', handleThemeConfirm)

  return () => {
    window.removeEventListener('theme-controller-confirm', handleThemeConfirm)
  }
}, [controllerSelection, setTheme])

useGameInput((event) => {
  if (event.input === 'left' || event.input === 'right') {
    setSelection((current) => (current === 0 ? 1 : 0))
    return
  }

  if (event.input === 'cross') {
    setTheme(OPTIONS[selection].value)
  }
}, true)

  return (
    <div
      role="group"
      aria-label="Color theme"
      className={cn(
        'arcade-panel relative inline-flex items-center gap-1 rounded-full p-1',
        className,
      )}
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = theme === value
        const controllerActive = controllerSelection === value
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            onClick={() => setTheme(value)}
           className={cn(
              'font-display inline-flex items-center gap-2 rounded-full uppercase transition-all duration-200',
              selection === OPTIONS.findIndex((option) => option.value === value)
                ? 'ring-2 ring-yellow-300 scale-105'
                : '',
              size === 'sm' ? 'px-3 py-1.5 text-[11px]' : 'px-4 py-2 text-xs',
              active
                ? value === 'light'
                  ? 'bg-accent text-accent-foreground shadow-[0_0_18px_-4px_var(--accent)]'
                  : 'bg-primary text-primary-foreground shadow-[0_0_18px_-4px_var(--primary)]'
                : 'text-muted-foreground hover:text-foreground',
                controllerActive ? 'ring-2 ring-yellow-300 scale-105' : ''
            )}
          >
            <Icon className="size-3.5" aria-hidden="true" />
            {label}
          </button>
        )
      })}
    </div>
  )
}
