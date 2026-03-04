import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get("tipo");

  const categorias = await prisma.categoria.findMany({
    where: tipo ? { tipo: tipo as "INGRESO" | "GASTO" | "TRANSFERENCIA" } : undefined,
    orderBy: { nombre: "asc" },
  });

  return NextResponse.json(categorias);
}
