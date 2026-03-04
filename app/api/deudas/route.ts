import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const deudas = await prisma.deuda.findMany({
    include: { pagos: { orderBy: { fecha: "desc" } } },
    orderBy: { tasaInteres: "desc" },
  });
  return NextResponse.json(deudas);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { nombre, tipo, montoOriginal, montoActual, tasaInteres, cuotaMensual, fechaInicio, fechaVencimiento, estrategia } = body;

  const deuda = await prisma.deuda.create({
    data: {
      nombre,
      tipo,
      montoOriginal: parseFloat(montoOriginal),
      montoActual: parseFloat(montoActual ?? montoOriginal),
      tasaInteres: parseFloat(tasaInteres ?? 0),
      cuotaMensual: cuotaMensual ? parseFloat(cuotaMensual) : null,
      fechaInicio: new Date(fechaInicio),
      fechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento) : null,
      estrategia: estrategia ?? "AVALANCHE",
    },
  });

  return NextResponse.json(deuda, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  await prisma.deuda.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ ok: true });
}
