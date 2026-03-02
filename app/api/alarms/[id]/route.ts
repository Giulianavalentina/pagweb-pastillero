export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/alarms/[id] - Obtener una alarma específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idNum = parseInt(id);
    
    const alarm = await prisma.alarm.findUnique({
      where: { id: idNum }
    });

    if (!alarm) {
      return NextResponse.json(
        { error: 'Alarma no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(alarm);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener' },
      { status: 500 }
    );
  }
}

// PATCH /api/alarms/[id] - Actualizar una alarma
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idNum = parseInt(id);
    const body = await request.json();
    const { time, medicamento, dosis, active } = body;

    const existingAlarm = await prisma.alarm.findUnique({
      where: { id: idNum }
    });

    if (!existingAlarm) {
      return NextResponse.json(
        { error: 'Alarma no encontrada' },
        { status: 404 }
      );
    }

    // Validar hora si viene
    if (time) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(time)) {
        return NextResponse.json(
          { error: 'Formato de hora inválido' },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.alarm.update({
      where: { id: idNum },
      data: {
        ...(time && { time }),
        ...(medicamento && { medicamento }),
        ...(dosis && { dosis }),
        ...(active !== undefined && { active }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error en PATCH:', error);
    return NextResponse.json(
      { error: 'Error al actualizar' },
      { status: 500 }
    );
  }
}

// DELETE /api/alarms/[id] - Eliminar una alarma
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idNum = parseInt(id);
    
    console.log(`🗑️ Intentando eliminar alarma ${idNum}`);

    if (isNaN(idNum)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const alarma = await prisma.alarm.findUnique({
      where: { id: idNum }
    });

    if (!alarma) {
      return NextResponse.json(
        { error: 'Alarma no encontrada' },
        { status: 404 }
      );
    }

    // Primero eliminar historial relacionado
    await prisma.history.deleteMany({
      where: { alarmId: idNum }
    });

    // Luego eliminar la alarma
    await prisma.alarm.delete({
      where: { id: idNum }
    });

    console.log(`✅ Alarma ${idNum} eliminada`);
    return NextResponse.json(
      { message: 'Alarma eliminada' },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ Error en DELETE:', error);
    return NextResponse.json(
      { error: 'Error al eliminar' },
      { status: 500 }
    );
  }
}