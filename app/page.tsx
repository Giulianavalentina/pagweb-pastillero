"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import {
  Pill,
  Wifi,
  WifiOff,
  Bell,
  Clock,
  Play,
  Check,
  BellOff,
  Plus,
  X,
  TrendingUp,
  Calendar,
  CheckCircle2,
  History,
} from "lucide-react"

/* ═══════════════════════════════════════════════════════
   TIPOS DE DATOS
   ───────────────────────────────────────────────────────
   Estos tipos pueden moverse a un archivo types.ts
   y coincidir con los modelos de Prisma.
   ═══════════════════════════════════════════════════════ */

interface Alarma {
  id: string
  hora: string
  medicamento: string
  dosis: string
  activa: boolean
}

interface RegistroDispensacion {
  id: string
  medicamento: string
  hora: string
  fecha: string
  metodo: "manual" | "programada"
}

interface DatosAdherencia {
  porcentaje: number
  dosisTomadas: number
  dosisTotal: number
}

/* ═══════════════════════════════════════════════════════
   DATOS INICIALES (reemplazar por llamadas a Prisma)
   ───────────────────────────────────────────────────────
   Estas constantes simulan los datos que vendrian
   de la base de datos. Para conectar Prisma:
   1. Crea un Server Component que haga la consulta.
   2. Pasa los resultados como props a este componente.
   ═══════════════════════════════════════════════════════ */

const listadoMedicamentos: Alarma[] = [
  { id: "1", hora: "08:00", medicamento: "Ibuprofeno", dosis: "400mg - 1 pastilla", activa: true },
  { id: "2", hora: "14:00", medicamento: "Omeprazol", dosis: "20mg - 1 capsula", activa: true },
  { id: "3", hora: "21:00", medicamento: "Paracetamol", dosis: "500mg - 1 pastilla", activa: false },
  { id: "4", hora: "22:30", medicamento: "Losartan", dosis: "50mg - 1 pastilla", activa: true },
]

const historialReciente: RegistroDispensacion[] = [
  { id: "h1", medicamento: "Ibuprofeno", hora: "08:02", fecha: "Hoy, 28 Feb", metodo: "programada" },
  { id: "h2", medicamento: "Omeprazol", hora: "14:00", fecha: "Ayer, 27 Feb", metodo: "programada" },
  { id: "h3", medicamento: "Paracetamol", hora: "16:30", fecha: "Ayer, 27 Feb", metodo: "manual" },
]

const datosAdherenciaInicial: DatosAdherencia = {
  porcentaje: 85,
  dosisTomadas: 18,
  dosisTotal: 21,
}

/* ═══════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════ */

function calcularCuentaRegresiva(horaObjetivo: string) {
  const ahora = new Date()
  const [h, m] = horaObjetivo.split(":").map(Number)
  const objetivo = new Date(ahora)
  objetivo.setHours(h, m, 0, 0)
  if (objetivo <= ahora) objetivo.setDate(objetivo.getDate() + 1)
  const diff = Math.max(0, Math.floor((objetivo.getTime() - ahora.getTime()) / 1000))
  return {
    horas: String(Math.floor(diff / 3600)).padStart(2, "0"),
    minutos: String(Math.floor((diff % 3600) / 60)).padStart(2, "0"),
    segundos: String(diff % 60).padStart(2, "0"),
    totalSegundos: diff,
  }
}

/* ═══════════════════════════════════════════════════════
   COMPONENTE: Encabezado
   Props: conectado, cantidadAlarmasActivas
   ═══════════════════════════════════════════════════════ */

function Encabezado({
  conectado,
  cantidadAlarmasActivas,
}: {
  conectado: boolean
  cantidadAlarmasActivas: number
}) {
  return (
    <header className="bg-card border-b border-border px-4 py-3 md:px-6 h-16 flex items-center shrink-0">
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-primary shadow-sm">
            <Pill className="size-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-foreground tracking-tight">PillMate</h1>
            <p className="text-xs text-muted-foreground leading-none hidden md:block">Panel de control del dispositivo</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {cantidadAlarmasActivas > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              <Bell className="size-3.5" />
              <span>{cantidadAlarmasActivas} activas</span>
            </div>
          )}
          <div
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
              conectado ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
            }`}
            role="status"
            aria-live="polite"
          >
            {conectado ? (
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

/* ═══════════════════════════════════════════════════════
   COMPONENTE: Proxima Dosis (Hero con countdown)
   Props: horaObjetivo, medicamento, dosis
   ═══════════════════════════════════════════════════════ */

function ProximaDosis({
  horaObjetivo,
  medicamento,
  dosis,
}: {
  horaObjetivo: string
  medicamento: string
  dosis: string
}) {
  const [cuenta, setCuenta] = useState(() => calcularCuentaRegresiva(horaObjetivo))

  useEffect(() => {
    const interval = setInterval(() => setCuenta(calcularCuentaRegresiva(horaObjetivo)), 1000)
    return () => clearInterval(interval)
  }, [horaObjetivo])

  const esUrgente = cuenta.totalSegundos < 1800

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-6 md:p-8 shadow-lg h-full">
      <div className="absolute -top-8 -right-8 size-32 rounded-full bg-primary-foreground/5" />
      <div className="absolute -bottom-6 -left-6 size-24 rounded-full bg-primary-foreground/5" />
      <div className="relative flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-primary-foreground/70" />
          <span className="text-sm font-medium text-primary-foreground/70 uppercase tracking-wider">Proxima dosis</span>
        </div>
        <div className="flex items-baseline gap-1" aria-label={`Faltan ${cuenta.horas} horas, ${cuenta.minutos} minutos`}>
          {[cuenta.horas, cuenta.minutos, cuenta.segundos].map((valor, i) => (
            <span key={i} className="flex items-baseline gap-1">
              {i > 0 && <span className="text-2xl md:text-3xl font-bold text-primary-foreground/50 animate-pulse">:</span>}
              <span className="text-5xl md:text-6xl font-bold text-primary-foreground font-mono tabular-nums tracking-tight">{valor}</span>
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center size-10 rounded-xl ${esUrgente ? "bg-warning/20" : "bg-primary-foreground/10"}`}>
            <Pill className={`size-5 ${esUrgente ? "text-warning" : "text-primary-foreground/80"}`} />
          </div>
          <div>
            <p className="text-lg font-bold text-primary-foreground">{medicamento}</p>
            <p className="text-sm text-primary-foreground/60">{dosis}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   COMPONENTE: Control de Hardware
   Props: alDispensar (callback)
   ───────────────────────────────────────────────────────
   La funcion `manejarClickDispensar` es el punto
   donde se conectara la logica de MQTT.
   ═══════════════════════════════════════════════════════ */

function ControlDeHardware({ alDispensar }: { alDispensar: () => void }) {
  const [estado, setEstado] = useState<"inactivo" | "dispensando" | "listo">("inactivo")

  const manejarClickDispensar = () => {
    // ──────────────────────────────────────────────────
    // TODO: Aqui va la logica de MQTT para enviar
    // el comando al pastillero fisico, por ejemplo:
    //   await mqttClient.publish('pillmate/dispense', '1')
    // ──────────────────────────────────────────────────
    setEstado("dispensando")
    alDispensar()
    setTimeout(() => {
      setEstado("listo")
      setTimeout(() => setEstado("inactivo"), 1500)
    }, 2000)
  }

  return (
    <div className="rounded-2xl bg-card border border-border p-5 shadow-sm flex flex-col gap-3 h-full">
      <div>
        <h3 className="text-base font-bold text-card-foreground">Control de Hardware</h3>
        <p className="text-sm text-muted-foreground">Dispensar medicamento manualmente</p>
      </div>
      <button
        onClick={manejarClickDispensar}
        disabled={estado !== "inactivo"}
        className={`w-full h-14 text-base font-semibold rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2.5
          ${estado === "listo"
            ? "bg-success text-success-foreground"
            : "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20 hover:-translate-y-0.5"
          }
          active:translate-y-0 active:shadow-none disabled:opacity-70 disabled:translate-y-0 disabled:shadow-none disabled:cursor-not-allowed`}
        aria-label="Dispensar pastilla ahora"
      >
        {estado === "dispensando" ? (
          <>
            <span className="size-5 rounded-full border-[2.5px] border-primary-foreground/30 border-t-primary-foreground animate-spin" />
            Dispensando...
          </>
        ) : estado === "listo" ? (
          <>
            <Check className="size-5" />
            Dispensado
          </>
        ) : (
          <>
            <Play className="size-5" />
            Dispensar Ahora
          </>
        )}
      </button>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   COMPONENTE: Interruptor (Toggle Switch)
   ═══════════════════════════════════════════════════════ */

function Interruptor({
  activado,
  alCambiar,
  etiqueta,
}: {
  activado: boolean
  alCambiar: () => void
  etiqueta: string
}) {
  return (
    <button
      role="switch"
      aria-checked={activado}
      aria-label={etiqueta}
      onClick={alCambiar}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
        activado ? "bg-primary" : "bg-muted"
      }`}
    >
      <span
        className={`pointer-events-none inline-block size-5 rounded-full bg-card shadow-sm ring-0 transition-transform duration-200 translate-y-0.5 ${
          activado ? "translate-x-5.5" : "translate-x-0.5"
        }`}
      />
    </button>
  )
}

/* ═══════════════════════════════════════════════════════
   COMPONENTE: Lista de Alarmas
   Props: listaDeAlarmas, alAlternar (toggle callback)
   ───────────────────────────────────────────────────────
   Renderiza con .map() sobre el array de alarmas.
   ═══════════════════════════════════════════════════════ */

function ListaDeAlarmas({
  listaDeAlarmas,
  alAlternar,
}: {
  listaDeAlarmas: Alarma[]
  alAlternar: (id: string) => void
}) {
  return (
    <div className="rounded-2xl bg-card border border-border p-5 shadow-sm flex flex-col gap-4 flex-1">
      <div>
        <h3 className="text-base font-bold text-card-foreground">Alarmas Programadas</h3>
        <p className="text-sm text-muted-foreground">
          {listaDeAlarmas.length} {listaDeAlarmas.length === 1 ? "medicamento configurado" : "medicamentos configurados"}
        </p>
      </div>
      {listaDeAlarmas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <BellOff className="size-8 mb-2 opacity-40" />
          <p className="text-sm font-medium">No hay alarmas</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5" role="list" aria-label="Lista de alarmas programadas">
          {listaDeAlarmas.map((alarma) => (
            <li
              key={alarma.id}
              className={`flex items-center justify-between rounded-xl border p-3.5 transition-all duration-200 ${
                alarma.activa ? "bg-card border-border hover:border-primary/20 hover:shadow-sm" : "bg-muted/40 border-border/50"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`flex items-center justify-center size-10 rounded-lg transition-colors ${alarma.activa ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                  <Pill className="size-5" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2.5">
                    <span className={`font-mono text-lg font-bold leading-none ${alarma.activa ? "text-foreground" : "text-muted-foreground"}`}>
                      {alarma.hora}
                    </span>
                    <span className={`text-sm font-semibold ${alarma.activa ? "text-card-foreground" : "text-muted-foreground"}`}>
                      {alarma.medicamento}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground mt-0.5">{alarma.dosis}</span>
                </div>
              </div>
              <Interruptor
                activado={alarma.activa}
                alCambiar={() => alAlternar(alarma.id)}
                etiqueta={`${alarma.activa ? "Desactivar" : "Activar"} alarma de ${alarma.medicamento}`}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   COMPONENTE: Modal para Agregar Alarma
   Props: alAgregar (callback con datos de la nueva alarma)
   ═══════════════════════════════════════════════════════ */

function ModalNuevaAlarma({
  alAgregar,
}: {
  alAgregar: (datos: { hora: string; medicamento: string; dosis: string }) => void
}) {
  const [abierto, setAbierto] = useState(false)
  const [hora, setHora] = useState("08:00")
  const [medicamento, setMedicamento] = useState("")
  const [dosis, setDosis] = useState("")
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (abierto) {
      dialog.showModal()
    } else {
      dialog.close()
    }
  }, [abierto])

  const manejarEnvio = (e: React.FormEvent) => {
    e.preventDefault()
    if (!medicamento.trim()) return
    alAgregar({ hora, medicamento: medicamento.trim(), dosis: dosis.trim() || "1 pastilla" })
    setHora("08:00")
    setMedicamento("")
    setDosis("")
    setAbierto(false)
  }

  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        className="w-full h-12 gap-2 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all duration-200 cursor-pointer flex items-center justify-center"
        aria-label="Agregar nueva alarma"
      >
        <Plus className="size-4" />
        Nueva Alarma
      </button>

      <dialog
        ref={dialogRef}
        onClose={() => setAbierto(false)}
        className="backdrop:bg-foreground/40 bg-transparent p-0 m-auto rounded-2xl max-w-md w-[calc(100%-2rem)]"
      >
        <div className="bg-card rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-card-foreground">Nueva Alarma</h2>
              <p className="text-sm text-muted-foreground">Configura una nueva alarma para tu medicamento.</p>
            </div>
            <button
              onClick={() => setAbierto(false)}
              className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              aria-label="Cerrar"
            >
              <X className="size-4" />
            </button>
          </div>

          <form onSubmit={manejarEnvio} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="alarma-hora" className="text-sm font-medium text-card-foreground">Hora</label>
              <input
                id="alarma-hora"
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="h-11 text-base bg-background text-foreground rounded-lg border border-input px-3 focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="alarma-medicamento" className="text-sm font-medium text-card-foreground">Medicamento</label>
              <input
                id="alarma-medicamento"
                type="text"
                value={medicamento}
                onChange={(e) => setMedicamento(e.target.value)}
                placeholder="Ej: Ibuprofeno"
                className="h-11 text-base bg-background text-foreground placeholder:text-muted-foreground rounded-lg border border-input px-3 focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="alarma-dosis" className="text-sm font-medium text-card-foreground">Dosis</label>
              <input
                id="alarma-dosis"
                type="text"
                value={dosis}
                onChange={(e) => setDosis(e.target.value)}
                placeholder="Ej: 1 pastilla, 200mg"
                className="h-11 text-base bg-background text-foreground placeholder:text-muted-foreground rounded-lg border border-input px-3 focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="submit"
                className="h-11 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg cursor-pointer transition-colors"
              >
                Guardar Alarma
              </button>
              <button
                type="button"
                onClick={() => setAbierto(false)}
                className="h-11 text-sm font-semibold rounded-lg border border-input bg-card text-card-foreground hover:bg-muted cursor-pointer transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  )
}

/* ═══════════════════════════════════════════════════════
   COMPONENTE: Metrica de Adherencia
   Props: datosAdherencia (DatosAdherencia)
   ═══════════════════════════════════════════════════════ */

function MetricaAdherencia({ datosAdherencia }: { datosAdherencia: DatosAdherencia }) {
  const { porcentaje, dosisTomadas, dosisTotal } = datosAdherencia
  const [porcentajeAnimado, setPorcentajeAnimado] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setPorcentajeAnimado(porcentaje), 100)
    return () => clearTimeout(timer)
  }, [porcentaje])

  const circunferencia = 2 * Math.PI * 52
  const desplazamiento = circunferencia - (porcentajeAnimado / 100) * circunferencia
  const colorEstado = porcentaje >= 80 ? "text-success" : porcentaje >= 50 ? "text-warning" : "text-destructive"
  const etiquetaEstado = porcentaje >= 80 ? "Excelente" : porcentaje >= 50 ? "Regular" : "Necesita mejora"

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
        <div className={`flex items-center gap-1.5 text-xs font-semibold ${colorEstado}`}>
          <TrendingUp className="size-3.5" />
          {etiquetaEstado}
        </div>
      </div>
      <div className="flex items-center gap-5">
        <div className="relative shrink-0">
          <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90" role="img" aria-label={`${porcentaje}% de adherencia`}>
            <circle cx="60" cy="60" r="52" stroke="currentColor" className="text-muted/60" strokeWidth="8" fill="none" />
            <circle cx="60" cy="60" r="52" stroke="currentColor" className={`${colorEstado} transition-all duration-1000 ease-out`} strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={circunferencia} strokeDashoffset={desplazamiento} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold ${colorEstado}`}>{porcentajeAnimado}%</span>
          </div>
        </div>
        <div className="flex flex-col gap-3 flex-1">
          <div className="flex items-center justify-between rounded-lg bg-success/5 px-3 py-2">
            <span className="text-xs text-muted-foreground">Tomadas</span>
            <span className="text-sm font-bold text-success">{dosisTomadas}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-destructive/5 px-3 py-2">
            <span className="text-xs text-muted-foreground">Omitidas</span>
            <span className="text-sm font-bold text-destructive">{dosisTotal - dosisTomadas}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2">
            <span className="text-xs text-muted-foreground">Total</span>
            <span className="text-sm font-bold text-foreground">{dosisTotal}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   COMPONENTE: Historial de Dispensaciones
   Props: datosHistorial (RegistroDispensacion[])
   ───────────────────────────────────────────────────────
   Renderiza con .map() sobre el array de registros.
   ═══════════════════════════════════════════════════════ */

function HistorialDispensaciones({ datosHistorial }: { datosHistorial: RegistroDispensacion[] }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-5 shadow-sm flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-card-foreground">Historial Reciente</h3>
          <p className="text-sm text-muted-foreground">Ultimas dispensaciones</p>
        </div>
        <History className="size-4 text-muted-foreground" />
      </div>
      {datosHistorial.length === 0 ? (
        <p className="text-center text-muted-foreground py-4 text-sm">No hay registros aun.</p>
      ) : (
        <ul className="flex flex-col gap-2" role="list" aria-label="Historial de dispensaciones">
          {datosHistorial.map((registro) => (
            <li key={registro.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-center size-8 rounded-lg bg-success/10 shrink-0">
                <CheckCircle2 className="size-4 text-success" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-card-foreground truncate">{registro.medicamento}</p>
                <p className="text-xs text-muted-foreground">{registro.fecha} - {registro.hora}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                registro.metodo === "manual" ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"
              }`}>
                {registro.metodo === "manual" ? "Manual" : "Auto"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   DASHBOARD PRINCIPAL
   ───────────────────────────────────────────────────────
   Para conectar con Prisma, convierte este componente
   en un Server Component wrapper que haga las queries
   y pase los datos como props a un Client Component.
   
   Ejemplo:
     // app/page.tsx (Server Component)
     import { prisma } from '@/lib/prisma'
     import { DashboardCliente } from './dashboard-cliente'
   
     export default async function Page() {
       const listaDeAlarmas = await prisma.alarma.findMany()
       const datosHistorial = await prisma.dispensacion.findMany({ take: 3 })
       return <DashboardCliente listaDeAlarmas={listaDeAlarmas} ... />
     }
   ═══════════════════════════════════════════════════════ */

export default function PillMateDashboard() {
  const [listaDeAlarmas, setListaDeAlarmas] = useState<Alarma[]>(listadoMedicamentos)
  const [datosHistorial, setDatosHistorial] = useState<RegistroDispensacion[]>(historialReciente)
  const [porcentajeAdherencia] = useState<DatosAdherencia>(datosAdherenciaInicial)
  const [dispositivoConectado] = useState(true)

  const alarmasActivas = listaDeAlarmas.filter((a) => a.activa)
  const proximaAlarma = [...alarmasActivas].sort((a, b) => a.hora.localeCompare(b.hora))[0]

  const alternarAlarma = useCallback((id: string) => {
    // TODO: Actualizar en Prisma -> await prisma.alarma.update({ where: { id }, data: { activa: !actual } })
    setListaDeAlarmas((prev) => prev.map((alarma) => (alarma.id === id ? { ...alarma, activa: !alarma.activa } : alarma)))
  }, [])

  const manejarDispensacion = useCallback(() => {
    // TODO: Guardar en Prisma -> await prisma.dispensacion.create({ data: { ... } })
    const ahora = new Date()
    const horaStr = ahora.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
    const nuevoRegistro: RegistroDispensacion = {
      id: `h-${Date.now()}`,
      medicamento: "Dispensacion manual",
      hora: horaStr,
      fecha: "Hoy",
      metodo: "manual",
    }
    setDatosHistorial((prev) => [nuevoRegistro, ...prev].slice(0, 3))
  }, [])

  const agregarAlarma = useCallback((datos: { hora: string; medicamento: string; dosis: string }) => {
    // TODO: Guardar en Prisma -> await prisma.alarma.create({ data: datos })
    const nuevaAlarma: Alarma = {
      id: `a-${Date.now()}`,
      hora: datos.hora,
      medicamento: datos.medicamento,
      dosis: datos.dosis,
      activa: true,
    }
    setListaDeAlarmas((prev) => [...prev, nuevaAlarma].sort((a, b) => a.hora.localeCompare(b.hora)))
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Encabezado conectado={dispositivoConectado} cantidadAlarmasActivas={alarmasActivas.length} />

      <main className="flex-1 overflow-y-auto p-4 md:p-5 lg:p-6">
        <div className="w-full max-w-none grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5 auto-rows-min">
          {/* Proxima Dosis - 2 columnas */}
          <div className="md:col-span-2">
            {proximaAlarma ? (
              <ProximaDosis horaObjetivo={proximaAlarma.hora} medicamento={proximaAlarma.medicamento} dosis={proximaAlarma.dosis} />
            ) : (
              <div className="rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-6 md:p-8 shadow-lg h-full flex flex-col justify-center">
                <p className="text-lg font-semibold text-primary-foreground">No hay dosis programadas</p>
                <p className="text-sm text-primary-foreground/60 mt-1">Agrega una alarma para comenzar</p>
              </div>
            )}
          </div>

          {/* Control de Hardware */}
          <div className="md:col-span-1">
            <ControlDeHardware alDispensar={manejarDispensacion} />
          </div>

          {/* Metrica de Adherencia */}
          <div className="md:col-span-1">
            <MetricaAdherencia datosAdherencia={porcentajeAdherencia} />
          </div>

          {/* Lista de Alarmas + boton nueva alarma - 2 columnas */}
          <div className="md:col-span-2 xl:col-span-2 flex flex-col gap-4 lg:gap-5">
            <ListaDeAlarmas listaDeAlarmas={listaDeAlarmas} alAlternar={alternarAlarma} />
            <ModalNuevaAlarma alAgregar={agregarAlarma} />
          </div>

          {/* Historial Reciente - 2 columnas */}
          <div className="md:col-span-2 xl:col-span-2">
            <HistorialDispensaciones datosHistorial={datosHistorial} />
          </div>
        </div>
      </main>
    </div>
  )
}
