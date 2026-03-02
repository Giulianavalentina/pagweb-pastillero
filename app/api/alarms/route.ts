export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/alarms - Listar todas las alarmas
export async function GET() {
  try {
    console.log("📡 GET /api/alarms - Conectando a DB...");

    const alarms = await prisma.alarm.findMany({
      orderBy: {
        time: 'asc',
      },
    });

    console.log(`✅ ${alarms.length} alarmas encontradas`);
    return NextResponse.json(alarms, { status: 200 });
  } catch (error) {
    console.error("❌ Error en GET /api/alarms:", error);
    return NextResponse.json(
      { error: "Error al obtener las alarmas" },
      { status: 500 }
    );
  }
}

// POST /api/alarms - Crear una nueva alarma
export async function POST(request: NextRequest) {
  try {
    console.log("📡 POST /api/alarms - Recibiendo datos...");

    const body = await request.json();
    console.log("📦 Body recibido:", body);

    const { time, medicamento, dosis, active } = body;

    if (!time || !medicamento) {
      return NextResponse.json(
        {
          error: "Campos requeridos faltantes",
          details: "time y medicamento son obligatorios"
        },
        { status: 400 }
      );
    }

    // Validar formato de hora
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      return NextResponse.json(
        {
          error: "Formato de hora inválido",
          details: "Use HH:MM (ej. 09:30)"
        },
        { status: 400 }
      );
    }

    // Crear en base de datos
    const newAlarm = await prisma.alarm.create({
      data: {
        time,
        medicamento,
        dosis: dosis || "",
        active: active !== undefined ? active : true,
      },
    });

    console.log("✅ Alarma creada:", newAlarm);
    return NextResponse.json(newAlarm, { status: 201 });

  } catch (error) {
    console.error("❌ Error en POST /api/alarms:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Formato JSON inválido" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error al crear la alarma" },
      { status: 500 }
    );
  }
}

export async function PUT() {
  return NextResponse.json(
    { error: "Usar PATCH /api/alarms/[id]" },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: "Usar DELETE /api/alarms/[id]" },
    { status: 405 }
  );
}