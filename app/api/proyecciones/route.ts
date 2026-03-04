import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const userId = session.user.id;

  const { searchParams } = new URL(request.url);
  const aportacionMensual = parseFloat(searchParams.get("aportacion") ?? "0");
  const años = parseInt(searchParams.get("anos") ?? "30");

  const config = await prisma.configuracionFinanciera.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  const tasa = config.tasaRetornoEsperada;
  const tasaMensual = tasa / 12;
  const meses = años * 12;

  const [activos, deudas] = await Promise.all([
    prisma.activo.aggregate({ where: { userId }, _sum: { valorActual: true } }),
    prisma.deuda.aggregate({ where: { userId }, _sum: { montoActual: true } }),
  ]);
  const patrimonioInicial = (activos._sum.valorActual ?? 0) - (deudas._sum.montoActual ?? 0);

  const puntos: Array<{ año: number; sinAporte: number; conAporte: number }> = [];
  let sinAporte = Math.max(patrimonioInicial, 0);
  let conAporte = Math.max(patrimonioInicial, 0);

  for (let m = 1; m <= meses; m++) {
    sinAporte = sinAporte * (1 + tasaMensual);
    conAporte = conAporte * (1 + tasaMensual) + aportacionMensual;
    if (m % 12 === 0) {
      puntos.push({ año: m / 12, sinAporte: Math.round(sinAporte), conAporte: Math.round(conAporte) });
    }
  }

  const gastoMensual = config.gastoMensualDeseado ?? 0;
  const gastoAnual = gastoMensual * 12;
  const meta25x = gastoAnual * 25;
  const ingresosPasivosMeta = gastoAnual;

  let añosParaMeta: number | null = null;
  if (aportacionMensual > 0 && meta25x > 0) {
    let v = Math.max(patrimonioInicial, 0);
    for (let m = 1; m <= 12 * 100; m++) {
      v = v * (1 + tasaMensual) + aportacionMensual;
      if (v >= meta25x) {
        añosParaMeta = Math.round((m / 12) * 10) / 10;
        break;
      }
    }
  }

  return NextResponse.json({
    patrimonioInicial,
    puntos,
    config: { tasaRetornoEsperada: tasa, tasaInflacion: config.tasaInflacion },
    regla4pct: { gastoMensualDeseado: gastoMensual, gastoAnual, meta25x, ingresosPasivosMeta, añosParaMeta },
  });
}
