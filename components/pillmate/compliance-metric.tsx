"use client"

import { useEffect, useState } from "react"
import { TrendingUp, Calendar } from "lucide-react"

interface ComplianceMetricProps {
  percentage: number
  takenDoses: number
  totalDoses: number
}

export function ComplianceMetric({ percentage, takenDoses, totalDoses }: ComplianceMetricProps) {
  const [animatedPercent, setAnimatedPercent] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedPercent(percentage), 100)
    return () => clearTimeout(timer)
  }, [percentage])

  const circumference = 2 * Math.PI * 52
  const strokeDashoffset = circumference - (animatedPercent / 100) * circumference

  const statusColor =
    percentage >= 80
      ? "text-success"
      : percentage >= 50
      ? "text-warning"
      : "text-destructive"

  const statusLabel =
    percentage >= 80
      ? "Excelente"
      : percentage >= 50
      ? "Regular"
      : "Necesita mejora"

  return (
    <div className="rounded-2xl bg-card border border-border p-5 shadow-sm flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-card-foreground">Adherencia Semanal</h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Calendar className="size-3.5" />
            Ultimos 7 dias
          </p>
        </div>
        <div className={`flex items-center gap-1.5 text-xs font-semibold ${statusColor}`}>
          <TrendingUp className="size-3.5" />
          {statusLabel}
        </div>
      </div>

      {/* Circular progress */}
      <div className="flex items-center gap-5">
        <div className="relative shrink-0">
          <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            className="-rotate-90"
            aria-label={`${percentage}% de adherencia semanal`}
            role="img"
          >
            <circle
              cx="60"
              cy="60"
              r="52"
              stroke="currentColor"
              className="text-muted/60"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="60"
              cy="60"
              r="52"
              stroke="currentColor"
              className={`${statusColor} transition-all duration-1000 ease-out`}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold ${statusColor}`}>
              {animatedPercent}%
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-col gap-3 flex-1">
          <div className="flex items-center justify-between rounded-lg bg-success/5 px-3 py-2">
            <span className="text-xs text-muted-foreground">Tomadas</span>
            <span className="text-sm font-bold text-success">{takenDoses}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-destructive/5 px-3 py-2">
            <span className="text-xs text-muted-foreground">Omitidas</span>
            <span className="text-sm font-bold text-destructive">{totalDoses - takenDoses}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2">
            <span className="text-xs text-muted-foreground">Total</span>
            <span className="text-sm font-bold text-foreground">{totalDoses}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
