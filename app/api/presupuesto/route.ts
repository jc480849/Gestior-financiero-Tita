import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const semana = searchParams.get("semana");

  if (!semana) {
    return NextResponse.json({ error: "Semana requerida" }, { status: 400 });
  }

  const presupuesto = await prisma.presupuesto.findUnique({
    where: { semana },
  });

  return NextResponse.json(presupuesto);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { semana, monto } = body;

  const presupuesto = await prisma.presupuesto.upsert({
    where: { semana },
    update: { monto: parseFloat(monto) },
    create: { semana, monto: parseFloat(monto) },
  });

  return NextResponse.json(presupuesto);
}
