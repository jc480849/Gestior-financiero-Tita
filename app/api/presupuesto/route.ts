import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mesRange } from "@/lib/format";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mes = searchParams.get("mes");
  if (!mes) return NextResponse.json({ error: "mes requerido" }, { status: 400 });

  const { start, end } = mesRange(mes);

  const [presupuestos, gastosPorCategoria] = await Promise.all([
    prisma.presupuestoCategoria.findMany({
      where: { mes },
      include: { categoria: true },
    }),
    prisma.transaccion.groupBy({
      by: ["categoriaId"],
      where: { tipo: "GASTO", fecha: { gte: start, lt: end } },
      _sum: { monto: true },
    }),
  ]);

  const gastosMap = new Map(gastosPorCategoria.map((g) => [g.categoriaId, g._sum.monto ?? 0]));

  const result = presupuestos.map((p) => ({
    ...p,
    gastado: gastosMap.get(p.categoriaId) ?? 0,
  }));

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { mes, categoriaId, monto } = body;

  const presupuesto = await prisma.presupuestoCategoria.upsert({
    where: { mes_categoriaId: { mes, categoriaId: parseInt(categoriaId) } },
    update: { monto: parseFloat(monto) },
    create: { mes, categoriaId: parseInt(categoriaId), monto: parseFloat(monto) },
    include: { categoria: true },
  });

  return NextResponse.json(presupuesto);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  await prisma.presupuestoCategoria.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ ok: true });
}
