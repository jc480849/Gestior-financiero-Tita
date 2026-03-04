import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const aportacionMensual = parseFloat(searchParams.get("aportacion") ?? "0");
  const años = parseInt(searchParams.get("anos") ?? "30");

  const config = await prisma.configuracionFinanciera.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });

  const tasa = config.tasaRetornoEsperada; // anual
  const tasaMensual = tasa / 12;
  const meses = años * 12;

  // Patrimonio neto actual
  const [activos, deudas] = await Promise.all([
    prisma.activo.aggregate({ _sum: { valorActual: true } }),
    prisma.deuda.aggregate({ _sum: { montoActual: true } }),
  ]);
  const patrimonioInicial = (activos._sum.valorActual ?? 0) - (deudas._sum.montoActual ?? 0);

  // Proyección compuesta mes a mes (solo anual para el gráfico)
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

  // Regla 4% / 25x
  const gastoMensual = config.gastoMensualDeseado ?? 0;
  const gastoAnual = gastoMensual * 12;
  const meta25x = gastoAnual * 25;
  const ingresosPasivosMeta = gastoAnual;

  // ¿Cuántos años para alcanzar la meta 25x con aportación?
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
    config: {
      tasaRetornoEsperada: tasa,
      tasaInflacion: config.tasaInflacion,
    },
    regla4pct: {
      gastoMensualDeseado: gastoMensual,
      gastoAnual,
      meta25x,
      ingresosPasivosMeta,
      añosParaMeta,
    },
  });
}
