"use client"

import { CheckCircle2, History } from "lucide-react"

export interface DispenseRecord {
  id: string
  medication: string
  time: string
  date: string
  method: "manual" | "programada"
}

interface DispenseHistoryProps {
  records: DispenseRecord[]
}

export function DispenseHistory({ records }: DispenseHistoryProps) {
  return (
    <div className="rounded-2xl bg-card border border-border p-5 shadow-sm flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-card-foreground">Historial Reciente</h3>
          <p className="text-sm text-muted-foreground">Ultimas dispensaciones</p>
        </div>
        <History className="size-4 text-muted-foreground" />
      </div>

      {records.length === 0 ? (
        <p className="text-center text-muted-foreground py-4 text-sm">
          No hay registros aun.
        </p>
      ) : (
        <ul className="flex flex-col gap-2" role="list" aria-label="Historial de dispensaciones">
          {records.map((record) => (
            <li
              key={record.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center justify-center size-8 rounded-lg bg-success/10 shrink-0">
                <CheckCircle2 className="size-4 text-success" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-card-foreground truncate">
                  {record.medication}
                </p>
                <p className="text-xs text-muted-foreground">
                  {record.date} - {record.time}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                  record.method === "manual"
                    ? "bg-warning/10 text-warning-foreground"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {record.method === "manual" ? "Manual" : "Auto"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
