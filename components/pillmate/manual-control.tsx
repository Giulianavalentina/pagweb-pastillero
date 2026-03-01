"use client"

import { Pill, Wifi, WifiOff, Bell } from "lucide-react"

interface HeaderProps {
  isConnected: boolean
  alarmCount?: number
}

export function Header({ isConnected, alarmCount = 0 }: HeaderProps) {
  return (
    <header className="bg-card border-b border-border px-4 py-3 md:px-6 h-16 flex items-center shrink-0">
      <div className="w-full flex items-center justify-between">
        {/* Logo on mobile */}
        <div className="flex md:hidden items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-primary shadow-sm">
            <Pill className="size-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">
              PillMate
            </h1>
            <p className="text-xs text-muted-foreground leading-none">
              Pastillero Inteligente
            </p>
          </div>
        </div>

        {/* Page title on desktop */}
        <div className="hidden md:flex items-center gap-3">
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            Dashboard
          </h1>
          <span className="text-sm text-muted-foreground">
            Panel de control del dispositivo
          </span>
        </div>

        {/* Right side: alarm count + connection status */}
        <div className="flex items-center gap-3">
          {/* Active alarms badge */}
          {alarmCount > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              <Bell className="size-3.5" />
              <span>{alarmCount} activas</span>
            </div>
          )}

          {/* Connection status */}
          <div
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
              isConnected
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive"
            }`}
            role="status"
            aria-live="polite"
          >
            {isConnected ? (
              <>
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-success" />
                </span>
                <Wifi className="size-3.5" />
                <span className="hidden sm:inline">En linea</span>
              </>
            ) : (
              <>
                <span className="size-2 rounded-full bg-destructive" />
                <WifiOff className="size-3.5" />
                <span className="hidden sm:inline">Desconectado</span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
