"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface AddAlarmDialogProps {
  onAdd: (alarm: { time: string; medication: string; dosage: string }) => void
}

export function AddAlarmDialog({ onAdd }: AddAlarmDialogProps) {
  const [open, setOpen] = useState(false)
  const [time, setTime] = useState("08:00")
  const [medication, setMedication] = useState("")
  const [dosage, setDosage] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!medication.trim()) return
    onAdd({ time, medication: medication.trim(), dosage: dosage.trim() || "1 pastilla" })
    setTime("08:00")
    setMedication("")
    setDosage("")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="w-full h-12 gap-2 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all duration-200"
          aria-label="Agregar nueva alarma"
        >
          <Plus className="size-4" />
          Nueva Alarma
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg text-card-foreground">Nueva Alarma</DialogTitle>
          <DialogDescription>
            Configura una nueva alarma para tu medicamento.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="alarm-time" className="text-sm font-medium text-card-foreground">
              Hora
            </Label>
            <Input
              id="alarm-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="h-11 text-base bg-background text-foreground rounded-lg"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="alarm-medication" className="text-sm font-medium text-card-foreground">
              Medicamento
            </Label>
            <Input
              id="alarm-medication"
              type="text"
              value={medication}
              onChange={(e) => setMedication(e.target.value)}
              placeholder="Ej: Ibuprofeno"
              className="h-11 text-base bg-background text-foreground placeholder:text-muted-foreground rounded-lg"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="alarm-dosage" className="text-sm font-medium text-card-foreground">
              Dosis
            </Label>
            <Input
              id="alarm-dosage"
              type="text"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="Ej: 1 pastilla, 200mg"
              className="h-11 text-base bg-background text-foreground placeholder:text-muted-foreground rounded-lg"
            />
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-col pt-2">
            <Button
              type="submit"
              className="h-11 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg"
            >
              Guardar Alarma
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="h-11 text-sm rounded-lg"
            >
              Cancelar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
