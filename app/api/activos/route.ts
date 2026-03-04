import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const userId = session.user.id;

  const activos = await prisma.activo.findMany({
    where: { userId },
    include: { historial: { orderBy: { fecha: "desc" }, take: 12 } },
    orderBy: { valorActual: "desc" },
  });
  return NextResponse.json(activos);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const userId = session.user.id;

  const body = await request.json();
  const { nombre, tipo, valorActual } = body;

  const activo = await prisma.activo.create({
    data: {
      userId,
      nombre,
      tipo,
      valorActual: parseFloat(valorActual),
      historial: { create: { valor: parseFloat(valorActual) } },
    },
    include: { historial: true },
  });

  return NextResponse.json(activo, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const userId = session.user.id;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  const body = await request.json();
  const { valorActual } = body;

  const activo = await prisma.activo.update({
    where: { id: parseInt(id), userId },
    data: {
      valorActual: parseFloat(valorActual),
      historial: { create: { valor: parseFloat(valorActual) } },
    },
  });

  return NextResponse.json(activo);
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const userId = session.user.id;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  await prisma.activo.delete({ where: { id: parseInt(id), userId } });
  return NextResponse.json({ ok: true });
}
