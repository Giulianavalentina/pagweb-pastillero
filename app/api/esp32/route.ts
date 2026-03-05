import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Variables en memoria del servidor (se limpian si reinicias el servidor)
let comandoPendiente: string | null = null;
let huboCambioConfig = false; 

// GET: El ESP32 pregunta qué hay de nuevo
export async function GET(request: Request) {
  const url = new URL(request.url);
  const path = url.pathname.split('/').filter(Boolean).pop();
  const queryPath = url.searchParams.get('path');

  // Si es una consulta del ESP32
  if (path === 'esp32' || queryPath === 'comandos' || path === 'comandos') {
    
    // 1. Buscamos la alarma activa más próxima en la base de datos
    const proximaAlarma = await prisma.alarm.findFirst({
      where: { active: true },
      orderBy: { time: 'asc' }
    });

    // 2. Preparamos el paquete de datos
    const respuesta = {
      comando: comandoPendiente,
      actualizarConfig: huboCambioConfig, // 🚩 La bandera mágica
      horaProgramada: proximaAlarma?.time || "00:00",
      alarmaActivada: !!proximaAlarma
    };

    // 3. Limpieza: Si había un comando o un cambio, los damos por "entregados"
    if (comandoPendiente) {
      console.log("📤 Orden manual enviada:", comandoPendiente);
      comandoPendiente = null;
    }

    if (huboCambioConfig) {
      console.log("♻️ Configuración sincronizada con el ESP32");
      huboCambioConfig = false; 
    }

    return NextResponse.json(respuesta);
  }

  return NextResponse.json({ error: 'Ruta no válida' }, { status: 404 });
}

// PUT: Este lo usaremos para el BOTÓN de dispensar y para NOTIFICAR cambios
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { comando, tipo } = body;

    // Si el tipo es 'config', es porque agregaste/editaste una alarma en la web
    if (tipo === 'config') {
      huboCambioConfig = true;
      console.log("📢 Cambio en alarmas detectado. Avisando al ESP32...");
      return NextResponse.json({ success: true, mensaje: "Aviso de cambio guardado" });
    }

    // Si hay un comando (el botón de "Abrir")
    if (comando) {
      comandoPendiente = comando;
      console.log("📥 Comando manual recibido:", comando);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Petición sin datos' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Error en PUT' }, { status: 500 });
  }
}

// POST: Para recibir logs del ESP32 (opcional)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("📡 Reporte del ESP32:", body);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false });
  }
}