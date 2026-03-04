import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { monto, fecha, nota } = body;

  const deudaId = parseInt(id);

  // Registrar pago
  const pago = await prisma.pagoDeuda.create({
    data: {
      deudaId,
      monto: parseFloat(monto),
      fecha: fecha ? new Date(fecha) : new Date(),
      nota: nota || null,
    },
  });

  // Actualizar monto actual de la deuda
  await prisma.deuda.update({
    where: { id: deudaId },
    data: { montoActual: { decrement: parseFloat(monto) } },
  });

  return NextResponse.json(pago, { status: 201 });
}
