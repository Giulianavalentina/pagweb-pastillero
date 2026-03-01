"use client"

import { useState } from "react"
import { LayoutDashboard, CalendarDays, Settings, Pill, ChevronLeft, ChevronRight } from "lucide-react"

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: CalendarDays, label: "Calendario", active: false },
  { icon: Settings, label: "Configuracion", active: false },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(true)

  return (
    <aside
      className={`hidden md:flex flex-col shrink-0 bg-card border-r border-border transition-all duration-300 ease-in-out ${
        collapsed ? "w-[68px]" : "w-52"
      }`}
    >
      {/* Logo area */}
      <div className="flex items-center gap-2.5 px-4 h-16 border-b border-border overflow-hidden">
        <div className="flex items-center justify-center size-9 rounded-xl bg-primary shadow-sm shrink-0">
          <Pill className="size-4.5 text-primary-foreground" />
        </div>
        <span
          className={`text-lg font-bold text-foreground tracking-tight whitespace-nowrap transition-opacity duration-200 ${
            collapsed ? "opacity-0 w-0" : "opacity-100"
          }`}
        >
          PillMate
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1.5 p-3 flex-1" aria-label="Navegacion principal">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.label}
            className={`group flex items-center gap-3 rounded-xl px-3 h-11 transition-all duration-200 overflow-hidden ${
              item.active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            aria-current={item.active ? "page" : undefined}
            title={item.label}
          >
            <item.icon className="size-5 shrink-0" />
            <span
              className={`text-sm font-medium whitespace-nowrap transition-opacity duration-200 ${
                collapsed ? "opacity-0 w-0" : "opacity-100"
              }`}
            >
              {item.label}
            </span>
            {item.active && collapsed && (
              <span className="sr-only">(pagina actual)</span>
            )}
          </button>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full h-9 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label={collapsed ? "Expandir barra lateral" : "Colapsar barra lateral"}
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>
      </div>
    </aside>
  )
}
