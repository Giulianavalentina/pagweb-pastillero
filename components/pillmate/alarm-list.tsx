"use client"

import { Pill, BellOff } from "lucide-react"
import { Switch } from "@/components/ui/switch"

export interface Alarm {
  id: string
  time: string
  medication: string
  dosage: string
  enabled: boolean
}

interface AlarmListProps {
  alarms: Alarm[]
  onToggle: (id: string) => void
}

export function AlarmList({ alarms, onToggle }: AlarmListProps) {
  return (
    <div className="rounded-2xl bg-card border border-border p-5 shadow-sm flex flex-col gap-4 flex-1">
      <div>
        <h3 className="text-base font-bold text-card-foreground">Alarmas Programadas</h3>
        <p className="text-sm text-muted-foreground">
          {alarms.length} {alarms.length === 1 ? "medicamento configurado" : "medicamentos configurados"}
        </p>
      </div>

      {alarms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <BellOff className="size-8 mb-2 opacity-40" />
          <p className="text-sm font-medium">No hay alarmas</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5" role="list" aria-label="Lista de alarmas programadas">
          {alarms.map((alarm) => (
            <li
              key={alarm.id}
              className={`group flex items-center justify-between rounded-xl border p-3.5 transition-all duration-200 ${
                alarm.enabled
                  ? "bg-card border-border hover:border-primary/20 hover:shadow-sm"
                  : "bg-muted/40 border-border/50"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`flex items-center justify-center size-10 rounded-lg transition-colors ${
                    alarm.enabled
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Pill className="size-5" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`font-mono text-lg font-bold leading-none ${
                        alarm.enabled ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {alarm.time}
                    </span>
                    <span className={`text-sm font-semibold ${alarm.enabled ? "text-card-foreground" : "text-muted-foreground"}`}>
                      {alarm.medication}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground mt-0.5">{alarm.dosage}</span>
                </div>
              </div>

              <Switch
                checked={alarm.enabled}
                onCheckedChange={() => onToggle(alarm.id)}
                aria-label={`${alarm.enabled ? "Desactivar" : "Activar"} alarma de ${alarm.medication}`}
                className="data-[state=checked]:bg-primary scale-110"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
