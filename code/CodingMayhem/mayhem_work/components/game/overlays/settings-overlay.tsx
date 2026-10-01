'use client'

import { Bluetooth, Gamepad2 } from 'lucide-react'
import { ArcadeButton } from '../arcade-button'
import { OverlayShell } from '../overlay-shell'
import { ThemeToggle } from '../theme-toggle'

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-surface/70 px-5 py-4 ring-1 ring-border">
      <span className="font-display text-sm uppercase text-foreground">{label}</span>
      {children}
    </div>
  )
}

function ComingSoon({ icon }: { icon: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-bold uppercase text-muted-foreground">
      {icon}
      Not connected
    </span>
  )
}

export function SettingsOverlay({ onClose }: { onClose: () => void }) {
  return (
    <OverlayShell title="Settings" onEscape={onClose}>
      <div className="flex flex-col gap-3">
        <Row label="Theme">
          <ThemeToggle size="sm" />
        </Row>
        <Row label="Controller">
          <ComingSoon icon={<Gamepad2 className="size-3.5" aria-hidden="true" />} />
        </Row>
        <Row label="mBot">
          <ComingSoon icon={<Bluetooth className="size-3.5" aria-hidden="true" />} />
        </Row>
      </div>
      <div className="mt-8 flex justify-center">
        <ArcadeButton size="lg" onClick={onClose}>
          Done
        </ArcadeButton>
      </div>
    </OverlayShell>
  )
}
