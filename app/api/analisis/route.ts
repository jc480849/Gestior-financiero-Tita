import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mesRange, lastNMonths } from "@/lib/format";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const userId = session.user.id;

  const { searchParams } = new URL(request.url);
  const meses = parseInt(searchParams.get("meses") ?? "6");

  const listaMeses = lastNMonths(meses);

  const tendencia = await Promise.all(
    listaMeses.map(async (mes) => {
      const { start, end } = mesRange(mes);
      const grupos = await prisma.transaccion.groupBy({
        by: ["tipo"],
        where: { userId, fecha: { gte: start, lt: end } },
        _sum: { monto: true },
      });
      return {
        mes,
        ingresos: grupos.find((g) => g.tipo === "INGRESO")?._sum.monto ?? 0,
        gastos: grupos.find((g) => g.tipo === "GASTO")?._sum.monto ?? 0,
      };
    })
  );

  const { start: startRange } = mesRange(listaMeses[0]);
  const { end: endRange } = mesRange(listaMeses[listaMeses.length - 1]);

  const gastosCategorias = await prisma.transaccion.groupBy({
    by: ["categoriaId"],
    where: { userId, tipo: "GASTO", fecha: { gte: startRange, lt: endRange } },
    _sum: { monto: true },
    orderBy: { _sum: { monto: "desc" } },
  });

  const categoriasInfo = await prisma.categoria.findMany({
    where: { id: { in: gastosCategorias.map((g) => g.categoriaId) } },
  });
  const categoriasMap = new Map(categoriasInfo.map((c) => [c.id, c]));

  const topGastos = gastosCategorias.map((g) => ({
    categoria: categoriasMap.get(g.categoriaId)?.nombre ?? "Otros",
    icono: categoriasMap.get(g.categoriaId)?.icono ?? "",
    color: categoriasMap.get(g.categoriaId)?.color ?? "#6b7280",
    total: g._sum.monto ?? 0,
  }));

  const ingresosCategorias = await prisma.transaccion.groupBy({
    by: ["categoriaId"],
    where: { userId, tipo: "INGRESO", fecha: { gte: startRange, lt: endRange } },
    _sum: { monto: true },
    orderBy: { _sum: { monto: "desc" } },
  });

  const ingCategoriasInfo = await prisma.categoria.findMany({
    where: { id: { in: ingresosCategorias.map((g) => g.categoriaId) } },
  });
  const ingCategoriasMap = new Map(ingCategoriasInfo.map((c) => [c.id, c]));

  const distribucionIngresos = ingresosCategorias.map((g) => ({
    categoria: ingCategoriasMap.get(g.categoriaId)?.nombre ?? "Otros",
    icono: ingCategoriasMap.get(g.categoriaId)?.icono ?? "",
    color: ingCategoriasMap.get(g.categoriaId)?.color ?? "#6b7280",
    total: g._sum.monto ?? 0,
  }));

  const ingMensuales = tendencia.map((t) => t.ingresos);
  const media = ingMensuales.reduce((a, b) => a + b, 0) / ingMensuales.length;
  const varianza = ingMensuales.reduce((a, b) => a + Math.pow(b - media, 2), 0) / ingMensuales.length;
  const volatilidad = Math.sqrt(varianza);
  const coefVariacion = media > 0 ? (volatilidad / media) * 100 : 0;

  return NextResponse.json({
    tendencia,
    topGastos,
    distribucionIngresos,
    volatilidad: { media, desviacion: volatilidad, coefVariacion },
  });
}
