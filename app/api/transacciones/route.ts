import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mesRange } from "@/lib/format";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const userId = session.user.id;

  const { searchParams } = new URL(request.url);
  const mes = searchParams.get("mes");
  const tipo = searchParams.get("tipo");
  const categoriaId = searchParams.get("categoriaId");
  const limit = parseInt(searchParams.get("limit") ?? "50");
  const offset = parseInt(searchParams.get("offset") ?? "0");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { userId };

  if (mes) {
    const { start, end } = mesRange(mes);
    where.fecha = { gte: start, lt: end };
  }
  if (tipo) where.tipo = tipo;
  if (categoriaId) where.categoriaId = parseInt(categoriaId);

  const [transacciones, total] = await Promise.all([
    prisma.transaccion.findMany({
      where,
      include: { categoria: true, cuenta: true, metodoPago: true },
      orderBy: { fecha: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.transaccion.count({ where }),
  ]);

  return NextResponse.json({ transacciones, total });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const userId = session.user.id;

  const body = await request.json();
  const { tipo, descripcion, monto, fecha, categoriaId, cuentaId, metodoPagoId, nota } = body;

  const transaccion = await prisma.transaccion.create({
    data: {
      userId,
      tipo,
      descripcion,
      monto: parseFloat(monto),
      fecha: fecha ? new Date(fecha) : new Date(),
      categoriaId: parseInt(categoriaId),
      cuentaId: cuentaId ? parseInt(cuentaId) : null,
      metodoPagoId: metodoPagoId ? parseInt(metodoPagoId) : null,
      nota: nota || null,
    },
    include: { categoria: true, cuenta: true, metodoPago: true },
  });

  return NextResponse.json(transaccion, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const userId = session.user.id;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  await prisma.transaccion.delete({ where: { id: parseInt(id), userId } });
  return NextResponse.json({ ok: true });
}
