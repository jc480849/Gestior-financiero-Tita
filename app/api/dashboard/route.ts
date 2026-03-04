import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mesRange, currentMes, lastNMonths } from "@/lib/format";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const userId = session.user.id;

  const { searchParams } = new URL(request.url);
  const mes = searchParams.get("mes") ?? currentMes();

  const { start, end } = mesRange(mes);

  const [
    transaccionesMes,
    presupuestosMes,
    deudas,
    activos,
    ultimasTransacciones,
  ] = await Promise.all([
    prisma.transaccion.groupBy({
      by: ["tipo"],
      where: { userId, fecha: { gte: start, lt: end } },
      _sum: { monto: true },
    }),
    prisma.presupuestoCategoria.findMany({
      where: { userId, mes },
      include: { categoria: true },
    }),
    prisma.deuda.aggregate({ where: { userId }, _sum: { montoActual: true } }),
    prisma.activo.aggregate({ where: { userId }, _sum: { valorActual: true } }),
    prisma.transaccion.findMany({
      where: { userId, fecha: { gte: start, lt: end } },
      include: { categoria: true },
      orderBy: { fecha: "desc" },
      take: 5,
    }),
  ]);

  const ingresos = transaccionesMes.find((t) => t.tipo === "INGRESO")?._sum.monto ?? 0;
  const gastos = transaccionesMes.find((t) => t.tipo === "GASTO")?._sum.monto ?? 0;
  const balance = ingresos - gastos;
  const tasaAhorro = ingresos > 0 ? (balance / ingresos) * 100 : 0;

  const gastosCategorias = await prisma.transaccion.groupBy({
    by: ["categoriaId"],
    where: { userId, tipo: "GASTO", fecha: { gte: start, lt: end } },
    _sum: { monto: true },
  });

  const categoriasInfo = await prisma.categoria.findMany({
    where: { id: { in: gastosCategorias.map((g) => g.categoriaId) } },
  });

  const categoriasMap = new Map(categoriasInfo.map((c) => [c.id, c]));
  const pieData = gastosCategorias.map((g) => ({
    nombre: categoriasMap.get(g.categoriaId)?.nombre ?? "Otros",
    icono: categoriasMap.get(g.categoriaId)?.icono ?? "",
    color: categoriasMap.get(g.categoriaId)?.color ?? "#6b7280",
    monto: g._sum.monto ?? 0,
  }));

  const meses = lastNMonths(6);
  const tendencia = await Promise.all(
    meses.map(async (m) => {
      const { start: s, end: e } = mesRange(m);
      const grupos = await prisma.transaccion.groupBy({
        by: ["tipo"],
        where: { userId, fecha: { gte: s, lt: e } },
        _sum: { monto: true },
      });
      return {
        mes: m,
        ingresos: grupos.find((g) => g.tipo === "INGRESO")?._sum.monto ?? 0,
        gastos: grupos.find((g) => g.tipo === "GASTO")?._sum.monto ?? 0,
      };
    })
  );

  const gastosMap = new Map(
    await prisma.transaccion
      .groupBy({
        by: ["categoriaId"],
        where: { userId, tipo: "GASTO", fecha: { gte: start, lt: end } },
        _sum: { monto: true },
      })
      .then((r) => r.map((g) => [g.categoriaId, g._sum.monto ?? 0]))
  );

  const alertas = presupuestosMes
    .filter((p) => {
      const gastado = gastosMap.get(p.categoriaId) ?? 0;
      return p.monto > 0 && gastado / p.monto > 0.9;
    })
    .map((p) => ({
      categoria: p.categoria.nombre,
      presupuestado: p.monto,
      gastado: gastosMap.get(p.categoriaId) ?? 0,
    }));

  const ingresosCategorias = await prisma.transaccion.groupBy({
    by: ["categoriaId"],
    where: { userId, tipo: "INGRESO", fecha: { gte: start, lt: end } },
    _sum: { monto: true },
  });
  let hhiAlerta = false;
  if (ingresos > 0 && ingresosCategorias.length > 0) {
    const maxIngreso = Math.max(...ingresosCategorias.map((i) => i._sum.monto ?? 0));
    hhiAlerta = maxIngreso / ingresos > 0.8;
  }

  return NextResponse.json({
    ingresos,
    gastos,
    balance,
    tasaAhorro,
    totalDeuda: deudas._sum.montoActual ?? 0,
    totalActivos: activos._sum.valorActual ?? 0,
    patrimonioNeto: (activos._sum.valorActual ?? 0) - (deudas._sum.montoActual ?? 0),
    pieData,
    tendencia,
    ultimasTransacciones,
    alertas,
    hhiAlerta,
  });
}
