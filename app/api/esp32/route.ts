import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Cola de comandos para el ESP32
let comandoPendiente: string | null = null;

// GET: El ESP32 pregunta si hay comandos
export async function GET(request: Request) {
  const url = new URL(request.url);
  const path = url.pathname.split('/').pop();
  
  // Devolver comandos pendientes
  if (path === 'comandos') {
    return NextResponse.json({ 
      comando: comandoPendiente 
    });
  }
  
  // Devolver configuración actual
  if (path === 'config') {
    // Aquí puedes obtener de tu BD
    return NextResponse.json({
      horaProgramada: '08:00',
      alarmaActivada: true
    });
  }
  
  return NextResponse.json({ error: 'Ruta no encontrada' }, { status: 404 });
}

// POST: El ESP32 envía eventos/estados
export async function POST(request: Request) {
  const url = new URL(request.url);
  const path = url.pathname.split('/').pop();
  
  const body = await request.json();
  
  if (path === 'eventos') {
    // Guardar evento en la BD
    console.log('Evento recibido:', body);
    
    // Aquí guardas con Prisma
    // await prisma.evento.create({ data: body });
    
    return NextResponse.json({ success: true });
  }
  
  if (path === 'estado') {
    console.log('Estado recibido:', body);
    return NextResponse.json({ success: true });
  }
  
  return NextResponse.json({ error: 'Ruta no encontrada' }, { status: 404 });
}

// POST para enviar comandos desde tu web
export async function PUT(request: Request) {
  const { comando } = await request.json();
  
  // Guardar comando para que el ESP32 lo recoja
  comandoPendiente = comando;
  
  // Opcional: Programar para que se limpie después de un tiempo
  setTimeout(() => {
    comandoPendiente = null;
  }, 10000); // 10 segundos
  
  return NextResponse.json({ success: true });
}