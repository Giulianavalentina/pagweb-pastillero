import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('📡 GET /api/history - Iniciando consulta...');
    
    const history = await prisma.history.findMany({
      include: {
        alarm: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`✅ GET exitoso: ${history.length} registros encontrados`);
    return NextResponse.json(history);
  } catch (error) {
    console.error('❌ Error en GET /history:', error);
    return NextResponse.json(
      { error: 'Error al obtener el historial' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📡 POST /api/history - Iniciando...');
    
    const body = await request.json();
    console.log('📦 Body recibido:', body);
    
    const { alarmId, action } = body;

    if (!alarmId || !action) {
      return NextResponse.json(
        { error: 'alarmId y action son requeridos' },
        { status: 400 }
      );
    }

    const alarmIdNum = Number(alarmId);

    const alarm = await prisma.alarm.findUnique({
      where: { id: alarmIdNum }
    });

    if (!alarm) {
      return NextResponse.json(
        { error: 'Alarma no encontrada' },
        { status: 404 }
      );
    }

    const historyEntry = await prisma.history.create({
      data: {
        alarmId: alarmIdNum,
        action,
      },
    });

    const fullHistoryEntry = await prisma.history.findUnique({
      where: { id: historyEntry.id },
      include: {
        alarm: true,
      },
    });

    return NextResponse.json(fullHistoryEntry, { status: 201 });
    
  } catch (error) {
    console.error('❌ Error en POST /history:', error);
    return NextResponse.json(
      { error: 'Error al crear registro' },
      { status: 500 }
    );
  }
}