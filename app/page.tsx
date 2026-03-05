"use client"

import { useState, useEffect, useRef } from "react"
import {
  Pill,
  Wifi,
  Clock,
  Play,
  Check,
  BellOff,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
} from "lucide-react"

/* ═══════════════════════════════════════════════════════
   TIPOS E INTERFACES
   ═══════════════════════════════════════════════════════ */

interface Alarma {
  id: number
  hora: string
  medicamento: string
  dosis: string
  activa: boolean
}

interface RegistroDispensacion {
  id: number
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
  }
}

/* ═══════════════════════════════════════════════════════
   COMPONENTES DE UI
   ═══════════════════════════════════════════════════════ */

function ModalConfirmarBorrado({ abierto, onClose, onConfirm }: any) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    if (abierto) dialogRef.current?.showModal()
    else dialogRef.current?.close()
  }, [abierto])

  return (
    <dialog ref={dialogRef} className="backdrop:bg-foreground/40 backdrop:backdrop-blur-sm bg-transparent p-0 m-auto rounded-2xl max-w-sm w-[calc(100%-2rem)]">
      <div className="bg-card rounded-2xl p-6 shadow-xl border border-border flex flex-col items-center text-center gap-4">
        <div className="size-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive"><Trash2 className="size-6" /></div>
        <div>
          <h2 className="text-lg font-bold text-card-foreground">¿Eliminar alarma?</h2>
          <p className="text-sm text-muted-foreground mt-1">Esta acción no se puede deshacer.</p>
        </div>
        <div className="flex gap-3 w-full mt-2">
          <button onClick={onClose} className="flex-1 h-11 rounded-xl border border-input font-semibold hover:bg-muted cursor-pointer text-card-foreground">Cancelar</button>
          <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 h-11 rounded-xl bg-destructive text-white font-bold hover:bg-destructive/90 transition-colors cursor-pointer shadow-lg shadow-destructive/20">Eliminar</button>
        </div>
      </div>
    </dialog>
  )
}

function Encabezado({ conectado }: { conectado: boolean; cantidadAlarmasActivas: number }) {
  return (
    <header className="bg-card border-b border-border px-4 py-3 md:px-6 h-16 flex items-center shrink-0">
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-primary shadow-sm"><Pill className="size-5 text-primary-foreground" /></div>
          <div><h1 className="text-lg md:text-xl font-bold text-foreground tracking-tight">PillMate</h1></div>
        </div>
        <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${conectado ? "bg-green-500/10 text-green-600" : "bg-destructive/10 text-destructive"}`}>
          <Wifi className="size-3.5" /> <span>{conectado ? "En linea" : "Desconectado"}</span>
        </div>
      </div>
    </header>
  )
}

function ProximaDosis({ horaObjetivo, medicamento, dosis }: { horaObjetivo: string; medicamento: string; dosis: string }) {
  const [cuenta, setCuenta] = useState(() => calcularCuentaRegresiva(horaObjetivo))
  useEffect(() => {
    const interval = setInterval(() => setCuenta(calcularCuentaRegresiva(horaObjetivo)), 1000)
    return () => clearInterval(interval)
  }, [horaObjetivo])

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-6 md:p-8 shadow-lg h-full text-white">
      <div className="flex items-center gap-2 opacity-70 mb-4"><Clock className="size-4" /><span className="text-sm font-medium uppercase tracking-wider">Próxima dosis</span></div>
      <div className="text-5xl md:text-6xl font-bold font-mono tabular-nums mb-4">{cuenta.horas}:{cuenta.minutos}:{cuenta.segundos}</div>
      <div><p className="text-lg font-bold">{medicamento}</p><p className="text-sm opacity-80">{dosis}</p></div>
    </div>
  )
}

function ControlDeHardware() {
  const [estado, setEstado] = useState<"inactivo" | "dispensando" | "listo">("inactivo")
  
  const manejarClickDispensar = async () => {
    setEstado("dispensando");
    try {
      await fetch('/api/esp32?path=comandos', {
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comando: 'abrir' })
      });
    } catch (error) { console.error(error); }
    setTimeout(() => { setEstado("listo"); setTimeout(() => setEstado("inactivo"), 1500) }, 2000)
  }

  return (
    <div className="rounded-2xl bg-card border border-border p-5 shadow-sm flex flex-col gap-3 h-full">
      <h3 className="text-base font-bold">Control de Hardware</h3>
      <button onClick={manejarClickDispensar} disabled={estado !== "inactivo"} className={`w-full h-14 text-base font-semibold rounded-xl transition-all flex items-center justify-center gap-2.5 ${estado === "listo" ? "bg-green-600 text-white" : "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"}`}>
        {estado === "dispensando" ? <span className="size-5 rounded-full border-2 border-t-transparent animate-spin" /> : estado === "listo" ? <Check className="size-5" /> : <Play className="size-5" />}
        {estado === "dispensando" ? "Enviando..." : estado === "listo" ? "¡Listo!" : "Dispensar Ahora"}
      </button>
    </div>
  )
}

function ListaDeAlarmas({ listaDeAlarmas, alAlternar, alEditar, alEliminar }: any) {
  return (
    <div className="rounded-2xl bg-card border border-border p-5 shadow-sm flex flex-col gap-4 flex-1">
      <h3 className="text-base font-bold">Alarmas Programadas</h3>
      {listaDeAlarmas.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground"><BellOff className="size-8 mx-auto mb-2 opacity-40" /><p>No hay alarmas</p></div>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {listaDeAlarmas.map((alarma: any) => (
            <li key={alarma.id} className="flex items-center justify-between rounded-xl border p-3.5 bg-card">
              <div className="flex items-center gap-3.5 flex-1">
                <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Pill className="size-5" /></div>
                <div><div className="flex items-center gap-2"><span className="font-mono text-lg font-bold">{alarma.hora}</span><span className="text-sm font-semibold">{alarma.medicamento}</span></div><span className="text-xs text-muted-foreground">{alarma.dosis}</span></div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => alEditar(alarma)} className="p-2 text-muted-foreground hover:text-primary cursor-pointer"><Pencil className="size-4" /></button>
                <button onClick={() => alEliminar(alarma.id)} className="p-2 text-muted-foreground hover:text-destructive cursor-pointer"><Trash2 className="size-4" /></button>
                <button onClick={() => alAlternar(alarma.id)} className={`w-11 h-6 rounded-full transition-colors ${alarma.activa ? 'bg-primary' : 'bg-muted'}`}><div className={`size-5 bg-white rounded-full transition-transform ${alarma.activa ? 'translate-x-5.5' : 'translate-x-0.5'}`} /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ModalAlarma({ abierto, setAbierto, alGuardar, alarmaAEditar }: any) {
  const [hora, setHora] = useState("08:00")
  const [medicamento, setMedicamento] = useState("")
  const [dosis, setDosis] = useState("")
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (alarmaAEditar) { setHora(alarmaAEditar.hora); setMedicamento(alarmaAEditar.medicamento); setDosis(alarmaAEditar.dosis) }
    else { setHora("08:00"); setMedicamento(""); setDosis("") }
  }, [alarmaAEditar, abierto])

  useEffect(() => { abierto ? dialogRef.current?.showModal() : dialogRef.current?.close() }, [abierto])

  return (
    <dialog ref={dialogRef} className="backdrop:bg-foreground/40 backdrop:backdrop-blur-sm bg-transparent p-0 m-auto rounded-2xl max-w-md w-[calc(100%-2rem)]">
      <div className="bg-card rounded-2xl p-6 border border-border shadow-2xl">
        <h2 className="text-lg font-bold mb-4">{alarmaAEditar ? "Editar Alarma" : "Nueva Alarma"}</h2>
        <form onSubmit={(e) => { e.preventDefault(); alGuardar({ id: alarmaAEditar?.id, hora, medicamento, dosis }); setAbierto(false) }} className="flex flex-col gap-4">
          <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} className="h-11 border rounded-lg px-3 bg-background" required />
          <input type="text" placeholder="Medicamento" value={medicamento} onChange={(e) => setMedicamento(e.target.value)} className="h-11 border rounded-lg px-3 bg-background" required />
          <input type="text" placeholder="Dosis" value={dosis} onChange={(e) => setDosis(e.target.value)} className="h-11 border rounded-lg px-3 bg-background" />
          <div className="flex flex-col gap-2 mt-2">
            <button type="submit" className="h-11 bg-primary text-primary-foreground font-bold rounded-lg cursor-pointer hover:bg-primary/90 transition-colors">Guardar</button>
            <button type="button" onClick={() => setAbierto(false)} className="h-11 border rounded-lg cursor-pointer hover:bg-muted transition-colors text-card-foreground">Cancelar</button>
          </div>
        </form>
      </div>
    </dialog>
  )
}

/* ═══════════════════════════════════════════════════════
   DASHBOARD PRINCIPAL
   ═══════════════════════════════════════════════════════ */

export default function PillMateDashboard() {
  const [listaDeAlarmas, setListaDeAlarmas] = useState<Alarma[]>([])
  const [datosHistorial, setDatosHistorial] = useState<RegistroDispensacion[]>([])
  const [loading, setLoading] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [alarmaAEditar, setAlarmaAEditar] = useState<Alarma | null>(null)
  const [confirmarBorrado, setConfirmarBorrado] = useState({ abierto: false, id: 0 })

  useEffect(() => { fetchAlarms(); fetchHistory() }, [])

  async function fetchAlarms() {
    try {
      const res = await fetch('/api/alarms')
      const data = await res.json()
      setListaDeAlarmas(data.map((a: any) => ({ id: a.id, hora: a.time, medicamento: a.medicamento || '', dosis: a.dosis || '', activa: a.active })))
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  async function fetchHistory() {
    try {
      const res = await fetch('/api/history')
      const data = await res.json()
      setDatosHistorial(data.map((entry: any) => ({
        id: entry.id,
        medicamento: entry.alarm?.medicamento || 'Manual',
        hora: new Date(entry.createdAt).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }),
        fecha: new Date(entry.createdAt).toLocaleDateString('es', { day: 'numeric', month: 'short' }),
        metodo: entry.action === 'pastilla_retirada' ? 'programada' : 'manual'
      })).slice(0, 3))
    } catch (e) { console.error(e) }
  }

  // AVISO AL ESP32
  const notificarCambioHardware = async () => {
    try {
      await fetch('/api/esp32', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: 'config' })
      });
    } catch (e) { console.error("Error notificando al hardware", e) }
  }

  const alternarAlarma = async (id: number) => {
    const alarma = listaDeAlarmas.find(a => a.id === id)
    if (!alarma) return
    try {
      const res = await fetch(`/api/alarms/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: !alarma.activa }) })
      if (res.ok) { fetchAlarms(); notificarCambioHardware(); }
    } catch (e) { console.error(e) }
  }

  const guardarAlarma = async (datos: any) => {
    const esEdit = !!datos.id
    try {
      const res = await fetch(esEdit ? `/api/alarms/${datos.id}` : '/api/alarms', {
        method: esEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ time: datos.hora, medicamento: datos.medicamento, dosis: datos.dosis, ...(esEdit ? {} : { active: true }) })
      })
      if (res.ok) { fetchAlarms(); notificarCambioHardware(); }
    } catch (e) { console.error(e) }
  }

  const ejecutarEliminacion = async () => {
    try {
      const res = await fetch(`/api/alarms/${confirmarBorrado.id}`, { method: 'DELETE' })
      if (res.ok) { fetchAlarms(); notificarCambioHardware(); }
    } catch (e) { console.error(e) }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-background"><div className="animate-spin size-10 border-4 border-primary border-t-transparent rounded-full" /></div>

  const alarmasActivas = listaDeAlarmas.filter(a => a.activa)
  const proxima = [...alarmasActivas].sort((a, b) => a.hora.localeCompare(b.hora))[0]

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Encabezado conectado={true} cantidadAlarmasActivas={alarmasActivas.length} />
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="md:col-span-2">
          {proxima ? <ProximaDosis horaObjetivo={proxima.hora} medicamento={proxima.medicamento} dosis={proxima.dosis} /> : <div className="bg-primary p-8 rounded-2xl text-white font-bold">Sin alarmas activas</div>}
        </div>
        <ControlDeHardware />
        <div className="rounded-2xl bg-card border border-border p-5 shadow-sm h-full">
            <h3 className="text-base font-bold mb-4">Estado del Sistema</h3>
            <div className="space-y-3">
                <div className="flex justify-between items-center text-sm"><span>Alarmas</span><span className="font-bold">{listaDeAlarmas.length}</span></div>
                <div className="flex justify-between items-center text-sm"><span>Activas</span><span className="font-bold text-primary">{alarmasActivas.length}</span></div>
            </div>
        </div>
        <div className="md:col-span-2 flex flex-col gap-4">
          <ListaDeAlarmas listaDeAlarmas={listaDeAlarmas} alAlternar={alternarAlarma} alEditar={(a: any) => { setAlarmaAEditar(a); setModalAbierto(true) }} alEliminar={(id: number) => setConfirmarBorrado({ abierto: true, id })} />
          <button onClick={() => { setAlarmaAEditar(null); setModalAbierto(true) }} className="h-12 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/20"><Plus className="size-5" /> Nueva Alarma</button>
        </div>
        <div className="md:col-span-2">
          <div className="bg-card border p-5 rounded-2xl shadow-sm">
            <h3 className="font-bold mb-4">Historial Reciente</h3>
            {datosHistorial.length === 0 ? <p className="text-sm text-muted-foreground">No hay registros</p> : 
              datosHistorial.map(h => (
              <div key={h.id} className="flex gap-3 p-3 border-b last:border-0 items-center">
                <CheckCircle2 className="text-green-500 size-5" />
                <div><p className="text-sm font-bold">{h.medicamento}</p><p className="text-xs text-muted-foreground">{h.fecha} - {h.hora}</p></div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <ModalAlarma abierto={modalAbierto} setAbierto={setModalAbierto} alGuardar={guardarAlarma} alarmaAEditar={alarmaAEditar} />
      <ModalConfirmarBorrado abierto={confirmarBorrado.abierto} onClose={() => setConfirmarBorrado({ ...confirmarBorrado, abierto: false })} onConfirm={ejecutarEliminacion} />
    </div>
  )
}