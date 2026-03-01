"use client"

import { useEffect, useState } from "react"
import { Pill, Clock } from "lucide-react"

interface NextDoseHeroProps {
  targetTime: string
  medication: string
  dosage: string
}

function parseCountdown(targetTime: string): { hours: string; minutes: string; seconds: string; totalSeconds: number } {
  const now = new Date()
  const [h, m] = targetTime.split(":").map(Number)
  const target = new Date(now)
  target.setHours(h, m, 0, 0)

  if (target <= now) {
    target.setDate(target.getDate() + 1)
  }

  const diff = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000))
  const hours = String(Math.floor(diff / 3600)).padStart(2, "0")
  const minutes = String(Math.floor((diff % 3600) / 60)).padStart(2, "0")
  const seconds = String(diff % 60).padStart(2, "0")

  return { hours, minutes, seconds, totalSeconds: diff }
}

export function NextDoseHero({ targetTime, medication, dosage }: NextDoseHeroProps) {
  const [countdown, setCountdown] = useState(() => parseCountdown(targetTime))

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(parseCountdown(targetTime))
    }, 1000)
    return () => clearInterval(interval)
  }, [targetTime])

  const isUrgent = countdown.totalSeconds < 1800

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-6 md:p-8 shadow-lg h-full">
      {/* Decorative circles */}
      <div className="absolute -top-8 -right-8 size-32 rounded-full bg-primary-foreground/5" />
      <div className="absolute -bottom-6 -left-6 size-24 rounded-full bg-primary-foreground/5" />

      <div className="relative flex flex-col gap-5">
        {/* Label */}
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-primary-foreground/70" />
          <span className="text-sm font-medium text-primary-foreground/70 uppercase tracking-wider">
            Proxima dosis
          </span>
        </div>

        {/* Countdown */}
        <div className="flex items-baseline gap-1" aria-label={`Faltan ${countdown.hours} horas, ${countdown.minutes} minutos y ${countdown.seconds} segundos`}>
          <div className="flex items-baseline gap-1">
            <span className="text-5xl md:text-6xl font-bold text-primary-foreground font-mono tabular-nums tracking-tight">
              {countdown.hours}
            </span>
            <span className="text-2xl md:text-3xl font-bold text-primary-foreground/50 animate-pulse">:</span>
            <span className="text-5xl md:text-6xl font-bold text-primary-foreground font-mono tabular-nums tracking-tight">
              {countdown.minutes}
            </span>
            <span className="text-2xl md:text-3xl font-bold text-primary-foreground/50 animate-pulse">:</span>
            <span className="text-5xl md:text-6xl font-bold text-primary-foreground font-mono tabular-nums tracking-tight">
              {countdown.seconds}
            </span>
          </div>
        </div>

        {/* Medication info */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center size-10 rounded-xl ${isUrgent ? "bg-warning/20" : "bg-primary-foreground/10"}`}>
            <Pill className={`size-5 ${isUrgent ? "text-warning" : "text-primary-foreground/80"}`} />
          </div>
          <div>
            <p className="text-lg font-bold text-primary-foreground">{medication}</p>
            <p className="text-sm text-primary-foreground/60">{dosage}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
