export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log("DATABASE_URL:", process.env.DATABASE_URL);

    const alarms = await prisma.alarm.findMany();

    return NextResponse.json(alarms);
  } catch (error) {
    console.error("FULL ERROR:", error);
    return NextResponse.json(
      { error: JSON.stringify(error, null, 2) },
      { status: 500 }
    );
  }
}