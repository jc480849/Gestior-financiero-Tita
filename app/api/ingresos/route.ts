import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const semana = searchParams.get("semana");

  let ingresos;
  if (semana) {
    const [year, week] = semana.split("-W").map(Number);
    const startDate = getStartOfWeek(year, week);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    ingresos = await prisma.ingreso.findMany({
      where: { fecha: { gte: startDate, lt: endDate } },
      orderBy: { fecha: "desc" },
    });
  } else {
    ingresos = await prisma.ingreso.findMany({ orderBy: { fecha: "desc" } });
  }

  return NextResponse.json(ingresos);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { descripcion, monto, categoria, fecha } = body;

  const ingreso = await prisma.ingreso.create({
    data: {
      descripcion,
      monto: parseFloat(monto),
      categoria,
      fecha: fecha ? new Date(fecha) : new Date(),
    },
  });

  return NextResponse.json(ingreso, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  await prisma.ingreso.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ ok: true });
}

function getStartOfWeek(year: number, week: number): Date {
  const date = new Date(year, 0, 1 + (week - 1) * 7);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}
